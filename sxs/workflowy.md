---
type: "SxS"
app: "workflowy"
version: "4.3.2610140850"
url: "https://beta.workflowy.com/guide/embed/"
model: "block"
command: "node sxs/run.ts workflowy"
elapsed_s: 203
workers: 4
---

# WorkFlowy vs ourus

Summary:

|  | agree | caret | whitespace | disagree | error | skipped | not run | total |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| original | 180 | [19](#caret-19) | [4](#whitespace-4) | [28](#disagree-28) |  |  |  | **231** |
| adapted | 303 | [13](#adapted-caret-13) | [17](#adapted-whitespace-17) | [129](#adapted-disagree-129) |  |  |  | **462** |
| **total** | **483 (34%)** | **32 (2.3%)** | **21 (1.5%)** | **157 (11%)** | **0 (0%)** | **[714](#skipped-714) (51%)** | **[1](#not-run-1) (0.071%)** | **1411** |

Per-file:

|  | agree | caret | whitespace | disagree | error | skipped | not run | total | original | adapted |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [backspace.md](../spec/backspace.md) | 38 | 3 |  | 12 |  | 33 |  | **86** | 17 | 36 |
| [backtick.md](../spec/backtick.md) | 1 |  | 1 | 6 |  | 25 |  | **33** |  | 8 |
| [copy.md](../spec/copy.md) | 3 |  |  |  |  | 10 |  | **13** | 1 | 2 |
| [cursor.md](../spec/cursor.md) | 28 | 1 |  |  |  | 7 |  | **36** | 13 | 16 |
| [delete-subtree.md](../spec/delete-subtree.md) | 7 |  |  |  |  | 7 |  | **14** | 3 | 4 |
| [delete.md](../spec/delete.md) | 21 |  |  | 9 |  | 26 |  | **56** | 10 | 20 |
| [drag.md](../spec/drag.md) |  |  |  |  |  | 8 |  | **8** |  |  |
| [duplicate-subtree.md](../spec/duplicate-subtree.md) |  | 5 |  |  |  | 7 |  | **12** | 5 |  |
| [enter.md](../spec/enter.md) | 49 | 1 | 3 | 8 |  | 37 |  | **98** | 26 | 35 |
| [fences.md](../spec/fences.md) | 7 |  | 4 | 2 |  | 57 |  | **70** |  | 13 |
| [fold.md](../spec/fold.md) | 11 | 1 |  | 2 |  | 5 |  | **19** | 13 | 1 |
| [gaps.md](../spec/gaps.md) | 14 |  |  |  |  | 5 |  | **19** |  | 14 |
| [indent.md](../spec/indent.md) | 29 |  |  | 1 |  | 25 |  | **55** | 19 | 11 |
| [lists.md](../spec/lists.md) | 5 |  |  |  |  | 11 |  | **16** |  | 5 |
| [move-subtree-down.md](../spec/move-subtree-down.md) | 28 |  |  | 2 |  | 14 |  | **44** | 15 | 15 |
| [move-subtree-up.md](../spec/move-subtree-up.md) | 27 |  |  | 1 |  | 18 |  | **46** | 16 | 12 |
| [move-subtree.md](../spec/move-subtree.md) | 10 | 2 |  | 1 |  | 11 |  | **24** | 8 | 5 |
| [obsidian-true-outliner.md](../spec/obsidian-true-outliner.md) | 34 | 2 | 1 | 4 |  | 26 |  | **67** | 13 | 28 |
| [outdent.md](../spec/outdent.md) | 16 |  |  | 2 |  | 24 |  | **42** | 4 | 14 |
| [paste-at.md](../spec/paste-at.md) |  |  |  |  |  | 5 |  | **5** |  |  |
| [paste-conv.md](../spec/paste-conv.md) | 6 |  |  |  |  |  |  | **6** | 1 | 5 |
| [paste-html.md](../spec/paste-html.md) | 8 |  |  | 9 |  | 2 |  | **19** |  | 17 |
| [paste-list-form.md](../spec/paste-list-form.md) | 3 |  |  | 2 |  | 1 |  | **6** |  | 5 |
| [paste-list.md](../spec/paste-list.md) | 8 | 3 |  | 16 |  | 2 |  | **29** | 5 | 22 |
| [paste-plain.md](../spec/paste-plain.md) | 11 | 1 |  | 15 |  | 9 |  | **36** |  | 27 |
| [paste.md](../spec/paste.md) | 11 |  | 1 | 10 |  | 14 |  | **36** |  | 22 |
| [placeholders.md](../spec/placeholders.md) | 10 |  | 4 | 1 |  | 5 |  | **20** | 5 | 10 |
| [quirks.md](../spec/quirks.md) | 3 |  |  |  |  | 4 |  | **7** |  | 3 |
| [quotes.md](../spec/quotes.md) | 8 |  |  | 10 |  | 125 |  | **143** |  | 18 |
| [regressions.md](../spec/regressions.md) | 34 | 5 | 7 | 28 |  | 114 | 1 | **189** | 17 | 57 |
| [scenarios.md](../spec/scenarios.md) | 17 |  |  | 3 |  | 9 |  | **29** | 9 | 11 |
| [select.md](../spec/select.md) | 12 | 6 |  |  |  | 5 |  | **23** | 9 | 9 |
| [shift-enter.md](../spec/shift-enter.md) |  |  |  |  |  | 36 |  | **36** |  |  |
| [subtree-selection.md](../spec/subtree-selection.md) | 7 | 1 |  | 5 |  | 4 |  | **17** | 11 | 2 |
| [tasks.md](../spec/tasks.md) | 7 |  |  | 7 |  | 16 |  | **30** |  | 14 |
| [typing.md](../spec/typing.md) |  |  |  |  |  | 3 |  | **3** |  |  |
| [undo.md](../spec/undo.md) | 4 |  |  |  |  | 1 |  | **5** | 3 | 1 |
| [zoom.md](../spec/zoom.md) | 6 | 1 |  | 1 |  | 6 |  | **14** | 8 |  |
| **total** | **483 (34%)** | **32 (2.3%)** | **21 (1.5%)** | **157 (11%)** | **0 (0%)** | **717 (51%)** | **1 (0.071%)** | **1411** | **231 (16%)** | **462 (33%)** |

## Disagree (28)

### [Backspace3](../spec/backspace.md#backspace3)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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

### [Backspace9](../spec/backspace.md#backspace9)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  ┃two
```

</td><td>

```buffer
- one
  ┃two
  
```

</td><td>

```buffer
- one┃two
```

</td></tr>
</table>

### [Delete1](../spec/delete.md#delete1)

> deleteContentForward

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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

### [Delete3](../spec/delete.md#delete3)

> deleteContentForward

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one┃
  two
```

</td><td>

```buffer
- one┃
  two
```

</td><td>

```buffer
- one┃two
```

</td></tr>
</table>

### [Enter16](../spec/enter.md#enter16)

> enter

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  lazy
```

</td><td>

```buffer
- a
  lazy
- ┃
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
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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
   
   ┃
   
```

</td><td>

```buffer
1. a
   text
2. ┃
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
<tr><th>workflowy</th><th>ourus</th></tr>
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
<tr><th>workflowy</th><th>ourus</th></tr>
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

### [Fold15](../spec/fold.md#fold15)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b
- ┃c

⟦folded 1; zoom none⟧
```

</td><td>

```buffer
- a
  - b
- ┃c

⟦folded 1; zoom none⟧
```

</td><td>

```buffer
- a┃c
  - b

⟦folded 1; zoom none⟧
```

</td></tr>
</table>

### [Indent19](../spec/indent.md#indent19)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
- b  
  c┃
```

</td></tr>
</table>

> indent

<table>
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b  
  c→┃
```

</td><td>

```buffer
- a
  - b  
    c┃
```

</td></tr>
</table>

> outdent

<table>
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b  
  c→┃
```

</td><td>

```buffer
- a
- b  
  c┃
```

</td></tr>
</table>

### [MoveDown23](../spec/move-subtree-down.md#movedown23)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
9. a┃
   - x
10. b
```

</td><td>

```buffer
1. b
2. a┃
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
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
9. a┃
10. b
    - x
```

</td><td>

```buffer
1. b
   - x
2. a┃
```

</td><td>

```buffer
9. b
   - x
10. a┃
```

</td></tr>
</table>

### [MoveUp15](../spec/move-subtree-up.md#moveup15)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
9. a
   - x
10. b┃
```

</td><td>

```buffer
1. b┃
2. a
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

### [TO4](../spec/obsidian-true-outliner.md#to4)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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

### [TO5](../spec/obsidian-true-outliner.md#to5)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- p
  1. ┃a
  2. b
```

</td><td>

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

### [TO6](../spec/obsidian-true-outliner.md#to6)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
3. a
4. ┃b
5. c
```

</td><td>

```buffer
1. a┃b
2. c
```

</td><td>

```buffer
3. a┃b
4. c
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
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- see ┃here
```

</td><td>

```buffer
1. see Introduction┃here
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
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃b
  - kid
```

</td><td>

```buffer
- ab
  - kid
- x
- y┃
```

</td><td>

```buffer
- ax
- y┃b
  - kid
```

</td></tr>
</table>

### [Regression8](../spec/regressions.md#regression8)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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

### [Regression46](../spec/regressions.md#regression46)

> outdent

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
1. «x»
2. b
```

</td><td>

```buffer
- a
- x┃
1. b
```

</td><td>

```buffer
- a
1. x┃
2. b
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
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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
   -
    x┃
  
```

</td><td>

```buffer
- 
  [x] 
  x┃
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
<tr><th>workflowy</th><th>ourus</th></tr>
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
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - x
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
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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

### [Zoom10](../spec/zoom.md#zoom10)

> enter

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃b
- c

⟦folded none; zoom 1⟧
```

</td><td>

```buffer
- ab
  - ┃
- c

⟦folded 1; zoom 1⟧
```

</td><td>

```buffer
- a
  - ┃b
- c

⟦folded none; zoom 1⟧
```

</td></tr>
</table>

## Whitespace (4)

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
<tr><th>workflowy</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃bravo
  - charlie
```

</td><td>

```buffer
-  x┃bravo
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
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃bravo
  - charlie
```

</td><td>

```buffer
-  x┃bravo
  - charlie
```

</td><td>

```buffer
- x┃bravo
  - charlie
```

</td></tr>
</table>

## Caret (19)

### [Backspace17](../spec/backspace.md#backspace17)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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

### [CursorDown4](../spec/cursor.md#cursordown4)

> cursorLineDown

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc┃
- abcd
```

</td><td>

```buffer
- abc
- ┃abcd
```

</td><td>

```buffer
- abc
- abc┃d
```

</td></tr>
</table>

### [DuplicateSubtree1](../spec/duplicate-subtree.md#duplicatesubtree1)

> duplicateSubtree

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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
- a
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

### [DuplicateSubtree2](../spec/duplicate-subtree.md#duplicatesubtree2)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
1. a┃
2. b
```

</td></tr>
</table>

> duplicateSubtree

<table>
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a┃
2. a
3. b
```

</td><td>

```buffer
1. a
2. a┃
3. b
```

</td></tr>
</table>

> deleteSubtree

<table>
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a
2. b
```

</td><td>

```buffer
1. a┃
2. b
```

</td></tr>
</table>

### [DuplicateSubtree3](../spec/duplicate-subtree.md#duplicatesubtree3)

> duplicateSubtree

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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
- ««b
- c»»
- b
- c
- d
```

</td><td>

```buffer
- a
- b
- c
- ««b
- c»»
- d
```

</td></tr>
</table>

### [DuplicateSubtree10](../spec/duplicate-subtree.md#duplicatesubtree10)

> duplicateSubtree

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
  - a
```

</td><td>

```buffer
- ┃
  - a
- 
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

### [DuplicateSubtree11](../spec/duplicate-subtree.md#duplicatesubtree11)

> duplicateSubtree

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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
- b
  - c
- d
```

</td><td>

```buffer
- a
- b
  - c
- ««b»»
  - c
- d
```

</td></tr>
</table>

### [Fold8](../spec/fold.md#fold8)

> duplicateSubtree

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - b

⟦folded 1; zoom none⟧
```

</td><td>

```buffer
- a┃
  - b
- a
  - b

⟦folded 1 3; zoom none⟧
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

### [MoveSubtree5](../spec/move-subtree.md#movesubtree5)

> moveSubtree ③

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃here
```

</td><td>

```buffer
1. Introduction┃here
```

</td><td>

```buffer
- 1\. Introduction┃here
```

</td></tr>
</table>

### [Regression163](../spec/regressions.md#regression163)

> duplicateSubtree

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ««a
- b
- c»»
```

</td><td>

```buffer
- ««a
- b
- c»»
- a
- b
- c
```

</td><td>

```buffer
- a
- b
- c
- ««a
- b
- c»»
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
<tr><th>workflowy</th><th>ourus</th></tr>
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
<tr><th>workflowy</th><th>ourus</th></tr>
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
<tr><th>workflowy</th><th>ourus</th></tr>
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
  - three
  - five»»
- four
```

</td></tr>
</table>

> selectNodeUp

<table>
<tr><th>workflowy</th><th>ourus</th></tr>
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
<tr><th>workflowy</th><th>ourus</th></tr>
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
<tr><th>workflowy</th><th>ourus</th></tr>
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
<tr><th>workflowy</th><th>ourus</th></tr>
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
<tr><th>workflowy</th><th>ourus</th></tr>
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
<tr><th>workflowy</th><th>ourus</th></tr>
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
<tr><th>workflowy</th><th>ourus</th></tr>
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
<tr><th>workflowy</th><th>ourus</th></tr>
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
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  ┃«mo»re
- b
```

</td><td>

```buffer
- a┃«
  mo»re
- b
```

</td></tr>
</table>

> selectNodeUp

<table>
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  ┃«mo»re
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
<tr><th>workflowy</th><th>ourus</th></tr>
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
<tr><th>workflowy</th><th>ourus</th></tr>
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
<tr><th>workflowy</th><th>ourus</th></tr>
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
- one
  - two
    - deep
  - ««three»»
  - five
- four
```

</td></tr>
</table>

### [SubtreeEdit12](../spec/subtree-selection.md#subtreeedit12)

> enter

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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
- b┃
  - b1
- c
```

</td></tr>
</table>

### [Zoom6](../spec/zoom.md#zoom6)

> zoomIn

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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

## Adapted: disagree (129)

### [Backspace15](../spec/backspace.md#backspace15)

> deleteContentBackward

Adapted: as blocks, blank lines, paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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
- para┃a
```

</td></tr>
</table>

### [Backspace18e](../spec/backspace.md#backspace18e)

> deleteContentBackward

Adapted: as blocks, heading

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- # ┃H
```

</td><td>

```buffer
- a
- # ┃H
```

</td><td>

```buffer
- a
- ┃H
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- # ┃H
```

</td><td>

```buffer
- a
- ┃H
```

</td></tr>
</table>

### [Backspace18g](../spec/backspace.md#backspace18g)

> deleteContentBackward

Adapted: as blocks, heading, paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- # ┃H
  - text
```

</td><td>

```buffer
- a
- # ┃H
  - text
```

</td><td>

```buffer
- a
- ┃H
  - text
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- # ┃H
  text
```

</td><td>

```buffer
- a
- ┃H
  - text
```

</td></tr>
</table>

### [Backspace19](../spec/backspace.md#backspace19)

Adapted: as blocks, blank lines, paragraph

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃bc
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃bc
```

</td><td>

```buffer
- a┃bc
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃bc
```

</td><td>

```buffer
- ┃bc
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>deleteContentBackward</th><th>deleteContentBackward</th></tr>
<tr valign="top"><td>

```buffer
- a

  ┃bc
```

</td><td>

```buffer
- a┃bc
```

</td><td>

```buffer
- ┃bc
```

</td></tr>
</table>

### [Backspace22](../spec/backspace.md#backspace22)

> deleteContentBackward

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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

### [Backspace36](../spec/backspace.md#backspace36)

> deleteContentBackward

Adapted: heading, paragraph, setext heading

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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

### [Backspace37](../spec/backspace.md#backspace37)

> deleteContentBackward

Adapted: heading, paragraph, setext heading

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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

### [Backspace40](../spec/backspace.md#backspace40)

> deleteContentBackward

Adapted: as blocks, blank lines, paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- p
  - ┃t
  2. m
```

</td><td>

```buffer
- p
  - ┃t
  2. m
```

</td><td>

```buffer
- p┃t
  1. m
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
- p┃t
  1. m
```

</td></tr>
</table>

### [Backspace41](../spec/backspace.md#backspace41)

> deleteContentBackward

Adapted: as blocks, list as an item's first block

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- 
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

Adapted: as blocks, task

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
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] ┃def
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

### [Backtick1](../spec/backtick.md#backtick1)

Adapted: as blocks, blank lines, code block, paragraph

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- intro
  
  ┃
```

</td></tr>
</table>

> "```"

<table>
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- intro
  ```┃
````

</td><td>

````buffer
- intro
  - ```┃
    ```
````

</td></tr>
</table>

> "js" enter "x"

<table>
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- intro
  ```js
  x┃
````

</td><td>

````buffer
- intro
  - ```js
    x┃
    ```
````

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>"```"</th><th>"js" enter "x"</th></tr>
<tr valign="top"><td>

```buffer
intro

┃
```

</td><td>

````buffer
- intro
  
  ```┃
  ```
````

</td><td>

````buffer
- intro
  
  ```js
  x┃
  ```
````

</td></tr>
</table>

### [Backtick4](../spec/backtick.md#backtick4)

> "````"

Adapted: code block, empty document

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

````buffer
- ```
  `┃
  ```
````

</td><td>

`````buffer
- ````┃
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

### [Backtick9](../spec/backtick.md#backtick9)

> "```"

Adapted: as blocks, code block

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- ```
  code
  ┃
  ```
````

</td><td>

`````buffer
- ````
  code```┃
  
  ````
`````

</td><td>

````buffer
- ```
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
- ```
  code
  ```┃
````

</td></tr>
</table>

### [Backtick12](../spec/backtick.md#backtick12)

Adapted: as blocks, code block, paragraph

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- ``┃print(1)
```

</td></tr>
</table>

> "`"

<table>
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- ```
  ┃print(1)
  ```
````

</td><td>

````buffer
- ```┃print(1)
  ```
````

</td></tr>
</table>

> enter

<table>
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- ```
  
  ┃print(1)
  ```
````

</td><td>

````buffer
- ```
  ┃print(1)
  ```
````

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>"`"</th><th>enter</th></tr>
<tr valign="top"><td>

```buffer
``┃print(1)
```

</td><td>

````buffer
- ```┃print(1)
  ```
````

</td><td>

````buffer
- ```
  ┃print(1)
  ```
````

</td></tr>
</table>

### [Backtick15](../spec/backtick.md#backtick15)

Adapted: as blocks, blank lines, code block, paragraph

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- intro
- ``┃
```

</td></tr>
</table>

> "`"

<table>
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- intro
- ```
  ┃
  ```
````

</td><td>

````buffer
- intro
- ```┃
  ```
````

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- intro┃
```

</td><td>

```buffer
- intro
- ``┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>"`"</th><th>deleteContentBackward</th></tr>
<tr valign="top"><td>

```buffer
intro

``┃
```

</td><td>

````buffer
- intro
- ```┃
  ```
````

</td><td>

```buffer
- intro
- ``┃
```

</td></tr>
</table>

### [Backtick30](../spec/backtick.md#backtick30)

> "~~~"

Adapted: as blocks, blank lines, code block, paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- intro
  
  ┃
```

</td><td>

```buffer
- intro
  ~~~┃
```

</td><td>

```buffer
- intro
  - ~~~┃
    ~~~
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
intro

┃
```

</td><td>

```buffer
- intro
  
  ~~~┃
  ~~~
```

</td></tr>
</table>

### [Delete13](../spec/delete.md#delete13)

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- # H1
```

</td></tr>
</table>

> deleteContentForward

<table>
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- # H1
```

</td><td>

```buffer
- a┃
- H1
```

</td></tr>
</table>

> deleteContentForward

<table>
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- # H1
```

</td><td>

```buffer
- a┃H1
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>deleteContentForward</th><th>deleteContentForward</th></tr>
<tr valign="top"><td>

```buffer
a┃

# H1
```

</td><td>

```buffer
a┃

H1
```

</td><td>

```buffer
a┃H1
```

</td></tr>
</table>

### [Delete13g](../spec/delete.md#delete13g)

Adapted: as blocks, heading

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
<tr><th>workflowy</th><th>ourus</th></tr>
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

</td></tr>
</table>

> deleteContentForward

<table>
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- # H
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

### [Delete17](../spec/delete.md#delete17)

> deleteContentForward

Adapted: as blocks, blank lines, paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Shopping:┃
  - milk
  - eggs
```

</td><td>

```buffer
- Shopping:┃
  - milk
  - eggs
```

</td><td>

```buffer
- Shopping:┃milk
  - eggs
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Shopping:┃

- milk
- eggs
```

</td><td>

```buffer
- Shopping:┃milk
  - eggs
```

</td></tr>
</table>

### [Delete18b](../spec/delete.md#delete18b)

> deleteContentForward

Adapted: as blocks, blank lines, paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - bc
```

</td><td>

```buffer
- a┃
  - bc
```

</td><td>

```buffer
- a┃bc
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
- a┃bc
```

</td></tr>
</table>

### [Delete26](../spec/delete.md#delete26)

> deleteContentForward

Adapted: heading, paragraph, setext heading

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Title┃
  - text
```

</td><td>

```buffer
- # Title┃
  - text
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
Title┃
=====
text
```

</td><td>

```buffer
Title┃text
=====
```

</td></tr>
</table>

### [Delete33](../spec/delete.md#delete33)

Adapted: as blocks, list as an item's first block

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
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - b
```

</td></tr>
</table>

> deleteContentForward

<table>
<tr><th>workflowy</th><th>ourus</th></tr>
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

### [Enter3c](../spec/enter.md#enter3c)

> enter

Adapted: under enterSplitSpace: start

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
9. a┃ b
   - c
10. d
```

</td><td>

```buffer
1. a
2. ┃ b
   - c
3. d
```

</td><td>

```buffer
9. a
10. ┃ b
    - c
11. d
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
10. ┃ b
     - c
11. d
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
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ## one
  
  ┃two
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
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ## one
  ┃two
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
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ## one
  t┃wo
  three
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
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ## one
  two
  ┃
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

### [Enter52](../spec/enter.md#enter52)

> enter

Adapted: blank lines, heading, paragraph, setext heading, under quirkEnterMidHeading: workflowy

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ## one
  ┃two
- ## three
```

</td><td>

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

### [Enter57](../spec/enter.md#enter57)

> enter

Adapted: as blocks, escape, paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- p
  #┃a
```

</td><td>

```buffer
- p
  \#
  ┃a
```

</td><td>

```buffer
- p
  \#
- ┃a
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
- p
  \#
- ┃a
```

</td></tr>
</table>

### [Enter60](../spec/enter.md#enter60)

Adapted: blank lines, escape, heading, paragraph, setext heading, under enterSplitSpace: start, under quirkEnterMidHeading: workflowy

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- # title┃ - x
```

</td></tr>
</table>

> enter

<table>
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- title
- # ┃ - x
```

</td><td>

```buffer
- title
- # ┃- x
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- title
- # ┃ - x
```

</td><td>

```buffer
- title
- ┃- x
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

┃\- x
===
```

</td><td>

```buffer
title

┃\- x
```

</td></tr>
</table>

### [Fence34](../spec/fences.md#fence34)

> deleteContentForward

Adapted: as blocks, code block

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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
- ```
  one
  ```
````

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

### [Fence63](../spec/fences.md#fence63)

> enter

Adapted: code block

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- item text
  -   ┃```
      code
      ```
````

</td><td>

````buffer
- item text
  -   
  - ┃```
      code
      ```
````

</td><td>

````buffer
- item text
- ```
  ┃code
  ```
````

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- item text
    ┃```
    code
    ```
````

</td><td>

````buffer
- item text
- ```
  ┃code
  ```
````

</td></tr>
</table>

### [MoveSubtree21](../spec/move-subtree.md#movesubtree21)

> moveSubtree ①

Adapted: blank lines

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- x┃
1. a
2. b
```

</td><td>

```buffer
1. a
- x
1. b
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

### [TO-E4](../spec/obsidian-true-outliner.md#to-e4)

> enter

Adapted: under enterSplitSpace: start

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- first
  second┃ line
```

</td><td>

```buffer
- first
  second
  ┃ line
```

</td><td>

```buffer
- first
  second
- ┃ line
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
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

</td></tr>
</table>

### [Outdent23](../spec/outdent.md#outdent23)

> outdent

Adapted: under outdent: logical

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- This site uses XSLT; that functionality is being [removed from this browser very soon](https://chromestatus.com/feature/4709671889534976).
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
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- c
- d┃
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
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
-  done
- todo┃
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
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- let a = 1;
- let b = 2;┃
```

</td><td>

````buffer
- ```js
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

Adapted: blank lines, empty document, heading, paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- Title
- para **bold** `c`┃
```

</td><td>

```buffer
- ## Title
  - para **bold** `c`┃
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
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
1. not a list, *x* and [y]
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

Adapted: blank lines, code block, empty document, heading

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- Setup
- npm install┃
```

</td><td>

````buffer
- ## Setup
  - ```shell
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
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- ·      one
- o      nested┃
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
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- javascript
- Copy code
- let a = 1;┃
```

</td><td>

````buffer
- ```javascript
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
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
1. ax
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
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a┃
2. b
```

</td><td>

```buffer
- ax
- y┃
1. b
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

Adapted: under pasteSeams: open

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃b
- c
```

</td><td>

```buffer
- ax
- y
- ┃b
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

Adapted: under pasteAtTextStart: before, under pasteSeams: open

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃ab
- c
```

</td><td>

```buffer
- x
- y
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

Adapted: under pasteOnParent: after, under pasteSeams: open

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - kid
```

</td><td>

```buffer
- a
  - kid
- x
- y┃
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

Adapted: as blocks, task

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
```

</td><td>

```buffer
- aone
- two
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
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

````buffer
- ```
  ac
  ```
- b
````

</td><td>

````buffer
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

Adapted: blank lines, code block, under pasteSeams: open

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

````buffer
- ax
- ```
  c┃
  ```
- b
````

</td><td>

````buffer
- ax
  - ```
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
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - kid
```

</td><td>

````buffer
- ```
  ac
  ```
  - kid
````

</td><td>

````buffer
- a
  - ```
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

Adapted: blank lines, paragraph, under pasteSeams: open

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- # ah
- text┃
- b
```

</td><td>

```buffer
- ah
  - text┃
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

### [PasteList18](../spec/paste-list.md#pastelist18)

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
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - kid
- b
```

</td><td>

```buffer
- a
  - kid
- x
- y┃
- b
```

</td><td>

```buffer
- ax
- y┃
  - kid
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
  - kid
- b
```

</td><td>

```buffer
- ax
- y┃
  - kid
- b
```

</td></tr>
</table>

### [PasteList19](../spec/paste-list.md#pastelist19)

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

Adapted: as blocks, paragraph, under pasteSeams: open

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Notes┃
  - z
```

</td><td>

```buffer
- Notes
  - z
- x
- y┃
```

</td><td>

```buffer
- Notesx
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
- Notesx
- y┃
  - z
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

Adapted: under pasteSeams: open

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. ┃ab
2. c
```

</td><td>

```buffer
- x
- y
- ┃ab
1. c
```

</td><td>

```buffer
1. x
2. y┃ab
3. c
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. ┃ab
2. c
```

</td><td>

```buffer
1. x
2. y┃ab
3. c
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
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

`````buffer
- ````
  a  code
    ```
  ````
  - code
  - ```┃
- b
`````

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
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

````buffer
- ```
  a  code
  ```
  - code┃
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

Adapted: under pastePlainLines: items

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃b
```

</td><td>

```buffer
- ax
- y
- ┃b
```

</td><td>

```buffer
- ax
- y┃b
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
- y┃b
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

Adapted: blank lines, under pastePlainLines: items

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃b
- c
```

</td><td>

```buffer
- ax
- y
- ┃b
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

Adapted: escape, under pastePlainLines: items

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃b
```

</td><td>

```buffer
- ax
- y
- ┃b
```

</td><td>

```buffer
- ax
- - y┃b
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
- \- y┃b
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

Adapted: blank lines, escape, under pastePlainLines: items

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃b
```

</td><td>

```buffer
- a$$
- x^2
- $$
- ┃b
```

</td><td>

```buffer
- a\$$
- x^2
- $$┃b
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
- a\$$
- x^2

- \$$┃b
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

Adapted: as blocks, paragraph, under pastePlainLines: items

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃words
```

</td><td>

```buffer
- a
- b
- ┃words
```

</td><td>

```buffer
- a
- b┃words
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
- a
- b┃words
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

Adapted: under pastePlainLines: items

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- 2┃\. y
```

</td><td>

```buffer
1. 2a
2. b
- ┃. y
```

</td><td>

```buffer
- 2a
- b┃. y
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
- 2a
- b┃. y
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

Adapted: as blocks, paragraph, under pastePlainLines: items

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- p┃
```

</td><td>

```buffer
- px
  - y┃
```

</td><td>

```buffer
- px
- y┃
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
- px
- y┃
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

Adapted: blank lines, under pastePlainLines: items

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
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
-  b
  - c
- x
- y┃
```

</td><td>

```buffer
- x
- y┃b
  - c
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>deleteContentForward</th><th>pastePlain</th></tr>
<tr valign="top"><td>

```buffer
- ┃a b
  - c
```

</td><td>

```buffer
- ┃◌ b
  - c
```

</td><td>

```buffer
- x

- y┃b
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

Adapted: under pastePlainLines: items

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃a
```

</td><td>

```buffer
- first
- second
- ┃a
```

</td><td>

```buffer
- first
- second┃a
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃a
```

</td><td>

```buffer
- first
- second┃a
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

Adapted: blank lines, heading, paragraph, setext heading, under pastePlainLines: items

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ## Title┃more
```

</td><td>

```buffer
- ## Titlex
- y
- ┃more
```

</td><td>

```buffer
- ## Titlemore
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
Title┃more
---
```

</td><td>

```buffer
Titlemore
---

x

y┃
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

Adapted: under pastePlainLines: items

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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
- a
  x┃b
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
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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

### [PastePlain32](../spec/paste-plain.md#pasteplain32)

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

Adapted: escape, under pasteSeams: open

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃b
```

</td><td>

```buffer
- ax
- y
- ┃b
```

</td><td>

```buffer
- ax
- - y┃b
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
- \- y┃b
```

</td></tr>
</table>

### [PastePlain33](../spec/paste-plain.md#pasteplain33)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
- x
- y
```

</td></tr>
</table>

> pastePlain

Adapted: under pasteSeams: open

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃b
```

</td><td>

```buffer
- ax
- y
- ┃b
```

</td><td>

```buffer
- ax
- y┃b
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
- y┃b
```

</td></tr>
</table>

### [PastePlain33b](../spec/paste-plain.md#pasteplain33b)

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

Adapted: blank lines, under pasteSeams: open

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a«bc»d
- e
```

</td><td>

```buffer
- ax
- y
- ┃d
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

Adapted: under pasteLines: items

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃b
```

</td><td>

```buffer
- ax
- y
- ┃b
```

</td><td>

```buffer
- ax
- y┃b
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
- y┃b
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

Adapted: as blocks, paragraph, under pasteSeams: open

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- See ┃here.
```

</td><td>

```buffer
- See x
- y
- ┃here.
```

</td><td>

```buffer
- See x
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
- See x
- y┃here.
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

Adapted: as blocks, blank lines, code block, paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- p┃
- q
```

</td><td>

````buffer
- ```
  pc
  ```
- q
````

</td><td>

````buffer
- p
  - ```
    c┃
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
  c┃
  ```
- q
````

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

Adapted: blank lines, heading, paragraph, under pasteSeams: open

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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
  - ## ph
  - text┃
  - q
  - ## B
    - r
```

</td><td>

```buffer
- # A
  - ph
  - text┃
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

ph

text┃

q

## B

r
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

Adapted: as blocks, blank lines, paragraph, under pasteSeams: open

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  ┃
- b
```

</td><td>

```buffer
- a
  \- x┃
  
- b
```

</td><td>

```buffer
- a
  x┃
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
  x┃
- b
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

Adapted: under pasteSeams: open

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a«bc»d
- e
```

</td><td>

```buffer
- ax
- y
- ┃d
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

Adapted: blank lines, heading, paragraph, under pasteSeams: open

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # A
  - ┃para
```

</td><td>

```buffer
- # A
  - ## h
  - text
  - ┃para
```

</td><td>

```buffer
- # A
  - h
  - text┃para
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# A

┃para
```

</td><td>

```buffer
# A

h

text┃para
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

Adapted: as blocks, blank lines, paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- p┃q
```

</td><td>

```buffer
- # ph
- text
- ┃q
```

</td><td>

```buffer
- ph
  - text┃q
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
p┃q
```

</td><td>

```buffer
- ph

  text┃q
```

</td></tr>
</table>

### [Placeholder13](../spec/placeholders.md#placeholder13)

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
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # H1
  - ┃
  - ## H2
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

### [Quote53](../spec/quotes.md#quote53)

> deleteContentBackward

Adapted: as blocks, blank lines, quote

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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
- ┃q
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
```

</td><td>

```buffer
- a
- ┃q
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

Adapted: as blocks, quote, under pastePlainLines: items

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- > a┃b
```

</td><td>

```buffer
- > ax
  y
  ┃b
```

</td><td>

```buffer
- > ax
- y┃b
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
- y┃b
```

</td></tr>
</table>

### [Quote94](../spec/quotes.md#quote94)

> deleteContentBackward

Adapted: as blocks, quote, task

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- [ ] 
  - > ┃q
- b
```

</td><td>

```buffer
- a
- [ ] 
  - > ┃q
- b
```

</td><td>

```buffer
- a
- [ ] 
  - ┃q
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
  - ┃q
- b
```

</td></tr>
</table>

### [QuoteText1](../spec/quotes.md#quotetext1)

Adapted: as blocks, quote

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
- > ┃q
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- > ┃q
```

</td><td>

```buffer
- a
- ┃q
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- > ┃q
```

</td><td>

```buffer
- a┃q
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>deleteContentBackward</th><th>deleteContentBackward</th></tr>
<tr valign="top"><td>

```buffer
- a
- > ┃q
```

</td><td>

```buffer
- a
- ┃q
```

</td><td>

```buffer
- a┃q
```

</td></tr>
</table>

### [QuoteText6](../spec/quotes.md#quotetext6)

Adapted: as blocks, quote

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- > q
```

</td></tr>
</table>

> deleteContentForward

<table>
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- > q
```

</td><td>

```buffer
- a┃
- q
```

</td></tr>
</table>

> deleteContentForward

<table>
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- > q
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
- q
```

</td><td>

```buffer
- a┃q
```

</td></tr>
</table>

### [QuoteText10](../spec/quotes.md#quotetext10)

> enter

Adapted: as blocks, quote

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- > ┃ab
```

</td><td>

```buffer
- > 
  ┃ab
```

</td><td>

```buffer
- ┃
- > ab
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
- ┃
- > ab
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

Adapted: as blocks, quote, under pastePlainLines: items

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- > See ┃here.
```

</td><td>

```buffer
- > See x
  
  y
  ┃here.
```

</td><td>

```buffer
- > See x
- y┃here.
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
- > See x
- y┃here.
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

Adapted: as blocks, blank lines, paragraph, quote, under pasteSeams: open

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- > p┃
- after
```

</td><td>

```buffer
- > p- x
  \- y┃
  
- after
```

</td><td>

```buffer
- > px
- y┃
- after
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
- > px
- y┃
- after
```

</td></tr>
</table>

### [QuoteText20](../spec/quotes.md#quotetext20)

> deleteContentBackward

Adapted: as blocks, quote

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- > ab
  ┃cd
```

</td><td>

```buffer
- > ab
  ┃cd
  
```

</td><td>

```buffer
- > ab┃cd
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> ab
> ┃cd
```

</td><td>

```buffer
- > ab┃cd
```

</td></tr>
</table>

### [Regression1](../spec/regressions.md#regression1)

> deleteContentBackward

Adapted: as blocks, bullet *

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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
- a┃b
  1. x
```

</td></tr>
</table>

### [Regression2](../spec/regressions.md#regression2)

> deleteContentBackward

Adapted: escape

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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
- ┃b
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

### [Regression4](../spec/regressions.md#regression4)

Adapted: as blocks, escape, paragraph

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- p0
  2\. m1┃
```

</td></tr>
</table>

> enter

<table>
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- p0
  2\. m1
  ┃
  
```

</td><td>

```buffer
- p0
  2\. m1
- ┃
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- p0
  2\. m1┃
  
```

</td><td>

```buffer
- p0
  2\. m1┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter</th><th>deleteContentBackward</th></tr>
<tr valign="top"><td>

```buffer
p0
2. m1┃
```

</td><td>

```buffer
- p0
  2\. m1
- ┃
```

</td><td>

```buffer
- p0
  2\. m1┃
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

Adapted: blank lines, heading, paragraph, setext heading, under pastePlainLines: items

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ## Title
  ┃more
```

</td><td>

```buffer
- ## Title
  
  x┃more
```

</td><td>

```buffer
- ## Title
  more
  - x┃
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
more
---

x┃
```

</td></tr>
</table>

### [Regression32](../spec/regressions.md#regression32)

> deleteContentForward

Adapted: escape

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- para┃
  →- a
```

</td><td>

```buffer
- para┃
  →- a
```

</td><td>

```buffer
- para┃→- a
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- para┃
  →\- a
```

</td><td>

```buffer
- para┃→- a
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

Adapted: as blocks, blank lines, escape, quote, under pastePlainLines: items

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- > a┃b
  c
```

</td><td>

````buffer
- > a- x
  
    ```
    c
    ```┃b
  c
````

</td><td>

````buffer
- > a- x
- ```
- c
- ```┃b
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
- > a- x
- \```

- c

- \```┃b
  c
````

</td></tr>
</table>

### [Regression53](../spec/regressions.md#regression53)

> deleteSoftLineBackward

Adapted: setext heading, task

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ## [x] a┃
  \- long text
```

</td><td>

```buffer
- ## ┃
  \- long text
```

</td><td>

```buffer
- ## [x] a┃
  \- long text
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [x] a┃
      - long text
  - 
```

</td><td>

```buffer
- [x] a┃
      - long text
  - 
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

Adapted: escape, under pastePlainLines: items

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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
     \# y┃
```

</td><td>

```buffer
1. x
   - 
     [x] 
       contx
   - # y┃
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
    - \# y┃
```

</td></tr>
</table>

### [Regression56](../spec/regressions.md#regression56)

> enter

Adapted: as blocks, quote, task

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- [ ] 
  - > ┃q
- b
```

</td><td>

```buffer
- a
- [ ] 
  - > 
    ┃q
- b
```

</td><td>

```buffer
- a
- [ ] 
  - ┃
  - > q
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
  - ┃
  - > q
- b
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

Adapted: under pasteOnParent: after, under pasteSeams: open

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - c
```

</td><td>

```buffer
- a→b┃
  - c
```

</td><td>

```buffer
- ab┃
  - c
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - c
```

</td><td>

```buffer
- ab┃
  - c
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
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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
- 
  - z┃
- y
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

Adapted: under pasteSeams: open

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Inbox┃
```

</td><td>

```buffer
- Inboxo Draft announcement
- · Send update
- · Archive notes┃
```

</td><td>

```buffer
- InboxDraft announcement
- Send update
- Archive notes┃
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
- InboxDraft announcement
- Send update
- Archive notes┃
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
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- before a after┃
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
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- *ab* *foo!*bar┃
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
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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

### [Regression105](../spec/regressions.md#regression105)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
# h
```

</td></tr>
</table>

> paste

Adapted: as blocks, paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- p┃q
```

</td><td>

```buffer
- # ph┃q
```

</td><td>

```buffer
- ph┃q
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
p┃q
```

</td><td>

```buffer
- ph┃q
```

</td></tr>
</table>

### [Regression138](../spec/regressions.md#regression138)

> deleteContentBackward

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # h
  - ┃x #
```

</td><td>

```buffer
- # h
  - ┃x #
```

</td><td>

```buffer
- # h┃x \#
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# h

┃x #
```

</td><td>

```buffer
# h┃x \#
```

</td></tr>
</table>

### [Regression144](../spec/regressions.md#regression144)

> indent

Adapted: blank lines, heading

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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

### [Regression146](../spec/regressions.md#regression146)

> deleteContentBackward

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # h
- # ┃n
```

</td><td>

```buffer
- # h┃n
```

</td><td>

```buffer
- # h
  - ┃n
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# h

# ┃n
```

</td><td>

```buffer
# h

┃n
```

</td></tr>
</table>

### [Regression168](../spec/regressions.md#regression168)

> moveSubtreeDown

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # ┃g
  - e
- #
  -   y
```

</td><td>

```buffer
- #
  -   y
- # ┃g
  - e
```

</td><td>

```buffer
- #
  - # ┃g
    - e
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

Adapted: under pasteSeams: open

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. 
2. c┃
      a
```

</td><td>

```buffer
1. 
2. c- ┃
      a
```

</td><td>

```buffer
1. 
2. c┃   a
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1.
10. c┃
   a
```

</td><td>

```buffer
1.
10. c┃   a
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
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- «« b»»
```

</td><td>

```buffer
- «« b»»
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

### [Scenario15](../spec/scenarios.md#scenario15)

Adapted: as blocks, task

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
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] milk
  - [ ] breadtwo loaves┃
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
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] milk
  - [ ] breadtwo loaves
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

