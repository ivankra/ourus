---
type: "SxS"
app: "athens"
version: "2022-05-18"
url: "https://athensresearch.github.io/athens/"
model: "block"
command: "node sxs/run.ts athens"
elapsed_s: 310
workers: 3
---

# Athens vs ourus

Summary:

|  | agree | caret | whitespace | disagree | error | skipped | total |
| --- | --- | --- | --- | --- | --- | --- | --- |
| original | 138 | [24](#caret-24) | [6](#whitespace-6) | [5](#disagree-5) |  |  | **173** |
| adapted | 374 | [16](#adapted-caret-16) | [22](#adapted-whitespace-22) | [68](#adapted-disagree-68) | [1](#adapted-error-1) |  | **481** |
| **total** | **512 (40%)** | **40 (3.1%)** | **28 (2.2%)** | **73 (5.7%)** | **1 (0.078%)** | **[631](#skipped-631) (49%)** | **1288** |

Per-file:

|  | agree | caret | whitespace | disagree | error | skipped | total | original | adapted |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [backspace.md](../spec/backspace.md) | 44 | 2 |  | 2 |  | 38 | **86** | 16 | 32 |
| [backtick.md](../spec/backtick.md) | 1 |  |  |  |  | 32 | **33** |  | 1 |
| [copy.md](../spec/copy.md) | 3 |  | 3 | 1 |  | 6 | **13** | 1 | 6 |
| [cursor.md](../spec/cursor.md) | 24 | 7 |  |  |  | 5 | **36** | 12 | 19 |
| [delete-subtree.md](../spec/delete-subtree.md) | 11 |  |  |  |  | 2 | **13** | 2 | 9 |
| [delete.md](../spec/delete.md) | 28 |  |  |  |  | 28 | **56** | 11 | 17 |
| [drag.md](../spec/drag.md) |  |  |  |  |  | 8 | **8** |  |  |
| [duplicate-subtree.md](../spec/duplicate-subtree.md) |  |  |  |  |  | 12 | **12** |  |  |
| [enter.md](../spec/enter.md) | 53 |  | 4 | 6 |  | 35 | **98** | 21 | 42 |
| [fences.md](../spec/fences.md) | 7 |  |  | 1 |  | 62 | **70** |  | 8 |
| [fold.md](../spec/fold.md) | 9 | 1 |  |  |  | 9 | **19** | 9 | 1 |
| [gaps.md](../spec/gaps.md) | 2 |  |  |  |  | 17 | **19** |  | 2 |
| [indent.md](../spec/indent.md) | 33 |  |  | 1 |  | 21 | **55** | 15 | 19 |
| [lists.md](../spec/lists.md) | 1 |  |  |  |  | 15 | **16** |  | 1 |
| [move-subtree-down.md](../spec/move-subtree-down.md) |  |  |  |  |  | 44 | **44** |  |  |
| [move-subtree-up.md](../spec/move-subtree-up.md) |  |  |  |  |  | 46 | **46** |  |  |
| [move-subtree.md](../spec/move-subtree.md) | 9 | 2 |  | 4 |  | 9 | **24** | 7 | 8 |
| [obsidian-true-outliner.md](../spec/obsidian-true-outliner.md) | 44 |  | 3 | 4 |  | 16 | **67** | 14 | 37 |
| [outdent.md](../spec/outdent.md) | 17 | 3 |  |  |  | 22 | **42** | 4 | 16 |
| [paste-at.md](../spec/paste-at.md) |  |  |  |  |  | 5 | **5** |  |  |
| [paste-conv.md](../spec/paste-conv.md) | 5 |  |  | 1 |  |  | **6** | 1 | 5 |
| [paste-html.md](../spec/paste-html.md) | 4 |  |  | 15 |  |  | **19** |  | 19 |
| [paste-list-form.md](../spec/paste-list-form.md) | 3 |  |  | 2 |  | 1 | **6** |  | 5 |
| [paste-list.md](../spec/paste-list.md) | 14 |  |  | 9 |  | 6 | **29** | 1 | 22 |
| [paste-plain.md](../spec/paste-plain.md) | 18 | 1 | 4 | 2 |  | 11 | **36** | 8 | 17 |
| [paste.md](../spec/paste.md) | 20 | 3 | 2 | 4 |  | 7 | **36** | 1 | 28 |
| [placeholders.md](../spec/placeholders.md) | 11 |  | 5 |  |  | 4 | **20** | 5 | 11 |
| [quirks.md](../spec/quirks.md) | 1 |  |  |  |  | 6 | **7** |  | 1 |
| [quotes.md](../spec/quotes.md) | 80 |  | 3 | 9 |  | 51 | **143** |  | 92 |
| [regressions.md](../spec/regressions.md) | 22 |  |  | 6 |  | 38 | **66** | 1 | 27 |
| [scenarios.md](../spec/scenarios.md) | 9 | 1 |  | 2 |  | 17 | **29** | 5 | 7 |
| [select.md](../spec/select.md) | 7 | 9 |  |  |  | 7 | **23** | 13 | 3 |
| [shift-enter.md](../spec/shift-enter.md) | 25 |  | 3 |  |  | 8 | **36** | 10 | 18 |
| [subtree-selection.md](../spec/subtree-selection.md) | 3 | 6 | 1 | 4 | 1 | 2 | **17** | 11 | 4 |
| [tasks.md](../spec/tasks.md) | 2 |  |  |  |  | 28 | **30** |  | 2 |
| [typing.md](../spec/typing.md) |  |  |  |  |  | 3 | **3** |  |  |
| [undo.md](../spec/undo.md) |  | 4 |  |  |  | 1 | **5** | 3 | 1 |
| [z-open.md](../spec/z-open.md) | 1 |  |  |  |  |  | **1** |  | 1 |
| [zoom.md](../spec/zoom.md) | 1 | 1 |  |  |  | 12 | **14** | 2 |  |
| **total** | **512 (40%)** | **40 (3.1%)** | **28 (2.2%)** | **73 (5.7%)** | **1 (0.078%)** | **634 (49%)** | **1288** | **173 (13%)** | **481 (37%)** |

## Disagree (5)

### [MoveSubtree5](../spec/move-subtree.md#movesubtree5)

> moveSubtree ③

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ««a
- b»»
- c
```

</td><td>

```buffer
- ««a
- b»»
- c
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
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ««a
- b»»
- c
```

</td><td>

```buffer
- ««a
- b»»
- c
```

</td><td>

```buffer
- ««a
- c
- b»»
```

</td></tr>
</table>

### [TO-E33](../spec/obsidian-true-outliner.md#to-e33)

> enter

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃b
```

</td><td>

```buffer
- ax y┃b
```

</td><td>

```buffer
- ax **y**┃b
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
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
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

## Whitespace (6)

### [Enter16](../spec/enter.md#enter16)

> enter

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
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

### [TO12](../spec/obsidian-true-outliner.md#to12)

> shiftEnter indent enter

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃a
```

</td><td>

```buffer
-     first
      second
  ┃a
```

</td><td>

```buffer
- first
      second
  ┃a
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
<tr><th>athens</th><th>ourus</th></tr>
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

### [ShiftEnter33](../spec/shift-enter.md#shiftenter33)

> shiftEnter

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
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

### [SubtreeEdit6](../spec/subtree-selection.md#subtreeedit6)

> cut

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
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
- c
```

</td><td>

```buffer
- a┃
- c
```

</td></tr>
</table>

## Caret (24)

### [Backspace17](../spec/backspace.md#backspace17)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
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

### [CursorUp3](../spec/cursor.md#cursorup3)

> cursorLineUp

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b
- c┃
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
  - ┃b
- c
```

</td></tr>
</table>

### [CursorDown4](../spec/cursor.md#cursordown4)

> cursorLineDown

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc┃
- abcd
```

</td><td>

```buffer
- abc
- abcd┃
```

</td><td>

```buffer
- abc
- abc┃d
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
<tr><th>athens</th><th>ourus</th></tr>
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

### [MoveSubtree4](../spec/move-subtree.md#movesubtree4)

> moveSubtree ②

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ««a
- b»»
- c
```

</td><td>

```buffer
- c
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
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- ┃a  
  b
```

</td><td>

```buffer
- a  
  b┃
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
<tr><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- amor┃e
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

### [Select2](../spec/select.md#select2)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- one
  - t┃wo
    - deep
  - three
- four
```

</td></tr>
</table>

> expandSelection

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- one
  - «two»
    - deep
  - three
- four
```

</td></tr>
</table>

> expandSelection

<table>
<tr><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - «two»
    - deep
  - three
- four
```

</td><td>

```buffer
- one
  - ««two»»
    - deep
  - three
- four
```

</td></tr>
</table>

> expandSelection

<table>
<tr><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - «two»
    - deep
  - three
- four
```

</td><td>

```buffer
- one
  - ««two
    - deep
  - three»»
- four
```

</td></tr>
</table>

> expandSelection

<table>
<tr><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - «two»
    - deep
  - three
- four
```

</td><td>

```buffer
- ««one»»
  - two
    - deep
  - three
- four
```

</td></tr>
</table>

> expandSelection

<table>
<tr><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - «two»
    - deep
  - three
- four
```

</td><td>

```buffer
- ««one
  - two
    - deep
  - three
- four»»
```

</td></tr>
</table>

> expandSelection

<table>
<tr><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - «two»
    - deep
  - three
- four
```

</td><td>

```buffer
- ««one
  - two
    - deep
  - three
- four»»
```

</td></tr>
</table>

### [Select3](../spec/select.md#select3)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- one
  - two
    - d1
    - de┃ep
    - d3
  - three
```

</td></tr>
</table>

> expandSelection

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- one
  - two
    - d1
    - «deep»
    - d3
  - three
```

</td></tr>
</table>

> expandSelection

<table>
<tr><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - two
    - d1
    - «deep»
    - d3
  - three
```

</td><td>

```buffer
- one
  - two
    - d1
    - ««deep»»
    - d3
  - three
```

</td></tr>
</table>

> expandSelection

<table>
<tr><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - two
    - d1
    - «deep»
    - d3
  - three
```

</td><td>

```buffer
- one
  - two
    - ««d1
    - deep
    - d3»»
  - three
```

</td></tr>
</table>

> expandSelection

<table>
<tr><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - two
    - d1
    - «deep»
    - d3
  - three
```

</td><td>

```buffer
- one
  - ««two»»
    - d1
    - deep
    - d3
  - three
```

</td></tr>
</table>

### [Select4](../spec/select.md#select4)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
- b┃
- c
```

</td></tr>
</table>

> expandSelection

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
- «b»
- c
```

</td></tr>
</table>

> expandSelection

<table>
<tr><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- «b»
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

> expandSelection

<table>
<tr><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- «b»
- c
```

</td><td>

```buffer
- ««a
- b
- c»»
```

</td></tr>
</table>

### [Select6](../spec/select.md#select6)

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

> expandSelection

<table>
<tr><th>athens</th><th>ourus</th></tr>
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
  - ««two
    - deep
  - three
  - five»»
- four
```

</td></tr>
</table>

> expandSelection

<table>
<tr><th>athens</th><th>ourus</th></tr>
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
- ««one»»
  - two
    - deep
  - three
  - five
- four
```

</td></tr>
</table>

### [Select10](../spec/select.md#select10)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- one
  - t┃wo
  - three
- four

⟦folded none; zoom 1⟧
```

</td></tr>
</table>

> expandSelection

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- one
  - «two»
  - three
- four

⟦folded none; zoom 1⟧
```

</td></tr>
</table>

> expandSelection

<table>
<tr><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - «two»
  - three
- four

⟦folded none; zoom 1⟧
```

</td><td>

```buffer
- one
  - ««two»»
  - three
- four

⟦folded none; zoom 1⟧
```

</td></tr>
</table>

> expandSelection

<table>
<tr><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - «two»
  - three
- four

⟦folded none; zoom 1⟧
```

</td><td>

```buffer
- one
  - ««two
  - three»»
- four

⟦folded none; zoom 1⟧
```

</td></tr>
</table>

> expandSelection

<table>
<tr><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - «two»
  - three
- four

⟦folded none; zoom 1⟧
```

</td><td>

```buffer
- ««one»»
  - two
  - three
- four

⟦folded none; zoom 1⟧
```

</td></tr>
</table>

> expandSelection

<table>
<tr><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - «two»
  - three
- four

⟦folded none; zoom 1⟧
```

</td><td>

```buffer
- ««one»»
  - two
  - three
- four

⟦folded none; zoom 1⟧
```

</td></tr>
</table>

### [Select12](../spec/select.md#select12)

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

> selectNodeUp

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

> selectNodeUp

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

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
<tr><th>athens</th><th>ourus</th></tr>
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
<tr><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - ««two
    - deep
  - three
  - five
- four»»
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
<tr><th>athens</th><th>ourus</th></tr>
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

### [SubtreeEdit1](../spec/subtree-selection.md#subtreeedit1)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ««b»»
- c
```

</td><td>

```buffer
- a
- c
```

</td><td>

```buffer
- a┃
- c
```

</td></tr>
</table>

### [SubtreeEdit2](../spec/subtree-selection.md#subtreeedit2)

> deleteContentForward

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
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
- c
```

</td><td>

```buffer
- a┃
- c
```

</td></tr>
</table>

### [SubtreeEdit3](../spec/subtree-selection.md#subtreeedit3)

> deleteSoftLineBackward

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
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

### [SubtreeEdit12](../spec/subtree-selection.md#subtreeedit12)

> enter

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
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
- ┃b
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

### [SubtreeEdit13](../spec/subtree-selection.md#subtreeedit13)

> shiftEnter

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
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
    - ┃deep
  - three
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
<tr><th>athens</th><th>ourus</th></tr>
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
<tr><th>athens</th><th>ourus</th></tr>
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

### [Undo4](../spec/undo.md#undo4)

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
<tr><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
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

> redo

<table>
<tr><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
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
<tr><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
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

> redo

<table>
<tr><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
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

### [Zoom6](../spec/zoom.md#zoom6)

> zoomIn

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b┃
  - c

⟦folded none; zoom none⟧
```

</td><td>

```buffer
- a
- b
  - ┃c

⟦folded none; zoom 2⟧
```

</td><td>

```buffer
- a
- b┃
  - c

⟦folded none; zoom 2⟧
```

</td></tr>
</table>

## Adapted: disagree (68)

### [Backspace26](../spec/backspace.md#backspace26)

> deleteContentBackward

Adapted: as blocks, paragraph

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃para
```

</td><td>

```buffer

```

</td><td>

```buffer
- ┃para
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
┃para
```

</td><td>

```buffer
┃para
```

</td></tr>
</table>

### [Backspace40b](../spec/backspace.md#backspace40b)

> deleteContentBackward

Adapted: as blocks, numbered list, paragraph

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃x
- c
```

</td><td>

```buffer
- c
```

</td><td>

```buffer
- ┃x
  - c
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃x
3. c
```

</td><td>

```buffer
┃x
- c
```

</td></tr>
</table>

### [Copy8](../spec/copy.md#copy8)

Adapted: as blocks, quote, the node at the caret selected (selectSubtree), under quotes: atom

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- > [!note] ┃q
  > body
```

</td></tr>
</table>

> selectSubtree copy

Original:
<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
> [!note] ┃q
> body
```

</td></tr>
</table>

### [Enter7](../spec/enter.md#enter7)

> enter

Adapted: blank lines, paragraph, under enterOnEmptyItem: outdent

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
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

┃◌

- b
```

</td></tr>
</table>

### [Enter28](../spec/enter.md#enter28)

Adapted: blank lines, paragraph, under enterOnEmptyItem: outdent

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
  - c
- ┃
```

</td></tr>
</table>

> enter

<table>
<tr><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - c
- 
- ┃
```

</td><td>

```buffer
- a
  - c
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
  - ┃◌
  - c
```

</td><td>

```buffer
- a
  - c
- ┃
```

</td><td>

```buffer
- a
  - c

┃◌
```

</td></tr>
</table>

### [Enter51](../spec/enter.md#enter51)

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
<tr><th>athens</th><th>ourus</th></tr>
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

> deleteContentBackward

<table>
<tr><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ## one
  ┃two
  three
```

</td><td>

```buffer
- ## one┃two
  three
```

</td></tr>
</table>

> undo undo

<table>
<tr><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ## one
  two
  three┃
```

</td><td>

```buffer
- ## one
  ┃two
  three
```

</td></tr>
</table>

> cursorLineBoundaryForward enter

<table>
<tr><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ## one
  two
  three
- ┃
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

### [Enter56b](../spec/enter.md#enter56b)

> enter

Adapted: as blocks, paragraph

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a«b
  c»d
```

</td><td>

```buffer
- a
- ┃b
  cd
```

</td><td>

```buffer
- a
- ┃d
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
a«b
c»d
```

</td><td>

```buffer
- a
- ┃d
```

</td></tr>
</table>

### [Enter59](../spec/enter.md#enter59)

> enter

Adapted: as blocks, paragraph

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- «ab»cd
```

</td><td>

```buffer
- ┃
- abcd
```

</td><td>

```buffer
- ┃
- cd
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
- ┃
- cd
```

</td></tr>
</table>

### [Fence62](../spec/fences.md#fence62)

> deleteContentBackward

Adapted: as blocks, code block

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
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
  ┃```
  body
  ```
````

</td><td>

`````buffer
- ````
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
- ````
  ┃```
  body
  ````
`````

</td></tr>
</table>

### [Indent37](../spec/indent.md#indent37)

> indent

Adapted: blank lines, thematic break

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ---┃
```

</td><td>

```buffer
- a
  - ---┃
```

</td><td>

```buffer
- a
- ---┃
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

### [MoveSubtree14](../spec/move-subtree.md#movesubtree14)

> moveSubtree ②

Adapted: heading

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # A
  - ## B
- # C
  - ### D┃
    - #### E
```

</td><td>

```buffer
- # A
  - ## B
  - ### D
    - #### E
- # C
```

</td><td>

```buffer
- # A
  - ## B
  - ## D┃
    - ### E
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
## B
  ▸
# C
### D┃②
#### E
```

</td><td>

```buffer
# A
## B
## D┃②
### E
# C
```

</td></tr>
</table>

### [MoveSubtree15](../spec/move-subtree.md#movesubtree15)

> moveSubtree ②

Adapted: heading, paragraph

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # A
  - x
- # C
  - ##### D┃
    - ###### E
```

</td><td>

```buffer
- # A
  - x
  - ##### D
    - ###### E
- # C
```

</td><td>

```buffer
- # A
  - x
  - ## D┃
    - ### E
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
x
  ▸
# C
##### D┃②
###### E
```

</td><td>

```buffer
# A
x
## D┃②
### E
# C
```

</td></tr>
</table>

### [TO-E10](../spec/obsidian-true-outliner.md#to-e10)

> enter

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
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

### [TO-E13-E16b](../spec/obsidian-true-outliner.md#to-e13-e16b)

> enter

Adapted: heading, paragraph

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
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

### [TO-E14-E20](../spec/obsidian-true-outliner.md#to-e14-e20)

> enter

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
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

Adapted: empty document, under quirkPasteCaret: athens

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- ┃x
- y
- z
```

</td><td>

```buffer
- ┃x
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
- ┃x
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

Adapted: empty document, under quirkPasteCaret: athens

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- ┃x
- y
- z
```

</td><td>

```buffer
- ┃x
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
- ┃x
  - y
- z
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

Adapted: empty document, under quirkPasteCaret: athens

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- ┃x b
  - y
- z
```

</td><td>

```buffer
- ┃x **b**
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
- ┃x **b**
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

Adapted: empty document, under quirkPasteCaret: athens

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- ┃x
- y
- z
```

</td><td>

```buffer
- ┃x
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
- ┃x
  - y
- z
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

Adapted: empty document, task, under quirkPasteCaret: athens

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- ┃done
- todo
```

</td><td>

```buffer
- [x] ┃done
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
- [x] ┃done
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

Adapted: code block, empty document, under quirkPasteCaret: athens

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- ┃let a = 1;
- let b = 2;
```

</td><td>

````buffer
- ```js
  ┃let a = 1;
  let b = 2;
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
┃let a = 1;
let b = 2;
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

Adapted: blank lines, empty document, heading, paragraph, under quirkPasteCaret: athens

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- ┃Title
- para bold c
```

</td><td>

```buffer
- ## ┃Title
  - para **bold** `c`
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
## ┃Title

para **bold** `c`
```

</td></tr>
</table>

### [PasteHtml12](../spec/paste-html.md#pastehtml12)

<table>
<tr><th colspan=2>clipboard</tr>
<tr><td>text/plain<td>text/html</tr>
<tr valign="top"><td>

```clipboard
q1

q2
```

</td><td>

```clipboard
<blockquote><p>q1</p><p>q2</p></blockquote>
```

</td></tr>
</table>

> paste

Adapted: empty document, quote, under quirkPasteCaret: athens

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- ┃q1
- q2
```

</td><td>

```buffer
- ┃> q1
  >
  > q2
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
┃> q1
>
> q2
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

Adapted: empty document, table, under quirkPasteCaret: athens

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- ┃a→b
- 1→2
```

</td><td>

```buffer
- ┃| a | b |
  | --- | ---: |
  | 1 | 2 |
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
┃| a | b |
| --- | ---: |
| 1 | 2 |
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

Adapted: empty document, under quirkPasteCaret: athens

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- ┃a b i c s l
- z
```

</td><td>

```buffer
- ┃a **b** *i* `c` ~~s~~ [l](https://e.x/p)
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
- ┃a **b** *i* `c` ~~s~~ [l](https://e.x/p)
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

Adapted: empty document, escape, under quirkPasteCaret: athens

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- ┃1. not a list, *x* and [y]
- # not a heading
```

</td><td>

```buffer
- ┃1. not a list, \*x\* and \[y\]
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
- ┃1\. not a list, \*x\* and \[y\]
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

Adapted: blank lines, code block, empty document, heading, under quirkPasteCaret: athens

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- ┃Setup
- npm install
```

</td><td>

````buffer
- ## ┃Setup
  - ```shell
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
## ┃Setup

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

Adapted: empty document, under quirkPasteCaret: athens

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- ┃Bold start
- nested
```

</td><td>

```buffer
- ┃**Bold** start
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
- ┃**Bold** start
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

Adapted: empty document, under quirkPasteCaret: athens

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- ┃·       one
- o       nested
```

</td><td>

```buffer
- ┃one
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
- ┃one
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

Adapted: code block, empty document, under quirkPasteCaret: athens

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- ┃javascript
- Copy code
- let a = 1;
```

</td><td>

````buffer
- ```javascript
  ┃let a = 1;
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
┃let a = 1;
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

Adapted: under quirkPasteCaret: athens

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- a
- ┃1. x
- 2. y
- b
```

</td><td>

```buffer
- a
- ┃x
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
- a┃
- b
```

</td><td>

```buffer
- a
- ┃x
- y
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

Adapted: numbered list, under quirkPasteCaret: athens

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
```

</td><td>

```buffer
- a
- ┃x
  - 1. x1
- y
```

</td><td>

```buffer
- a
- ┃x
  - x1
- y
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
- ┃x
  1. x1
- y
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

Adapted: under pasteParagraphList: children, under quirkPasteCaret: athens

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
```

</td><td>

```buffer
- a
- ┃one
- two
  - x
```

</td><td>

```buffer
- a
- ┃one
  two
  - x
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
- ┃one
  two
  - x
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

Adapted: code block, under quirkPasteCaret: athens

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

````buffer
- a
- ┃```
- c
- ```
- b
````

</td><td>

````buffer
- a
  - ```
    ┃c
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
  ┃c
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

Adapted: code block, under quirkPasteCaret: athens

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

````buffer
- a
- ┃x
- ```
- c
- ```
- b
````

</td><td>

````buffer
- a
- ┃x
  - ```
    c
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
- ┃x
  ```
  c
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

Adapted: code block, under quirkPasteCaret: athens

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - kid
```

</td><td>

````buffer
- a
  - ┃```
  - c
  - ```
  - kid
````

</td><td>

````buffer
- a
  - ```
    ┃c
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
  ┃c
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

Adapted: code block, under quirkPasteCaret: athens

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
- b
```

</td><td>

````buffer
- ┃```
- c
- ```
- b
````

</td><td>

````buffer
- ```
  ┃c
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
  ┃c
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

Adapted: heading, under quirkPasteCaret: athens

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- a
- ┃# h
- text
- b
```

</td><td>

```buffer
- a
- # ┃h
  text
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
- # ┃h
  text
- b
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

Adapted: quote, under quirkPasteCaret: athens

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃
  - b1
```

</td><td>

```buffer
- a
- 
  - ┃> q
  - b1
```

</td><td>

```buffer
- a
- ┃> q
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
- ┃> q
  - b1
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

Adapted: code block, under quirkPasteCaret: athens

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

````buffer
- a
- ┃```
  - code
  - ```
- b
````

</td><td>

````buffer
- a
- ```
  ┃code
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
  ┃code
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

Adapted: code block, under quirkPasteCaret: athens

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

````buffer
- a
- ┃```
  - code
- b
````

</td><td>

````buffer
- a
- ```
  ┃code
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
  ┃code
  ```
- b
````

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
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a«bc
  de»f
```

</td><td>

```buffer
- ax
  \- y┃bc
  def
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

Adapted: as blocks, quote, under quotes: atom

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- > a«bc
  > de»f
```

</td><td>

```buffer
- > ax
  \# y┃bc
  > def
```

</td><td>

```buffer
- > ax
  > # y┃f
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
- > ax
  > # y┃f
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

Adapted: as blocks, blank lines, code block, paragraph, under quirkPasteCaret: athens

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- p┃
- q
```

</td><td>

````buffer
- p
- ┃```
- c
- ```
- q
````

</td><td>

````buffer
- p
  - ```
    ┃c
    ```
- q
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
- p
  ```
  ┃c
  ```
- q
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

Adapted: as blocks, blank lines, under quirkPasteCaret: athens

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
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
- ┃x
- y
- b
```

</td><td>

```buffer
- a
  
  p
  - ┃x
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

  p┃

- b
```

</td><td>

```buffer
- a
  
  p
  - ┃x
  - y
- b
```

</td></tr>
</table>

### [Paste14](../spec/paste.md#paste14)

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

Adapted: as blocks, code block

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- ```
  a┃
  ```
````

</td><td>

````buffer
- ```
  a
  ```
- ┃x
- y
````

</td><td>

````buffer
- ```
  a- x
  \- y
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
```
a┃
```
````

</td><td>

````buffer
- ```
  a- x
  - y
  ┃
  ```
````

</td></tr>
</table>

### [Paste23](../spec/paste.md#paste23)

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

Adapted: as blocks, blank lines, heading, paragraph, quote, under quirkPasteCaret: athens, under quotes: atom

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- > [!note] q┃
- after
```

</td><td>

```buffer
- > [!note] q
- ┃## h
- text
- after
```

</td><td>

```buffer
- > [!note] q
- ## ┃h
  text
- after
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> [!note] q┃

after
```

</td><td>

```buffer
- > [!note] q
- ## ┃h
  text
- after
```

</td></tr>
</table>

### [Quote30](../spec/quotes.md#quote30)

> enter

Adapted: as blocks, quote, under copyAtCaret: host, under copySelection: nodes, under emptyItemWithChildren: refuse, under enterInQuote: split, under enterOnEmptyItem: outdent, under enterSplitSpace: start, under enterTask: plain, under joinWithChildren: refuse, under mixedDepths: refuse, under outdent: logical, under pasteLines: items, under pasteOverSelection: ignore, under pasteParagraphList: children, under quirkPasteCaret: athens, under quotes: atom

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- x
  > - a┃
```

</td><td>

```buffer
- x
  > - a
- ┃
```

</td><td>

```buffer
- x
  > - a
  
  ┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- x
  > - a┃
```

</td><td>

```buffer
- x
  > - a

  ┃◌
```

</td></tr>
</table>

### [Quote79](../spec/quotes.md#quote79)

> enter

Adapted: as blocks, quote, under quotes: atom

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- > [«!note] q6»
```

</td><td>

```buffer
- > [
- ┃!note] q6
```

</td><td>

```buffer
- > [
- ┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> [«!note] q6»
```

</td><td>

```buffer
- > [
- ┃
```

</td></tr>
</table>

### [Quote82](../spec/quotes.md#quote82)

> deleteSubtree

Adapted: as blocks, empty document, quote, under quotes: atom

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- > ┃p
  >
  > q
```

</td><td>

```buffer

```

</td><td>

```buffer
- ┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- > ┃p
  >
  > q
```

</td><td>

```buffer
┃
```

</td></tr>
</table>

### [Quote84](../spec/quotes.md#quote84)

> enter

Adapted: as blocks, quote, under quotes: atom

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- > [!note] Title
  ┃two
  lines
```

</td><td>

```buffer
- > [!note] Title
  
- ┃two
  lines
```

</td><td>

```buffer
- > [!note] Title
- ┃two
  > lines
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> [!note] Title
┃two
lines
```

</td><td>

```buffer
- > [!note] Title
- ┃two
  > lines
```

</td></tr>
</table>

### [QuoteText8](../spec/quotes.md#quotetext8)

Adapted: as blocks, blank lines, paragraph, quote, under enterInQuote: split

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- > ab┃
```

</td></tr>
</table>

> enter

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- > ab
- ┃
```

</td></tr>
</table>

> enter

<table>
<tr><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- > ab
- 
- ┃
```

</td><td>

```buffer
- > ab
- ┃
```

</td></tr>
</table>

> "c"

<table>
<tr><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- > ab
- 
- c┃
```

</td><td>

```buffer
- > ab
- c┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter</th><th>enter</th><th>"c"</th></tr>
<tr valign="top"><td>

```buffer
> ab┃
```

</td><td>

```buffer
- > ab
- ┃
```

</td><td>

```buffer
- > ab

┃◌
```

</td><td>

```buffer
- > ab

c┃
```

</td></tr>
</table>

### [QuoteText9](../spec/quotes.md#quotetext9)

Adapted: as blocks, blank lines, paragraph, quote, under enterInQuote: split

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- > ab┃
```

</td></tr>
</table>

> enter

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- > ab
- ┃
```

</td></tr>
</table>

> enter

<table>
<tr><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- > ab
- 
- ┃
```

</td><td>

```buffer
- > ab
- ┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter</th><th>enter</th></tr>
<tr valign="top"><td>

```buffer
- > ab┃
```

</td><td>

```buffer
- > ab
- ┃
```

</td><td>

```buffer
- > ab

┃◌
```

</td></tr>
</table>

### [QuoteAtom13](../spec/quotes.md#quoteatom13)

Adapted: as blocks, blank lines, paragraph, quote, under enterInQuote: split

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- > - a┃
```

</td></tr>
</table>

> enter

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- > - a
- ┃
```

</td></tr>
</table>

> enter

<table>
<tr><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- > - a
- 
- ┃
```

</td><td>

```buffer
- > - a
- ┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter</th><th>enter</th></tr>
<tr valign="top"><td>

```buffer
> - a┃
```

</td><td>

```buffer
- > - a
- ┃
```

</td><td>

```buffer
- > - a

┃◌
```

</td></tr>
</table>

### [QuoteAtom18](../spec/quotes.md#quoteatom18)

> enter

Adapted: as blocks, quote

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- > a┃b
  cd
```

</td><td>

```buffer
- > a
- ┃b
  cd
```

</td><td>

```buffer
- > a
- ┃b
  > cd
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> a┃b
cd
```

</td><td>

```buffer
- > a
- ┃b
  > cd
```

</td></tr>
</table>

### [Regression5](../spec/regressions.md#regression5)

> enter

Adapted: as blocks, escape, link reference definition, paragraph, under enterSplitSpace: start

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [a]: ┃/url
```

</td><td>

```buffer
- [a]: 
- ┃/url
```

</td><td>

```buffer
- [a]: 
  ┃/url
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
- [a]: 
┃/url
```

</td></tr>
</table>

### [Regression6](../spec/regressions.md#regression6)

> deleteContentBackward

Adapted: as blocks, code block

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

`````````````buffer
- ```
  x┃````````````
  body
  ```
`````````````

</td><td>

`````````````buffer
- ```
  ┃````````````
  body
  ```
`````````````

</td><td>

``````````````buffer
- `````````````
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
- `````````````
  ┃````````````
  body
  `````````````
``````````````

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

Adapted: as blocks, paragraph

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- «ab»c
```

</td><td>

```buffer
- 
  x┃abc
```

</td><td>

```buffer
- x┃c
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
«ab»c
```

</td><td>

```buffer
- x┃c
```

</td></tr>
</table>

### [Regression33](../spec/regressions.md#regression33)

> deleteSoftLineBackward

Adapted: as blocks, numbered list, quote, under quotes: atom

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- > q1
  p ┃2) x
```

</td><td>

```buffer
- > q1
  ┃2\) x
```

</td><td>

```buffer
- > q1
- x
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> q1
p ┃2) x
```

</td><td>

```buffer
- > q1
┃2) x
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

Adapted: as blocks, quote, under quotes: atom

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- > a┃b
  > c
```

</td><td>

````buffer
- > a- x
  
    ```
    c
    ```┃b
  > c
````

</td><td>

````buffer
- > a- x
  > 
  >   ```
  >   c
  >   ```┃b
  > c
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
- > a- x
  > 
  >   ```
  >   c
  >   ```┃b
  > c
````

</td></tr>
</table>

### [Regression64](../spec/regressions.md#regression64)

> indent

Adapted: blank lines, quote

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- > ┃q
  →2) long text
```

</td><td>

```buffer
- a
  - > ┃q
    →2) long text
```

</td><td>

```buffer
- a
- > ┃q
  →2) long text
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

> ┃q
→2) long text
```

</td><td>

```buffer
- a

> ┃q
→2) long text
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

Adapted: code block, under quirkPasteCaret: athens

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- example┃
- next
```

</td><td>

````buffer
- example
- !┃```
- code
- ```
- next
````

</td><td>

````buffer
- example
  - ```
    !┃code
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
  !┃code
  ```
- next
````

</td></tr>
</table>

### [Scenario23](../spec/scenarios.md#scenario23)

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
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- # Plan
- revise ┃2. draft
```

</td></tr>
</table>

> shiftEnter

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- # Plan
- revise 
  ┃2\. draft
```

</td></tr>
</table>

> undo undo undo

<table>
<tr><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Plan
- revis┃2. draft
```

</td><td>

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

Adapted: under pasteOverSelection: ignore

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
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
- b
  - b1
- p
- q┃
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
- ««b»»
  - b1
- c
```

</td><td>

```buffer
- a
- b
  - b1
- p
- q┃
- c
```

</td></tr>
</table>

### [SubtreeEdit16](../spec/subtree-selection.md#subtreeedit16)

> deleteContentForward "x"

Adapted: paragraph

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ««a
  - a1
- b»»
```

</td><td>

```buffer

```

</td><td>

```buffer
- x┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ««a
  - a1
- b»»
```

</td><td>

```buffer
x┃
```

</td></tr>
</table>

## Adapted: whitespace (22)

### [Copy4](../spec/copy.md#copy4)

Adapted: the node at the caret selected (selectSubtree)

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

> selectSubtree copy

Original:
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

### [Copy9](../spec/copy.md#copy9)

Adapted: the node at the caret selected (selectSubtree)

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

> selectSubtree copy

Original:
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

### [Cut4](../spec/copy.md#cut4)

> selectSubtree cut

Adapted: the node at the caret selected (selectSubtree)

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
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

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

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

### [Enter37](../spec/enter.md#enter37)

> enter

Adapted: as blocks, numbered list

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  text
  ┃
```

</td><td>

```buffer
- a
  text
  
- ┃
```

</td><td>

```buffer
- a
  text
- ┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a
   text
   ┃
```

</td><td>

```buffer
- a
  text
- ┃
```

</td></tr>
</table>

### [Enter52](../spec/enter.md#enter52)

> enter

Adapted: blank lines, heading, paragraph, setext heading

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
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

### [Enter68](../spec/enter.md#enter68)

> enter

Adapted: as blocks, paragraph, quote, under quotes: atom

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- > [!note] ┃q
- p # h
```

</td><td>

```buffer
- > [!note] 
- ┃q
- p # h
```

</td><td>

```buffer
- > [!note]
- ┃q
- p # h
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> [!note] ┃q
p # h
```

</td><td>

```buffer
- > [!note]
- ┃q
- p # h
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
<tr><th>athens</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
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

Adapted: as blocks, paragraph

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃abc
```

</td><td>

```buffer
- 
  x┃abc
```

</td><td>

```buffer
- x┃abc
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
┃abc
```

</td><td>

```buffer
- x┃abc
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

Adapted: as blocks, blank lines, paragraph

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- p
- ┃abc
```

</td><td>

```buffer
- p
- 
  
  x┃abc
```

</td><td>

```buffer
- p
- x┃abc
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
p

┃abc
```

</td><td>

```buffer
- p
- x┃abc
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
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
-   ```
    ┃
    ```
````

</td><td>

````buffer
-   ```
    a
    b┃
    ```
````

</td><td>

````buffer
-   ```
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

Adapted: as blocks, blank lines, paragraph, under quirkPasteCaret: athens

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  ┃
- b
```

</td><td>

```buffer
- a
  
- ┃x
- b
```

</td><td>

```buffer
- a
- ┃x
- b
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
- a
  
- ┃x
- b
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

Adapted: as blocks, paragraph, under quirkPasteCaret: athens

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- p┃
```

</td><td>

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
- p
- ┃a
- b
```

</td></tr>
</table>

### [Placeholder4](../spec/placeholders.md#placeholder4)

Adapted: as blocks, blank lines, paragraph

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
<tr><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- para
  ┃
```

</td><td>

```buffer
- para
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
- para
  ┃
```

</td><td>

```buffer
┃- para
  
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
<tr><th>athens</th><th>ourus</th></tr>
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

### [Placeholder18](../spec/placeholders.md#placeholder18)

Adapted: as blocks, blank lines, escape, paragraph

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a┃ # b
- after
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- ┃ # b
- after
```

</td></tr>
</table>

> cursorDocEnd

<table>
<tr><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
-  # b
- after┃
```

</td><td>

```buffer
- # b
- after
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>deleteContentBackward</th><th>cursorDocEnd</th></tr>
<tr valign="top"><td>

```buffer
a┃ # b

after
```

</td><td>

```buffer
- ┃◌ # b
- after
```

</td><td>

```buffer
- \# b
- after
┃
```

</td></tr>
</table>

### [Placeholder19](../spec/placeholders.md#placeholder19)

Adapted: as blocks, blank lines, escape, paragraph

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

````buffer
- para
  a┃ ``` x
- after
````

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

````buffer
- para
  ┃ ``` x
- after
````

</td></tr>
</table>

> cursorDocEnd

<table>
<tr><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- para
   ``` x
- after┃
````

</td><td>

````buffer
- para
  ``` x
- after
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
- para
  ┃◌ ``` x
- after
````

</td><td>

````buffer
- para
  \``` x
- after
┃
````

</td></tr>
</table>

### [Quote42](../spec/quotes.md#quote42)

> enter

Adapted: as blocks, escape, quote, under enterSplitSpace: start, under quotes: atom

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- > para ┃- x
  > - a
```

</td><td>

```buffer
- > para 
- ┃- x
  > - a
```

</td><td>

```buffer
- > para
- ┃- x
  > - a
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> para ┃- x
> - a
```

</td><td>

```buffer
- > para
- ┃\- x
  > - a
```

</td></tr>
</table>

### [QuoteText10](../spec/quotes.md#quotetext10)

> enter

Adapted: as blocks, quote, under quotes: atom

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- > ┃ab
```

</td><td>

```buffer
- > 
- ┃ab
```

</td><td>

```buffer
- >
- ┃ab
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
- >
- ┃ab
```

</td></tr>
</table>

### [QuoteText19](../spec/quotes.md#quotetext19)

> enter

Adapted: as blocks, quote, under copyAtCaret: host, under copySelection: nodes, under emptyItemWithChildren: refuse, under enterInQuote: split, under enterOnEmptyItem: outdent, under enterSplitSpace: start, under enterTask: plain, under joinWithChildren: refuse, under mixedDepths: refuse, under outdent: logical, under pasteLines: items, under pasteOverSelection: ignore, under pasteParagraphList: children, under quirkPasteCaret: athens, under quotes: atom

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- > ┃
```

</td><td>

```buffer
- > 
- ┃
```

</td><td>

```buffer
- >
- ┃
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
- >
- ┃
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
<tr><th>athens</th><th>ourus</th></tr>
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
<tr><th>athens</th><th>ourus</th></tr>
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

## Adapted: caret (16)

### [Backspace43](../spec/backspace.md#backspace43)

Adapted: as blocks, paragraph

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- ┃para
```

</td></tr>
</table>

> enter

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- ┃
- para
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- para
```

</td><td>

```buffer
- ┃para
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter</th><th>deleteContentBackward</th></tr>
<tr valign="top"><td>

```buffer
┃para
```

</td><td>

```buffer
- ┃
- para
```

</td><td>

```buffer
- ┃para
```

</td></tr>
</table>

### [CursorUp2](../spec/cursor.md#cursorup2)

> cursorLineUp

Adapted: heading

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ## Title
  - ┃a
```

</td><td>

```buffer
- ┃## Title
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

### [CursorDown5](../spec/cursor.md#cursordown5)

> cursorLineDown

Adapted: as blocks, task

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- [ ] task
```

</td><td>

```buffer
- a
- [ ] task┃
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

### [CursorHome8](../spec/cursor.md#cursorhome8)

> cursorLineBoundaryBackward

Adapted: as blocks, task

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] task┃
```

</td><td>

```buffer
- ┃[ ] task
```

</td><td>

```buffer
- [ ] ┃task
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] task┃
```

</td><td>

```buffer
- [ ] ┃task
```

</td></tr>
</table>

### [CursorHome9](../spec/cursor.md#cursorhome9)

> cursorLineBoundaryBackward

Adapted: as blocks, task

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [x] done┃
```

</td><td>

```buffer
- ┃[x] done
```

</td><td>

```buffer
- [x] ┃done
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [x] done┃
```

</td><td>

```buffer
- [x] ┃done
```

</td></tr>
</table>

### [CursorHome10](../spec/cursor.md#cursorhome10)

> cursorLineBoundaryBackward

Adapted: heading

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ## Title┃
```

</td><td>

```buffer
- ┃## Title
```

</td><td>

```buffer
- ## ┃Title
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
## Title┃
```

</td><td>

```buffer
## ┃Title
```

</td></tr>
</table>

### [MoveSubtree19](../spec/move-subtree.md#movesubtree19)

> moveSubtree

Adapted: numbered list

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ««b
- c»»
```

</td><td>

```buffer
- b
- c
- a
```

</td><td>

```buffer
- ««b
- c»»
- a
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
▸
1. a
2. ««b
3. c»»
```

</td><td>

```buffer
1. ««b
2. c»»
3. a
```

</td></tr>
</table>

### [Outdent17](../spec/outdent.md#outdent17)

> outdent

Adapted: as blocks, heading

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃# H
- b
```

</td><td>

```buffer
- ┃# H
- b
```

</td><td>

```buffer
- # ┃H
  - b
```

</td></tr>
</table>

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

### [Outdent18](../spec/outdent.md#outdent18)

> outdent

Adapted: as blocks, blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃# H
- b
- after
```

</td><td>

```buffer
- ┃# H
- b
- after
```

</td><td>

```buffer
- # ┃H
  - b
  - after
```

</td></tr>
</table>

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
# ┃H
- b
- after
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

Adapted: blank lines, heading, paragraph, under quirkPasteCaret: athens

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # A
  - p┃
  - q
  - ## B
    - r
```

</td><td>

```buffer
- # A
  - p
  - ┃## h
  - text
  - q
  - ## B
    - r
```

</td><td>

```buffer
- # A
  - p
  - ## ┃h
    - text
    - q
  - ## B
    - r
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

p

## ┃h
text

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

Adapted: blank lines, heading, paragraph, under quirkPasteCaret: athens

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ## A┃
  - p
- ## B
```

</td><td>

```buffer
- ## A
  - ┃## h
  - text
  - p
- ## B
```

</td><td>

```buffer
- ## A
- ## ┃h
  - text
  - p
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

p

## B
```

</td><td>

```buffer
## A

## ┃h
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

Adapted: blank lines, heading, paragraph, under quirkPasteCaret: athens

<table>
<tr><th>buffer</th><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ## A┃
  - p
```

</td><td>

```buffer
- ## A
  - ┃### h
  - text
  - p
```

</td><td>

```buffer
- ## A
  - ### ┃h
    - text
    - p
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

### ┃h
text

p
```

</td></tr>
</table>

### [Select8](../spec/select.md#select8)

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- # H
  - pa┃ra
    - x
- # I
```

</td></tr>
</table>

> expandSelection

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- # H
  - «para»
    - x
- # I
```

</td></tr>
</table>

> expandSelection

<table>
<tr><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # H
  - «para»
    - x
- # I
```

</td><td>

```buffer
- # H
  - ««para»»
    - x
- # I
```

</td></tr>
</table>

> expandSelection

<table>
<tr><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # H
  - «para»
    - x
- # I
```

</td><td>

```buffer
- ««# H»»
  - para
    - x
- # I
```

</td></tr>
</table>

> expandSelection

<table>
<tr><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # H
  - «para»
    - x
- # I
```

</td><td>

```buffer
- ««# H
  - para
    - x
- # I»»
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>expandSelection</th><th>expandSelection</th><th>expandSelection</th><th>expandSelection</th></tr>
<tr valign="top"><td>

```buffer
# H

pa┃ra
- x

# I
```

</td><td>

```buffer
# H

«para»
- x

# I
```

</td><td>

```buffer
# H

««para»»
- x

# I
```

</td><td>

```buffer
# ««H»»

para
- x

# I
```

</td><td>

```buffer
# ««H

para
- x

# I»»
```

</td></tr>
</table>

### [Select9](../spec/select.md#select9)

Adapted: as blocks, task

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- [ ] ta┃sk
  - sub
- c
```

</td></tr>
</table>

> expandSelection

<table>
<tr><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- «[ ] task»
  - sub
- c
```

</td><td>

```buffer
- [ ] «task»
  - sub
- c
```

</td></tr>
</table>

> expandSelection

<table>
<tr><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- «[ ] task»
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
<tr><th>buffer</th><th>expandSelection</th><th>expandSelection</th></tr>
<tr valign="top"><td>

```buffer
- [ ] ta┃sk
  - sub
- c
```

</td><td>

```buffer
- [ ] «task»
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
<tr><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
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

> cursorDocStart cursorLineBoundaryForward

<table>
<tr><th>athens</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- 
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
- ┃
```

</td><td>

```buffer
- a┃
- 
```

</td></tr>
</table>

## Adapted: error (1)

### [SubtreeEdit9](../spec/subtree-selection.md#subtreeedit9)

Adapted: as blocks, task

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- ««[ ] task»»
  - sub
- c
```

</td></tr>
</table>

> "x"

Error: Athens holds the starting state differently:
  meant:
    - ««[ ] task»»
      - sub
    - c
  holds:
    - ««[x] task»»
      - sub
    - c

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

## Skipped (634)

| example | why |
| --- | --- |
| **backspace.md** | |
| [Backspace2](../spec/backspace.md#backspace2) | caret in a marker |
| [Backspace4](../spec/backspace.md#backspace4) | tag markup-heading |
| [Backspace12e](../spec/backspace.md#backspace12e) | tag free-form |
| [Backspace14](../spec/backspace.md#backspace14) | tag free-form |
| [Backspace16](../spec/backspace.md#backspace16) | tag markup-fence |
| [Backspace17e](../spec/backspace.md#backspace17e) | tag free-form |
| [Backspace18](../spec/backspace.md#backspace18) | tag free-form |
| [Backspace18b](../spec/backspace.md#backspace18b) | tag free-form |
| [Backspace18c](../spec/backspace.md#backspace18c) | tag free-form |
| [Backspace18d](../spec/backspace.md#backspace18d) | tag free-form |
| [Backspace18e](../spec/backspace.md#backspace18e) | tag markup-heading |
| [Backspace18f](../spec/backspace.md#backspace18f) | tag markup-heading |
| [Backspace18g](../spec/backspace.md#backspace18g) | tag markup-heading |
| [Backspace19b](../spec/backspace.md#backspace19b) | tag free-form |
| [Backspace23](../spec/backspace.md#backspace23) | tag free-form |
| [Backspace24](../spec/backspace.md#backspace24) | tag markup-fence |
| [Backspace27](../spec/backspace.md#backspace27) | tag free-form |
| [Backspace28](../spec/backspace.md#backspace28) | tag markup-fence |
| [Backspace31](../spec/backspace.md#backspace31) | selection across blocks |
| [Backspace33](../spec/backspace.md#backspace33) | tag free-form |
| [Backspace34](../spec/backspace.md#backspace34) | option backspaceAtTopItem: refuse |
| [Backspace35](../spec/backspace.md#backspace35) | tag free-form |
| [SoftBackspace1](../spec/backspace.md#softbackspace1) | tag markup-task |
| [SoftBackspace3](../spec/backspace.md#softbackspace3) | tag markup-heading |
| [SoftBackspace4](../spec/backspace.md#softbackspace4) | tag markup-heading |
| [SoftBackspace6](../spec/backspace.md#softbackspace6) | tag markup-heading |
| [SoftBackspace7](../spec/backspace.md#softbackspace7) | tag free-form |
| [SoftBackspace8](../spec/backspace.md#softbackspace8) | tag free-form |
| [SoftBackspace9](../spec/backspace.md#softbackspace9) | tag markup-fence |
| [SoftBackspace10](../spec/backspace.md#softbackspace10) | tag markup-task |
| [SoftBackspace11](../spec/backspace.md#softbackspace11) | tag free-form |
| [Backspace42](../spec/backspace.md#backspace42) | tag free-form |
| [Backspace42b](../spec/backspace.md#backspace42b) | option markup: decorated |
| [Backspace43c](../spec/backspace.md#backspace43c) | tag free-form |
| [Backspace47](../spec/backspace.md#backspace47) | tag free-form |
| [Backspace49](../spec/backspace.md#backspace49) | option joinWithChildren: the app's refuse, as blocks |
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
| [Backtick8](../spec/backtick.md#backtick8) | tag free-form |
| [Backtick9](../spec/backtick.md#backtick9) | tag markup-fence |
| [Backtick10](../spec/backtick.md#backtick10) | tag markup-fence |
| [Backtick11](../spec/backtick.md#backtick11) | tag markup-fence |
| [Backtick12](../spec/backtick.md#backtick12) | tag markup-fence |
| [Backtick13](../spec/backtick.md#backtick13) | tag markup-fence |
| [Backtick14](../spec/backtick.md#backtick14) | tag markup-fence |
| [Backtick15](../spec/backtick.md#backtick15) | tag markup-fence |
| [Backtick16](../spec/backtick.md#backtick16) | tag markup-fence |
| [Backtick17](../spec/backtick.md#backtick17) | tag free-form |
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
| [Copy5](../spec/copy.md#copy5) | selection across blocks |
| [Copy6](../spec/copy.md#copy6) | nothing to compare |
| [Copy7](../spec/copy.md#copy7) | selection across blocks |
| [Cut2](../spec/copy.md#cut2) | selection across blocks |
| [Cut3](../spec/copy.md#cut3) | selection across blocks |
| **cursor.md** | |
| [CursorDown2](../spec/cursor.md#cursordown2) | indented code |
| [CursorHome3](../spec/cursor.md#cursorhome3) | caret in a marker |
| [CursorHome4](../spec/cursor.md#cursorhome4) | caret in a marker |
| [CursorHome15](../spec/cursor.md#cursorhome15) | caret in a marker |
| [CursorDocEndLeft1](../spec/cursor.md#cursordocendleft1) | cursorCharLeft after cursorDocEnd |
| **delete-subtree.md** | |
| [DeleteSubtree6](../spec/delete-subtree.md#deletesubtree6) | no text focus after deleteSubtree |
| [DeleteSubtree12](../spec/delete-subtree.md#deletesubtree12) | option quotes: container |
| **delete.md** | |
| [Delete4](../spec/delete.md#delete4) | tag markup-heading |
| [Delete4b](../spec/delete.md#delete4b) | tag markup-heading |
| [Delete9](../spec/delete.md#delete9) | tag free-form |
| [Delete10](../spec/delete.md#delete10) | option quotes: container |
| [Delete11](../spec/delete.md#delete11) | tag markup-fence |
| [Delete13](../spec/delete.md#delete13) | tag markup-heading |
| [Delete13b](../spec/delete.md#delete13b) | tag markup-heading |
| [Delete13c](../spec/delete.md#delete13c) | tag free-form |
| [Delete13d](../spec/delete.md#delete13d) | tag free-form |
| [Delete13e](../spec/delete.md#delete13e) | tag free-form |
| [Delete13f](../spec/delete.md#delete13f) | tag markup-heading |
| [Delete13g](../spec/delete.md#delete13g) | tag markup-heading |
| [Delete14](../spec/delete.md#delete14) | tag free-form |
| [Delete15](../spec/delete.md#delete15) | tag markup-heading |
| [Delete16](../spec/delete.md#delete16) | tag free-form |
| [Delete16b](../spec/delete.md#delete16b) | tag free-form |
| [Delete16c](../spec/delete.md#delete16c) | tag free-form |
| [Delete16d](../spec/delete.md#delete16d) | tag free-form |
| [Delete16e](../spec/delete.md#delete16e) | tag free-form |
| [Delete16f](../spec/delete.md#delete16f) | tag free-form |
| [Delete18d](../spec/delete.md#delete18d) | tag free-form |
| [Delete19](../spec/delete.md#delete19) | tag markup-task |
| [Delete21](../spec/delete.md#delete21) | selection across blocks |
| [Delete23](../spec/delete.md#delete23) | tag free-form |
| [Delete24](../spec/delete.md#delete24) | tag free-form |
| [Delete25](../spec/delete.md#delete25) | tag free-form |
| [Delete29](../spec/delete.md#delete29) | tag free-form |
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
| [DuplicateSubtree4](../spec/duplicate-subtree.md#duplicatesubtree4) | tag free-form |
| [DuplicateSubtree5](../spec/duplicate-subtree.md#duplicatesubtree5) | option quotes: container |
| [DuplicateSubtree6](../spec/duplicate-subtree.md#duplicatesubtree6) | tag free-form |
| [DuplicateSubtree7](../spec/duplicate-subtree.md#duplicatesubtree7) | action duplicateSubtree |
| [DuplicateSubtree8](../spec/duplicate-subtree.md#duplicatesubtree8) | tag markup-fence |
| [DuplicateSubtree9](../spec/duplicate-subtree.md#duplicatesubtree9) | tag markup-fence |
| [DuplicateSubtree10](../spec/duplicate-subtree.md#duplicatesubtree10) | action duplicateSubtree |
| [DuplicateSubtree11](../spec/duplicate-subtree.md#duplicatesubtree11) | action duplicateSubtree |
| [DuplicateSubtree12](../spec/duplicate-subtree.md#duplicatesubtree12) | action duplicateSubtree |
| **enter.md** | |
| [Enter3b](../spec/enter.md#enter3b) | option enterMidItem: child |
| [Enter6](../spec/enter.md#enter6) | tag free-form |
| [Enter7b](../spec/enter.md#enter7b) | tag free-form |
| [Enter7c](../spec/enter.md#enter7c) | option enterOnEmptyItem: unwrap |
| [Enter14](../spec/enter.md#enter14) | tag free-form |
| [Enter15b](../spec/enter.md#enter15b) | tag free-form |
| [Enter21b](../spec/enter.md#enter21b) | option enterOnEmptyItem: unwrap |
| [Enter23](../spec/enter.md#enter23) | indented code |
| [Enter26b](../spec/enter.md#enter26b) | option enterAtTextStart: stay |
| [Enter27b](../spec/enter.md#enter27b) | option enterOnEmptyItem: unwrap |
| [Enter29b](../spec/enter.md#enter29b) | option enterAtTextStart: stay |
| [Enter32](../spec/enter.md#enter32) | tag markup-heading |
| [Enter32b](../spec/enter.md#enter32b) | tag markup-heading |
| [Enter33b](../spec/enter.md#enter33b) | option enterAtTextStart: stay |
| [Enter34](../spec/enter.md#enter34) | caret in a marker |
| [Enter40](../spec/enter.md#enter40) | tag free-form |
| [Enter41](../spec/enter.md#enter41) | tag free-form |
| [Enter64](../spec/enter.md#enter64) | option enterSplitSpace: drop |
| [Enter65g](../spec/enter.md#enter65g) | tag markup-task |
| [Enter65l](../spec/enter.md#enter65l) | tag markup-heading |
| [Enter65m](../spec/enter.md#enter65m) | tag markup-heading |
| [Enter45](../spec/enter.md#enter45) | tag markup-heading |
| [Enter46](../spec/enter.md#enter46) | option quotes: container |
| [Enter50](../spec/enter.md#enter50) | tag free-form |
| [Enter54](../spec/enter.md#enter54) | tag markup-task |
| [Enter54b](../spec/enter.md#enter54b) | tag markup-task |
| [Enter55](../spec/enter.md#enter55) | tag markup-heading |
| [Enter55b](../spec/enter.md#enter55b) | tag markup-heading |
| [Enter55c](../spec/enter.md#enter55c) | tag free-form |
| [Enter56](../spec/enter.md#enter56) | selection across blocks |
| [Enter60](../spec/enter.md#enter60) | tag markup-heading |
| [Enter60b](../spec/enter.md#enter60b) | tag markup-heading |
| [Enter61](../spec/enter.md#enter61) | tag markup-heading |
| [Enter63](../spec/enter.md#enter63) | tag free-form |
| [Enter63b](../spec/enter.md#enter63b) | option enterOnEmptyItem: exit |
| **fences.md** | |
| [Fence1](../spec/fences.md#fence1) | tag enter-in-fence |
| [Fence2](../spec/fences.md#fence2) | tag enter-in-fence |
| [Fence3](../spec/fences.md#fence3) | tag enter-in-fence |
| [Fence4](../spec/fences.md#fence4) | tag enter-in-fence |
| [Fence5](../spec/fences.md#fence5) | tag enter-in-fence |
| [Fence6](../spec/fences.md#fence6) | tag markup-fence |
| [Fence7](../spec/fences.md#fence7) | tag markup-fence |
| [Fence7b](../spec/fences.md#fence7b) | tag markup-fence |
| [Fence7c](../spec/fences.md#fence7c) | tag markup-fence |
| [Fence7d](../spec/fences.md#fence7d) | tag markup-fence |
| [Fence9](../spec/fences.md#fence9) | tag markup-fence |
| [Fence10](../spec/fences.md#fence10) | tag enter-in-fence |
| [Fence11](../spec/fences.md#fence11) | tag markup-fence |
| [Fence12](../spec/fences.md#fence12) | tag markup-fence |
| [Fence13](../spec/fences.md#fence13) | tag markup-fence |
| [Fence14](../spec/fences.md#fence14) | tag markup-fence |
| [Fence15](../spec/fences.md#fence15) | tag markup-fence |
| [Fence17](../spec/fences.md#fence17) | tag markup-fence |
| [Fence19](../spec/fences.md#fence19) | tag markup-fence |
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
| [Fence42](../spec/fences.md#fence42) | tag enter-in-fence |
| [Fence44](../spec/fences.md#fence44) | indented code |
| [Fence45](../spec/fences.md#fence45) | tag markup-fence |
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
| [Fold2b](../spec/fold.md#fold2b) | option enterMidItem: child |
| [Fold4](../spec/fold.md#fold4) | action moveSubtreeUp |
| [Fold8](../spec/fold.md#fold8) | action duplicateSubtree |
| [Fold9](../spec/fold.md#fold9) | action fold ② |
| [Fold10](../spec/fold.md#fold10) | action fold ① |
| [Fold11](../spec/fold.md#fold11) | action toggleFold |
| [Fold13](../spec/fold.md#fold13) | its view, on an adapted start |
| [Fold15b](../spec/fold.md#fold15b) | changes only what blocks can't show |
| [Fold16](../spec/fold.md#fold16) | action moveSubtreeDown |
| **gaps.md** | |
| [Gap1](../spec/gaps.md#gap1) | action moveSubtreeUp |
| [Gap2](../spec/gaps.md#gap2) | action moveSubtreeDown |
| [Gap3](../spec/gaps.md#gap3) | action moveSubtreeUp |
| [Gap4](../spec/gaps.md#gap4) | action moveSubtreeUp |
| [Gap5](../spec/gaps.md#gap5) | action moveSubtreeUp |
| [Gap6](../spec/gaps.md#gap6) | action moveSubtreeDown |
| [Gap7](../spec/gaps.md#gap7) | action moveSubtreeDown |
| [Gap8](../spec/gaps.md#gap8) | action moveSubtreeUp |
| [Gap9](../spec/gaps.md#gap9) | action moveSubtreeUp |
| [Gap10](../spec/gaps.md#gap10) | action moveSubtreeUp |
| [Gap11](../spec/gaps.md#gap11) | action moveSubtreeDown |
| [Gap14](../spec/gaps.md#gap14) | action moveSubtreeUp |
| [Gap15](../spec/gaps.md#gap15) | caret on a blank line |
| [Gap16](../spec/gaps.md#gap16) | caret on a blank line |
| [Gap17](../spec/gaps.md#gap17) | action moveSubtreeDown |
| [Gap18](../spec/gaps.md#gap18) | action moveSubtreeDown |
| [Gap19](../spec/gaps.md#gap19) | frontmatter |
| **indent.md** | |
| [Indent11](../spec/indent.md#indent11) | changes only what blocks can't show |
| [Indent12](../spec/indent.md#indent12) | tag free-form |
| [Indent16](../spec/indent.md#indent16) | tag free-form |
| [Indent22](../spec/indent.md#indent22) | tag free-form |
| [Indent23](../spec/indent.md#indent23) | tag free-form |
| [Indent25](../spec/indent.md#indent25) | tag free-form |
| [Indent28](../spec/indent.md#indent28) | caret in a marker |
| [Indent30](../spec/indent.md#indent30) | caret in a marker |
| [Indent31](../spec/indent.md#indent31) | tag markup-fence |
| [Indent31b](../spec/indent.md#indent31b) | tag markup-fence |
| [Indent32](../spec/indent.md#indent32) | changes only what blocks can't show |
| [Indent37b](../spec/indent.md#indent37b) | changes only what blocks can't show |
| [Indent38](../spec/indent.md#indent38) | indented code |
| [Indent39](../spec/indent.md#indent39) | option indentUnit: tab |
| [Indent40](../spec/indent.md#indent40) | option indentUnit: 2 |
| [Indent41](../spec/indent.md#indent41) | option indentUnit: tab |
| [Indent42](../spec/indent.md#indent42) | option indentUnit: tab |
| [Indent45b](../spec/indent.md#indent45b) | indented code |
| [Indent47](../spec/indent.md#indent47) | option mixedDepths: each |
| [Indent48](../spec/indent.md#indent48) | option mixedDepths: each |
| [Indent50](../spec/indent.md#indent50) | nothing to compare |
| **lists.md** | |
| [Lists1](../spec/lists.md#lists1) | action moveSubtreeDown |
| [Lists2](../spec/lists.md#lists2) | option listParent: container |
| [Lists3](../spec/lists.md#lists3) | option listParent: container |
| [Lists4](../spec/lists.md#lists4) | option listParent: block |
| [Lists5](../spec/lists.md#lists5) | action moveSubtreeDown |
| [Lists6](../spec/lists.md#lists6) | option listParent: container |
| [Lists7](../spec/lists.md#lists7) | action moveSubtreeDown |
| [Lists8](../spec/lists.md#lists8) | option listParent: container |
| [Lists8b](../spec/lists.md#lists8b) | option listParent: container |
| [Lists10](../spec/lists.md#lists10) | option listParent: container |
| [Lists11](../spec/lists.md#lists11) | action moveSubtreeDown |
| [Lists12](../spec/lists.md#lists12) | option listParent: container |
| [Lists13](../spec/lists.md#lists13) | option listParent: container |
| [Lists14](../spec/lists.md#lists14) | option listParent: container |
| [Lists15](../spec/lists.md#lists15) | option listParent: container |
| **move-subtree-down.md** | |
| [MoveDown1](../spec/move-subtree-down.md#movedown1) | action moveSubtreeDown |
| [MoveDown2](../spec/move-subtree-down.md#movedown2) | tag free-form |
| [MoveDown3](../spec/move-subtree-down.md#movedown3) | action moveSubtreeDown |
| [MoveDown4](../spec/move-subtree-down.md#movedown4) | action moveSubtreeDown |
| [MoveDown5](../spec/move-subtree-down.md#movedown5) | action moveSubtreeDown |
| [MoveDown6](../spec/move-subtree-down.md#movedown6) | action moveSubtreeDown |
| [MoveDown7](../spec/move-subtree-down.md#movedown7) | action moveSubtreeDown |
| [MoveDown8](../spec/move-subtree-down.md#movedown8) | action moveSubtreeDown |
| [MoveDown9](../spec/move-subtree-down.md#movedown9) | action moveSubtreeDown |
| [MoveDown10](../spec/move-subtree-down.md#movedown10) | action moveSubtreeDown |
| [MoveDown11](../spec/move-subtree-down.md#movedown11) | action moveSubtreeDown |
| [MoveDown12](../spec/move-subtree-down.md#movedown12) | action moveSubtreeDown |
| [MoveDown13](../spec/move-subtree-down.md#movedown13) | action moveSubtreeDown |
| [MoveDown14](../spec/move-subtree-down.md#movedown14) | action moveSubtreeDown |
| [MoveDown15](../spec/move-subtree-down.md#movedown15) | action moveSubtreeDown |
| [MoveDown16](../spec/move-subtree-down.md#movedown16) | action moveSubtreeDown |
| [MoveDown17](../spec/move-subtree-down.md#movedown17) | tag free-form |
| [MoveDown18](../spec/move-subtree-down.md#movedown18) | action moveSubtreeDown |
| [MoveDown19](../spec/move-subtree-down.md#movedown19) | tag free-form |
| [MoveDown20](../spec/move-subtree-down.md#movedown20) | tag free-form |
| [MoveDown21](../spec/move-subtree-down.md#movedown21) | action moveSubtreeDown |
| [MoveDown22](../spec/move-subtree-down.md#movedown22) | action moveSubtreeDown |
| [MoveDown23](../spec/move-subtree-down.md#movedown23) | action moveSubtreeDown |
| [MoveDown24](../spec/move-subtree-down.md#movedown24) | action moveSubtreeDown |
| [MoveDown25](../spec/move-subtree-down.md#movedown25) | tag free-form |
| [MoveDown26](../spec/move-subtree-down.md#movedown26) | action moveSubtreeDown |
| [MoveDown27](../spec/move-subtree-down.md#movedown27) | action moveSubtreeDown |
| [MoveDown28](../spec/move-subtree-down.md#movedown28) | tag free-form |
| [MoveDown29](../spec/move-subtree-down.md#movedown29) | action moveSubtreeDown |
| [MoveDown30](../spec/move-subtree-down.md#movedown30) | action moveSubtreeDown |
| [MoveDown31](../spec/move-subtree-down.md#movedown31) | action moveSubtreeDown |
| [MoveDown32](../spec/move-subtree-down.md#movedown32) | action moveSubtreeDown |
| [MoveDown33](../spec/move-subtree-down.md#movedown33) | action moveSubtreeDown |
| [MoveDown34](../spec/move-subtree-down.md#movedown34) | tag markup-fence |
| [MoveDown35](../spec/move-subtree-down.md#movedown35) | action moveSubtreeDown |
| [MoveDown36](../spec/move-subtree-down.md#movedown36) | action moveSubtreeDown |
| [MoveDown37](../spec/move-subtree-down.md#movedown37) | tag markup-fence |
| [MoveDown38](../spec/move-subtree-down.md#movedown38) | tag free-form |
| [MoveDown39](../spec/move-subtree-down.md#movedown39) | action moveSubtreeDown |
| [MoveDown40](../spec/move-subtree-down.md#movedown40) | action moveSubtreeDown |
| [MoveDown41](../spec/move-subtree-down.md#movedown41) | action moveSubtreeDown |
| [MoveDown42](../spec/move-subtree-down.md#movedown42) | action moveSubtreeDown |
| [MoveDown43](../spec/move-subtree-down.md#movedown43) | action moveSubtreeDown |
| [MoveDown44](../spec/move-subtree-down.md#movedown44) | action moveSubtreeDown |
| **move-subtree-up.md** | |
| [MoveUp1](../spec/move-subtree-up.md#moveup1) | action moveSubtreeUp |
| [MoveUp2](../spec/move-subtree-up.md#moveup2) | action moveSubtreeUp |
| [MoveUp3](../spec/move-subtree-up.md#moveup3) | action moveSubtreeUp |
| [MoveUp4](../spec/move-subtree-up.md#moveup4) | action moveSubtreeUp |
| [MoveUp5](../spec/move-subtree-up.md#moveup5) | action moveSubtreeUp |
| [MoveUp6](../spec/move-subtree-up.md#moveup6) | action moveSubtreeUp |
| [MoveUp7](../spec/move-subtree-up.md#moveup7) | action moveSubtreeUp |
| [MoveUp8](../spec/move-subtree-up.md#moveup8) | action moveSubtreeUp |
| [MoveUp9](../spec/move-subtree-up.md#moveup9) | action moveSubtreeUp |
| [MoveUp10](../spec/move-subtree-up.md#moveup10) | action moveSubtreeUp |
| [MoveUp11](../spec/move-subtree-up.md#moveup11) | action moveSubtreeUp |
| [MoveUp12](../spec/move-subtree-up.md#moveup12) | tag free-form |
| [MoveUp13](../spec/move-subtree-up.md#moveup13) | action moveSubtreeUp |
| [MoveUp14](../spec/move-subtree-up.md#moveup14) | action moveSubtreeUp |
| [MoveUp15](../spec/move-subtree-up.md#moveup15) | action moveSubtreeUp |
| [MoveUp16](../spec/move-subtree-up.md#moveup16) | action moveSubtreeUp |
| [MoveUp17](../spec/move-subtree-up.md#moveup17) | action moveSubtreeUp |
| [MoveUp18](../spec/move-subtree-up.md#moveup18) | action moveSubtreeUp |
| [MoveUp19](../spec/move-subtree-up.md#moveup19) | action moveSubtreeUp |
| [MoveUp20](../spec/move-subtree-up.md#moveup20) | action moveSubtreeUp |
| [MoveUp21](../spec/move-subtree-up.md#moveup21) | action moveSubtreeUp |
| [MoveUp22](../spec/move-subtree-up.md#moveup22) | action moveSubtreeUp |
| [MoveUp23](../spec/move-subtree-up.md#moveup23) | action moveSubtreeUp |
| [MoveUp24](../spec/move-subtree-up.md#moveup24) | tag free-form |
| [MoveUp25](../spec/move-subtree-up.md#moveup25) | action moveSubtreeUp |
| [MoveUp26](../spec/move-subtree-up.md#moveup26) | action moveSubtreeUp |
| [MoveUp27](../spec/move-subtree-up.md#moveup27) | tag free-form |
| [MoveUp28](../spec/move-subtree-up.md#moveup28) | tag free-form |
| [MoveUp29](../spec/move-subtree-up.md#moveup29) | tag free-form |
| [MoveUp30](../spec/move-subtree-up.md#moveup30) | action moveSubtreeUp |
| [MoveUp31](../spec/move-subtree-up.md#moveup31) | action moveSubtreeUp |
| [MoveUp32](../spec/move-subtree-up.md#moveup32) | action moveSubtreeUp |
| [MoveUp33](../spec/move-subtree-up.md#moveup33) | tag free-form |
| [MoveUp34](../spec/move-subtree-up.md#moveup34) | action moveSubtreeUp |
| [MoveUp35](../spec/move-subtree-up.md#moveup35) | tag free-form |
| [MoveUp36](../spec/move-subtree-up.md#moveup36) | tag free-form |
| [MoveUp37](../spec/move-subtree-up.md#moveup37) | tag markup-fence |
| [MoveUp38](../spec/move-subtree-up.md#moveup38) | tag markup-fence |
| [MoveUp39](../spec/move-subtree-up.md#moveup39) | action moveSubtreeUp |
| [MoveUp40](../spec/move-subtree-up.md#moveup40) | action moveSubtreeUp |
| [MoveUp41](../spec/move-subtree-up.md#moveup41) | tag markup-fence |
| [MoveUp42](../spec/move-subtree-up.md#moveup42) | action moveSubtreeUp |
| [MoveUp43](../spec/move-subtree-up.md#moveup43) | option indentUnit: tab |
| [MoveUp44](../spec/move-subtree-up.md#moveup44) | action moveSubtreeUp |
| [MoveUp45](../spec/move-subtree-up.md#moveup45) | action moveSubtreeUp |
| [MoveUp46](../spec/move-subtree-up.md#moveup46) | action moveSubtreeUp |
| **move-subtree.md** | |
| [MoveSubtree7](../spec/move-subtree.md#movesubtree7) | changes only what blocks can't show |
| [MoveSubtree8](../spec/move-subtree.md#movesubtree8) | changes only what blocks can't show |
| [MoveSubtree10](../spec/move-subtree.md#movesubtree10) | nothing to compare |
| [MoveSubtree11](../spec/move-subtree.md#movesubtree11) | nothing to compare |
| [MoveSubtree13](../spec/move-subtree.md#movesubtree13) | nothing to compare |
| [MoveSubtree16](../spec/move-subtree.md#movesubtree16) | nothing to compare |
| [MoveSubtree17](../spec/move-subtree.md#movesubtree17) | drop: the pickup is refused (non-contiguous) |
| [MoveSubtree18](../spec/move-subtree.md#movesubtree18) | nothing to compare |
| [MoveSubtree20](../spec/move-subtree.md#movesubtree20) | option mixedDepths: the app's refuse, not replayable |
| **obsidian-true-outliner.md** | |
| [TO-E7-E8](../spec/obsidian-true-outliner.md#to-e7-e8) | option enterMidItem: child |
| [TO-E11](../spec/obsidian-true-outliner.md#to-e11) | option enterMidItem: child |
| [TO-E18](../spec/obsidian-true-outliner.md#to-e18) | tag markup-heading |
| [TO-E19-E21b](../spec/obsidian-true-outliner.md#to-e19-e21b) | tag free-form |
| [TO-S5](../spec/obsidian-true-outliner.md#to-s5) | tag free-form |
| [TO-S7-S8](../spec/obsidian-true-outliner.md#to-s7-s8) | tag markup-heading |
| [TO-S7-S8b](../spec/obsidian-true-outliner.md#to-s7-s8b) | tag markup-heading |
| [TO1](../spec/obsidian-true-outliner.md#to1) | tag markup-task |
| [TO-Seamsd](../spec/obsidian-true-outliner.md#to-seamsd) | indented code |
| [TO-BlockId](../spec/obsidian-true-outliner.md#to-blockid) | action moveSubtreeUp |
| [TO-BlockIdb](../spec/obsidian-true-outliner.md#to-blockidb) | action moveSubtreeUp |
| [TO-Lazy](../spec/obsidian-true-outliner.md#to-lazy) | action moveSubtreeDown |
| [TO-Lazyb](../spec/obsidian-true-outliner.md#to-lazyb) | action moveSubtreeDown |
| [TO-Lazyc](../spec/obsidian-true-outliner.md#to-lazyc) | action moveSubtreeDown |
| [TO18](../spec/obsidian-true-outliner.md#to18) | tag free-form |
| [TO-Bug197](../spec/obsidian-true-outliner.md#to-bug197) | option quotes: container |
| **outdent.md** | |
| [Outdent2](../spec/outdent.md#outdent2) | tag free-form |
| [Outdent4](../spec/outdent.md#outdent4) | tag free-form |
| [Outdent11](../spec/outdent.md#outdent11) | tag free-form |
| [Outdent12](../spec/outdent.md#outdent12) | tag free-form |
| [Outdent14](../spec/outdent.md#outdent14) | caret in a marker |
| [DirectOutdent2](../spec/outdent.md#directoutdent2) | tag free-form |
| [DirectOutdent3](../spec/outdent.md#directoutdent3) | tag free-form |
| [DirectOutdent5](../spec/outdent.md#directoutdent5) | tag free-form |
| [DirectOutdent6](../spec/outdent.md#directoutdent6) | tag free-form |
| [LogicalOutdent2](../spec/outdent.md#logicaloutdent2) | tag free-form |
| [LogicalOutdent3](../spec/outdent.md#logicaloutdent3) | tag free-form |
| [LogicalOutdent6](../spec/outdent.md#logicaloutdent6) | tag free-form |
| [LogicalOutdent5](../spec/outdent.md#logicaloutdent5) | tag free-form |
| [Outdent16](../spec/outdent.md#outdent16) | tag free-form |
| [Outdent19](../spec/outdent.md#outdent19) | tag free-form |
| [Outdent19b](../spec/outdent.md#outdent19b) | tag free-form |
| [Outdent20](../spec/outdent.md#outdent20) | tag free-form |
| [Outdent20b](../spec/outdent.md#outdent20b) | tag free-form |
| [Outdent22b](../spec/outdent.md#outdent22b) | indented code |
| [Outdent23](../spec/outdent.md#outdent23) | option mixedDepths: each |
| [Outdent24](../spec/outdent.md#outdent24) | option mixedDepths: each |
| [Outdent26](../spec/outdent.md#outdent26) | nothing to compare |
| **paste-at.md** | |
| [PasteAt1](../spec/paste-at.md#pasteat1) | action pasteAt |
| [PasteAt2](../spec/paste-at.md#pasteat2) | action pasteAt |
| [PasteAt3](../spec/paste-at.md#pasteat3) | action pasteAt |
| [PasteAt4](../spec/paste-at.md#pasteat4) | action pasteAt |
| [PasteAt5](../spec/paste-at.md#pasteat5) | action deleteByDrag |
| **paste-list-form.md** | |
| [PasteListForm6](../spec/paste-list-form.md#pastelistform6) | option pasteListForm: own |
| **paste-list.md** | |
| [PasteList18](../spec/paste-list.md#pastelist18) | option pasteOnParent: after |
| [PasteList19](../spec/paste-list.md#pastelist19) | option pasteOnParent: after |
| [PasteList20](../spec/paste-list.md#pastelist20) | option pasteAtTextStart: before |
| [PasteList22](../spec/paste-list.md#pastelist22) | option pasteSeams: open |
| [PasteList23](../spec/paste-list.md#pastelist23) | option pasteSeams: open |
| [PasteList24](../spec/paste-list.md#pastelist24) | option pasteSeams: open |
| **paste-plain.md** | |
| [PastePlain4](../spec/paste-plain.md#pasteplain4) | tag free-form |
| [PastePlain21](../spec/paste-plain.md#pasteplain21) | tag free-form |
| [PastePlain22](../spec/paste-plain.md#pasteplain22) | tag free-form |
| [PastePlain27](../spec/paste-plain.md#pasteplain27) | changes only what blocks can't show |
| [PastePlain29](../spec/paste-plain.md#pasteplain29) | tag markup-fence |
| [PastePlain31](../spec/paste-plain.md#pasteplain31) | option pastePlainLines: enter |
| [PastePlain32](../spec/paste-plain.md#pasteplain32) | option pastePlainLines: items |
| [PastePlain33](../spec/paste-plain.md#pasteplain33) | option pastePlainLines: items |
| [PastePlain33b](../spec/paste-plain.md#pasteplain33b) | option pastePlainLines: items |
| [PastePlain33c](../spec/paste-plain.md#pasteplain33c) | option pastePlainLines: items |
| [PastePlain34](../spec/paste-plain.md#pasteplain34) | option pastePlainLines: host |
| **paste.md** | |
| [Paste4b](../spec/paste.md#paste4b) | option pasteSeams: open |
| [Paste9](../spec/paste.md#paste9) | option quotes: container |
| [Paste16](../spec/paste.md#paste16) | caret in a marker |
| [Paste20](../spec/paste.md#paste20) | option pasteAtTextStart: before |
| [Paste21](../spec/paste.md#paste21) | option pasteSeams: open |
| [Paste24b](../spec/paste.md#paste24b) | option pasteSeams: open |
| [Paste26b](../spec/paste.md#paste26b) | option pasteSeams: open |
| **placeholders.md** | |
| [Placeholder2](../spec/placeholders.md#placeholder2) | tag free-form |
| [Placeholder10](../spec/placeholders.md#placeholder10) | caret on a blank line |
| [Placeholder12](../spec/placeholders.md#placeholder12) | caret on a blank line |
| [Placeholder13](../spec/placeholders.md#placeholder13) | tag markup-heading |
| **quirks.md** | |
| [Quirk1](../spec/quirks.md#quirk1) | option quirkEnterMidHeading: workflowy |
| [Quirk1b](../spec/quirks.md#quirk1b) | option quirkEnterMidHeading: workflowy |
| [Quirk1c](../spec/quirks.md#quirk1c) | option quirkEnterMidHeading: workflowy |
| [Quirk2](../spec/quirks.md#quirk2) | option quirkPasteCaret: roam |
| [Quirk3](../spec/quirks.md#quirk3) | option backspaceAtItemStart: logseq |
| [Quirk4](../spec/quirks.md#quirk4) | option quirkPasteText: dynalist |
| **quotes.md** | |
| [Quote2](../spec/quotes.md#quote2) | changes only what blocks can't show |
| [Quote3](../spec/quotes.md#quote3) | changes only what blocks can't show |
| [Quote4](../spec/quotes.md#quote4) | changes only what blocks can't show |
| [Quote6](../spec/quotes.md#quote6) | changes only what blocks can't show |
| [Quote7](../spec/quotes.md#quote7) | changes only what blocks can't show |
| [Quote8](../spec/quotes.md#quote8) | changes only what blocks can't show |
| [Quote9](../spec/quotes.md#quote9) | changes only what blocks can't show |
| [Quote20](../spec/quotes.md#quote20) | action moveSubtreeDown |
| [Quote21](../spec/quotes.md#quote21) | action moveSubtreeDown |
| [Quote22](../spec/quotes.md#quote22) | action moveSubtreeDown |
| [Quote23](../spec/quotes.md#quote23) | action moveSubtreeUp |
| [Quote24](../spec/quotes.md#quote24) | action moveSubtreeUp |
| [Quote25](../spec/quotes.md#quote25) | action moveSubtreeUp |
| [Quote26](../spec/quotes.md#quote26) | option quotes: container |
| [Quote27](../spec/quotes.md#quote27) | tag free-form |
| [Quote28](../spec/quotes.md#quote28) | tag free-form |
| [Quote32](../spec/quotes.md#quote32) | tag free-form |
| [Quote33](../spec/quotes.md#quote33) | tag free-form |
| [Quote34](../spec/quotes.md#quote34) | tag free-form |
| [Quote35](../spec/quotes.md#quote35) | option quotes: container |
| [Quote36](../spec/quotes.md#quote36) | option quotes: container |
| [Quote43b](../spec/quotes.md#quote43b) | option markup: decorated |
| [Quote47](../spec/quotes.md#quote47) | tag free-form |
| [Quote51](../spec/quotes.md#quote51) | tag free-form |
| [Quote54](../spec/quotes.md#quote54) | tag free-form |
| [Quote55](../spec/quotes.md#quote55) | option backspaceAtTopItem: refuse |
| [Quote59](../spec/quotes.md#quote59) | tag free-form |
| [Quote89](../spec/quotes.md#quote89) | option quotes: container |
| [Quote90](../spec/quotes.md#quote90) | tag markup-fence |
| [Quote64](../spec/quotes.md#quote64) | changes only what blocks can't show |
| [Quote65](../spec/quotes.md#quote65) | option quotes: container |
| [Quote67](../spec/quotes.md#quote67) | action moveSubtreeUp |
| [Quote68](../spec/quotes.md#quote68) | action moveSubtreeUp |
| [Quote71](../spec/quotes.md#quote71) | action moveSubtreeDown |
| [Quote73](../spec/quotes.md#quote73) | tag free-form |
| [Quote77](../spec/quotes.md#quote77) | option quotes: container |
| [Quote78](../spec/quotes.md#quote78) | option quotes: container |
| [Quote80](../spec/quotes.md#quote80) | option quotes: container |
| [Quote81](../spec/quotes.md#quote81) | action moveSubtreeDown |
| [Quote83](../spec/quotes.md#quote83) | option quotes: container |
| [Quote85](../spec/quotes.md#quote85) | changes only what blocks can't show |
| [Quote86](../spec/quotes.md#quote86) | action duplicateSubtree |
| [Quote93](../spec/quotes.md#quote93) | tag markup-heading |
| [Quote69](../spec/quotes.md#quote69) | option quotes: container |
| [Quote70](../spec/quotes.md#quote70) | option quotes: container |
| [Quote94](../spec/quotes.md#quote94) | tag markup-task |
| [Quote96](../spec/quotes.md#quote96) | action duplicateSubtree |
| [Quote97](../spec/quotes.md#quote97) | tag free-form |
| [QuoteText4](../spec/quotes.md#quotetext4) | action moveSubtreeUp |
| [QuoteText15](../spec/quotes.md#quotetext15) | action moveSubtreeUp |
| [QuoteAtom15](../spec/quotes.md#quoteatom15) | option enterAtTextStart: stay |
| **regressions.md** | |
| [Regression7](../spec/regressions.md#regression7) | tag markup-fence |
| [Regression8](../spec/regressions.md#regression8) | action moveSubtreeUp |
| [Regression9](../spec/regressions.md#regression9) | changes only what blocks can't show |
| [Regression15](../spec/regressions.md#regression15) | tag markup-heading |
| [Regression16](../spec/regressions.md#regression16) | option enterMidItem: child |
| [Regression17](../spec/regressions.md#regression17) | tag markup-task |
| [Regression18](../spec/regressions.md#regression18) | tag markup-heading |
| [Regression19](../spec/regressions.md#regression19) | tag markup-heading |
| [Regression22](../spec/regressions.md#regression22) | option pastePlainLines: items |
| [Regression23](../spec/regressions.md#regression23) | tag markup-fence |
| [Regression29](../spec/regressions.md#regression29) | option quotes: container |
| [Regression30](../spec/regressions.md#regression30) | changes only what blocks can't show |
| [Regression31](../spec/regressions.md#regression31) | tag free-form |
| [Regression38](../spec/regressions.md#regression38) | option quotes: container |
| [Regression39](../spec/regressions.md#regression39) | action moveSubtreeDown |
| [Regression40](../spec/regressions.md#regression40) | action moveSubtreeUp |
| [Regression41](../spec/regressions.md#regression41) | option quotes: container |
| [Regression42](../spec/regressions.md#regression42) | action moveSubtreeUp |
| [Regression43](../spec/regressions.md#regression43) | caret in a marker |
| [Regression44](../spec/regressions.md#regression44) | tag markup-task |
| [Regression45](../spec/regressions.md#regression45) | tag markup-task |
| [Regression46](../spec/regressions.md#regression46) | tag markup-task |
| [Regression48](../spec/regressions.md#regression48) | action moveSubtreeDown |
| [Regression49](../spec/regressions.md#regression49) | changes only what blocks can't show |
| [Regression50](../spec/regressions.md#regression50) | option quotes: container |
| [Regression51](../spec/regressions.md#regression51) | action duplicateSubtree |
| [Regression52](../spec/regressions.md#regression52) | action duplicateSubtree |
| [Regression53](../spec/regressions.md#regression53) | tag markup-task |
| [Regression54](../spec/regressions.md#regression54) | indented code |
| [Regression55](../spec/regressions.md#regression55) | tag markup-task |
| [Regression56](../spec/regressions.md#regression56) | tag markup-task |
| [Regression57](../spec/regressions.md#regression57) | tag markup-task |
| [Regression58](../spec/regressions.md#regression58) | action moveSubtreeDown |
| [Regression59](../spec/regressions.md#regression59) | action moveSubtreeDown |
| [Regression60](../spec/regressions.md#regression60) | option listParent: block |
| [Regression61](../spec/regressions.md#regression61) | option listParent: container |
| [Regression62](../spec/regressions.md#regression62) | changes only what blocks can't show |
| [Regression66](../spec/regressions.md#regression66) | caret on a blank line |
| **scenarios.md** | |
| [Scenario5](../spec/scenarios.md#scenario5) | action moveSubtreeDown |
| [Scenario6](../spec/scenarios.md#scenario6) | tag free-form |
| [Scenario8](../spec/scenarios.md#scenario8) | action moveSubtreeUp |
| [Scenario8b](../spec/scenarios.md#scenario8b) | no text focus after moveSubtree ③ |
| [Scenario8c](../spec/scenarios.md#scenario8c) | no text focus after moveSubtree ② |
| [Scenario8d](../spec/scenarios.md#scenario8d) | action drag ② |
| [Scenario9](../spec/scenarios.md#scenario9) | action moveSubtreeDown |
| [Scenario10](../spec/scenarios.md#scenario10) | action moveSubtreeUp |
| [Scenario13](../spec/scenarios.md#scenario13) | action moveSubtreeUp |
| [Scenario14](../spec/scenarios.md#scenario14) | action moveSubtreeDown |
| [Scenario15](../spec/scenarios.md#scenario15) | tag markup-task |
| [Scenario16](../spec/scenarios.md#scenario16) | action moveSubtreeUp |
| [Scenario19](../spec/scenarios.md#scenario19) | action moveSubtreeUp |
| [Scenario20](../spec/scenarios.md#scenario20) | action moveSubtreeUp |
| [Scenario22](../spec/scenarios.md#scenario22) | action moveSubtreeDown |
| [Scenario24](../spec/scenarios.md#scenario24) | tag free-form |
| [Scenario25](../spec/scenarios.md#scenario25) | tag free-form |
| **select.md** | |
| [Select1](../spec/select.md#select1) | action selectNode |
| [Select5](../spec/select.md#select5) | option selectionLadder: parents |
| [Select7](../spec/select.md#select7) | selection across blocks |
| [Select17](../spec/select.md#select17) | caret on a blank line |
| [Select18](../spec/select.md#select18) | changes only what blocks can't show |
| [Select22](../spec/select.md#select22) | option selectionLadder: top |
| [Select23](../spec/select.md#select23) | option selectNodeUp: sibling |
| **shift-enter.md** | |
| [ShiftEnter14](../spec/shift-enter.md#shiftenter14) | tag free-form |
| [ShiftEnter22](../spec/shift-enter.md#shiftenter22) | tag free-form |
| [ShiftEnter22b](../spec/shift-enter.md#shiftenter22b) | tag free-form |
| [ShiftEnter24](../spec/shift-enter.md#shiftenter24) | tag free-form |
| [ShiftEnter26](../spec/shift-enter.md#shiftenter26) | tag free-form |
| [ShiftEnter26b](../spec/shift-enter.md#shiftenter26b) | tag markup-task |
| [ShiftEnter27](../spec/shift-enter.md#shiftenter27) | selection across blocks |
| [ShiftEnter29](../spec/shift-enter.md#shiftenter29) | tag markup-heading |
| **subtree-selection.md** | |
| [SubtreeEdit10](../spec/subtree-selection.md#subtreeedit10) | changes only what blocks can't show |
| [SubtreeEdit15](../spec/subtree-selection.md#subtreeedit15) | caret in a marker |
| **tasks.md** | |
| [TaskEnter1](../spec/tasks.md#taskenter1) | tag free-form |
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
| **typing.md** | |
| [Typing1](../spec/typing.md#typing1) | tag free-form |
| [Typing2](../spec/typing.md#typing2) | tag free-form |
| [Typing3](../spec/typing.md#typing3) | tag free-form |
| **undo.md** | |
| [Undo2](../spec/undo.md#undo2) | tag free-form |
| **zoom.md** | |
| [Zoom1](../spec/zoom.md#zoom1) | the caret in the zoom root, the page's title |
| [Zoom2](../spec/zoom.md#zoom2) | the caret in the zoom root, the page's title |
| [Zoom3](../spec/zoom.md#zoom3) | its view, on an adapted start |
| [Zoom4](../spec/zoom.md#zoom4) | caret in a marker |
| [Zoom5](../spec/zoom.md#zoom5) | the caret in the zoom root, the page's title |
| [Zoom7](../spec/zoom.md#zoom7) | the caret in the zoom root, the page's title |
| [Zoom8](../spec/zoom.md#zoom8) | action clearZoom |
| [Zoom9](../spec/zoom.md#zoom9) | the caret in the zoom root, the page's title |
| [Zoom10](../spec/zoom.md#zoom10) | the caret in the zoom root, the page's title |
| [Zoom12](../spec/zoom.md#zoom12) | caret on a blank line |
| [Zoom13](../spec/zoom.md#zoom13) | the caret in the zoom root, the page's title |
| [Zoom14](../spec/zoom.md#zoom14) | option enterOnEmptyItem: unwrap |
