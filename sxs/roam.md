---
type: "SxS"
app: "roam"
version: "0.13.12 (39a714f3; API 1.1.5)"
url: "https://roamresearch.com/#/app/help"
model: "block"
command: "node sxs/run.ts roam"
elapsed_s: 363
workers: 3
---

# Roam vs ourus

Summary:

|  | agree | caret | whitespace | disagree | error | skipped | total |
| --- | --- | --- | --- | --- | --- | --- | --- |
| original | 216 | [20](#caret-20) | [14](#whitespace-14) | [14](#disagree-14) |  |  | **264** |
| adapted | 432 | [16](#adapted-caret-16) | [30](#adapted-whitespace-30) | [69](#adapted-disagree-69) |  |  | **547** |
| **total** | **648 (45%)** | **36 (2.5%)** | **44 (3%)** | **83 (5.7%)** | **0 (0%)** | **[634](#skipped-634) (44%)** | **1447** |

Per-file:

|  | agree | caret | whitespace | disagree | error | skipped | total | original | adapted |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [backspace.md](../spec/backspace.md) | 43 |  |  | 3 |  | 40 | **86** | 18 | 28 |
| [backtick.md](../spec/backtick.md) | 1 |  |  |  |  | 32 | **33** |  | 1 |
| [block-ids.md](../spec/block-ids.md) | 12 |  |  | 5 |  | 4 | **21** | 8 | 9 |
| [copy.md](../spec/copy.md) | 3 |  | 3 | 1 |  | 6 | **13** | 1 | 6 |
| [cursor.md](../spec/cursor.md) | 25 | 5 |  |  |  | 6 | **36** | 12 | 18 |
| [delete-subtree.md](../spec/delete-subtree.md) | 6 | 3 |  |  |  | 5 | **14** | 3 | 6 |
| [delete.md](../spec/delete.md) | 28 |  |  |  |  | 28 | **56** | 11 | 17 |
| [drag.md](../spec/drag.md) |  |  |  |  |  | 8 | **8** |  |  |
| [duplicate-subtree.md](../spec/duplicate-subtree.md) |  |  |  |  |  | 12 | **12** |  |  |
| [enter.md](../spec/enter.md) | 52 | 1 | 4 | 4 |  | 37 | **98** | 23 | 38 |
| [fences.md](../spec/fences.md) | 3 |  |  |  |  | 67 | **70** |  | 3 |
| [fold.md](../spec/fold.md) | 13 |  |  | 2 |  | 7 | **22** | 15 |  |
| [gaps.md](../spec/gaps.md) | 14 |  |  |  |  | 5 | **19** | 1 | 13 |
| [indent.md](../spec/indent.md) | 27 |  |  | 2 |  | 26 | **55** | 20 | 9 |
| [lists.md](../spec/lists.md) | 4 |  |  |  |  | 12 | **16** |  | 4 |
| [move-subtree-down.md](../spec/move-subtree-down.md) | 28 |  |  |  |  | 17 | **45** | 14 | 14 |
| [move-subtree-up.md](../spec/move-subtree-up.md) | 30 |  |  |  |  | 17 | **47** | 16 | 14 |
| [move-subtree.md](../spec/move-subtree.md) | 7 | 4 |  |  |  | 13 | **24** | 8 | 3 |
| [obsidian-true-outliner.md](../spec/obsidian-true-outliner.md) | 45 |  | 4 | 2 |  | 16 | **67** | 19 | 32 |
| [outdent.md](../spec/outdent.md) | 16 |  |  | 2 |  | 24 | **42** | 5 | 13 |
| [paste-at.md](../spec/paste-at.md) |  |  |  |  |  | 5 | **5** |  |  |
| [paste-conv.md](../spec/paste-conv.md) | 4 |  |  | 1 |  | 1 | **6** | 1 | 4 |
| [paste-html.md](../spec/paste-html.md) | 9 |  |  | 7 |  | 3 | **19** |  | 16 |
| [paste-list-form.md](../spec/paste-list-form.md) | 3 |  |  | 2 |  | 1 | **6** |  | 5 |
| [paste-list.md](../spec/paste-list.md) | 12 |  | 2 | 4 |  | 11 | **29** | 3 | 15 |
| [paste-plain.md](../spec/paste-plain.md) | 19 |  | 3 | 1 |  | 13 | **36** | 9 | 14 |
| [paste.md](../spec/paste.md) | 21 |  | 1 | 5 |  | 9 | **36** | 2 | 25 |
| [placeholders.md](../spec/placeholders.md) | 9 |  | 5 | 2 |  | 4 | **20** | 5 | 11 |
| [quirks.md](../spec/quirks.md) | 4 |  |  |  |  | 3 | **7** |  | 4 |
| [quotes.md](../spec/quotes.md) | 89 |  | 4 | 9 |  | 41 | **143** |  | 102 |
| [regressions.md](../spec/regressions.md) | 54 | 6 | 10 | 26 |  | 103 | **199** | 15 | 81 |
| [scenarios.md](../spec/scenarios.md) | 21 |  |  | 1 |  | 7 | **29** | 11 | 11 |
| [select.md](../spec/select.md) | 6 | 12 |  |  |  | 5 | **23** | 10 | 8 |
| [shift-enter.md](../spec/shift-enter.md) | 22 |  | 6 |  |  | 8 | **36** | 12 | 16 |
| [subtree-selection.md](../spec/subtree-selection.md) | 7 | 3 | 2 | 3 |  | 2 | **17** | 11 | 4 |
| [tasks.md](../spec/tasks.md) | 1 | 1 |  |  |  | 28 | **30** |  | 2 |
| [typing.md](../spec/typing.md) |  |  |  |  |  | 3 | **3** |  |  |
| [undo.md](../spec/undo.md) | 4 |  |  |  |  | 1 | **5** | 3 | 1 |
| [zoom.md](../spec/zoom.md) | 6 | 1 |  | 1 |  | 6 | **14** | 8 |  |
| **total** | **648 (45%)** | **36 (2.5%)** | **44 (3%)** | **83 (5.7%)** | **0 (0%)** | **636 (44%)** | **1447** | **264 (18%)** | **547 (38%)** |

## Disagree (14)

### [Backspace17](../spec/backspace.md#backspace17)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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

### [BlockIds12](../spec/block-ids.md#blockids12)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a ^x
- ┃b ^y
```

</td><td>

```buffer
- a ^x┃b ^y
```

</td><td>

```buffer
- a ^x
- ┃b ^y
```

</td></tr>
</table>

### [BlockIds14](../spec/block-ids.md#blockids14)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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

</td><td>

```buffer
- a┃b ^p3
- c
```

</td></tr>
</table>

### [BlockIds15](../spec/block-ids.md#blockids15)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃^x
```

</td><td>

```buffer
- a┃^x
```

</td><td>

```buffer
- a┃ ^x
```

</td></tr>
</table>

### [BlockIds18](../spec/block-ids.md#blockids18)

> shiftEnter

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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

### [Fold11](../spec/fold.md#fold11)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b┃

⟦folded none; zoom none⟧
```

</td></tr>
</table>

> toggleFold

<table>
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b┃

⟦folded none; zoom none⟧
```

</td><td>

```buffer
- a┃
  - b

⟦folded 1; zoom none⟧
```

</td></tr>
</table>

> toggleFold

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b┃

⟦folded none; zoom none⟧
```

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

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - b
- c

⟦folded 1; zoom none⟧
```

</td><td>

```buffer
- a- x
  ┃
  - b
- c

⟦folded 1; zoom none⟧
```

</td><td>

```buffer
- a
  - b
- x┃
- c

⟦folded 1; zoom none⟧
```

</td></tr>
</table>

### [Indent4](../spec/indent.md#indent4)

> indent

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a
2. b┃
3. c
```

</td><td>

```buffer
1. a
   - b┃
2. c
```

</td><td>

```buffer
1. a
   1. b┃
2. c
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
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃a b
  - c
```

</td><td>

```buffer
- ┃ b
  - c
```

</td></tr>
</table>

> pastePlain

<table>
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- x
  y┃a b
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

### [Paste17e](../spec/paste.md#paste17e)

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
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a«bc»d
- e
```

</td><td>

```buffer
- a- x
  ┃d
- e
```

</td><td>

```buffer
- abcd
- x┃
- e
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
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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

### [Zoom9](../spec/zoom.md#zoom9)

> deleteSubtree

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b┃
  - c

⟦folded none; zoom 2⟧
```

</td><td>

```buffer
- a
  - c

⟦folded none; zoom none⟧
```

</td><td>

```buffer
- a
  - c

⟦folded none; zoom 1⟧
```

</td></tr>
</table>

## Whitespace (14)

### [Enter16](../spec/enter.md#enter16)

> enter

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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

### [TO12](../spec/obsidian-true-outliner.md#to12)

> shiftEnter indent enter

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
<tr><th>roam</th><th>ourus</th></tr>
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

### [Regression81](../spec/regressions.md#regression81)

> shiftEnter

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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

### [ShiftEnter11](../spec/shift-enter.md#shiftenter11)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- one┃
- two
```

</td></tr>
</table>

> shiftEnter shiftEnter

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- one
  
  ┃
- two
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>roam</th><th>ourus</th></tr>
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
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- 
  ┃one
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

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

### [ShiftEnter33](../spec/shift-enter.md#shiftenter33)

> shiftEnter

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ««b»»
  - b1
- c
```

</td><td>

```buffer
- a┃
- c
```

</td><td>

```buffer
- a┃
- c
```

</td></tr>
</table>

## Caret (20)

### [CursorUp3](../spec/cursor.md#cursorup3)

> cursorLineUp

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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

### [MoveSubtree4](../spec/move-subtree.md#movesubtree4)

> moveSubtree ②

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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

### [MoveSubtree5](../spec/move-subtree.md#movesubtree5)

> moveSubtree ③

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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

### [MoveSubtree6](../spec/move-subtree.md#movesubtree6)

> moveSubtree ③

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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

### [MoveSubtree19](../spec/move-subtree.md#movesubtree19)

> moveSubtree

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a
2. ««b
3. c»»
```

</td><td>

```buffer
1. b
2. c
3. a
```

</td><td>

```buffer
1. ««b
2. c»»
3. a
```

</td></tr>
</table>

### [Regression97](../spec/regressions.md#regression97)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ««top»»
  - one
  - two
- other

⟦folded none; zoom 1⟧
```

</td><td>

```buffer
- other

⟦folded none; zoom none⟧
```

</td><td>

```buffer
- ┃other

⟦folded none; zoom none⟧
```

</td></tr>
</table>

### [Select1](../spec/select.md#select1)

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

> selectNode

<table>
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - two
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

> selectNode

<table>
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - two
    - deep
  - three
- four
```

</td><td>

```buffer
- one
  - ┃two
    - deep
  - three
- four
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
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - two
    - de«ep»
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
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - two
    - de«ep»
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
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - two
    - de«ep»
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
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - two
    - ┃«de»ep
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
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - two
    - ┃«de»ep
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
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - two
    - deep
  - ┃«th»ree
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
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - two
    - deep
  - ┃«th»ree
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
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - two
    - deep
  - ┃«th»ree
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
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - two
    - deep
  - th«ree»
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
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - two
    - deep
  - th«ree»
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
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - two
    - ┃«de»ep
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
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - two
    - ┃«de»ep
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
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - two
    - ┃«de»ep
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
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - two
    - ┃«de»ep
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
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - two
    - ┃«de»ep
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
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - two
    - de«ep»
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

### [Select15](../spec/select.md#select15)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
- b┃
```

</td></tr>
</table>

> selectNodeDown

<table>
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b┃
```

</td><td>

```buffer
- a
- ««b»»
```

</td></tr>
</table>

> selectNodeDown

<table>
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b┃
```

</td><td>

```buffer
- a
- ««b»»
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
<tr><th>roam</th><th>ourus</th></tr>
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
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
  - c
- d

⟦folded 2; zoom none⟧
```

</td><td>

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
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
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
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
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

### [Select20](../spec/select.md#select20)

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

> selectNodeDown

<table>
<tr><th>roam</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
  - two┃
    - y
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
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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

### [Zoom6](../spec/zoom.md#zoom6)

> zoomIn

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
  - c┃

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

## Adapted: disagree (69)

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
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

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

### [Backspace43b](../spec/backspace.md#backspace43b)

> enter deleteContentBackward

Adapted: heading

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # ┃Title
```

</td><td>

```buffer
- ┃
- # Title
```

</td><td>

```buffer
- # ┃Title
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# ┃Title
```

</td><td>

```buffer
# ┃Title
```

</td></tr>
</table>

### [BlockIds7](../spec/block-ids.md#blockids7)

> enter

Adapted: under enterSplitSpace: start

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
<tr><th>roam</th><th>ourus</th></tr>
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

Adapted: blank lines, heading, paragraph, setext heading, under quirkEnterMidHeading: workflowy

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
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  
- ## ┃two
  three
```

</td><td>

```buffer
- one
- ## ┃two
  three
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  
- ┃two
  three
```

</td><td>

```buffer
- one
- ┃two
  three
```

</td></tr>
</table>

> undo undo

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
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  two
- ## ┃
  three
```

</td><td>

```buffer
- one
  two
- ## ┃three
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

┃two
three
---
```

</td><td>

```buffer
one

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

┃three
---
```

</td></tr>
</table>

### [Indent37](../spec/indent.md#indent37)

> indent

Adapted: blank lines, thematic break

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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

### [TO-E10](../spec/obsidian-true-outliner.md#to-e10)

> enter

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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

### [TO14](../spec/obsidian-true-outliner.md#to14)

Adapted: blank lines

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
1. a┃
2. b
```

</td></tr>
</table>

> enter indent

<table>
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a
   - ┃
2. b
```

</td><td>

```buffer
1. a
   1. ┃
2. b
```

</td></tr>
</table>

> cursorDocStart

<table>
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. ┃a
   - 
2. b
```

</td><td>

```buffer
1. a
   1. 
2. b
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter indent</th><th>cursorDocStart</th></tr>
<tr valign="top"><td>

```buffer
1. a┃
2. b
```

</td><td>

```buffer
1. a
   1. ┃◌
2. b
```

</td><td>

```buffer
┃1. a

   1. 
2. b
```

</td></tr>
</table>

### [Outdent23](../spec/outdent.md#outdent23)

> outdent

Adapted: under outdent: logical

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
  - ««deep»»
  - five
- ««three»»
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

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
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

</td></tr>
</table>

### [Outdent25](../spec/outdent.md#outdent25)

> outdent

Adapted: under mixedDepths: each

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b
    - c
      - ««d
  - e»»
  - f
- g
```

</td><td>

```buffer
- a
  - b
    - c
    - ««d»»
  - f
- ««e»»
- g
```

</td><td>

```buffer
- a
  - b
    - c
      - ««d
  - e»»
  - f
- g
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
    - c
      - ««d
  - e»»
  - f
- g
```

</td><td>

```buffer
- a
  - b
    - c
      - ««d
  - e»»
  - f
- g
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

Adapted: under quirkPasteCaret: roam

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- a
- - x┃
- - y
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
- a┃
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
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
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
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- c┃
- d
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
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- done┃
- todo
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

Adapted: empty document, quote

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- > q1
  > q2┃
```

</td><td>

```buffer
- > q1
  >
  > q2┃
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
> q1
>
> q2┃
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
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- {{[[table]]}}┃
  - a
    - b
  - 1
    - 2
```

</td><td>

```buffer
- | a | b |
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

Adapted: empty document, escape, under quirkPasteCaret: roam

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- 1\. not a list, *x* and [y]┃
- # not a heading
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
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- ·      one┃
- o      nested
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

Adapted: under quirkPasteCaret: roam

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- a
- 1\. x┃
- 2\. y
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
- a┃
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

Adapted: under quirkPasteCaret: roam

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
```

</td><td>

```buffer
- a
- x
  1\. x1┃
- y
```

</td><td>

```buffer
- a
- x┃
  1. x1
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
- x┃
  1. x1
- y
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
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
  - kid
```

</td><td>

```buffer
- x┃
- y
- 
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

Adapted: under pasteParagraphList: children, under quirkPasteCaret: roam

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
```

</td><td>

```buffer
- a
- one┃
- two
  - x
```

</td><td>

```buffer
- a
- one
  two┃
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
- one
  two┃
  - x
```

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

Adapted: heading, under quirkPasteCaret: roam

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- a
- # h┃
  - text
- b
```

</td><td>

```buffer
- a
- # h┃
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
- # h┃
  text
- b
```

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

Adapted: as blocks, blank lines, under quirkPasteCaret: roam

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
- x┃
- y
- b
```

</td><td>

```buffer
- a
  
  p
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

  p┃

- b
```

</td><td>

```buffer
- a
  
  p
  - x┃
  - y
- b
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

Adapted: as blocks, blank lines, paragraph

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  ┃
- b
```

</td><td>

```buffer
- a
  \- x
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
  
- x┃
- b
```

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

Adapted: as blocks, blank lines, heading, paragraph, quote, under quirkPasteCaret: roam, under quotes: atom

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- > [!note] q┃
- after
```

</td><td>

```buffer
- > [!note] q
- ## h┃
  - text
- after
```

</td><td>

```buffer
- > [!note] q
- ## h┃
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
- ## h┃
  text
- after
```

</td></tr>
</table>

### [Paste27](../spec/paste.md#paste27)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
> # q
```

</td></tr>
</table>

> paste

Adapted: blank lines, heading, paragraph, quote

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # A
  - para┃
  - more
```

</td><td>

```buffer
- # A
  - para> # q
    ┃
  - more
```

</td><td>

```buffer
- # A
  - para
  - > # q┃
  - more
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

more
```

</td><td>

```buffer
# A
para

> # q┃

more
```

</td></tr>
</table>

### [Placeholder1](../spec/placeholders.md#placeholder1)

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
<tr><th>roam</th><th>ourus</th></tr>
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

> indent

<table>
<tr><th>roam</th><th>ourus</th></tr>
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
<tr><th>roam</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>enter</th><th>indent</th><th>cursorDocStart cursorLineBoundaryForward</th></tr>
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

</td></tr>
</table>

### [Placeholder5](../spec/placeholders.md#placeholder5)

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
<tr><th>roam</th><th>ourus</th></tr>
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

> indent

<table>
<tr><th>roam</th><th>ourus</th></tr>
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

> outdent

<table>
<tr><th>roam</th><th>ourus</th></tr>
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

> indent

<table>
<tr><th>roam</th><th>ourus</th></tr>
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
<tr><th>roam</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>enter</th><th>indent</th><th>outdent</th><th>indent</th><th>cursorDocStart cursorLineBoundaryForward</th></tr>
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

</td></tr>
</table>

### [Quote20](../spec/quotes.md#quote20)

Adapted: as blocks, blank lines, quote, under quotes: atom

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- > - a┃
  > - x
- > - b
```

</td></tr>
</table>

> outdent

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- > - a┃
  > - x
- > - b
```

</td></tr>
</table>

> moveSubtreeDown

<table>
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- > - b
- > - a┃
  > - x
```

</td><td>

```buffer
- > - a┃
  > - x
- > - b
```

</td></tr>
</table>

> indent

<table>
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- > - b
  - > - a┃
    > - x
```

</td><td>

```buffer
- > - a┃
  > - x
- > - b
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>outdent</th><th>moveSubtreeDown</th><th>indent</th></tr>
<tr valign="top"><td>

```buffer
> - a┃
> - x

> - b
```

</td><td>

```buffer
> - a┃
> - x
- > - b
```

</td><td>

```buffer
> - a┃
> - x
- > - b
```

</td><td>

```buffer
- > - a┃
  > - x
- > - b
```

</td></tr>
</table>

### [Quote30](../spec/quotes.md#quote30)

> enter

Adapted: as blocks, quote, under backspaceAtTopItem: refuse, under copyAtCaret: host, under emptyItemWithChildren: refuse, under enterInQuote: split, under enterOnEmptyItem: outdent, under enterSplitSpace: start, under enterTask: plain, under joinWithChildren: refuse, under mixedDepths: each, under outdent: logical, under pasteAtTextStart: before, under pasteLines: items, under pasteOverSelection: ignore, under pasteParagraphList: children, under quirkEnterMidHeading: workflowy, under quirkPasteCaret: roam, under quotes: atom, under selectionLadder: top

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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

### [Quote82](../spec/quotes.md#quote82)

> deleteSubtree

Adapted: as blocks, empty document, quote, under quotes: atom

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
<tr><th>roam</th><th>ourus</th></tr>
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
<tr><th>roam</th><th>ourus</th></tr>
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
<tr><th>roam</th><th>ourus</th></tr>
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
<tr><th>roam</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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

### [Regression21](../spec/regressions.md#regression21)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
x
```

</td></tr>
</table>

> paste

Adapted: as blocks, paragraph

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one ┃two
```

</td><td>

```buffer
- one x
  ┃two
```

</td><td>

```buffer
- one two
- x┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
one ┃two
```

</td><td>

```buffer
- one two
- x┃
```

</td></tr>
</table>

### [Regression33](../spec/regressions.md#regression33)

> deleteSoftLineBackward

Adapted: as blocks, quote, under quotes: atom

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
2. x
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
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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

Adapted: under quirkPasteCaret: roam

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Inbox┃
```

</td><td>

```buffer
- Inbox
- o Draft announcement┃
- · Send update
- · Archive notes
```

</td><td>

```buffer
- Inbox
- Draft announcement┃
- Send update
- Archive notes
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Inbox┃
```

</td><td>

```buffer
- Inbox
- Draft announcement┃
- Send update
- Archive notes
```

</td></tr>
</table>

### [Regression84](../spec/regressions.md#regression84)

> outdent

Adapted: blank lines, paragraph, quote, under quotes: atom

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- x┃
  > - a
  >
  > - →b
  
  
  
  y
```

</td><td>

```buffer
- x┃
  > - a
  >
  > - →b
  
  
  
  y
```

</td><td>

```buffer
- x┃
- > - a
  >
  > - →b
- y
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- x┃
  > - a
  >
  > - →b

  y
```

</td><td>

```buffer
x┃
> - a
>
> - →b

y
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

Adapted: under enterTask: plain, under pasteOverSelection: ignore

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- 
  [x] 
   «    - b»
```

</td><td>

```buffer
- 
  [x] 
       - b
- -┃
  - x
```

</td><td>

```buffer
- 
  [x] 
       - b
- 
  x┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [x]␠
   «    - b»
```

</td><td>

```buffer
- [x] 
       - b
-
  x┃
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

Adapted: empty document, paragraph

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- before` a `after┃
```

</td><td>

```buffer
- before`  a  `after┃
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

Adapted: empty document, paragraph

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- *a**b* *foo!*bar┃
```

</td><td>

```buffer
- *ab* foo!bar┃
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
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- Keep ~~draft~~ and %%this%% literal┃
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

Adapted: empty document, heading

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- Issue #┃
```

</td><td>

```buffer
- ## Issue \#┃
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

Adapted: blank lines, empty document, paragraph, under quirkPasteCaret: roam

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- *ab*┃
```

</td><td>

```buffer
- *a*┃
- *b*
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
*a*┃

*b*
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

Adapted: as blocks, heading, paragraph

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- here┃
```

</td><td>

```buffer
- hereTitle┃
```

</td><td>

```buffer
- here
- ## Title┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
here┃
```

</td><td>

```buffer
- here
- ## Title┃
```

</td></tr>
</table>

### [Regression119](../spec/regressions.md#regression119)

> deleteSoftLineBackward

Adapted: as blocks, blank lines, quote, under quotes: atom

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- > ```
  > PAYLOAD┃
  > ```
  > AFTER
````

</td><td>

````buffer
- > ```
  ┃
  > ```
  > AFTER
````

</td><td>

````buffer
- > ```
  - > ```
    > AFTER
````

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
> ```
> PAYLOAD┃
> ```
> AFTER
````

</td><td>

````buffer
- > ```
┃
  > ```
  > AFTER
````

</td></tr>
</table>

### [Regression129](../spec/regressions.md#regression129)

Adapted: as blocks, quote

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- >- [x] >
   ┃   -
```

</td></tr>
</table>

> deleteContentForward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- >- [x] >
   ┃  -
```

</td></tr>
</table>

> cursorDocStart

<table>
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃>- [x] >
     -
```

</td><td>

```buffer
- >- [x] >
  - 
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>deleteContentForward</th><th>cursorDocStart</th></tr>
<tr valign="top"><td>

```buffer
>- [x] >
 ┃   -
```

</td><td>

```buffer
- >- [x] >
   ┃◌  -
```

</td><td>

```buffer
┃- >- [x] >
     -
```

</td></tr>
</table>

### [Regression144](../spec/regressions.md#regression144)

> indent

Adapted: blank lines, heading

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ## B
- ## ┃C
```

</td><td>

```buffer
- ## B
  - ## ┃C
```

</td><td>

```buffer
- ## B
  - ### ┃C
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
## B

## ┃C
```

</td><td>

```buffer
## B

### ┃C
```

</td></tr>
</table>

### [Regression145](../spec/regressions.md#regression145)

> outdent

Adapted: blank lines, heading

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # A
  - ## B
    - ### ┃C
```

</td><td>

```buffer
- # A
  - ## B
  - ### ┃C
```

</td><td>

```buffer
- # A
  - ## B
  - ## ┃C
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

### ┃C
```

</td><td>

```buffer
# A

## B

## ┃C
```

</td></tr>
</table>

### [Regression168](../spec/regressions.md#regression168)

> moveSubtreeDown

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # ┃g
  e
- #
  -   y
```

</td><td>

```buffer
- #
  -   y
- # ┃g
  e
```

</td><td>

```buffer
- #
  - # ┃g
    e
  - y
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # ┃g
  e
#
  y
```

</td><td>

```buffer
#
- # ┃g
  e

y
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

Adapted: as blocks, blank lines, link reference definition, paragraph

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [a]:u┃
  T
```

</td><td>

```buffer
- [a]:ux
  ┃
  T
```

</td><td>

```buffer
- [a]:u
  - x┃
  - T
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
  - x┃

  T
```

</td></tr>
</table>

### [Regression184](../spec/regressions.md#regression184)

Adapted: as blocks, quote

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- > a
  > b┃
  > c
```

</td></tr>
</table>

> shiftEnter

<table>
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- > a
  > b
  ┃
  > c
```

</td><td>

```buffer
- > a
  > b
  > ┃
  > c
```

</td></tr>
</table>

> "x"

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- > a
  > b
  x┃
  > c
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- > a
  > b
  ┃
  > c
```

</td><td>

```buffer
- > a
  > b
  > ┃
  > c
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- > a
  > b┃
  > c
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>shiftEnter</th><th>"x"</th><th>deleteContentBackward</th><th>deleteContentBackward</th></tr>
<tr valign="top"><td>

```buffer
> a
> b┃
> c
```

</td><td>

```buffer
- > a
  > b
  > ┃
  > c
```

</td><td>

```buffer
- > a
  > b
  > x┃
  > c
```

</td><td>

```buffer
- > a
  > b
  > ┃
  > c
```

</td><td>

```buffer
- > a
  > b┃
  > c
```

</td></tr>
</table>

### [Regression185](../spec/regressions.md#regression185)

Adapted: as blocks, quote

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- > a
  > b┃
  > c
```

</td></tr>
</table>

> shiftEnter

<table>
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- > a
  > b
  ┃
  > c
```

</td><td>

```buffer
- > a
  > b
  > ┃
  > c
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- > a
  > b┃
  > c
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>shiftEnter</th><th>deleteContentBackward</th></tr>
<tr valign="top"><td>

```buffer
- > a
  > b┃
  > c
```

</td><td>

```buffer
- > a
  > b
  > ┃
  > c
```

</td><td>

```buffer
- > a
  > b┃
  > c
```

</td></tr>
</table>

### [Regression191](../spec/regressions.md#regression191)

> indent

Adapted: bullet *, quote, thematic break, under quotes: atom

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- > ## h
-   ---
  ┃
- > ## h
```

</td><td>

```buffer
- > ## h
  -   ---
    ┃
- > ## h
```

</td><td>

```buffer
- > ## h
- ---
  ┃
- > ## h
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> ## h
  ---
┃
> ## h
```

</td><td>

```buffer
> ## h
* ---
  ┃
> ## h
```

</td></tr>
</table>

### [Regression199](../spec/regressions.md#regression199)

> deleteSoftLineBackward

Adapted: blank lines, heading, paragraph, quote, under quotes: atom

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- 
- # h
  - > - 
    > ^x┃
```

</td><td>

```buffer
- 
- # h
  - > - 
    ┃
```

</td><td>

```buffer
- # h
  - > - 
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
◌
# h
> - ◌
> ^x┃
```

</td><td>

```buffer
# h
> - 
┃
```

</td></tr>
</table>

### [Scenario23](../spec/scenarios.md#scenario23)

Adapted: heading, paragraph, under quirkEnterMidHeading: workflowy

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
- Plan
- # revise ┃2. draft
```

</td></tr>
</table>

> shiftEnter

<table>
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Plan
- # revise 
  ┃2\. draft
```

</td><td>

```buffer
- Plan
- # revise 
  - ┃2\. draft
```

</td></tr>
</table>

> undo undo undo

<table>
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Plan2. ┃draft
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
Plan
# revise ┃2. draft
```

</td><td>

```buffer
Plan
# revise 
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
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
- p┃
- q
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
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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

## Adapted: whitespace (30)

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
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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

### [Enter52](../spec/enter.md#enter52)

> enter

Adapted: blank lines, heading, paragraph, setext heading, under quirkEnterMidHeading: workflowy

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ## one
  ┃two
- ## three
```

</td><td>

```buffer
- one
  
- ## ┃two
- ## three
```

</td><td>

```buffer
- one
- ## ┃two
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

┃two
---
three
---
```

</td></tr>
</table>

### [Enter68](../spec/enter.md#enter68)

> enter

Adapted: as blocks, paragraph, quote, under quotes: atom

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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

### [TO-E17](../spec/obsidian-true-outliner.md#to-e17)

> enter

Adapted: blank lines, heading, paragraph, setext heading, under enterSplitSpace: start, under quirkEnterMidHeading: workflowy

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Hello┃ world
```

</td><td>

```buffer
- Hello
- # ┃ world
```

</td><td>

```buffer
- Hello
- # ┃world
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
<tr><th>roam</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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

Adapted: as blocks, paragraph, under quirkPasteCaret: roam

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- p┃
```

</td><td>

```buffer
- p
  
- a┃
- b
```

</td><td>

```buffer
- p
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
p┃
```

</td><td>

```buffer
- p
- a┃
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
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃para
  
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
<tr><th>roam</th><th>ourus</th></tr>
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
<tr><th>roam</th><th>ourus</th></tr>
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
<tr><th>roam</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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

Adapted: as blocks, quote, under backspaceAtTopItem: refuse, under copyAtCaret: host, under emptyItemWithChildren: refuse, under enterInQuote: split, under enterOnEmptyItem: outdent, under enterSplitSpace: start, under enterTask: plain, under joinWithChildren: refuse, under mixedDepths: each, under outdent: logical, under pasteAtTextStart: before, under pasteLines: items, under pasteOverSelection: ignore, under pasteParagraphList: children, under quirkEnterMidHeading: workflowy, under quirkPasteCaret: roam, under quotes: atom, under selectionLadder: top

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- «ab»c
```

</td><td>

```buffer
- 
  x┃c
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

### [Regression110](../spec/regressions.md#regression110)

> indent

Adapted: link reference definition

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃ [a]: /url
```

</td><td>

```buffer
- ┃ [a]: /url
```

</td><td>

```buffer
- ┃[a]: /url
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
┃ [a]: /url
```

</td><td>

```buffer
- ┃[a]: /url
```

</td></tr>
</table>

### [Regression136](../spec/regressions.md#regression136)

> deleteSoftLineBackward

Adapted: heading, setext heading

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Ti
  tle┃
```

</td><td>

```buffer
- # Ti
  ┃
```

</td><td>

```buffer
- # Ti┃
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

### [Regression162](../spec/regressions.md#regression162)

> indent

Adapted: quote

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
-  >┃a
  >b
```

</td><td>

```buffer
-  >┃a
  >b
```

</td><td>

```buffer
- >┃a
  >b
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

### [Regression173](../spec/regressions.md#regression173)

> shiftEnter

Adapted: quote, under quotes: atom

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃ > +→]
  `
```

</td><td>

```buffer
- 
  ┃ > +→]
  `
```

</td><td>

```buffer
- ┃ > +→]
  `
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
┃ > +→]
`
```

</td><td>

```buffer
┃ > +→]
`
```

</td></tr>
</table>

### [Regression181](../spec/regressions.md#regression181)

> indent

Adapted: paragraph

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [a]
  [a]:s┃
```

</td><td>

```buffer
- [a]
  [a]:s┃
```

</td><td>

```buffer
- 
  [a]
  [a]:s┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
[a]
[a]:s┃
```

</td><td>

```buffer
- [a]
  [a]:s┃
```

</td></tr>
</table>

### [ShiftEnter12](../spec/shift-enter.md#shiftenter12)

Adapted: as blocks, paragraph

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- para┃
```

</td></tr>
</table>

> shiftEnter shiftEnter

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- para
  
  ┃
```

</td></tr>
</table>

> deleteContentBackward deleteContentBackward

<table>
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- para
  ┃
```

</td><td>

```buffer
- para┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>shiftEnter shiftEnter</th><th>deleteContentBackward deleteContentBackward</th></tr>
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
- para┃
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
<tr><th>roam</th><th>ourus</th></tr>
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
<tr><th>roam</th><th>ourus</th></tr>
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

### [CursorDown5](../spec/cursor.md#cursordown5)

> cursorLineDown

Adapted: as blocks, task

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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

### [DeleteSubtree4](../spec/delete-subtree.md#deletesubtree4)

> deleteSubtree

Adapted: as blocks, task

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - a1
- [ ] b
```

</td><td>

```buffer
- ┃[ ] b
```

</td><td>

```buffer
- [ ] ┃b
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
- [ ] b
```

</td><td>

```buffer
- [ ] ┃b
```

</td></tr>
</table>

### [DeleteSubtree9](../spec/delete-subtree.md#deletesubtree9)

> deleteSubtree

Adapted: blank lines, heading, paragraph, setext heading, thematic break

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃Intro
- ---
- ## title: x
```

</td><td>

```buffer
- ┃---
- ## title: x
```

</td><td>

```buffer
- ---
- ## ┃title: x
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
┃Intro

---
title: x
---
```

</td><td>

```buffer

---
┃title: x
---
```

</td></tr>
</table>

### [DeleteSubtree10](../spec/delete-subtree.md#deletesubtree10)

> deleteSubtree

Adapted: blank lines, heading, paragraph, setext heading, thematic break

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃a
- ***
- ## title
```

</td><td>

```buffer
- ┃***
- ## title
```

</td><td>

```buffer
- ***
- ## ┃title
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
┃a

***
title
---
```

</td><td>

```buffer
***
┃title
---
```

</td></tr>
</table>

### [Enter59](../spec/enter.md#enter59)

> enter

Adapted: as blocks, paragraph

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- «ab»cd
```

</td><td>

```buffer
- 
- ┃cd
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

Adapted: as blocks, list as an item's first block

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
- ┃
  - z
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
- 
  - z┃
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

Adapted: as blocks, escape, paragraph

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- \┃
```

</td><td>

```buffer
- \- a
  \- b┃
```

</td><td>

```buffer
- - a
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
- \- a
  \- b┃
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

Adapted: heading

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # a┃
```

</td><td>

```buffer
- # ab #┃
```

</td><td>

```buffer
- # ab \#┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# a┃
```

</td><td>

```buffer
# ab \#┃
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

Adapted: as blocks, blank lines, paragraph

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- «« b»»
```

</td><td>

```buffer
- x
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
 ««b»»
␠
```

</td><td>

```buffer
x┃
```

</td></tr>
</table>

### [Regression196](../spec/regressions.md#regression196)

> deleteSubtree

Adapted: as blocks, quote, under quotes: atom

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. > [!note] ┃T
2. > [!note] U
```

</td><td>

```buffer
1. ┃> [!note] U
```

</td><td>

```buffer
1. > ┃[!note] U
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. > [!note] ┃T
2. > [!note] U
```

</td><td>

```buffer
1. > ┃[!note] U
```

</td></tr>
</table>

### [Select6](../spec/select.md#select6)

Adapted: under selectionLadder: top

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
<tr><th>roam</th><th>ourus</th></tr>
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
- ««one
  - two
    - deep
  - three
  - five
- four»»
```

</td></tr>
</table>

> expandSelection

<table>
<tr><th>roam</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>expandSelection</th><th>expandSelection</th></tr>
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

### [Select9](../spec/select.md#select9)

Adapted: as blocks, task, under selectionLadder: top

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
<tr><th>roam</th><th>ourus</th></tr>
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
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- ««[ ] task
  - sub
- c»»
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
- [ ] ««task
  - sub
- c»»
```

</td></tr>
</table>

### [Select21](../spec/select.md#select21)

Adapted: as blocks, blank lines, paragraph

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- al┃pha
- beta
```

</td></tr>
</table>

> expandSelection

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- «alpha»
- beta
```

</td></tr>
</table>

> selectNodeDown

<table>
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- «alpha»
- beta
```

</td><td>

```buffer
- ««alpha»»
- beta
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>expandSelection</th><th>selectNodeDown</th></tr>
<tr valign="top"><td>

```buffer
al┃pha

beta
```

</td><td>

```buffer
- «alpha»
- beta
```

</td><td>

```buffer
- ««alpha»»
- beta
```

</td></tr>
</table>

### [TaskEnter3](../spec/tasks.md#taskenter3)

> enter

Adapted: as blocks, escape, task, under enterSplitSpace: start, under enterTask: plain

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] abc ┃# x
```

</td><td>

```buffer
- [ ] abc 
- # x
```

</td><td>

```buffer
- [ ] abc 
- ┃# x
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
- ┃\# x
```

</td></tr>
</table>

## Skipped (636)

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
| [Backspace26](../spec/backspace.md#backspace26) | changes only what blocks can't show |
| [Backspace27](../spec/backspace.md#backspace27) | tag free-form |
| [Backspace28](../spec/backspace.md#backspace28) | tag markup-fence |
| [Backspace31](../spec/backspace.md#backspace31) | selection across blocks |
| [Backspace33](../spec/backspace.md#backspace33) | tag free-form |
| [Backspace35](../spec/backspace.md#backspace35) | tag free-form |
| [Backspace40](../spec/backspace.md#backspace40) | list numbered in part, or not from 1 |
| [Backspace40b](../spec/backspace.md#backspace40b) | list numbered in part, or not from 1 |
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
| **block-ids.md** | |
| [BlockIds2](../spec/block-ids.md#blockids2) | code block |
| [BlockIds17](../spec/block-ids.md#blockids17) | selection across blocks |
| [BlockIds19](../spec/block-ids.md#blockids19) | caret on a blank line |
| [BlockIds20](../spec/block-ids.md#blockids20) | action duplicateSubtree |
| **copy.md** | |
| [Copy2](../spec/copy.md#copy2) | selection across blocks |
| [Copy5](../spec/copy.md#copy5) | option copySelection: nodes |
| [Copy6](../spec/copy.md#copy6) | nothing to compare |
| [Copy7](../spec/copy.md#copy7) | option copySelection: nodes |
| [Cut2](../spec/copy.md#cut2) | selection across blocks |
| [Cut3](../spec/copy.md#cut3) | option copySelection: nodes |
| **cursor.md** | |
| [CursorDown2](../spec/cursor.md#cursordown2) | indented code |
| [CursorHome3](../spec/cursor.md#cursorhome3) | caret in a marker |
| [CursorHome4](../spec/cursor.md#cursorhome4) | caret in a marker |
| [CursorHome7](../spec/cursor.md#cursorhome7) | list numbered in part, or not from 1 |
| [CursorHome15](../spec/cursor.md#cursorhome15) | caret in a marker |
| [CursorDocEndLeft1](../spec/cursor.md#cursordocendleft1) | cursorCharLeft after cursorDocEnd |
| **delete-subtree.md** | |
| [DeleteSubtree6](../spec/delete-subtree.md#deletesubtree6) | no text focus after deleteSubtree |
| [DeleteSubtree8](../spec/delete-subtree.md#deletesubtree8) | code block |
| [DeleteSubtree12](../spec/delete-subtree.md#deletesubtree12) | option quotes: container |
| [DeleteSubtree13](../spec/delete-subtree.md#deletesubtree13) | list numbered in part, or not from 1 |
| [DeleteSubtree14](../spec/delete-subtree.md#deletesubtree14) | code block |
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
| [Enter3c](../spec/enter.md#enter3c) | list numbered in part, or not from 1 |
| [Enter6](../spec/enter.md#enter6) | tag free-form |
| [Enter7b](../spec/enter.md#enter7b) | tag free-form |
| [Enter7c](../spec/enter.md#enter7c) | option enterOnEmptyItem: unwrap |
| [Enter14](../spec/enter.md#enter14) | tag free-form |
| [Enter15b](../spec/enter.md#enter15b) | tag free-form |
| [Enter21b](../spec/enter.md#enter21b) | option enterOnEmptyItem: unwrap |
| [Enter23](../spec/enter.md#enter23) | indented code |
| [Enter25](../spec/enter.md#enter25) | list numbered in part, or not from 1 |
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
| [Fence8](../spec/fences.md#fence8) | code block |
| [Fence9](../spec/fences.md#fence9) | tag markup-fence |
| [Fence10](../spec/fences.md#fence10) | tag enter-in-fence |
| [Fence11](../spec/fences.md#fence11) | tag markup-fence |
| [Fence12](../spec/fences.md#fence12) | tag markup-fence |
| [Fence13](../spec/fences.md#fence13) | tag markup-fence |
| [Fence14](../spec/fences.md#fence14) | tag markup-fence |
| [Fence15](../spec/fences.md#fence15) | tag markup-fence |
| [Fence16](../spec/fences.md#fence16) | code block |
| [Fence17](../spec/fences.md#fence17) | tag markup-fence |
| [Fence18](../spec/fences.md#fence18) | code block |
| [Fence19](../spec/fences.md#fence19) | tag markup-fence |
| [Fence21](../spec/fences.md#fence21) | code block |
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
| [Fence48](../spec/fences.md#fence48) | code block |
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
| [Fence62](../spec/fences.md#fence62) | code block |
| [Fence63](../spec/fences.md#fence63) | tag markup-fence |
| [Fence64](../spec/fences.md#fence64) | tag markup-fence |
| **fold.md** | |
| [Fold2b](../spec/fold.md#fold2b) | option enterMidItem: child |
| [Fold8](../spec/fold.md#fold8) | action duplicateSubtree |
| [Fold9](../spec/fold.md#fold9) | action fold ② |
| [Fold10](../spec/fold.md#fold10) | action fold ① |
| [Fold13](../spec/fold.md#fold13) | its view, on an adapted start |
| [Fold15b](../spec/fold.md#fold15b) | changes only what blocks can't show |
| [Fold20](../spec/fold.md#fold20) | caret in a heading's #s |
| **gaps.md** | |
| [Gap7](../spec/gaps.md#gap7) | code block |
| [Gap15](../spec/gaps.md#gap15) | caret on a blank line |
| [Gap16](../spec/gaps.md#gap16) | caret on a blank line |
| [Gap18](../spec/gaps.md#gap18) | caret on a blank line |
| [Gap19](../spec/gaps.md#gap19) | frontmatter |
| **indent.md** | |
| [Indent11](../spec/indent.md#indent11) | changes only what blocks can't show |
| [Indent12](../spec/indent.md#indent12) | tag free-form |
| [Indent13](../spec/indent.md#indent13) | code block |
| [Indent16](../spec/indent.md#indent16) | tag free-form |
| [Indent20](../spec/indent.md#indent20) | code block |
| [Indent22](../spec/indent.md#indent22) | tag free-form |
| [Indent23](../spec/indent.md#indent23) | tag free-form |
| [Indent24](../spec/indent.md#indent24) | heading deeper than H3 |
| [Indent25](../spec/indent.md#indent25) | tag free-form |
| [Indent28](../spec/indent.md#indent28) | caret in a marker |
| [Indent29b](../spec/indent.md#indent29b) | list numbered in part, or not from 1 |
| [Indent30](../spec/indent.md#indent30) | caret in a marker |
| [Indent31](../spec/indent.md#indent31) | tag markup-fence |
| [Indent31b](../spec/indent.md#indent31b) | tag markup-fence |
| [Indent32](../spec/indent.md#indent32) | changes only what blocks can't show |
| [Indent34](../spec/indent.md#indent34) | code block |
| [Indent37b](../spec/indent.md#indent37b) | changes only what blocks can't show |
| [Indent38](../spec/indent.md#indent38) | indented code |
| [Indent39](../spec/indent.md#indent39) | option indentUnit: tab |
| [Indent40](../spec/indent.md#indent40) | option indentUnit: 2 |
| [Indent41](../spec/indent.md#indent41) | option indentUnit: tab |
| [Indent42](../spec/indent.md#indent42) | option indentUnit: tab |
| [Indent44](../spec/indent.md#indent44) | code block |
| [Indent45b](../spec/indent.md#indent45b) | indented code |
| [Indent48](../spec/indent.md#indent48) | nothing to compare |
| [Indent50](../spec/indent.md#indent50) | option mixedDepths: refuse |
| **lists.md** | |
| [Lists2](../spec/lists.md#lists2) | option listParent: container |
| [Lists3](../spec/lists.md#lists3) | option listParent: container |
| [Lists4](../spec/lists.md#lists4) | option listParent: block |
| [Lists5](../spec/lists.md#lists5) | code block |
| [Lists6](../spec/lists.md#lists6) | option listParent: container |
| [Lists8](../spec/lists.md#lists8) | option listParent: container |
| [Lists8b](../spec/lists.md#lists8b) | option listParent: container |
| [Lists10](../spec/lists.md#lists10) | option listParent: container |
| [Lists12](../spec/lists.md#lists12) | option listParent: container |
| [Lists13](../spec/lists.md#lists13) | option listParent: container |
| [Lists14](../spec/lists.md#lists14) | option listParent: container |
| [Lists15](../spec/lists.md#lists15) | option listParent: container |
| **move-subtree-down.md** | |
| [MoveDown2](../spec/move-subtree-down.md#movedown2) | tag free-form |
| [MoveDown17](../spec/move-subtree-down.md#movedown17) | tag free-form |
| [MoveDown19](../spec/move-subtree-down.md#movedown19) | tag free-form |
| [MoveDown20](../spec/move-subtree-down.md#movedown20) | tag free-form |
| [MoveDown21](../spec/move-subtree-down.md#movedown21) | code block |
| [MoveDown23](../spec/move-subtree-down.md#movedown23) | list numbered in part, or not from 1 |
| [MoveDown25](../spec/move-subtree-down.md#movedown25) | tag free-form |
| [MoveDown28](../spec/move-subtree-down.md#movedown28) | tag free-form |
| [MoveDown29](../spec/move-subtree-down.md#movedown29) | list numbered in part, or not from 1 |
| [MoveDown30](../spec/move-subtree-down.md#movedown30) | list numbered in part, or not from 1 |
| [MoveDown32](../spec/move-subtree-down.md#movedown32) | caret in a marker |
| [MoveDown34](../spec/move-subtree-down.md#movedown34) | tag markup-fence |
| [MoveDown37](../spec/move-subtree-down.md#movedown37) | tag markup-fence |
| [MoveDown38](../spec/move-subtree-down.md#movedown38) | tag free-form |
| [MoveDown40](../spec/move-subtree-down.md#movedown40) | list numbered in part, or not from 1 |
| [MoveDown43](../spec/move-subtree-down.md#movedown43) | caret in a marker |
| [MoveDown44](../spec/move-subtree-down.md#movedown44) | caret in a marker |
| **move-subtree-up.md** | |
| [MoveUp12](../spec/move-subtree-up.md#moveup12) | tag free-form |
| [MoveUp13](../spec/move-subtree-up.md#moveup13) | code block |
| [MoveUp15](../spec/move-subtree-up.md#moveup15) | list numbered in part, or not from 1 |
| [MoveUp18](../spec/move-subtree-up.md#moveup18) | indented code |
| [MoveUp24](../spec/move-subtree-up.md#moveup24) | tag free-form |
| [MoveUp27](../spec/move-subtree-up.md#moveup27) | tag free-form |
| [MoveUp28](../spec/move-subtree-up.md#moveup28) | tag free-form |
| [MoveUp29](../spec/move-subtree-up.md#moveup29) | tag free-form |
| [MoveUp33](../spec/move-subtree-up.md#moveup33) | tag free-form |
| [MoveUp34](../spec/move-subtree-up.md#moveup34) | caret in a marker |
| [MoveUp35](../spec/move-subtree-up.md#moveup35) | tag free-form |
| [MoveUp36](../spec/move-subtree-up.md#moveup36) | tag free-form |
| [MoveUp37](../spec/move-subtree-up.md#moveup37) | tag markup-fence |
| [MoveUp38](../spec/move-subtree-up.md#moveup38) | tag markup-fence |
| [MoveUp39](../spec/move-subtree-up.md#moveup39) | caret on a blank line |
| [MoveUp41](../spec/move-subtree-up.md#moveup41) | tag markup-fence |
| [MoveUp43](../spec/move-subtree-up.md#moveup43) | option indentUnit: tab |
| **move-subtree.md** | |
| [MoveSubtree7](../spec/move-subtree.md#movesubtree7) | changes only what blocks can't show |
| [MoveSubtree8](../spec/move-subtree.md#movesubtree8) | changes only what blocks can't show |
| [MoveSubtree10](../spec/move-subtree.md#movesubtree10) | nothing to compare |
| [MoveSubtree11](../spec/move-subtree.md#movesubtree11) | nothing to compare |
| [MoveSubtree13](../spec/move-subtree.md#movesubtree13) | nothing to compare |
| [MoveSubtree14](../spec/move-subtree.md#movesubtree14) | heading deeper than H3 |
| [MoveSubtree15](../spec/move-subtree.md#movesubtree15) | heading deeper than H3 |
| [MoveSubtree16](../spec/move-subtree.md#movesubtree16) | heading deeper than H3 |
| [MoveSubtree17](../spec/move-subtree.md#movesubtree17) | drop: the pickup is refused (non-contiguous) |
| [MoveSubtree18](../spec/move-subtree.md#movesubtree18) | nothing to compare |
| [MoveSubtree20](../spec/move-subtree.md#movesubtree20) | option mixedDepths: the app's each, not replayable |
| [MoveSubtree21](../spec/move-subtree.md#movesubtree21) | list numbered in part, or not from 1 |
| [MoveSubtree22](../spec/move-subtree.md#movesubtree22) | code block |
| **obsidian-true-outliner.md** | |
| [TO-Bug228](../spec/obsidian-true-outliner.md#to-bug228) | list numbered in part, or not from 1 |
| [TO-E7-E8](../spec/obsidian-true-outliner.md#to-e7-e8) | option enterMidItem: child |
| [TO-E11](../spec/obsidian-true-outliner.md#to-e11) | option enterMidItem: child |
| [TO-E18](../spec/obsidian-true-outliner.md#to-e18) | tag markup-heading |
| [TO-E19-E21b](../spec/obsidian-true-outliner.md#to-e19-e21b) | tag free-form |
| [TO-S5](../spec/obsidian-true-outliner.md#to-s5) | tag free-form |
| [TO-S7-S8](../spec/obsidian-true-outliner.md#to-s7-s8) | tag markup-heading |
| [TO-S7-S8b](../spec/obsidian-true-outliner.md#to-s7-s8b) | tag markup-heading |
| [TO1](../spec/obsidian-true-outliner.md#to1) | tag markup-task |
| [TO4](../spec/obsidian-true-outliner.md#to4) | list numbered in part, or not from 1 |
| [TO6](../spec/obsidian-true-outliner.md#to6) | list numbered in part, or not from 1 |
| [TO-Seamsd](../spec/obsidian-true-outliner.md#to-seamsd) | indented code |
| [TO-Lazyb](../spec/obsidian-true-outliner.md#to-lazyb) | code block |
| [TO-Lazyc](../spec/obsidian-true-outliner.md#to-lazyc) | code block |
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
| [Outdent17](../spec/outdent.md#outdent17) | caret in a heading's #s |
| [Outdent17b](../spec/outdent.md#outdent17b) | caret in a heading's #s |
| [Outdent18](../spec/outdent.md#outdent18) | caret in a heading's #s |
| [Outdent19](../spec/outdent.md#outdent19) | tag free-form |
| [Outdent19b](../spec/outdent.md#outdent19b) | tag free-form |
| [Outdent20](../spec/outdent.md#outdent20) | tag free-form |
| [Outdent20b](../spec/outdent.md#outdent20b) | tag free-form |
| [Outdent22b](../spec/outdent.md#outdent22b) | indented code |
| [Outdent24](../spec/outdent.md#outdent24) | nothing to compare |
| [Outdent26](../spec/outdent.md#outdent26) | option mixedDepths: refuse |
| **paste-at.md** | |
| [PasteAt1](../spec/paste-at.md#pasteat1) | action pasteAt |
| [PasteAt2](../spec/paste-at.md#pasteat2) | action pasteAt |
| [PasteAt3](../spec/paste-at.md#pasteat3) | action pasteAt |
| [PasteAt4](../spec/paste-at.md#pasteat4) | action pasteAt |
| [PasteAt5](../spec/paste-at.md#pasteat5) | action deleteByDrag |
| **paste-conv.md** | |
| [PasteConvPhraseInCode](../spec/paste-conv.md#pasteconvphraseincode) | code block |
| **paste-html.md** | |
| [PasteHtml9](../spec/paste-html.md#pastehtml9) | code block (expected) |
| [PasteHtml16](../spec/paste-html.md#pastehtml16) | code block (expected) |
| [PasteHtml19](../spec/paste-html.md#pastehtml19) | code block (expected) |
| **paste-list-form.md** | |
| [PasteListForm6](../spec/paste-list-form.md#pastelistform6) | option pasteListForm: own |
| **paste-list.md** | |
| [PasteList12](../spec/paste-list.md#pastelist12) | code block (expected) |
| [PasteList13](../spec/paste-list.md#pastelist13) | code block (expected) |
| [PasteList14](../spec/paste-list.md#pastelist14) | code block (expected) |
| [PasteList15](../spec/paste-list.md#pastelist15) | code block (expected) |
| [PasteList18](../spec/paste-list.md#pastelist18) | option pasteOnParent: after |
| [PasteList19](../spec/paste-list.md#pastelist19) | option pasteOnParent: after |
| [PasteList22](../spec/paste-list.md#pastelist22) | option pasteSeams: open |
| [PasteList23](../spec/paste-list.md#pastelist23) | option pasteSeams: open |
| [PasteList24](../spec/paste-list.md#pastelist24) | option pasteSeams: open |
| [PasteList26](../spec/paste-list.md#pastelist26) | code block (expected) |
| [PasteList27](../spec/paste-list.md#pastelist27) | code block (expected) |
| **paste-plain.md** | |
| [PastePlain4](../spec/paste-plain.md#pasteplain4) | tag free-form |
| [PastePlain21](../spec/paste-plain.md#pasteplain21) | tag free-form |
| [PastePlain22](../spec/paste-plain.md#pasteplain22) | tag free-form |
| [PastePlain27](../spec/paste-plain.md#pasteplain27) | changes only what blocks can't show |
| [PastePlain28](../spec/paste-plain.md#pasteplain28) | code block |
| [PastePlain29](../spec/paste-plain.md#pasteplain29) | tag markup-fence |
| [PastePlain30](../spec/paste-plain.md#pasteplain30) | code block |
| [PastePlain31](../spec/paste-plain.md#pasteplain31) | option pastePlainLines: enter |
| [PastePlain32](../spec/paste-plain.md#pasteplain32) | option pastePlainLines: items |
| [PastePlain33](../spec/paste-plain.md#pasteplain33) | option pastePlainLines: items |
| [PastePlain33b](../spec/paste-plain.md#pasteplain33b) | option pastePlainLines: items |
| [PastePlain33c](../spec/paste-plain.md#pasteplain33c) | option pastePlainLines: items |
| [PastePlain34](../spec/paste-plain.md#pasteplain34) | option pastePlainLines: host |
| **paste.md** | |
| [Paste4b](../spec/paste.md#paste4b) | option pasteSeams: open |
| [Paste7](../spec/paste.md#paste7) | code block (expected) |
| [Paste9](../spec/paste.md#paste9) | option quotes: container |
| [Paste14](../spec/paste.md#paste14) | code block |
| [Paste15](../spec/paste.md#paste15) | code block |
| [Paste16](../spec/paste.md#paste16) | caret in a marker |
| [Paste21](../spec/paste.md#paste21) | option pasteSeams: open |
| [Paste24b](../spec/paste.md#paste24b) | option pasteSeams: open |
| [Paste26b](../spec/paste.md#paste26b) | option pasteSeams: open |
| **placeholders.md** | |
| [Placeholder2](../spec/placeholders.md#placeholder2) | tag free-form |
| [Placeholder10](../spec/placeholders.md#placeholder10) | caret on a blank line |
| [Placeholder12](../spec/placeholders.md#placeholder12) | caret on a blank line |
| [Placeholder13](../spec/placeholders.md#placeholder13) | tag markup-heading |
| **quirks.md** | |
| [Quirk2b](../spec/quirks.md#quirk2b) | option quirkPasteCaret: athens |
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
| [Quote24](../spec/quotes.md#quote24) | changes only what blocks can't show |
| [Quote25](../spec/quotes.md#quote25) | changes only what blocks can't show |
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
| [Quote59](../spec/quotes.md#quote59) | tag free-form |
| [Quote89](../spec/quotes.md#quote89) | option quotes: container |
| [Quote90](../spec/quotes.md#quote90) | tag markup-fence |
| [Quote64](../spec/quotes.md#quote64) | changes only what blocks can't show |
| [Quote65](../spec/quotes.md#quote65) | option quotes: container |
| [Quote67](../spec/quotes.md#quote67) | changes only what blocks can't show |
| [Quote73](../spec/quotes.md#quote73) | tag free-form |
| [Quote77](../spec/quotes.md#quote77) | option quotes: container |
| [Quote78](../spec/quotes.md#quote78) | option quotes: container |
| [Quote80](../spec/quotes.md#quote80) | option quotes: container |
| [Quote83](../spec/quotes.md#quote83) | option quotes: container |
| [Quote85](../spec/quotes.md#quote85) | changes only what blocks can't show |
| [Quote86](../spec/quotes.md#quote86) | action duplicateSubtree |
| [Quote93](../spec/quotes.md#quote93) | tag markup-heading |
| [Quote69](../spec/quotes.md#quote69) | option quotes: container |
| [Quote70](../spec/quotes.md#quote70) | option quotes: container |
| [Quote94](../spec/quotes.md#quote94) | tag markup-task |
| [Quote96](../spec/quotes.md#quote96) | action duplicateSubtree |
| [Quote97](../spec/quotes.md#quote97) | tag free-form |
| [QuoteAtom15](../spec/quotes.md#quoteatom15) | option enterAtTextStart: stay |
| **regressions.md** | |
| [Regression1](../spec/regressions.md#regression1) | list numbered in part, or not from 1 |
| [Regression6](../spec/regressions.md#regression6) | code block |
| [Regression7](../spec/regressions.md#regression7) | tag markup-fence |
| [Regression8](../spec/regressions.md#regression8) | list numbered in part, or not from 1 |
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
| [Regression40](../spec/regressions.md#regression40) | caret in a marker |
| [Regression41](../spec/regressions.md#regression41) | option quotes: container |
| [Regression42](../spec/regressions.md#regression42) | selection across blocks |
| [Regression43](../spec/regressions.md#regression43) | caret in a marker |
| [Regression44](../spec/regressions.md#regression44) | tag markup-task |
| [Regression45](../spec/regressions.md#regression45) | tag markup-task |
| [Regression46](../spec/regressions.md#regression46) | tag markup-task |
| [Regression48](../spec/regressions.md#regression48) | indented code |
| [Regression49](../spec/regressions.md#regression49) | list numbered in part, or not from 1 |
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
| [Regression60](../spec/regressions.md#regression60) | option listParent: block |
| [Regression61](../spec/regressions.md#regression61) | option listParent: container |
| [Regression62](../spec/regressions.md#regression62) | changes only what blocks can't show |
| [Regression63](../spec/regressions.md#regression63) | list numbered in part, or not from 1 |
| [Regression66](../spec/regressions.md#regression66) | caret on a blank line |
| [Regression67](../spec/regressions.md#regression67) | caret on a blank line |
| [Regression68](../spec/regressions.md#regression68) | caret on a blank line |
| [Regression69](../spec/regressions.md#regression69) | the caret in a block a fold hides |
| [Regression70](../spec/regressions.md#regression70) | caret on a blank line |
| [Regression71](../spec/regressions.md#regression71) | action duplicateSubtree |
| [Regression78](../spec/regressions.md#regression78) | nothing to compare |
| [Regression79](../spec/regressions.md#regression79) | action duplicateSubtree |
| [Regression80](../spec/regressions.md#regression80) | action pasteAt |
| [Regression90](../spec/regressions.md#regression90) | option closeBackticks: all |
| [Regression91](../spec/regressions.md#regression91) | option pastePlainLines: enter |
| [Regression92](../spec/regressions.md#regression92) | caret in a marker |
| [Regression93](../spec/regressions.md#regression93) | action duplicateSubtree |
| [Regression100](../spec/regressions.md#regression100) | caret on a blank line |
| [Regression103](../spec/regressions.md#regression103) | tag enter-in-fence |
| [Regression104](../spec/regressions.md#regression104) | code block |
| [Regression105](../spec/regressions.md#regression105) | option pasteSeams: open |
| [Regression106](../spec/regressions.md#regression106) | caret on a blank line |
| [Regression107](../spec/regressions.md#regression107) | code block |
| [Regression108](../spec/regressions.md#regression108) | nothing to compare |
| [Regression109](../spec/regressions.md#regression109) | action duplicateSubtree |
| [Regression112](../spec/regressions.md#regression112) | nothing to compare |
| [Regression114](../spec/regressions.md#regression114) | option pastePlainLines: enter |
| [Regression115](../spec/regressions.md#regression115) | code block |
| [Regression116](../spec/regressions.md#regression116) | code block |
| [Regression118](../spec/regressions.md#regression118) | code block |
| [Regression120](../spec/regressions.md#regression120) | code block |
| [Regression121](../spec/regressions.md#regression121) | code block |
| [Regression122](../spec/regressions.md#regression122) | code block |
| [Regression123](../spec/regressions.md#regression123) | option markup: decorated |
| [Regression124](../spec/regressions.md#regression124) | the caret in a block a fold hides |
| [Regression126](../spec/regressions.md#regression126) | code block |
| [Regression128](../spec/regressions.md#regression128) | action pasteAt |
| [Regression130](../spec/regressions.md#regression130) | selection across blocks |
| [Regression131](../spec/regressions.md#regression131) | changes only what blocks can't show |
| [Regression132](../spec/regressions.md#regression132) | action deleteByDrag |
| [Regression133](../spec/regressions.md#regression133) | option closeBackticks: all |
| [Regression134](../spec/regressions.md#regression134) | option closeBackticks: all |
| [Regression137](../spec/regressions.md#regression137) | heading's closing #s |
| [Regression142](../spec/regressions.md#regression142) | list numbered in part, or not from 1 |
| [Regression143](../spec/regressions.md#regression143) | list numbered in part, or not from 1 |
| [Regression147](../spec/regressions.md#regression147) | code block |
| [Regression149](../spec/regressions.md#regression149) | changes only what blocks can't show |
| [Regression150](../spec/regressions.md#regression150) | tag enter-in-fence |
| [Regression151](../spec/regressions.md#regression151) | code block |
| [Regression152](../spec/regressions.md#regression152) | option markup: decorated |
| [Regression153](../spec/regressions.md#regression153) | changes only what blocks can't show |
| [Regression154](../spec/regressions.md#regression154) | indented code |
| [Regression159](../spec/regressions.md#regression159) | caret in a marker |
| [Regression160](../spec/regressions.md#regression160) | option pastePlainLines: enter |
| [Regression161](../spec/regressions.md#regression161) | selection across blocks |
| [Regression163](../spec/regressions.md#regression163) | action duplicateSubtree |
| [Regression164](../spec/regressions.md#regression164) | code block |
| [Regression165](../spec/regressions.md#regression165) | caret in a marker |
| [Regression166](../spec/regressions.md#regression166) | option quotes: container |
| [Regression167](../spec/regressions.md#regression167) | action duplicateSubtree |
| [Regression178](../spec/regressions.md#regression178) | option closeBackticks: all |
| [Regression180](../spec/regressions.md#regression180) | list numbered in part, or not from 1 |
| [Regression187](../spec/regressions.md#regression187) | caret on a blank line |
| [Regression190](../spec/regressions.md#regression190) | action duplicateSubtree |
| [Regression192](../spec/regressions.md#regression192) | action duplicateSubtree |
| [Regression193](../spec/regressions.md#regression193) | caret on a blank line |
| [Regression194](../spec/regressions.md#regression194) | code block |
| [Regression195](../spec/regressions.md#regression195) | action duplicateSubtree |
| **scenarios.md** | |
| [Scenario6](../spec/scenarios.md#scenario6) | tag free-form |
| [Scenario8b](../spec/scenarios.md#scenario8b) | no text focus after moveSubtree ③ |
| [Scenario8d](../spec/scenarios.md#scenario8d) | action drag ② |
| [Scenario15](../spec/scenarios.md#scenario15) | tag markup-task |
| [Scenario18](../spec/scenarios.md#scenario18) | code block (expected) |
| [Scenario24](../spec/scenarios.md#scenario24) | tag free-form |
| [Scenario25](../spec/scenarios.md#scenario25) | tag free-form |
| **select.md** | |
| [Select5](../spec/select.md#select5) | option selectionLadder: parents |
| [Select7](../spec/select.md#select7) | selection across blocks |
| [Select17](../spec/select.md#select17) | caret on a blank line |
| [Select18](../spec/select.md#select18) | changes only what blocks can't show |
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
| [Zoom3](../spec/zoom.md#zoom3) | its view, on an adapted start |
| [Zoom4](../spec/zoom.md#zoom4) | caret in a marker |
| [Zoom8](../spec/zoom.md#zoom8) | action clearZoom |
| [Zoom12](../spec/zoom.md#zoom12) | caret on a blank line |
| [Zoom13](../spec/zoom.md#zoom13) | code block |
| [Zoom14](../spec/zoom.md#zoom14) | option enterOnEmptyItem: unwrap |