> enter

<table>
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] milk
  - [ ] breadtwo loaves
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
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- example┃
- next
```

</td><td>

````buffer
- ```
  examplecode
  ```
- next
````

</td><td>

````buffer
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

### [SubtreeEdit16](../spec/subtree-selection.md#subtreeedit16)

> deleteContentForward "x"

Adapted: paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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

### [TaskEnter7](../spec/tasks.md#taskenter7)

> enter

Adapted: as blocks, task, under enterSplitSpace: start

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [x] a┃ b
  - c
```

</td><td>

```buffer
- [ ] a
- [x] ┃ b
  - c
```

</td><td>

```buffer
- [x] a
- [ ] ┃ b
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
- [ ] ┃ b
  - c
```

</td></tr>
</table>

### [TaskBackspace2](../spec/tasks.md#taskbackspace2)

Adapted: as blocks, task

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
<tr><th>workflowy</th><th>ourus</th></tr>
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

> deleteContentBackward

<table>
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
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

Adapted: as blocks, task

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- [x] ┃b
```

</td><td>

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

Adapted: as blocks, task

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- [ ] b
```

</td><td>

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

Adapted: as blocks, task

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
- [x] a
```

</td><td>

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

Adapted: as blocks, task

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- [ ] 
```

</td><td>

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

### [TaskBackspace10](../spec/tasks.md#taskbackspace10)

> deleteContentBackward

Adapted: as blocks, escape, task

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] ┃# x
```

</td><td>

```buffer
- [ ] ┃# x
```

</td><td>

```buffer
- ┃# x
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] ┃# x
```

</td><td>

```buffer
- ┃\# x
```

</td></tr>
</table>

## Adapted: whitespace (17)

### [Backtick2](../spec/backtick.md#backtick2)

> "```"

Adapted: code block

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃
```

</td><td>

````buffer
- a
- ```
  ┃
  ```
````

</td><td>

````buffer
- a
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
- a
- ┃
```

</td><td>

````buffer
- a
- ```┃
  ```
````

</td></tr>
</table>

### [Enter65l](../spec/enter.md#enter65l)

Adapted: heading, paragraph, under quirkEnterMidHeading: workflowy

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- # one two┃ three
```

</td></tr>
</table>

> enter

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- one two
- # ┃ three
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one two
- # ┃ three
```

</td><td>

```buffer
- one two
- #┃ three
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter</th><th>deleteContentBackward</th></tr>
<tr valign="top"><td>

```buffer
# one two┃ three
```

</td><td>

```buffer
one two
# ┃ three
```

</td><td>

```buffer
one two
#┃ three
```

</td></tr>
</table>

### [Enter65m](../spec/enter.md#enter65m)

Adapted: heading, paragraph, under quirkEnterMidHeading: workflowy

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- # one two┃ - x
```

</td></tr>
</table>

> enter

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- one two
- # ┃ - x
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one two
- # ┃ - x
```

</td><td>

```buffer
- one two
- #┃ - x
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter</th><th>deleteContentBackward</th></tr>
<tr valign="top"><td>

```buffer
# one two┃ - x
```

</td><td>

```buffer
one two
# ┃ - x
```

</td><td>

```buffer
one two
#┃ - x
```

</td></tr>
</table>

### [Enter60b](../spec/enter.md#enter60b)

> enter deleteContentBackward

Adapted: heading, paragraph, under enterSplitSpace: start, under quirkEnterMidHeading: workflowy

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # title┃ - x
```

</td><td>

```buffer
- title
- # ┃ - x
```

</td><td>

```buffer
- title
- #┃ - x
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# title┃ - x
```

</td><td>

```buffer
title
#┃ - x
```

</td></tr>
</table>

### [Fence1](../spec/fences.md#fence1)

Adapted: as blocks, code block

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

````buffer
- a
  - ```
    code┃
    ```
````

</td></tr>
</table>

> enter

<table>
<tr><th>workflowy</th><th>ourus</th></tr>
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

</td></tr>
</table>

> "x"

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

````buffer
- a
  - ```
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
    x┃
    ```
````

</td></tr>
</table>

### [Fence3](../spec/fences.md#fence3)

> enter

Adapted: as blocks, code block

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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
  - ```
      nested
      ┃
    ```
````

</td></tr>
</table>

### [Fence5](../spec/fences.md#fence5)

> enter

Adapted: as blocks, code block

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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

### [Fence30](../spec/fences.md#fence30)

> deleteContentForward

Adapted: as blocks, code block

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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
  - ```
    code┃
    ```
````

</td></tr>
</table>

### [TO-E17](../spec/obsidian-true-outliner.md#to-e17)

> enter

Adapted: blank lines, heading, paragraph, setext heading, under enterSplitSpace: start, under quirkEnterMidHeading: workflowy

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- ```
  a┃
  ```
````

</td><td>

````buffer
- ```
  a- x
  \- y┃
  ```
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
<tr><th>workflowy</th><th>ourus</th></tr>
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
<tr><th>workflowy</th><th>ourus</th></tr>
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
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- para
  ┃ ``` x
  
- after
````

</td><td>

````buffer
- para
  ┃ ``` x
- after
````

</td></tr>
</table>

> cursorDocEnd

<table>
<tr><th>workflowy</th><th>ourus</th></tr>
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

### [Regression136](../spec/regressions.md#regression136)

> deleteSoftLineBackward

Adapted: heading, setext heading

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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

### [Regression167](../spec/regressions.md#regression167)

> duplicateSubtree

Adapted: blank lines, paragraph, quote

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
-   ┃e
  - g
    - > y
```

</td><td>

```buffer
-   ┃e
  - g
    - > y
-   e
  - g
    - > y
```

</td><td>

```buffer
-   e
  - g
    - > y
- ┃e
  - g
    - > y
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
  ┃e
- g
  >y
```

</td><td>

```buffer
  e
- g
  >y

┃e
- g
  >y
```

</td></tr>
</table>

### [Regression181](../spec/regressions.md#regression181)

> indent

Adapted: paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [a]
  [a]:s┃
```

</td><td>

```buffer
- [a]
  [a]:s→┃
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

## Adapted: caret (13)

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
<tr><th>workflowy</th><th>ourus</th></tr>
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

### [Backspace43b](../spec/backspace.md#backspace43b)

> enter deleteContentBackward

Adapted: heading

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # ┃Title
```

</td><td>

```buffer
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

### [Enter59](../spec/enter.md#enter59)

> enter

Adapted: as blocks, paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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

Adapted: under pasteSeams: open

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- top
  - sib┃
```

</td><td>

```buffer
- top
  - siba
    - b┃
      - c
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

Adapted: under pasteSeams: open

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- top
  - sib┃
```

</td><td>

```buffer
- top
  - siba
    - b┃
      - c
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
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
- b
```

</td><td>

````buffer
- ```
  c
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

Adapted: blank lines, code block

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃b
- d
```

</td><td>

````buffer
- ax
  - ```
    c
    ```
- ┃b
- d
````

</td><td>

````buffer
- ax
  - ```
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

Adapted: under pastePlainLines: items

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
```

</td><td>

```buffer
- ax
2. y┃
```

</td><td>

```buffer
- ax
- 2\. y┃
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
- 2\. y┃
```

</td></tr>
</table>

### [Regression71](../spec/regressions.md#regression71)

> duplicateSubtree

Adapted: as blocks, list as an item's first block

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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
  - a
  - b
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
  - a
  - b
  - ««a
  - b»»
- y
```

</td></tr>
</table>

### [Regression93](../spec/regressions.md#regression93)

> duplicateSubtree

Adapted: blank lines

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃
```

</td><td>

```buffer
- a
  - ┃
  - 
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

### [Regression113](../spec/regressions.md#regression113)

> deleteContentBackward

Adapted: as blocks, blank lines, paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ««a»»
- 
```

</td><td>

```buffer
- 
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
«a

◌»
```

</td><td>

```buffer
- ┃
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
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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
<tr><th>workflowy</th><th>ourus</th></tr>
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
<tr><th>workflowy</th><th>ourus</th></tr>
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
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - ««two
    - deep
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

> selectNodeDown

<table>
<tr><th>workflowy</th><th>ourus</th></tr>
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
<tr><th>workflowy</th><th>ourus</th></tr>
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

## Skipped (717)

| example | why |
| --- | --- |
| **backspace.md** | |
| [Backspace2](../spec/backspace.md#backspace2) | caret in a marker |
| [Backspace4](../spec/backspace.md#backspace4) | heading's closing #s |
| [Backspace12e](../spec/backspace.md#backspace12e) | tag free-form |
| [Backspace14](../spec/backspace.md#backspace14) | tag free-form |
| [Backspace16](../spec/backspace.md#backspace16) | changes only what blocks can't show |
| [Backspace17e](../spec/backspace.md#backspace17e) | tag free-form |
| [Backspace18](../spec/backspace.md#backspace18) | tag free-form |
| [Backspace18b](../spec/backspace.md#backspace18b) | tag free-form |
| [Backspace18c](../spec/backspace.md#backspace18c) | tag free-form |
| [Backspace18d](../spec/backspace.md#backspace18d) | tag free-form |
| [Backspace18f](../spec/backspace.md#backspace18f) | option headingEditing: block |
| [Backspace19b](../spec/backspace.md#backspace19b) | tag free-form |
| [Backspace23](../spec/backspace.md#backspace23) | tag free-form |
| [Backspace24](../spec/backspace.md#backspace24) | changes only what blocks can't show |
| [Backspace26](../spec/backspace.md#backspace26) | changes only what blocks can't show |
| [Backspace27](../spec/backspace.md#backspace27) | tag free-form |
| [Backspace31](../spec/backspace.md#backspace31) | selection across blocks |
| [Backspace33](../spec/backspace.md#backspace33) | tag free-form |
| [Backspace35](../spec/backspace.md#backspace35) | tag free-form |
| [SoftBackspace4](../spec/backspace.md#softbackspace4) | heading's closing #s |
| [SoftBackspace6](../spec/backspace.md#softbackspace6) | caret on a blank line |
| [SoftBackspace7](../spec/backspace.md#softbackspace7) | tag free-form |
| [SoftBackspace8](../spec/backspace.md#softbackspace8) | tag free-form |
| [SoftBackspace9](../spec/backspace.md#softbackspace9) | caret in a task's checkbox, a heading's #s or a quote's > |
| [SoftBackspace10](../spec/backspace.md#softbackspace10) | option taskEditing: text |
| [SoftBackspace11](../spec/backspace.md#softbackspace11) | tag free-form |
| [Backspace42](../spec/backspace.md#backspace42) | tag free-form |
| [Backspace42b](../spec/backspace.md#backspace42b) | option markup: decorated |
| [Backspace43c](../spec/backspace.md#backspace43c) | tag free-form |
| [Backspace47](../spec/backspace.md#backspace47) | tag free-form |
| [Backspace49](../spec/backspace.md#backspace49) | option joinWithChildren: the app's refuse, as blocks |
| [Backspace50](../spec/backspace.md#backspace50) | option backspaceAtItemStart: body |
| [Backspace50b](../spec/backspace.md#backspace50b) | option backspaceAtItemStart: unwrap |
| **backtick.md** | |
| [Backtick2b](../spec/backtick.md#backtick2b) | option closeBackticks: all |
| [Backtick3](../spec/backtick.md#backtick3) | quote |
| [Backtick5](../spec/backtick.md#backtick5) | fenced block with a language, tildes, or text around it in its item: WorkFlowy's code block is an item of backticks alone |
| [Backtick6](../spec/backtick.md#backtick6) | fenced block with a language, tildes, or text around it in its item: WorkFlowy's code block is an item of backticks alone |
| [Backtick7](../spec/backtick.md#backtick7) | option markup: decorated |
| [Backtick8](../spec/backtick.md#backtick8) | tag free-form |
| [Backtick10](../spec/backtick.md#backtick10) | fenced block with a language, tildes, or text around it in its item: WorkFlowy's code block is an item of backticks alone |
| [Backtick11](../spec/backtick.md#backtick11) | option closeBackticks: none |
| [Backtick13](../spec/backtick.md#backtick13) | option markup: decorated |
| [Backtick14](../spec/backtick.md#backtick14) | code block's fence longer than its code needs, which WorkFlowy's reads back without |
| [Backtick16](../spec/backtick.md#backtick16) | option markup: decorated |
| [Backtick17](../spec/backtick.md#backtick17) | tag free-form |
| [Backtick19](../spec/backtick.md#backtick19) | option closeBackticks: all |
| [Backtick20](../spec/backtick.md#backtick20) | option closeBackticks: all |
| [Backtick21](../spec/backtick.md#backtick21) | option closeBackticks: all |
| [Backtick22](../spec/backtick.md#backtick22) | option closeBackticks: all |
| [Backtick23](../spec/backtick.md#backtick23) | code block's fence longer than its code needs, which WorkFlowy's reads back without |
| [Backtick24](../spec/backtick.md#backtick24) | fenced block with a language, tildes, or text around it in its item: WorkFlowy's code block is an item of backticks alone |
| [Backtick25](../spec/backtick.md#backtick25) | fenced block with a language, tildes, or text around it in its item: WorkFlowy's code block is an item of backticks alone |
| [Backtick26](../spec/backtick.md#backtick26) | fenced block with a language, tildes, or text around it in its item: WorkFlowy's code block is an item of backticks alone |
| [Backtick27](../spec/backtick.md#backtick27) | fenced block with a language, tildes, or text around it in its item: WorkFlowy's code block is an item of backticks alone |
| [Backtick28](../spec/backtick.md#backtick28) | caret in a code block's fences |
| [Backtick29](../spec/backtick.md#backtick29) | fenced block with a language, tildes, or text around it in its item: WorkFlowy's code block is an item of backticks alone |
| [Backtick31](../spec/backtick.md#backtick31) | option markup: decorated |
| [Backtick32](../spec/backtick.md#backtick32) | option closeBackticks: all |
| **copy.md** | |
| [Copy2](../spec/copy.md#copy2) | selection across blocks |
| [Copy3](../spec/copy.md#copy3) | selection across an item's name and its note |
| [Copy4](../spec/copy.md#copy4) | nothing to compare |
| [Copy5](../spec/copy.md#copy5) | option copySelection: nodes |
| [Copy6](../spec/copy.md#copy6) | nothing to compare |
| [Copy7](../spec/copy.md#copy7) | option copySelection: nodes |
| [Copy8](../spec/copy.md#copy8) | callout |
| [Copy9](../spec/copy.md#copy9) | nothing to compare |
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
| [DeleteSubtree6](../spec/delete-subtree.md#deletesubtree6) | no text focus after deleteSubtree |
| [DeleteSubtree7](../spec/delete-subtree.md#deletesubtree7) | quote |
| [DeleteSubtree8](../spec/delete-subtree.md#deletesubtree8) | caret in a task's checkbox, a heading's #s or a quote's > |
| [DeleteSubtree9](../spec/delete-subtree.md#deletesubtree9) | thematic break |
| [DeleteSubtree10](../spec/delete-subtree.md#deletesubtree10) | thematic break |
| [DeleteSubtree12](../spec/delete-subtree.md#deletesubtree12) | option quotes: container |
| [DeleteSubtree14](../spec/delete-subtree.md#deletesubtree14) | caret in a task's checkbox, a heading's #s or a quote's > |
| **delete.md** | |
| [Delete4](../spec/delete.md#delete4) | heading's closing #s |
| [Delete4b](../spec/delete.md#delete4b) | heading's closing #s |
| [Delete9](../spec/delete.md#delete9) | tag free-form |
| [Delete10](../spec/delete.md#delete10) | option quotes: container |
| [Delete11](../spec/delete.md#delete11) | indented code |
| [Delete13b](../spec/delete.md#delete13b) | option headingEditing: block |
| [Delete13c](../spec/delete.md#delete13c) | tag free-form |
| [Delete13d](../spec/delete.md#delete13d) | tag free-form |
| [Delete13e](../spec/delete.md#delete13e) | tag free-form |
| [Delete13f](../spec/delete.md#delete13f) | option headingEditing: block |
| [Delete14](../spec/delete.md#delete14) | tag free-form |
| [Delete15](../spec/delete.md#delete15) | heading's closing #s |
| [Delete16](../spec/delete.md#delete16) | tag free-form |
| [Delete16b](../spec/delete.md#delete16b) | tag free-form |
| [Delete16c](../spec/delete.md#delete16c) | tag free-form |
| [Delete16d](../spec/delete.md#delete16d) | tag free-form |
| [Delete16e](../spec/delete.md#delete16e) | tag free-form |
| [Delete16f](../spec/delete.md#delete16f) | tag free-form |
| [Delete18d](../spec/delete.md#delete18d) | tag free-form |
| [Delete19](../spec/delete.md#delete19) | option markup: decorated |
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
| [DuplicateSubtree4](../spec/duplicate-subtree.md#duplicatesubtree4) | tag free-form |
| [DuplicateSubtree5](../spec/duplicate-subtree.md#duplicatesubtree5) | option quotes: container |
| [DuplicateSubtree6](../spec/duplicate-subtree.md#duplicatesubtree6) | tag free-form |
| [DuplicateSubtree7](../spec/duplicate-subtree.md#duplicatesubtree7) | caret in a marker |
| [DuplicateSubtree8](../spec/duplicate-subtree.md#duplicatesubtree8) | caret in a task's checkbox, a heading's #s or a quote's > |
| [DuplicateSubtree9](../spec/duplicate-subtree.md#duplicatesubtree9) | option closeBackticks: none |
| [DuplicateSubtree12](../spec/duplicate-subtree.md#duplicatesubtree12) | caret in a marker |
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
| [Enter30](../spec/enter.md#enter30) | option enterOnEmptyItem: outdent |
| [Enter32b](../spec/enter.md#enter32b) | option enterAtTextStart: stay |
| [Enter33b](../spec/enter.md#enter33b) | option enterAtTextStart: stay |
| [Enter34](../spec/enter.md#enter34) | caret in a marker |
| [Enter36b](../spec/enter.md#enter36b) | quote |
| [Enter40](../spec/enter.md#enter40) | tag free-form |
| [Enter41](../spec/enter.md#enter41) | tag free-form |
| [Enter64](../spec/enter.md#enter64) | option enterSplitSpace: drop |
| [Enter65k](../spec/enter.md#enter65k) | action shiftEnter |
| [Enter46](../spec/enter.md#enter46) | option quotes: container |
| [Enter49](../spec/enter.md#enter49) | table |
| [Enter50](../spec/enter.md#enter50) | tag free-form |
| [Enter54](../spec/enter.md#enter54) | caret in a task's checkbox, a heading's #s or a quote's > |
| [Enter54b](../spec/enter.md#enter54b) | caret in a task's checkbox, a heading's #s or a quote's > |
| [Enter55](../spec/enter.md#enter55) | caret in a task's checkbox, a heading's #s or a quote's > |
| [Enter55b](../spec/enter.md#enter55b) | caret in a task's checkbox, a heading's #s or a quote's > |
| [Enter55c](../spec/enter.md#enter55c) | tag free-form |
| [Enter56](../spec/enter.md#enter56) | selection across blocks |
| [Enter56b](../spec/enter.md#enter56b) | selection across an item's name and its note |
| [Enter61](../spec/enter.md#enter61) | heading's closing #s |
| [Enter63](../spec/enter.md#enter63) | tag free-form |
| [Enter63b](../spec/enter.md#enter63b) | option enterOnEmptyItem: exit |
| [Enter66](../spec/enter.md#enter66) | footnote |
| [Enter67](../spec/enter.md#enter67) | thematic break |
| [Enter68](../spec/enter.md#enter68) | callout |
| [Enter70](../spec/enter.md#enter70) | table |
| **fences.md** | |
| [Fence4](../spec/fences.md#fence4) | quote |
| [Fence6](../spec/fences.md#fence6) | fenced block with a language, tildes, or text around it in its item: WorkFlowy's code block is an item of backticks alone |
| [Fence7](../spec/fences.md#fence7) | caret in a code block's fences |
| [Fence7b](../spec/fences.md#fence7b) | action shiftEnter |
| [Fence7c](../spec/fences.md#fence7c) | caret in a code block's fences |
| [Fence7d](../spec/fences.md#fence7d) | caret in a code block's fences |
| [Fence8](../spec/fences.md#fence8) | action shiftEnter |
| [Fence9](../spec/fences.md#fence9) | caret in a task's checkbox, a heading's #s or a quote's > |
| [Fence10](../spec/fences.md#fence10) | option handleFenceContents: false |
| [Fence11](../spec/fences.md#fence11) | option handleFenceContents: false |
| [Fence12](../spec/fences.md#fence12) | caret in a task's checkbox, a heading's #s or a quote's > |
| [Fence13](../spec/fences.md#fence13) | caret in a code block's fences |
| [Fence14](../spec/fences.md#fence14) | caret in a code block's fences |
| [Fence15](../spec/fences.md#fence15) | caret in a task's checkbox, a heading's #s or a quote's > |
| [Fence19](../spec/fences.md#fence19) | changes only what blocks can't show |
| [Fence20](../spec/fences.md#fence20) | quote |
| [Fence21](../spec/fences.md#fence21) | nothing to compare |
| [Fence22](../spec/fences.md#fence22) | action shiftEnter |
| [Fence23](../spec/fences.md#fence23) | caret in a code block's fences |
| [Fence24](../spec/fences.md#fence24) | fenced block with a language, tildes, or text around it in its item: WorkFlowy's code block is an item of backticks alone |
| [Fence25](../spec/fences.md#fence25) | caret in a task's checkbox, a heading's #s or a quote's > |
| [Fence26](../spec/fences.md#fence26) | caret in a task's checkbox, a heading's #s or a quote's > |
| [Fence27](../spec/fences.md#fence27) | fenced block with a language, tildes, or text around it in its item: WorkFlowy's code block is an item of backticks alone |
| [Fence28](../spec/fences.md#fence28) | fenced block with a language, tildes, or text around it in its item: WorkFlowy's code block is an item of backticks alone |
| [Fence29](../spec/fences.md#fence29) | caret in a code block's fences |
| [Fence31](../spec/fences.md#fence31) | caret in a task's checkbox, a heading's #s or a quote's > |
| [Fence31b](../spec/fences.md#fence31b) | caret in a task's checkbox, a heading's #s or a quote's > |
| [Fence32](../spec/fences.md#fence32) | action shiftEnter |
| [Fence32b](../spec/fences.md#fence32b) | option markup: decorated |
| [Fence33](../spec/fences.md#fence33) | caret in a task's checkbox, a heading's #s or a quote's > |
| [Fence35](../spec/fences.md#fence35) | caret in a code block's fences |
| [Fence38](../spec/fences.md#fence38) | action shiftEnter |
| [Fence39](../spec/fences.md#fence39) | code block's fence longer than its code needs, which WorkFlowy's reads back without |
| [Fence40](../spec/fences.md#fence40) | quote |
| [Fence41](../spec/fences.md#fence41) | action shiftEnter |
| [Fence49](../spec/fences.md#fence49) | caret in a task's checkbox, a heading's #s or a quote's > |
| [Fence50](../spec/fences.md#fence50) | caret in a task's checkbox, a heading's #s or a quote's > |
| [Fence51](../spec/fences.md#fence51) | caret in a task's checkbox, a heading's #s or a quote's > |
| [Fence58](../spec/fences.md#fence58) | caret in a code block's fences |
| [Fence59](../spec/fences.md#fence59) | caret in a code block's fences |
| [Fence59b](../spec/fences.md#fence59b) | caret in a code block's fences |
| [Fence60](../spec/fences.md#fence60) | caret in a code block's fences |
| [Fence42](../spec/fences.md#fence42) | math |
| [Fence43](../spec/fences.md#fence43) | action shiftEnter |
| [Fence44](../spec/fences.md#fence44) | indented code |
| [Fence45](../spec/fences.md#fence45) | math |
| [Fence46](../spec/fences.md#fence46) | quote |
| [Fence47](../spec/fences.md#fence47) | math |
| [Fence52](../spec/fences.md#fence52) | indented code |
| [Fence53](../spec/fences.md#fence53) | indented code |
| [Fence54](../spec/fences.md#fence54) | indented code |
| [Fence55](../spec/fences.md#fence55) | math |
| [Fence56](../spec/fences.md#fence56) | math |
| [Fence57](../spec/fences.md#fence57) | quote |
| [Fence61](../spec/fences.md#fence61) | caret in a marker |
| [Fence62](../spec/fences.md#fence62) | code block's fence longer than its code needs, which WorkFlowy's reads back without |
| [Fence64](../spec/fences.md#fence64) | action shiftEnter |
| **fold.md** | |
| [Fold2b](../spec/fold.md#fold2b) | option enterMidItem: child |
| [Fold9](../spec/fold.md#fold9) | action fold ② |
| [Fold10](../spec/fold.md#fold10) | action fold ① |
| [Fold13](../spec/fold.md#fold13) | its view, on an adapted start |
| [Fold15b](../spec/fold.md#fold15b) | changes only what blocks can't show |
| **gaps.md** | |
| [Gap15](../spec/gaps.md#gap15) | caret on a blank line |
| [Gap16](../spec/gaps.md#gap16) | caret on a blank line |
| [Gap17](../spec/gaps.md#gap17) | caret on a blank line |
| [Gap18](../spec/gaps.md#gap18) | caret on a blank line |
| [Gap19](../spec/gaps.md#gap19) | frontmatter |
| **indent.md** | |
| [Indent11](../spec/indent.md#indent11) | changes only what blocks can't show |
| [Indent12](../spec/indent.md#indent12) | tag free-form |
| [Indent16](../spec/indent.md#indent16) | tag free-form |
| [Indent22](../spec/indent.md#indent22) | tag free-form |
| [Indent23](../spec/indent.md#indent23) | tag free-form |
| [Indent24](../spec/indent.md#indent24) | heading deeper than H3 |
| [Indent25](../spec/indent.md#indent25) | tag free-form |
| [Indent28](../spec/indent.md#indent28) | caret in a marker |
| [Indent30](../spec/indent.md#indent30) | caret in a marker |
| [Indent31](../spec/indent.md#indent31) | caret in a task's checkbox, a heading's #s or a quote's > |
| [Indent31b](../spec/indent.md#indent31b) | option markup: decorated |
| [Indent32](../spec/indent.md#indent32) | changes only what blocks can't show |
| [Indent34](../spec/indent.md#indent34) | fenced block with a language, tildes, or text around it in its item: WorkFlowy's code block is an item of backticks alone |
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
| [Indent48](../spec/indent.md#indent48) | nothing to compare |
| [Indent50](../spec/indent.md#indent50) | option mixedDepths: refuse |
| **lists.md** | |
| [Lists2](../spec/lists.md#lists2) | option listParent: container |
| [Lists3](../spec/lists.md#lists3) | option listParent: container |
| [Lists4](../spec/lists.md#lists4) | option listParent: block |
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
| [MoveDown25](../spec/move-subtree-down.md#movedown25) | tag free-form |
| [MoveDown28](../spec/move-subtree-down.md#movedown28) | tag free-form |
| [MoveDown31](../spec/move-subtree-down.md#movedown31) | thematic break |
| [MoveDown32](../spec/move-subtree-down.md#movedown32) | caret in a marker |
| [MoveDown34](../spec/move-subtree-down.md#movedown34) | caret in a task's checkbox, a heading's #s or a quote's > |
| [MoveDown37](../spec/move-subtree-down.md#movedown37) | caret in a task's checkbox, a heading's #s or a quote's > |
| [MoveDown38](../spec/move-subtree-down.md#movedown38) | tag free-form |
| [MoveDown40](../spec/move-subtree-down.md#movedown40) | numbered list that skips a number |
| [MoveDown43](../spec/move-subtree-down.md#movedown43) | caret in a marker |
| [MoveDown44](../spec/move-subtree-down.md#movedown44) | caret in a marker |
| **move-subtree-up.md** | |
| [MoveUp12](../spec/move-subtree-up.md#moveup12) | tag free-form |
| [MoveUp18](../spec/move-subtree-up.md#moveup18) | indented code |
| [MoveUp19](../spec/move-subtree-up.md#moveup19) | thematic break |
| [MoveUp20](../spec/move-subtree-up.md#moveup20) | link reference definition |
| [MoveUp24](../spec/move-subtree-up.md#moveup24) | tag free-form |
| [MoveUp27](../spec/move-subtree-up.md#moveup27) | tag free-form |
| [MoveUp28](../spec/move-subtree-up.md#moveup28) | tag free-form |
| [MoveUp29](../spec/move-subtree-up.md#moveup29) | tag free-form |
| [MoveUp30](../spec/move-subtree-up.md#moveup30) | link reference definition |
| [MoveUp33](../spec/move-subtree-up.md#moveup33) | tag free-form |
| [MoveUp34](../spec/move-subtree-up.md#moveup34) | caret in a marker |
| [MoveUp35](../spec/move-subtree-up.md#moveup35) | tag free-form |
| [MoveUp36](../spec/move-subtree-up.md#moveup36) | tag free-form |
| [MoveUp37](../spec/move-subtree-up.md#moveup37) | math |
| [MoveUp38](../spec/move-subtree-up.md#moveup38) | math |
| [MoveUp39](../spec/move-subtree-up.md#moveup39) | caret on a blank line |
| [MoveUp41](../spec/move-subtree-up.md#moveup41) | option closeBackticks: none |
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
| [MoveSubtree20](../spec/move-subtree.md#movesubtree20) | quote |
| **obsidian-true-outliner.md** | |
| [TO-Bug228](../spec/obsidian-true-outliner.md#to-bug228) | numbered list that skips a number |
| [TO-E7-E8](../spec/obsidian-true-outliner.md#to-e7-e8) | option enterMidItem: child |
| [TO-E11](../spec/obsidian-true-outliner.md#to-e11) | option enterMidItem: child |
| [TO-E18](../spec/obsidian-true-outliner.md#to-e18) | caret on a blank line |
| [TO-E19-E21b](../spec/obsidian-true-outliner.md#to-e19-e21b) | tag free-form |
| [TO-S4](../spec/obsidian-true-outliner.md#to-s4) | action shiftEnter |
| [TO-S5](../spec/obsidian-true-outliner.md#to-s5) | tag free-form |
| [TO-S7-S8](../spec/obsidian-true-outliner.md#to-s7-s8) | action shiftEnter |
| [TO-S7-S8b](../spec/obsidian-true-outliner.md#to-s7-s8b) | action shiftEnter |
| [TO-S9](../spec/obsidian-true-outliner.md#to-s9) | action shiftEnter |
| [TO-S11](../spec/obsidian-true-outliner.md#to-s11) | action shiftEnter |
| [TO-S11b](../spec/obsidian-true-outliner.md#to-s11b) | action shiftEnter |
| [TO-S13](../spec/obsidian-true-outliner.md#to-s13) | action shiftEnter |
| [TO-Bug153](../spec/obsidian-true-outliner.md#to-bug153) | action shiftEnter |
| [TO1](../spec/obsidian-true-outliner.md#to1) | option markup: decorated |
| [TO-Seamsc](../spec/obsidian-true-outliner.md#to-seamsc) | thematic break |
| [TO-Seamsd](../spec/obsidian-true-outliner.md#to-seamsd) | indented code |
| [TO8](../spec/obsidian-true-outliner.md#to8) | action shiftEnter |
| [TO9](../spec/obsidian-true-outliner.md#to9) | action shiftEnter |
| [TO10](../spec/obsidian-true-outliner.md#to10) | action shiftEnter |
| [TO11](../spec/obsidian-true-outliner.md#to11) | action shiftEnter |
| [TO12](../spec/obsidian-true-outliner.md#to12) | action shiftEnter |
| [TO13](../spec/obsidian-true-outliner.md#to13) | action shiftEnter |
| [TO18](../spec/obsidian-true-outliner.md#to18) | tag free-form |
| [TO19](../spec/obsidian-true-outliner.md#to19) | option enterOnEmptyItem: outdent |
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
| [Outdent17](../spec/outdent.md#outdent17) | caret in a task's checkbox, a heading's #s or a quote's > |
| [Outdent17b](../spec/outdent.md#outdent17b) | caret in a task's checkbox, a heading's #s or a quote's > |
| [Outdent18](../spec/outdent.md#outdent18) | caret in a task's checkbox, a heading's #s or a quote's > |
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
| **paste-html.md** | |
| [PasteHtml12](../spec/paste-html.md#pastehtml12) | quote |
| [PasteHtml13](../spec/paste-html.md#pastehtml13) | table (expected) |
| **paste-list-form.md** | |
| [PasteListForm6](../spec/paste-list-form.md#pastelistform6) | option pasteListForm: own |
| **paste-list.md** | |
| [PasteList7b](../spec/paste-list.md#pastelist7b) | option enterTask: plain |
| [PasteList21](../spec/paste-list.md#pastelist21) | option pasteParagraphList: children |
| **paste-plain.md** | |
| [PastePlain4](../spec/paste-plain.md#pasteplain4) | tag free-form |
| [PastePlain17](../spec/paste-plain.md#pasteplain17) | selection across an item's name and its note |
| [PastePlain18](../spec/paste-plain.md#pasteplain18) | selection across an item's name and its note |
| [PastePlain21](../spec/paste-plain.md#pasteplain21) | tag free-form |
| [PastePlain22](../spec/paste-plain.md#pasteplain22) | tag free-form |
| [PastePlain27](../spec/paste-plain.md#pasteplain27) | changes only what blocks can't show |
| [PastePlain31](../spec/paste-plain.md#pasteplain31) | option pastePlainLines: enter |
| [PastePlain33c](../spec/paste-plain.md#pasteplain33c) | option pasteOverSelection: ignore |
| [PastePlain34](../spec/paste-plain.md#pasteplain34) | option pastePlainLines: host |
| **paste.md** | |
| [Paste9](../spec/paste.md#paste9) | option quotes: container |
| [Paste15](../spec/paste.md#paste15) | caret in a code block's fences |
| [Paste16](../spec/paste.md#paste16) | caret in a marker |
| [Paste17b](../spec/paste.md#paste17b) | option pasteOverSelection: ignore |
| [Paste17c](../spec/paste.md#paste17c) | option pasteOverSelection: ignore |
| [Paste17d](../spec/paste.md#paste17d) | option pasteOverSelection: ignore |
| [Paste17e](../spec/paste.md#paste17e) | option pasteOverSelection: ignore |
| [Paste17f](../spec/paste.md#paste17f) | option pasteOverSelection: ignore |
| [Paste17g](../spec/paste.md#paste17g) | option pasteOverSelection: ignore |
| [Paste23](../spec/paste.md#paste23) | callout |
| [Paste25](../spec/paste.md#paste25) | callout |
| [Paste26](../spec/paste.md#paste26) | action shiftEnter |
| [Paste26b](../spec/paste.md#paste26b) | action shiftEnter |
| [Paste27](../spec/paste.md#paste27) | quote |
| **placeholders.md** | |
| [Placeholder2](../spec/placeholders.md#placeholder2) | tag free-form |
| [Placeholder4](../spec/placeholders.md#placeholder4) | action shiftEnter |
| [Placeholder10](../spec/placeholders.md#placeholder10) | caret on a blank line |
| [Placeholder12](../spec/placeholders.md#placeholder12) | caret on a blank line |
| [Placeholder16](../spec/placeholders.md#placeholder16) | action selectDocStart |
| **quirks.md** | |
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
| [Quote27](../spec/quotes.md#quote27) | tag free-form |
| [Quote28](../spec/quotes.md#quote28) | tag free-form |
| [Quote29](../spec/quotes.md#quote29) | quote |
| [Quote30](../spec/quotes.md#quote30) | quote |
| [Quote31](../spec/quotes.md#quote31) | quote |
| [Quote32](../spec/quotes.md#quote32) | tag free-form |
| [Quote33](../spec/quotes.md#quote33) | tag free-form |
| [Quote34](../spec/quotes.md#quote34) | tag free-form |
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
| [Quote44](../spec/quotes.md#quote44) | action shiftEnter |
| [Quote45](../spec/quotes.md#quote45) | action shiftEnter |
| [Quote46](../spec/quotes.md#quote46) | action shiftEnter |
| [Quote47](../spec/quotes.md#quote47) | tag free-form |
| [Quote48](../spec/quotes.md#quote48) | quote |
| [Quote49](../spec/quotes.md#quote49) | quote |
| [Quote50](../spec/quotes.md#quote50) | quote |
| [Quote51](../spec/quotes.md#quote51) | tag free-form |
| [Quote52](../spec/quotes.md#quote52) | quote |
| [Quote54](../spec/quotes.md#quote54) | tag free-form |
| [Quote55](../spec/quotes.md#quote55) | quote |
| [Quote56](../spec/quotes.md#quote56) | quote |
| [Quote57](../spec/quotes.md#quote57) | callout |
| [Quote58](../spec/quotes.md#quote58) | callout |
| [Quote59](../spec/quotes.md#quote59) | tag free-form |
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
| [Quote73](../spec/quotes.md#quote73) | tag free-form |
| [Quote74](../spec/quotes.md#quote74) | action shiftEnter |
| [Quote75](../spec/quotes.md#quote75) | quote |
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
| [Quote86](../spec/quotes.md#quote86) | quote |
| [Quote87](../spec/quotes.md#quote87) | quote |
| [Quote91](../spec/quotes.md#quote91) | action shiftEnter |
| [Quote91b](../spec/quotes.md#quote91b) | action shiftEnter |
| [Quote92](../spec/quotes.md#quote92) | quote |
| [Quote93](../spec/quotes.md#quote93) | quote |
| [Quote69](../spec/quotes.md#quote69) | option quotes: container |
| [Quote70](../spec/quotes.md#quote70) | option quotes: container |
| [Quote95](../spec/quotes.md#quote95) | quote |
| [Quote96](../spec/quotes.md#quote96) | quote |
| [Quote97](../spec/quotes.md#quote97) | tag free-form |
| [QuoteText8](../spec/quotes.md#quotetext8) | quote |
| [QuoteText9](../spec/quotes.md#quotetext9) | quote |
| [QuoteText11](../spec/quotes.md#quotetext11) | action shiftEnter |
| [QuoteText17](../spec/quotes.md#quotetext17) | quote |
| [QuoteText19](../spec/quotes.md#quotetext19) | quote |
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
| [Regression5](../spec/regressions.md#regression5) | link reference definition (expected) |
| [Regression6](../spec/regressions.md#regression6) | code block's fence longer than its code needs, which WorkFlowy's reads back without |
| [Regression7](../spec/regressions.md#regression7) | fenced block with a language, tildes, or text around it in its item: WorkFlowy's code block is an item of backticks alone |
| [Regression9](../spec/regressions.md#regression9) | changes only what blocks can't show |
| [Regression10](../spec/regressions.md#regression10) | action shiftEnter |
| [Regression11](../spec/regressions.md#regression11) | action shiftEnter |
| [Regression12](../spec/regressions.md#regression12) | action shiftEnter |
| [Regression16](../spec/regressions.md#regression16) | option enterMidItem: child |
| [Regression18](../spec/regressions.md#regression18) | option headingEditing: block |
| [Regression19](../spec/regressions.md#regression19) | option headingEditing: block |
| [Regression23](../spec/regressions.md#regression23) | fenced block with a language, tildes, or text around it in its item: WorkFlowy's code block is an item of backticks alone |
| [Regression26](../spec/regressions.md#regression26) | action shiftEnter |
| [Regression28](../spec/regressions.md#regression28) | callout |
| [Regression29](../spec/regressions.md#regression29) | option quotes: container |
| [Regression30](../spec/regressions.md#regression30) | changes only what blocks can't show |
| [Regression31](../spec/regressions.md#regression31) | tag free-form |
| [Regression34](../spec/regressions.md#regression34) | thematic break |
| [Regression35](../spec/regressions.md#regression35) | link reference definition (expected) |
| [Regression38](../spec/regressions.md#regression38) | option quotes: container |
| [Regression40](../spec/regressions.md#regression40) | caret in a marker |
| [Regression41](../spec/regressions.md#regression41) | option quotes: container |
| [Regression42](../spec/regressions.md#regression42) | selection across blocks |
| [Regression43](../spec/regressions.md#regression43) | caret in a marker |
| [Regression45](../spec/regressions.md#regression45) | selection across blocks |
| [Regression47](../spec/regressions.md#regression47) | action shiftEnter |
| [Regression48](../spec/regressions.md#regression48) | indented code |
| [Regression49](../spec/regressions.md#regression49) | changes only what blocks can't show |
| [Regression50](../spec/regressions.md#regression50) | option quotes: container |
| [Regression51](../spec/regressions.md#regression51) | selection across blocks |
| [Regression52](../spec/regressions.md#regression52) | indented code |
| [Regression54](../spec/regressions.md#regression54) | indented code |
| [Regression57](../spec/regressions.md#regression57) | changes only what blocks can't show |
| [Regression58](../spec/regressions.md#regression58) | caret in a marker |
| [Regression59](../spec/regressions.md#regression59) | caret in a marker |
| [Regression60](../spec/regressions.md#regression60) | option quotes: atom |
| [Regression61](../spec/regressions.md#regression61) | option quotes: atom |
| [Regression62](../spec/regressions.md#regression62) | option quotes: atom |
| [Regression64](../spec/regressions.md#regression64) | option quotes: atom |
| [Regression66](../spec/regressions.md#regression66) | caret on a blank line |
| [Regression67](../spec/regressions.md#regression67) | caret on a blank line |
| [Regression68](../spec/regressions.md#regression68) | caret on a blank line |
| [Regression69](../spec/regressions.md#regression69) | the caret in a block a fold hides |
| [Regression70](../spec/regressions.md#regression70) | caret on a blank line |
| [Regression78](../spec/regressions.md#regression78) | option quotes: atom |
| [Regression79](../spec/regressions.md#regression79) | thematic break |
| [Regression80](../spec/regressions.md#regression80) | action pasteAt |
| [Regression81](../spec/regressions.md#regression81) | action shiftEnter |
| [Regression84](../spec/regressions.md#regression84) | quote |
| [Regression90](../spec/regressions.md#regression90) | option closeBackticks: all |
| [Regression91](../spec/regressions.md#regression91) | option pastePlainLines: enter |
| [Regression92](../spec/regressions.md#regression92) | caret in a marker |
| [Regression96](../spec/regressions.md#regression96) | option pasteLines: the app's items, as blocks |
| [Regression100](../spec/regressions.md#regression100) | caret on a blank line |
| [Regression101](../spec/regressions.md#regression101) | quote |
| [Regression102](../spec/regressions.md#regression102) | action shiftEnter |
| [Regression104](../spec/regressions.md#regression104) | code block's fence longer than its code needs, which WorkFlowy's reads back without |
| [Regression106](../spec/regressions.md#regression106) | caret on a blank line |
| [Regression107](../spec/regressions.md#regression107) | caret in a task's checkbox, a heading's #s or a quote's > |
| [Regression108](../spec/regressions.md#regression108) | quote |
| [Regression109](../spec/regressions.md#regression109) | quote |
| [Regression110](../spec/regressions.md#regression110) | link reference definition |
| [Regression111](../spec/regressions.md#regression111) | quote |
| [Regression112](../spec/regressions.md#regression112) | quote |
| [Regression114](../spec/regressions.md#regression114) | option pastePlainLines: enter |
| [Regression115](../spec/regressions.md#regression115) | code block's fence longer than its code needs, which WorkFlowy's reads back without |
| [Regression116](../spec/regressions.md#regression116) | code block's fence longer than its code needs, which WorkFlowy's reads back without |
| [Regression117](../spec/regressions.md#regression117) | quote |
| [Regression118](../spec/regressions.md#regression118) | code block's fence longer than its code needs, which WorkFlowy's reads back without |
| [Regression119](../spec/regressions.md#regression119) | quote |
| [Regression122](../spec/regressions.md#regression122) | code block's fence longer than its code needs, which WorkFlowy's reads back without |
| [Regression123](../spec/regressions.md#regression123) | option markup: decorated |
| [Regression124](../spec/regressions.md#regression124) | the caret in a block a fold hides |
| [Regression126](../spec/regressions.md#regression126) | code block's fence longer than its code needs, which WorkFlowy's reads back without |
| [Regression127](../spec/regressions.md#regression127) | quote |
| [Regression128](../spec/regressions.md#regression128) | action pasteAt |
| [Regression129](../spec/regressions.md#regression129) | quote |
| [Regression130](../spec/regressions.md#regression130) | selection across blocks |
| [Regression131](../spec/regressions.md#regression131) | quote |
| [Regression132](../spec/regressions.md#regression132) | action deleteByDrag |
| [Regression133](../spec/regressions.md#regression133) | option closeBackticks: all |
| [Regression134](../spec/regressions.md#regression134) | option closeBackticks: all |
| [Regression137](../spec/regressions.md#regression137) | heading's closing #s |
| [Regression142](../spec/regressions.md#regression142) | nothing to compare |
| [Regression147](../spec/regressions.md#regression147) | fenced block with a language, tildes, or text around it in its item: WorkFlowy's code block is an item of backticks alone |
| [Regression149](../spec/regressions.md#regression149) | changes only what blocks can't show |
| [Regression150](../spec/regressions.md#regression150) | math |
| [Regression151](../spec/regressions.md#regression151) | nothing to compare |
| [Regression152](../spec/regressions.md#regression152) | option markup: decorated |
| [Regression153](../spec/regressions.md#regression153) | changes only what blocks can't show |
| [Regression154](../spec/regressions.md#regression154) | indented code |
| [Regression156](../spec/regressions.md#regression156) | action shiftEnter |
| [Regression158](../spec/regressions.md#regression158) | quote |
| [Regression159](../spec/regressions.md#regression159) | caret in a marker |
| [Regression160](../spec/regressions.md#regression160) | option pastePlainLines: enter |
| [Regression161](../spec/regressions.md#regression161) | callout |
| [Regression162](../spec/regressions.md#regression162) | changes only what blocks can't show |
| [Regression164](../spec/regressions.md#regression164) | fenced block with a language, tildes, or text around it in its item: WorkFlowy's code block is an item of backticks alone |
| [Regression165](../spec/regressions.md#regression165) | caret in a marker |
| [Regression166](../spec/regressions.md#regression166) | option quotes: container |
| [Regression169](../spec/regressions.md#regression169) | link reference definition |
| [Regression171](../spec/regressions.md#regression171) | quote |
| [Regression172](../spec/regressions.md#regression172) | action shiftEnter |
| [Regression173](../spec/regressions.md#regression173) | action shiftEnter |
| [Regression176](../spec/regressions.md#regression176) | action shiftEnter |
| [Regression178](../spec/regressions.md#regression178) | option closeBackticks: all |
| [Regression179](../spec/regressions.md#regression179) | thematic break |
| [Regression180](../spec/regressions.md#regression180) | changes only what blocks can't show |
| [Regression182](../spec/regressions.md#regression182) | link reference definition |
| [Regression183](../spec/regressions.md#regression183) | quote |
| [Regression184](../spec/regressions.md#regression184) | action shiftEnter |
| [Regression185](../spec/regressions.md#regression185) | action shiftEnter |
| [Regression186](../spec/regressions.md#regression186) | quote |
| [Regression187](../spec/regressions.md#regression187) | quote |
| [Regression188](../spec/regressions.md#regression188) | quote |
| **scenarios.md** | |
| [Scenario6](../spec/scenarios.md#scenario6) | tag free-form |
| [Scenario8b](../spec/scenarios.md#scenario8b) | no text focus after moveSubtree ③ |
| [Scenario8c](../spec/scenarios.md#scenario8c) | no text focus after moveSubtree ② |
| [Scenario8d](../spec/scenarios.md#scenario8d) | action drag ② |
| [Scenario11](../spec/scenarios.md#scenario11) | action shiftEnter |
| [Scenario20](../spec/scenarios.md#scenario20) | action shiftEnter |
| [Scenario23](../spec/scenarios.md#scenario23) | action shiftEnter |
| [Scenario24](../spec/scenarios.md#scenario24) | tag free-form |
| [Scenario25](../spec/scenarios.md#scenario25) | tag free-form |
| **select.md** | |
| [Select1](../spec/select.md#select1) | action selectNode |
| [Select5](../spec/select.md#select5) | option selectionLadder: parents |
| [Select7](../spec/select.md#select7) | selection across blocks |
| [Select17](../spec/select.md#select17) | caret on a blank line |
| [Select18](../spec/select.md#select18) | changes only what blocks can't show |
| **shift-enter.md** | |
| [ShiftEnter1](../spec/shift-enter.md#shiftenter1) | action shiftEnter |
| [ShiftEnter2](../spec/shift-enter.md#shiftenter2) | action shiftEnter |
| [ShiftEnter3](../spec/shift-enter.md#shiftenter3) | action shiftEnter |
| [ShiftEnter4](../spec/shift-enter.md#shiftenter4) | action shiftEnter |
| [ShiftEnter5](../spec/shift-enter.md#shiftenter5) | action shiftEnter |
| [ShiftEnter6](../spec/shift-enter.md#shiftenter6) | action shiftEnter |
| [ShiftEnter7](../spec/shift-enter.md#shiftenter7) | action shiftEnter |
| [ShiftEnter8](../spec/shift-enter.md#shiftenter8) | action shiftEnter |
| [ShiftEnter9](../spec/shift-enter.md#shiftenter9) | action shiftEnter |
| [ShiftEnter10](../spec/shift-enter.md#shiftenter10) | action shiftEnter |
| [ShiftEnter11](../spec/shift-enter.md#shiftenter11) | action shiftEnter |
| [ShiftEnter12](../spec/shift-enter.md#shiftenter12) | action shiftEnter |
| [ShiftEnter13](../spec/shift-enter.md#shiftenter13) | action shiftEnter |
| [ShiftEnter13b](../spec/shift-enter.md#shiftenter13b) | action shiftEnter |
| [ShiftEnter30](../spec/shift-enter.md#shiftenter30) | action shiftEnter |
| [ShiftEnter14](../spec/shift-enter.md#shiftenter14) | tag free-form |
| [ShiftEnter15](../spec/shift-enter.md#shiftenter15) | action shiftEnter |
| [ShiftEnter16](../spec/shift-enter.md#shiftenter16) | action shiftEnter |
| [ShiftEnter17](../spec/shift-enter.md#shiftenter17) | action shiftEnter |
| [ShiftEnter18](../spec/shift-enter.md#shiftenter18) | action shiftEnter |
| [ShiftEnter19](../spec/shift-enter.md#shiftenter19) | action shiftEnter |
| [ShiftEnter20](../spec/shift-enter.md#shiftenter20) | action shiftEnter |
| [ShiftEnter21](../spec/shift-enter.md#shiftenter21) | action shiftEnter |
| [ShiftEnter22](../spec/shift-enter.md#shiftenter22) | tag free-form |
| [ShiftEnter22b](../spec/shift-enter.md#shiftenter22b) | tag free-form |
| [ShiftEnter23](../spec/shift-enter.md#shiftenter23) | action shiftEnter |
| [ShiftEnter24](../spec/shift-enter.md#shiftenter24) | tag free-form |
| [ShiftEnter25](../spec/shift-enter.md#shiftenter25) | action shiftEnter |
| [ShiftEnter26](../spec/shift-enter.md#shiftenter26) | tag free-form |
| [ShiftEnter26b](../spec/shift-enter.md#shiftenter26b) | option markup: decorated |
| [ShiftEnter27](../spec/shift-enter.md#shiftenter27) | action shiftEnter |
| [ShiftEnter28](../spec/shift-enter.md#shiftenter28) | action shiftEnter |
| [ShiftEnter29](../spec/shift-enter.md#shiftenter29) | action shiftEnter |
| [ShiftEnter31](../spec/shift-enter.md#shiftenter31) | action shiftEnter |
| [ShiftEnter32](../spec/shift-enter.md#shiftenter32) | action shiftEnter |
| [ShiftEnter33](../spec/shift-enter.md#shiftenter33) | action shiftEnter |
| **subtree-selection.md** | |
| [SubtreeEdit10](../spec/subtree-selection.md#subtreeedit10) | thematic break |
| [SubtreeEdit13](../spec/subtree-selection.md#subtreeedit13) | action shiftEnter |
| [SubtreeEdit15](../spec/subtree-selection.md#subtreeedit15) | caret in a marker |
| [SubtreeEdit17](../spec/subtree-selection.md#subtreeedit17) | option pasteOverSelection: ignore |
| **tasks.md** | |
| [TaskEnter1](../spec/tasks.md#taskenter1) | tag free-form |
| [TaskEnter9](../spec/tasks.md#taskenter9) | option enterTask: plain |
| [TaskEnter9b](../spec/tasks.md#taskenter9b) | option enterTask: plain |
| [TaskEnter9c](../spec/tasks.md#taskenter9c) | option enterTask: plain |
| [TaskBackspace1](../spec/tasks.md#taskbackspace1) | option markup: decorated |
| [TaskBackspace3b](../spec/tasks.md#taskbackspace3b) | option taskEditing: unwrap |
| [TaskBackspace3c](../spec/tasks.md#taskbackspace3c) | option taskEditing: unwrap |
| [TaskBackspace4](../spec/tasks.md#taskbackspace4) | option taskEditing: block |
| [TaskBackspace5](../spec/tasks.md#taskbackspace5) | option taskEditing: text |
| [TaskBackspace6](../spec/tasks.md#taskbackspace6) | option markup: decorated |
| [TaskBackspace7](../spec/tasks.md#taskbackspace7) | option taskEditing: block |
| [TaskBackspace8](../spec/tasks.md#taskbackspace8) | caret in a task's checkbox, a heading's #s or a quote's > |
| [TaskBackspace8b](../spec/tasks.md#taskbackspace8b) | caret in a task's checkbox, a heading's #s or a quote's > |
| [TaskBackspace9](../spec/tasks.md#taskbackspace9) | caret in a task's checkbox, a heading's #s or a quote's > |
| [TaskBackspace11](../spec/tasks.md#taskbackspace11) | option taskEditing: block |
| [TaskDelete4](../spec/tasks.md#taskdelete4) | caret in a task's checkbox, a heading's #s or a quote's > |
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
| [Zoom13](../spec/zoom.md#zoom13) | caret in a task's checkbox, a heading's #s or a quote's > |
| [Zoom14](../spec/zoom.md#zoom14) | option enterOnEmptyItem: unwrap |

## Not run (1)

| example | why |
| --- | --- |
| **regressions.md** | |
| [Regression189](../spec/regressions.md#regression189) | new, or its start changed since |
