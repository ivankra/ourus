---
type: "SxS"
app: "workflowy"
version: "4.3.2610140850"
url: "https://beta.workflowy.com/guide/embed/"
model: "block"
command: "node sxs/run.ts workflowy"
elapsed_s: 286
workers: 4
---

# WorkFlowy vs ourus

Summary:

|  | agree | caret | whitespace | disagree | error | skipped | total |
| --- | --- | --- | --- | --- | --- | --- | --- |
| original | 115 | [5](#caret-5) | [4](#whitespace-4) | [36](#disagree-36) |  |  | **160** |
| adapted | 107 | [5](#adapted-caret-5) | [9](#adapted-whitespace-9) | [77](#adapted-disagree-77) |  |  | **198** |
| **total** | **222 (28%)** | **10 (1.3%)** | **13 (1.7%)** | **113 (14%)** | **0 (0%)** | **[429](#skipped-429) (55%)** | **787** |

Per-file:

|  | agree | caret | whitespace | disagree | error | skipped | total | original | adapted |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [backspace.md](../spec/backspace.md) | 24 | 1 |  | 11 |  | 29 | **65** | 15 | 21 |
| [cursor.md](../spec/cursor.md) | 24 | 4 |  |  |  | 8 | **36** | 13 | 15 |
| [del.md](../spec/del.md) | 10 |  |  | 6 |  | 32 | **48** | 10 | 6 |
| [delete-subtree.md](../spec/delete-subtree.md) | 2 | 2 |  | 1 |  | 5 | **10** | 2 | 3 |
| [duplicate-subtree.md](../spec/duplicate-subtree.md) |  | 2 |  |  |  | 6 | **8** | 2 |  |
| [enter.md](../spec/enter.md) | 21 | 1 | 9 | 7 |  | 21 | **59** | 21 | 17 |
| [fences.md](../spec/fences.md) | 6 |  |  | 8 |  | 37 | **51** |  | 14 |
| [gaps.md](../spec/gaps.md) | 12 |  |  |  |  | 7 | **19** |  | 12 |
| [indent.md](../spec/indent.md) | 19 |  |  | 1 |  | 10 | **30** | 12 | 8 |
| [move-subtree-down.md](../spec/move-subtree-down.md) | 19 |  |  | 2 |  | 16 | **37** | 10 | 11 |
| [move-subtree-up.md](../spec/move-subtree-up.md) | 16 |  |  | 1 |  | 21 | **38** | 9 | 8 |
| [obsidian-true-outliner.md](../spec/obsidian-true-outliner.md) | 22 |  | 2 | 17 |  | 26 | **67** | 23 | 18 |
| [outdent.md](../spec/outdent.md) | 7 |  |  |  |  | 22 | **29** | 5 | 2 |
| [paste.md](../spec/paste.md) | 14 |  |  | 33 |  | 60 | **107** | 16 | 31 |
| [placeholders.md](../spec/placeholders.md) | 5 |  | 1 | 1 |  | 9 | **16** | 2 | 5 |
| [quotes.md](../spec/quotes.md) |  |  |  |  |  | 90 | **90** |  |  |
| [scenarios.md](../spec/scenarios.md) | 13 |  |  | 5 |  | 6 | **24** | 11 | 7 |
| [shift-enter.md](../spec/shift-enter.md) | 1 |  |  | 14 |  | 11 | **26** | 6 | 9 |
| [tasks.md](../spec/tasks.md) | 4 |  | 1 | 6 |  | 6 | **17** |  | 11 |
| [typing.md](../spec/typing.md) |  |  |  |  |  | 4 | **4** |  |  |
| [undo.md](../spec/undo.md) | 3 |  |  |  |  | 2 | **5** | 3 |  |
| [z-open.md](../spec/z-open.md) |  |  |  |  |  | 1 | **1** |  |  |
| **total** | **222 (28%)** | **10 (1.3%)** | **13 (1.7%)** | **113 (14%)** | **0 (0%)** | **429 (55%)** | **787** | **160 (20%)** | **198 (25%)** |

## Disagree (36)

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

### [Delete1](../spec/del.md#delete1)

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

### [Delete3](../spec/del.md#delete3)

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

### [Enter3c](../spec/enter.md#enter3c)

> enter

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
10. ┃b
    - c
11. d
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
<tr><th>workflowy</th><th>ourus</th></tr>
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
<tr><th>workflowy</th><th>ourus</th></tr>
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

### [E4](../spec/obsidian-true-outliner.md#e4)

> enter

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
- ┃line
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
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- foo
  bar┃
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
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- foo
  barx┃
```

</td><td>

```buffer
- foo
  x┃
  bar
```

</td></tr>
</table>

### [S13](../spec/obsidian-true-outliner.md#s13)

> shiftEnter

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a«lpha» beta
```

</td><td>

```buffer
- alpha beta
  ┃
```

</td><td>

```buffer
- a
  ┃beta
```

</td></tr>
</table>

### [Children move to the joined node](../spec/obsidian-true-outliner.md#children-move-to-the-joined-node)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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

### [Next item becomes the new 1.](../spec/obsidian-true-outliner.md#next-item-becomes-the-new-1)

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

### [List starting at 3 keeps its start](../spec/obsidian-true-outliner.md#list-starting-at-3-keeps-its-start)

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

### [Backspace returns to the start](../spec/obsidian-true-outliner.md#backspace-returns-to-the-start)

> shiftEnter indent deleteContentBackward

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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
- foo┃
```

</td><td>

```buffer
- one
  - kid
  - foo┃
```

</td></tr>
</table>

### [Shift-Tab then Backspace returns to start](../spec/obsidian-true-outliner.md#shift-tab-then-backspace-returns-to-start)

> shiftEnter outdent deleteContentBackward

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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
- b┃
- c
```

</td></tr>
</table>

### [Shift-Enter, Tab, then Enter](../spec/obsidian-true-outliner.md#shift-enter-tab-then-enter)

> shiftEnter indent enter

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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
  →
  ┃
  
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

### [Paste3](../spec/paste.md#paste3)

> pastePlain

<table>
<tr><th>clipboard</th><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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
- y
- ┃b
```

</td><td>

```buffer
- ax
  y
  ┃b
```

</td></tr>
</table>

### [Paste5](../spec/paste.md#paste5)

> pastePlain

<table>
<tr><th>clipboard</th><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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
- y┃
```

</td><td>

```buffer
- ax
  y
  ┃
```

</td></tr>
</table>

### [Paste8b](../spec/paste.md#paste8b)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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

### [Paste16](../spec/paste.md#paste16)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
- x
- y
```

</td><td>

```buffer
1. ┃
2. b
```

</td><td>

```buffer
1. x
- y┃
1. b
```

</td><td>

```buffer
1. x
2. y┃
3. b
```

</td></tr>
</table>

### [Paste31](../spec/paste.md#paste31)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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
1. see Introduction┃here
```

</td><td>

```buffer
- see 1. Introduction┃here
```

</td></tr>
</table>

### [Paste78](../spec/paste.md#paste78)

> pastePlain

<table>
<tr><th>clipboard</th><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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
- second
- ┃a
```

</td><td>

```buffer
- first
  second
  ┃a
```

</td></tr>
</table>

### [Scenario7](../spec/scenarios.md#scenario7)

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
<tr><th>workflowy</th><th>ourus</th></tr>
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
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- buy milk ┃ and eggs
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
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃buy milk  and eggs
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
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- today:┃
- buy milk  and eggs
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
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- today:
- buy milk  and eggs
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
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- today:
- buy milk  and eggs┃call A
```

</td><td>

```buffer
- today:
- buy milk and eggs┃call A
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
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  ┃more
  
- b
```

</td><td>

```buffer
- a┃more
- b
```

</td></tr>
</table>

> cursorLineBoundaryForward deleteContentForward

<table>
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  more┃
  
- b
```

</td><td>

```buffer
- amore┃b
```

</td></tr>
</table>

> undo

<table>
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  more┃
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
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  more┃
  
- b
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

### [ShiftEnter1](../spec/shift-enter.md#shiftenter1)

> shiftEnter

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one two┃ three
```

</td><td>

```buffer
- one two three
  ┃
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
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a
   - b┃ c
```

</td><td>

```buffer
1. a
   - b c
     ┃
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
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- x
  - a┃ b
```

</td><td>

```buffer
- x
  - a b
    ┃
```

</td><td>

```buffer
- x
  - a
    ┃b
```

</td></tr>
</table>

### [ShiftEnter17](../spec/shift-enter.md#shiftenter17)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- one┃two
```

</td></tr>
</table>

> shiftEnter

<table>
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- onetwo
  ┃
```

</td><td>

```buffer
- one
  ┃two
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- onetwo┃
```

</td><td>

```buffer
- one┃two
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
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one two three
  ┃
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
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one two three┃
```

</td><td>

```buffer
- one two┃three
```

</td></tr>
</table>

## Whitespace (4)

### [Enter1](../spec/enter.md#enter1)

> enter

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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

### [Enter3](../spec/enter.md#enter3)

> enter

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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

### [Enter35](../spec/enter.md#enter35)

> enter

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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

### [Placeholder8](../spec/placeholders.md#placeholder8)

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
<tr><th>workflowy</th><th>ourus</th></tr>
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

## Caret (5)

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

### [Enter28](../spec/enter.md#enter28)

> enter

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃
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
  - ┃
  - 
  - c
```

</td></tr>
</table>

## Adapted: disagree (77)

### [Backspace15](../spec/backspace.md#backspace15)

> deleteContentBackward

Adapted: blank lines, paragraph

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
para┃a
```

</td></tr>
</table>

### [Backspace18e](../spec/backspace.md#backspace18e)

> deleteContentBackward

Adapted: heading

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

Adapted: blank lines, heading, paragraph

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

  text
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

Adapted: blank lines, paragraph

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
  2. m
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

### [Backspace41](../spec/backspace.md#backspace41)

> deleteContentBackward

Adapted: a list as an item's first block

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

### [Delete13](../spec/del.md#delete13)

> deleteContentForward

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- # H1
```

</td><td>

```buffer
- a┃
- # H1
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

### [Delete13g](../spec/del.md#delete13g)

> deleteContentForward

Adapted: heading

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- # H
```

</td><td>

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

### [Delete17](../spec/del.md#delete17)

> deleteContentForward

Adapted: blank lines, paragraph

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
Shopping:┃milk
- eggs
```

</td></tr>
</table>

### [Delete26](../spec/del.md#delete26)

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

### [DeleteSubtree6](../spec/delete-subtree.md#deletesubtree6)

> deleteSubtree "x"

Adapted: paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - b
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
- a┃
  - b
```

</td><td>

```buffer
x┃
```

</td></tr>
</table>

### [Enter42](../spec/enter.md#enter42)

> enter

Adapted: escape, heading, paragraph, setext heading

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # title ┃- x
```

</td><td>

```buffer
- title 
- # ┃- x
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
<tr><th>workflowy</th><th>ourus</th></tr>
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
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [a]: b ┃c
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
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ## one
  
  ┃two
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

### [Enter52](../spec/enter.md#enter52)

> enter

Adapted: blank lines, heading, paragraph, setext heading

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

### [Fence1](../spec/fences.md#fence1)

Adapted: code block

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

### [Fence3](../spec/fences.md#fence3)

> enter

Adapted: code block

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
  ```
    nested
    ┃
  ```
````

</td></tr>
</table>

### [Fence5](../spec/fences.md#fence5)

> enter

Adapted: code block

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

### [Fence8](../spec/fences.md#fence8)

> shiftEnter

Adapted: code block

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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
    ┃
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

### [Fence30](../spec/fences.md#fence30)

> deleteContentForward

Adapted: code block

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

### [Fence34](../spec/fences.md#fence34)

> deleteContentForward

Adapted: code block

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

### [Fence36](../spec/fences.md#fence36)

> deleteContentBackward

Adapted: code block

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- ```
  ``
  ┃`
  body
  ```
````

</td><td>

`````buffer
- ````
  ``┃`
  body
  ````
`````

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

### [Fence37](../spec/fences.md#fence37)

> deleteContentForward

Adapted: code block

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- ```
  ``┃
  `
  body
  ```
````

</td><td>

`````buffer
- ````
  ``┃`
  body
  ````
`````

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

### [E17](../spec/obsidian-true-outliner.md#e17)

> enter

Adapted: heading, paragraph, setext heading

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

### [Split title above a subheading](../spec/obsidian-true-outliner.md#split-title-above-a-subheading)

> enter

Adapted: heading, paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # He┃ad
  - ## Sub
```

</td><td>

```buffer
- He
- # ┃ad
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

### [Split title above an existing paragraph](../spec/obsidian-true-outliner.md#split-title-above-an-existing-paragraph)

> enter

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Head┃line
  - Body.
```

</td><td>

```buffer
- Head
- # ┃line
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

### [S4](../spec/obsidian-true-outliner.md#s4)

> shiftEnter

Adapted: paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one┃ two
```

</td><td>

```buffer
- one two
  ┃
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

### [S9](../spec/obsidian-true-outliner.md#s9)

> shiftEnter

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- item
  - para┃ text
```

</td><td>

```buffer
- item
  - para text
    ┃
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

### [Paste1](../spec/paste.md#paste1)

> pasteStructured

Adapted: code block, paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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

### [Paste4](../spec/paste.md#paste4)

> pastePlain

Adapted: escape

<table>
<tr><th>clipboard</th><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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
- y
- ┃b
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

### [Paste9](../spec/paste.md#paste9)

> pasteStructured

Adapted: code block

<table>
<tr><th>clipboard</th><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

````clipboard
```
code
```
````

</td><td>

```buffer
- a
- ┃
```

</td><td>

```buffer
- a
- code┃
```

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

```buffer
- a
- ┃
```

</td><td>

````buffer
- a
- ```
  code┃
  ```
````

</td></tr>
</table>

### [Paste11](../spec/paste.md#paste11)

> pasteStructured

Adapted: code block

<table>
<tr><th>clipboard</th><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

````clipboard
```
code
```
````

</td><td>

```buffer
- a
  - ┃
```

</td><td>

```buffer
- a
  - code┃
```

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

```buffer
- a
  - ┃◌
```

</td><td>

````buffer
- a
  - ```
    code┃
    ```
````

</td></tr>
</table>

### [Paste19](../spec/paste.md#paste19)

> pasteStructured

Adapted: heading, paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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

### [Paste25](../spec/paste.md#paste25)

> pasteStructured

Adapted: code block

<table>
<tr><th>clipboard</th><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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

### [Paste30](../spec/paste.md#paste30)

> pastePlain

Adapted: escape

<table>
<tr><th>clipboard</th><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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
2. y┃
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

### [Paste32](../spec/paste.md#paste32)

> pasteStructured

Adapted: blank lines, heading, paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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

### [Paste33](../spec/paste.md#paste33)

> pasteStructured

Adapted: blank lines, heading, paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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

### [Paste34](../spec/paste.md#paste34)

> pasteStructured

Adapted: blank lines, heading, paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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

### [Paste35](../spec/paste.md#paste35)

> pasteStructured

Adapted: blank lines, heading, paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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

### [Paste37](../spec/paste.md#paste37)

> pasteStructured

Adapted: blank lines, paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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
- y
- ┃here.
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

### [Paste45](../spec/paste.md#paste45)

> pastePlain

Adapted: escape

<table>
<tr><th>clipboard</th><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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
- x^2
- $$
- ┃b
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

### [Paste52](../spec/paste.md#paste52)

> pasteStructured

Adapted: code block

<table>
<tr><th>clipboard</th><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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

### [Paste53](../spec/paste.md#paste53)

> pasteStructured

Adapted: blank lines, heading, paragraph, setext heading

<table>
<tr><th>clipboard</th><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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

### [Paste57](../spec/paste.md#paste57)

> pasteStructured

Adapted: heading, paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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

### [Paste61](../spec/paste.md#paste61)

> pasteStructured

Adapted: heading, paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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

### [Paste62](../spec/paste.md#paste62)

> pasteStructured

Adapted: blank lines, code block, paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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

### [Paste64](../spec/paste.md#paste64)

> pastePlain

Adapted: escape, paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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
- b
- ┃words
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

### [Paste66](../spec/paste.md#paste66)

> pasteStructured

Adapted: code block

<table>
<tr><th>clipboard</th><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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

```buffer
- grandchild// greet
  - f();┃
```

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

### [Paste68](../spec/paste.md#paste68)

> pastePlain

Adapted: escape, paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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

### [Paste69](../spec/paste.md#paste69)

> pastePlain

Adapted: escape, paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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

### [Paste70](../spec/paste.md#paste70)

> pasteStructured

Adapted: blank lines, code block, escape, paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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

### [Paste74](../spec/paste.md#paste74)

> pasteStructured

Adapted: code block

<table>
<tr><th>clipboard</th><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

````clipboard
```
if x:
    y
```
````

</td><td>

```buffer
- a
- ┃
```

</td><td>

```buffer
- a
- if x:
  - y┃
```

</td><td>

````buffer
- a
- ```
  if x:
      y┃
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
- ```
  if x:
      y┃
  ```
````

</td></tr>
</table>

### [Paste80](../spec/paste.md#paste80)

> pastePlain

Adapted: paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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
- b┃
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

### [Paste81](../spec/paste.md#paste81)

> pastePlain

Adapted: escape

<table>
<tr><th>clipboard</th><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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
1. 2a
2. b
- ┃. y
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

### [Scenario18](../spec/scenarios.md#scenario18)

> pasteStructured "!"

Adapted: code block, paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Plan
- # revise ┃2. draft
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
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Plan
- # revise 2. draft
  ┃
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
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer

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

### [ShiftEnter5](../spec/shift-enter.md#shiftenter5)

> shiftEnter

Adapted: escape

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc ┃- def
```

</td><td>

```buffer
- abc - def
  ┃
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

### [ShiftEnter6](../spec/shift-enter.md#shiftenter6)

> shiftEnter

Adapted: escape

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc ┃1. def
```

</td><td>

```buffer
- abc 1. def
  ┃
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

### [ShiftEnter7](../spec/shift-enter.md#shiftenter7)

> shiftEnter

Adapted: escape, paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Title ┃===
```

</td><td>

```buffer
- Title ===
  ┃
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

### [ShiftEnter8](../spec/shift-enter.md#shiftenter8)

> shiftEnter

Adapted: escape, paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Title ┃--
```

</td><td>

```buffer
- Title --
  ┃
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

### [ShiftEnter9](../spec/shift-enter.md#shiftenter9)

> shiftEnter

Adapted: escape

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one ┃<div>
```

</td><td>

```buffer
- one <div>
  ┃
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

### [ShiftEnter18](../spec/shift-enter.md#shiftenter18)

> shiftEnter

Adapted: escape

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. abc ┃2. x
```

</td><td>

```buffer
1. abc 2. x
   ┃
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

### [ShiftEnter19](../spec/shift-enter.md#shiftenter19)

> shiftEnter

Adapted: escape, paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a | b ┃|---|---|
```

</td><td>

```buffer
- a | b |---|---|
  ┃
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

### [ShiftEnter20](../spec/shift-enter.md#shiftenter20)

Adapted: escape

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- abc┃- def
```

</td></tr>
</table>

> shiftEnter

<table>
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc- def
  ┃
```

</td><td>

```buffer
- abc
  ┃\- def
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc- def┃
```

</td><td>

```buffer
- abc┃- def
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>shiftEnter</th><th>deleteContentBackward</th></tr>
<tr valign="top"><td>

```buffer
- abc┃- def
```

</td><td>

```buffer
- abc
  ┃\- def
```

</td><td>

```buffer
- abc┃- def
```

</td></tr>
</table>

### [ShiftEnter23](../spec/shift-enter.md#shiftenter23)

> shiftEnter

Adapted: escape, paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [Note]: this ┃matters a lot
```

</td><td>

```buffer
- [Note]: this matters a lot
  ┃
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

### [TaskEnter7](../spec/tasks.md#taskenter7)

> enter

Adapted: task

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

Adapted: task

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

Adapted: task

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

Adapted: task

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

Adapted: task

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

## Adapted: whitespace (9)

### [Enter8](../spec/enter.md#enter8)

> enter

Adapted: escape

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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

Adapted: blank lines, escape, paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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

### [Enter12](../spec/enter.md#enter12)

> enter

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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

### [Enter22](../spec/enter.md#enter22)

> enter

Adapted: blank lines, escape, paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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

### [E9](../spec/obsidian-true-outliner.md#e9)

> enter

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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

### [Task checkbox carries over unchecked](../spec/obsidian-true-outliner.md#task-checkbox-carries-over-unchecked)

> enter

Adapted: task

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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

### [TaskEnter3](../spec/tasks.md#taskenter3)

> enter

Adapted: task

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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

## Adapted: caret (5)

### [CursorRight1](../spec/cursor.md#cursorright1)

> cursorCharRight

Adapted: paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  b
```

</td><td>

```buffer
- a┃
  b
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
a┃
b
```

</td><td>

```buffer
a
┃b
```

</td></tr>
</table>

### [CursorUp1](../spec/cursor.md#cursorup1)

> cursorLineUp

Adapted: paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ab┃
```

</td><td>

```buffer
- ab
```

</td><td>

```buffer
- ┃ab
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
ab┃
```

</td><td>

```buffer
┃ab
```

</td></tr>
</table>

### [CursorDown1](../spec/cursor.md#cursordown1)

> cursorLineDown cursorLineDown

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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

### [DeleteSubtree3](../spec/delete-subtree.md#deletesubtree3)

> deleteSubtree

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- para┃
  - x
- # H
```

</td><td>

```buffer
- # H
```

</td><td>

```buffer
- # ┃H
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para┃

- x

# H
```

</td><td>

```buffer
# ┃H
```

</td></tr>
</table>

### [DeleteSubtree4](../spec/delete-subtree.md#deletesubtree4)

> deleteSubtree

Adapted: task

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - a1
- [ ] b
```

</td><td>

```buffer
- [ ] b
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

## Skipped (429)

| example | why |
| --- | --- |
| **backspace.md** | |
| [Backspace2](../spec/backspace.md#backspace2) | a caret in a marker |
| [Backspace4](../spec/backspace.md#backspace4) | a heading's closing #s |
| [Backspace12](../spec/backspace.md#backspace12) | tag free-form |
| [Backspace12b](../spec/backspace.md#backspace12b) | tag free-form |
| [Backspace12c](../spec/backspace.md#backspace12c) | tag free-form |
| [Backspace14](../spec/backspace.md#backspace14) | tag free-form |
| [Backspace17b](../spec/backspace.md#backspace17b) | option emptyItemWithChildren: the app's refuse |
| [Backspace17c](../spec/backspace.md#backspace17c) | option emptyItemWithChildren: the app's refuse |
| [Backspace17e](../spec/backspace.md#backspace17e) | tag free-form |
| [Backspace18](../spec/backspace.md#backspace18) | tag free-form |
| [Backspace18b](../spec/backspace.md#backspace18b) | tag free-form |
| [Backspace18c](../spec/backspace.md#backspace18c) | tag free-form |
| [Backspace18d](../spec/backspace.md#backspace18d) | tag free-form |
| [Backspace18f](../spec/backspace.md#backspace18f) | option headingEditing: block |
| [Backspace19](../spec/backspace.md#backspace19) | tag free-form |
| [Backspace20](../spec/backspace.md#backspace20) | tag free-form |
| [Backspace21b](../spec/backspace.md#backspace21b) | option deleteAtGap: gap |
| [Backspace23](../spec/backspace.md#backspace23) | tag free-form |
| [Backspace27](../spec/backspace.md#backspace27) | tag free-form |
| [Backspace31](../spec/backspace.md#backspace31) | a selection across blocks |
| [Backspace33](../spec/backspace.md#backspace33) | tag free-form |
| [Backspace34](../spec/backspace.md#backspace34) | option backspaceAtTopItem: refuse |
| [Backspace35](../spec/backspace.md#backspace35) | tag free-form |
| [Backspace38](../spec/backspace.md#backspace38) | tag free-form |
| [SoftBackspace4](../spec/backspace.md#softbackspace4) | a heading's closing #s |
| [SoftBackspace6](../spec/backspace.md#softbackspace6) | a caret on a blank line |
| [SoftBackspace7](../spec/backspace.md#softbackspace7) | tag free-form |
| [SoftBackspace8](../spec/backspace.md#softbackspace8) | tag free-form |
| [SoftBackspace9](../spec/backspace.md#softbackspace9) | a caret in a task's checkbox or a heading's #s |
| **cursor.md** | |
| [CursorDown2](../spec/cursor.md#cursordown2) | indented code |
| [CursorHome3](../spec/cursor.md#cursorhome3) | a caret in a marker |
| [CursorHome4](../spec/cursor.md#cursorhome4) | a caret in a marker |
| [CursorHome11](../spec/cursor.md#cursorhome11) | a quote |
| [CursorHome15](../spec/cursor.md#cursorhome15) | a caret in a marker |
| [CursorHome16](../spec/cursor.md#cursorhome16) | a quote |
| [CursorHome17](../spec/cursor.md#cursorhome17) | a callout |
| [CursorDocEndLeft1](../spec/cursor.md#cursordocendleft1) | cursorCharLeft after cursorDocEnd |
| **del.md** | |
| [Delete4](../spec/del.md#delete4) | a heading's closing #s |
| [Delete4b](../spec/del.md#delete4b) | a heading's closing #s |
| [Delete5](../spec/del.md#delete5) | option emptyItemWithChildren: the app's refuse |
| [Delete5b](../spec/del.md#delete5b) | option emptyItemWithChildren: the app's refuse |
| [Delete5c](../spec/del.md#delete5c) | option emptyItemWithChildren: the app's refuse |
| [Delete5d](../spec/del.md#delete5d) | option emptyItemWithChildren: the app's refuse |
| [Delete9](../spec/del.md#delete9) | tag free-form |
| [Delete10](../spec/del.md#delete10) | a quote |
| [Delete11](../spec/del.md#delete11) | indented code |
| [Delete13b](../spec/del.md#delete13b) | option headingEditing: block |
| [Delete13c](../spec/del.md#delete13c) | tag free-form |
| [Delete13d](../spec/del.md#delete13d) | tag free-form |
| [Delete13e](../spec/del.md#delete13e) | tag free-form |
| [Delete13f](../spec/del.md#delete13f) | option headingEditing: block |
| [Delete14](../spec/del.md#delete14) | tag free-form |
| [Delete15](../spec/del.md#delete15) | a heading's closing #s |
| [Delete16](../spec/del.md#delete16) | tag free-form |
| [Delete16b](../spec/del.md#delete16b) | tag free-form |
| [Delete16c](../spec/del.md#delete16c) | tag free-form |
| [Delete16d](../spec/del.md#delete16d) | tag free-form |
| [Delete16e](../spec/del.md#delete16e) | tag free-form |
| [Delete16f](../spec/del.md#delete16f) | tag free-form |
| [Delete16g](../spec/del.md#delete16g) | a caret in a marker |
| [Delete17b](../spec/del.md#delete17b) | option deleteAtGap: gap |
| [Delete18](../spec/del.md#delete18) | tag free-form |
| [Delete18b](../spec/del.md#delete18b) | tag free-form |
| [Delete18c](../spec/del.md#delete18c) | tag free-form |
| [Delete19](../spec/del.md#delete19) | a caret in a task's checkbox or a heading's #s |
| [Delete21](../spec/del.md#delete21) | a selection across blocks |
| [Delete23](../spec/del.md#delete23) | tag free-form |
| [Delete24](../spec/del.md#delete24) | tag free-form |
| [Delete25](../spec/del.md#delete25) | tag free-form |
| **delete-subtree.md** | |
| [DeleteSubtree5](../spec/delete-subtree.md#deletesubtree5) | a selection across blocks |
| [DeleteSubtree7](../spec/delete-subtree.md#deletesubtree7) | a quote |
| [DeleteSubtree8](../spec/delete-subtree.md#deletesubtree8) | a caret in a task's checkbox or a heading's #s |
| [DeleteSubtree9](../spec/delete-subtree.md#deletesubtree9) | thematic break |
| [DeleteSubtree10](../spec/delete-subtree.md#deletesubtree10) | thematic break |
| **duplicate-subtree.md** | |
| [DuplicateSubtree3](../spec/duplicate-subtree.md#duplicatesubtree3) | a selection across blocks |
| [DuplicateSubtree4](../spec/duplicate-subtree.md#duplicatesubtree4) | tag free-form |
| [DuplicateSubtree5](../spec/duplicate-subtree.md#duplicatesubtree5) | a quote |
| [DuplicateSubtree6](../spec/duplicate-subtree.md#duplicatesubtree6) | tag free-form |
| [DuplicateSubtree7](../spec/duplicate-subtree.md#duplicatesubtree7) | a caret in a marker |
| [DuplicateSubtree8](../spec/duplicate-subtree.md#duplicatesubtree8) | a caret in a task's checkbox or a heading's #s |
| **enter.md** | |
| [Enter3b](../spec/enter.md#enter3b) | option enterMidItem: child |
| [Enter6](../spec/enter.md#enter6) | tag free-form |
| [Enter7b](../spec/enter.md#enter7b) | tag free-form |
| [Enter14](../spec/enter.md#enter14) | tag free-form |
| [Enter15b](../spec/enter.md#enter15b) | tag free-form |
| [Enter23](../spec/enter.md#enter23) | indented code |
| [Enter26b](../spec/enter.md#enter26b) | option enterAtTextStart: stay |
| [Enter29b](../spec/enter.md#enter29b) | option enterAtTextStart: stay |
| [Enter30](../spec/enter.md#enter30) | option enterOnEmptyItem: outdent |
| [Enter32b](../spec/enter.md#enter32b) | option enterAtTextStart: stay |
| [Enter33b](../spec/enter.md#enter33b) | option enterAtTextStart: stay |
| [Enter34](../spec/enter.md#enter34) | a caret in a marker |
| [Enter36b](../spec/enter.md#enter36b) | a quote |
| [Enter37](../spec/enter.md#enter37) | a caret on a blank line |
| [Enter40](../spec/enter.md#enter40) | tag free-form |
| [Enter41](../spec/enter.md#enter41) | tag free-form |
| [Enter46](../spec/enter.md#enter46) | a quote |
| [Enter47](../spec/enter.md#enter47) | tag free-form |
| [Enter49](../spec/enter.md#enter49) | table |
| [Enter50](../spec/enter.md#enter50) | tag free-form |
| [Enter53](../spec/enter.md#enter53) | tag free-form |
| **fences.md** | |
| [Fence4](../spec/fences.md#fence4) | a quote |
| [Fence6](../spec/fences.md#fence6) | a fenced block with a language, tildes, or text around it in its item: WorkFlowy's code block is an item of backticks alone |
| [Fence7](../spec/fences.md#fence7) | a caret in a code block's fences |
| [Fence7b](../spec/fences.md#fence7b) | a caret in a code block's fences |
| [Fence7c](../spec/fences.md#fence7c) | a caret in a code block's fences |
| [Fence7d](../spec/fences.md#fence7d) | a caret in a code block's fences |
| [Fence9](../spec/fences.md#fence9) | a caret in a task's checkbox or a heading's #s |
| [Fence10](../spec/fences.md#fence10) | option handleFenceContents: false |
| [Fence11](../spec/fences.md#fence11) | option handleFenceContents: false |
| [Fence12](../spec/fences.md#fence12) | a caret in a task's checkbox or a heading's #s |
| [Fence13](../spec/fences.md#fence13) | a caret in a code block's fences |
| [Fence14](../spec/fences.md#fence14) | a caret in a code block's fences |
| [Fence15](../spec/fences.md#fence15) | a caret in a task's checkbox or a heading's #s |
| [Fence20](../spec/fences.md#fence20) | a quote |
| [Fence21](../spec/fences.md#fence21) | nothing to compare |
| [Fence22](../spec/fences.md#fence22) | a caret in a code block's fences |
| [Fence23](../spec/fences.md#fence23) | a caret in a code block's fences |
| [Fence24](../spec/fences.md#fence24) | a fenced block with a language, tildes, or text around it in its item: WorkFlowy's code block is an item of backticks alone |
| [Fence25](../spec/fences.md#fence25) | a caret in a task's checkbox or a heading's #s |
| [Fence26](../spec/fences.md#fence26) | a caret in a task's checkbox or a heading's #s |
| [Fence27](../spec/fences.md#fence27) | a fenced block with a language, tildes, or text around it in its item: WorkFlowy's code block is an item of backticks alone |
| [Fence28](../spec/fences.md#fence28) | a fenced block with a language, tildes, or text around it in its item: WorkFlowy's code block is an item of backticks alone |
| [Fence29](../spec/fences.md#fence29) | a caret in a code block's fences |
| [Fence31](../spec/fences.md#fence31) | a caret in a task's checkbox or a heading's #s |
| [Fence32](../spec/fences.md#fence32) | a caret in a code block's fences |
| [Fence33](../spec/fences.md#fence33) | a caret in a task's checkbox or a heading's #s |
| [Fence35](../spec/fences.md#fence35) | a caret in a code block's fences |
| [Fence38](../spec/fences.md#fence38) | a code block's fence longer than its code needs, which WorkFlowy's reads back without |
| [Fence39](../spec/fences.md#fence39) | a code block's fence longer than its code needs, which WorkFlowy's reads back without |
| [Fence40](../spec/fences.md#fence40) | a quote |
| [Fence41](../spec/fences.md#fence41) | a caret in a code block's fences |
| [Fence42](../spec/fences.md#fence42) | math |
| [Fence43](../spec/fences.md#fence43) | a quote |
| [Fence44](../spec/fences.md#fence44) | indented code |
| [Fence45](../spec/fences.md#fence45) | math |
| [Fence46](../spec/fences.md#fence46) | a quote |
| [Fence47](../spec/fences.md#fence47) | math |
| **gaps.md** | |
| [Gap13](../spec/gaps.md#gap13) | option pasteStructuredAtEnd: the app's join |
| [Gap14](../spec/gaps.md#gap14) | a caret on a blank line |
| [Gap15](../spec/gaps.md#gap15) | a caret on a blank line |
| [Gap16](../spec/gaps.md#gap16) | a caret on a blank line |
| [Gap17](../spec/gaps.md#gap17) | a caret on a blank line |
| [Gap18](../spec/gaps.md#gap18) | a caret on a blank line |
| [Gap19](../spec/gaps.md#gap19) | frontmatter |
| **indent.md** | |
| [Indent9](../spec/indent.md#indent9) | a selection across blocks |
| [Indent12](../spec/indent.md#indent12) | tag free-form |
| [Indent16](../spec/indent.md#indent16) | tag free-form |
| [Indent22](../spec/indent.md#indent22) | tag free-form |
| [Indent23](../spec/indent.md#indent23) | tag free-form |
| [Indent24](../spec/indent.md#indent24) | tag free-form |
| [Indent25](../spec/indent.md#indent25) | tag free-form |
| [Indent27](../spec/indent.md#indent27) | a selection across blocks |
| [Indent28](../spec/indent.md#indent28) | a caret in a marker |
| [Indent30](../spec/indent.md#indent30) | a caret in a marker |
| **move-subtree-down.md** | |
| [MoveDown2](../spec/move-subtree-down.md#movedown2) | tag free-form |
| [MoveDown8](../spec/move-subtree-down.md#movedown8) | tag free-form |
| [MoveDown11](../spec/move-subtree-down.md#movedown11) | a selection across blocks |
| [MoveDown12](../spec/move-subtree-down.md#movedown12) | a selection across blocks |
| [MoveDown13](../spec/move-subtree-down.md#movedown13) | tag free-form |
| [MoveDown14](../spec/move-subtree-down.md#movedown14) | a selection across blocks |
| [MoveDown17](../spec/move-subtree-down.md#movedown17) | tag free-form |
| [MoveDown19](../spec/move-subtree-down.md#movedown19) | tag free-form |
| [MoveDown20](../spec/move-subtree-down.md#movedown20) | tag free-form |
| [MoveDown25](../spec/move-subtree-down.md#movedown25) | tag free-form |
| [MoveDown28](../spec/move-subtree-down.md#movedown28) | tag free-form |
| [MoveDown31](../spec/move-subtree-down.md#movedown31) | thematic break |
| [MoveDown32](../spec/move-subtree-down.md#movedown32) | a caret in a marker |
| [MoveDown34](../spec/move-subtree-down.md#movedown34) | a caret in a task's checkbox or a heading's #s |
| [MoveDown36](../spec/move-subtree-down.md#movedown36) | tag free-form |
| [MoveDown37](../spec/move-subtree-down.md#movedown37) | a caret in a task's checkbox or a heading's #s |
| **move-subtree-up.md** | |
| [MoveUp7](../spec/move-subtree-up.md#moveup7) | tag free-form |
| [MoveUp10](../spec/move-subtree-up.md#moveup10) | a selection across blocks |
| [MoveUp11](../spec/move-subtree-up.md#moveup11) | a selection across blocks |
| [MoveUp12](../spec/move-subtree-up.md#moveup12) | tag free-form |
| [MoveUp18](../spec/move-subtree-up.md#moveup18) | indented code |
| [MoveUp19](../spec/move-subtree-up.md#moveup19) | thematic break |
| [MoveUp20](../spec/move-subtree-up.md#moveup20) | link reference definition |
| [MoveUp21](../spec/move-subtree-up.md#moveup21) | tag free-form |
| [MoveUp23](../spec/move-subtree-up.md#moveup23) | tag free-form |
| [MoveUp24](../spec/move-subtree-up.md#moveup24) | tag free-form |
| [MoveUp27](../spec/move-subtree-up.md#moveup27) | tag free-form |
| [MoveUp28](../spec/move-subtree-up.md#moveup28) | tag free-form |
| [MoveUp29](../spec/move-subtree-up.md#moveup29) | tag free-form |
| [MoveUp30](../spec/move-subtree-up.md#moveup30) | link reference definition |
| [MoveUp31](../spec/move-subtree-up.md#moveup31) | a selection across blocks |
| [MoveUp33](../spec/move-subtree-up.md#moveup33) | tag free-form |
| [MoveUp34](../spec/move-subtree-up.md#moveup34) | a caret in a marker |
| [MoveUp35](../spec/move-subtree-up.md#moveup35) | tag free-form |
| [MoveUp36](../spec/move-subtree-up.md#moveup36) | tag free-form |
| [MoveUp37](../spec/move-subtree-up.md#moveup37) | math |
| [MoveUp38](../spec/move-subtree-up.md#moveup38) | math |
| **obsidian-true-outliner.md** | |
| [Renumbering stops at a delimiter change](../spec/obsidian-true-outliner.md#renumbering-stops-at-a-delimiter-change) | a numbered list that skips a number |
| [Split item becomes first tab-indented child](../spec/obsidian-true-outliner.md#split-item-becomes-first-tab-indented-child) | option enterMidItem: child |
| [E11](../spec/obsidian-true-outliner.md#e11) | option enterMidItem: child |
| [E15](../spec/obsidian-true-outliner.md#e15) | tag free-form |
| [E18](../spec/obsidian-true-outliner.md#e18) | a caret on a blank line |
| [Empty paragraph before a section list](../spec/obsidian-true-outliner.md#empty-paragraph-before-a-section-list) | tag free-form |
| [#267, E5](../spec/obsidian-true-outliner.md#267-e5) | a quote |
| [S5](../spec/obsidian-true-outliner.md#s5) | tag free-form |
| [Line break in setext title refused](../spec/obsidian-true-outliner.md#line-break-in-setext-title-refused) | tag free-form |
| [Line break in setext underline refused](../spec/obsidian-true-outliner.md#line-break-in-setext-underline-refused) | a caret on a blank line |
| [Leaving the place removes it](../spec/obsidian-true-outliner.md#leaving-the-place-removes-it) | tag free-form |
| [Backspace before the checkbox](../spec/obsidian-true-outliner.md#backspace-before-the-checkbox) | a caret in a task's checkbox or a heading's #s |
| [Outdented child leaves quote above alone](../spec/obsidian-true-outliner.md#outdented-child-leaves-quote-above-alone) | a quote |
| [Indented item keeps its quote](../spec/obsidian-true-outliner.md#indented-item-keeps-its-quote) | a quote |
| [Outdented item keeps its quote](../spec/obsidian-true-outliner.md#outdented-item-keeps-its-quote) | a quote |
| [Indented item keeps its thematic break](../spec/obsidian-true-outliner.md#indented-item-keeps-its-thematic-break) | thematic break |
| [Outdented item keeps its code block](../spec/obsidian-true-outliner.md#outdented-item-keeps-its-code-block) | indented code |
| [Blank line added below a quote](../spec/obsidian-true-outliner.md#blank-line-added-below-a-quote) | a quote |
| [Carried place removed on leaving](../spec/obsidian-true-outliner.md#carried-place-removed-on-leaving) | tag free-form |
| [Doubly indented place removed on leaving](../spec/obsidian-true-outliner.md#doubly-indented-place-removed-on-leaving) | tag free-form |
| [Empty paragraph and blank lines removed](../spec/obsidian-true-outliner.md#empty-paragraph-and-blank-lines-removed) | tag free-form |
| [Indented list under paragraph restored](../spec/obsidian-true-outliner.md#indented-list-under-paragraph-restored) | tag free-form |
| [Pasted list takes space indent unit](../spec/obsidian-true-outliner.md#pasted-list-takes-space-indent-unit) | option pasteStructuredAtEnd: the app's join |
| [Pasted list takes tab indent unit](../spec/obsidian-true-outliner.md#pasted-list-takes-tab-indent-unit) | option pasteStructuredAtEnd: the app's join |
| [Pasted quote set off from paragraph](../spec/obsidian-true-outliner.md#pasted-quote-set-off-from-paragraph) | a quote |
| [Pasted list and block become children](../spec/obsidian-true-outliner.md#pasted-list-and-block-become-children) | option pasteStructuredAtEnd: the app's join |
| **outdent.md** | |
| [Outdent4](../spec/outdent.md#outdent4) | tag free-form |
| [Outdent5](../spec/outdent.md#outdent5) | tag free-form |
| [Outdent6](../spec/outdent.md#outdent6) | option outdent: the app's logical |
| [Outdent7](../spec/outdent.md#outdent7) | option outdent: the app's logical |
| [Outdent8](../spec/outdent.md#outdent8) | a selection across blocks |
| [Outdent10](../spec/outdent.md#outdent10) | a selection across blocks |
| [Outdent11](../spec/outdent.md#outdent11) | tag free-form |
| [Outdent12](../spec/outdent.md#outdent12) | tag free-form |
| [Outdent13](../spec/outdent.md#outdent13) | option outdent: the app's logical |
| [Outdent14](../spec/outdent.md#outdent14) | a caret in a marker |
| [DirectOutdent1](../spec/outdent.md#directoutdent1) | option outdent: the app's logical |
| [DirectOutdent2](../spec/outdent.md#directoutdent2) | tag free-form |
| [DirectOutdent3](../spec/outdent.md#directoutdent3) | tag free-form |
| [DirectOutdent4](../spec/outdent.md#directoutdent4) | option outdent: the app's logical |
| [LogicalOutdent2](../spec/outdent.md#logicaloutdent2) | tag free-form |
| [LogicalOutdent3](../spec/outdent.md#logicaloutdent3) | tag free-form |
| [LogicalOutdent5](../spec/outdent.md#logicaloutdent5) | tag free-form |
| [Outdent16](../spec/outdent.md#outdent16) | tag free-form |
| [Outdent17](../spec/outdent.md#outdent17) | tag free-form |
| [Outdent17b](../spec/outdent.md#outdent17b) | tag free-form |
| [Outdent18](../spec/outdent.md#outdent18) | tag free-form |
| [Outdent19](../spec/outdent.md#outdent19) | tag free-form |
| **paste.md** | |
| [Paste2](../spec/paste.md#paste2) | option pasteStructuredAtEnd: the app's join |
| [Paste2b](../spec/paste.md#paste2b) | option pasteStructuredListForm: own |
| [Paste6](../spec/paste.md#paste6) | tag free-form |
| [Paste7](../spec/paste.md#paste7) | option pasteStructuredLines: the app's items |
| [Paste10](../spec/paste.md#paste10) | option pasteStructuredLines: the app's items |
| [Paste12](../spec/paste.md#paste12) | a quote |
| [Paste13](../spec/paste.md#paste13) | option pasteStructuredAtEnd: the app's join |
| [Paste13b](../spec/paste.md#paste13b) | option pasteStructuredAtEnd: the app's join |
| [Paste13c](../spec/paste.md#paste13c) | option pasteStructuredListForm: own |
| [Paste13d](../spec/paste.md#paste13d) | option pasteStructuredListForm: the app's drop |
| [Paste13e](../spec/paste.md#paste13e) | option pasteStructuredListForm: own |
| [Paste14](../spec/paste.md#paste14) | option pasteStructuredAtEnd: the app's join |
| [Paste15](../spec/paste.md#paste15) | option pasteStructuredListForm: the app's drop |
| [Paste15b](../spec/paste.md#paste15b) | option pasteStructuredListForm: literal |
| [Paste15d](../spec/paste.md#paste15d) | option pasteStructuredListForm: own |
| [Paste16b](../spec/paste.md#paste16b) | option pasteStructuredListForm: own |
| [Paste17](../spec/paste.md#paste17) | option pasteStructuredAtEnd: the app's join |
| [Paste17b](../spec/paste.md#paste17b) | option pasteStructuredListForm: literal |
| [Paste17c](../spec/paste.md#paste17c) | option pasteStructuredAtEnd: the app's join |
| [Paste17d](../spec/paste.md#paste17d) | option pasteStructuredListForm: literal |
| [Paste18](../spec/paste.md#paste18) | option pasteStructuredAtEnd: the app's join |
| [Paste18b](../spec/paste.md#paste18b) | option pasteStructuredListForm: literal |
| [Paste20](../spec/paste.md#paste20) | option pasteStructuredAtEnd: the app's join |
| [Paste20b](../spec/paste.md#paste20b) | option pasteStructuredOnParent: the app's after, as blocks |
| [Paste21](../spec/paste.md#paste21) | option pasteStructuredAtEnd: the app's join |
| [Paste23](../spec/paste.md#paste23) | a quote |
| [Paste26](../spec/paste.md#paste26) | option pasteStructuredAtEnd: the app's join |
| [Paste27](../spec/paste.md#paste27) | option pasteStructuredAtEnd: the app's join |
| [Paste27b](../spec/paste.md#paste27b) | option pasteStructuredOnParent: the app's after |
| [Paste27c](../spec/paste.md#paste27c) | option enterMidItem: child |
| [Paste28](../spec/paste.md#paste28) | a callout |
| [Paste29](../spec/paste.md#paste29) | option pasteStructuredAtEnd: the app's join |
| [Paste36b](../spec/paste.md#paste36b) | option pasteStructuredParagraphList: children |
| [Paste38](../spec/paste.md#paste38) | option pasteStructuredMidText: after |
| [Paste38b](../spec/paste.md#paste38b) | option pasteStructuredMidText: after |
| [Paste40](../spec/paste.md#paste40) | tag free-form |
| [Paste41](../spec/paste.md#paste41) | tag free-form |
| [Paste42](../spec/paste.md#paste42) | option pasteStructuredOnParent: the app's after |
| [Paste43](../spec/paste.md#paste43) | option enterMidItem: child |
| [Paste44](../spec/paste.md#paste44) | math (expected) |
| [Paste46](../spec/paste.md#paste46) | a fenced block with a language, tildes, or text around it in its item: WorkFlowy's code block is an item of backticks alone |
| [Paste47](../spec/paste.md#paste47) | a caret in a code block's fences |
| [Paste48](../spec/paste.md#paste48) | option pasteStructuredLines: the app's items |
| [Paste50](../spec/paste.md#paste50) | a selection across blocks |
| [Paste51](../spec/paste.md#paste51) | option pasteStructuredLines: the app's items |
| [Paste54](../spec/paste.md#paste54) | tag free-form |
| [Paste55](../spec/paste.md#paste55) | tag free-form |
| [Paste56](../spec/paste.md#paste56) | tag free-form |
| [Paste58](../spec/paste.md#paste58) | thematic break (expected) |
| [Paste59](../spec/paste.md#paste59) | option pasteStructuredOnParent: the app's after |
| [Paste63](../spec/paste.md#paste63) | option pasteStructuredListForm: the app's drop |
| [Paste65](../spec/paste.md#paste65) | a caret on a blank line |
| [Paste67](../spec/paste.md#paste67) | a caret on a blank line |
| [Paste71](../spec/paste.md#paste71) | a caret in a code block's fences |
| [Paste72](../spec/paste.md#paste72) | a quote |
| [Paste73](../spec/paste.md#paste73) | option pasteStructuredLines: the app's items |
| [Paste75](../spec/paste.md#paste75) | option pasteStructuredLines: the app's items |
| [Paste76](../spec/paste.md#paste76) | option pasteStructuredOnParent: the app's after |
| [Paste77](../spec/paste.md#paste77) | a quote |
| [Paste79](../spec/paste.md#paste79) | math (expected) |
| **placeholders.md** | |
| [Placeholder2](../spec/placeholders.md#placeholder2) | tag free-form |
| [Placeholder3](../spec/placeholders.md#placeholder3) | tag free-form |
| [Placeholder4](../spec/placeholders.md#placeholder4) | tag free-form |
| [Placeholder9](../spec/placeholders.md#placeholder9) | cursorCharLeft after cursorDocEnd |
| [Placeholder10](../spec/placeholders.md#placeholder10) | a caret on a blank line |
| [Placeholder11](../spec/placeholders.md#placeholder11) | cursorCharLeft after cursorDocEnd |
| [Placeholder12](../spec/placeholders.md#placeholder12) | a caret on a blank line |
| [Placeholder15](../spec/placeholders.md#placeholder15) | cursorCharLeft after cursorDocEnd |
| [Placeholder16](../spec/placeholders.md#placeholder16) | action selectDocStart |
| **quotes.md** | |
| [Quote1](../spec/quotes.md#quote1) | a quote |
| [Quote2](../spec/quotes.md#quote2) | a quote |
| [Quote3](../spec/quotes.md#quote3) | a quote |
| [Quote4](../spec/quotes.md#quote4) | a quote |
| [Quote5](../spec/quotes.md#quote5) | a quote |
| [Quote6](../spec/quotes.md#quote6) | a quote |
| [Quote7](../spec/quotes.md#quote7) | a callout |
| [Quote8](../spec/quotes.md#quote8) | a quote |
| [Quote9](../spec/quotes.md#quote9) | a quote |
| [Quote10](../spec/quotes.md#quote10) | a quote |
| [Quote11](../spec/quotes.md#quote11) | a quote |
| [Quote12](../spec/quotes.md#quote12) | option outdent: the app's logical |
| [Quote12b](../spec/quotes.md#quote12b) | a quote |
| [Quote13](../spec/quotes.md#quote13) | a callout |
| [Quote14](../spec/quotes.md#quote14) | a quote |
| [Quote15](../spec/quotes.md#quote15) | a quote |
| [Quote16](../spec/quotes.md#quote16) | a quote |
| [Quote17](../spec/quotes.md#quote17) | a quote |
| [Quote18](../spec/quotes.md#quote18) | a quote |
| [Quote19](../spec/quotes.md#quote19) | a quote |
| [Quote20](../spec/quotes.md#quote20) | a quote |
| [Quote21](../spec/quotes.md#quote21) | a quote |
| [Quote22](../spec/quotes.md#quote22) | a quote |
| [Quote23](../spec/quotes.md#quote23) | a quote |
| [Quote24](../spec/quotes.md#quote24) | a quote |
| [Quote25](../spec/quotes.md#quote25) | a quote |
| [Quote26](../spec/quotes.md#quote26) | a quote |
| [Quote27](../spec/quotes.md#quote27) | tag free-form |
| [Quote28](../spec/quotes.md#quote28) | tag free-form |
| [Quote29](../spec/quotes.md#quote29) | a quote |
| [Quote30](../spec/quotes.md#quote30) | a quote |
| [Quote31](../spec/quotes.md#quote31) | a quote |
| [Quote32](../spec/quotes.md#quote32) | tag free-form |
| [Quote33](../spec/quotes.md#quote33) | tag free-form |
| [Quote34](../spec/quotes.md#quote34) | tag free-form |
| [Quote35](../spec/quotes.md#quote35) | a quote |
| [Quote36](../spec/quotes.md#quote36) | a quote |
| [Quote37](../spec/quotes.md#quote37) | a quote |
| [Quote38](../spec/quotes.md#quote38) | a callout |
| [Quote39](../spec/quotes.md#quote39) | a callout |
| [Quote40](../spec/quotes.md#quote40) | a callout |
| [Quote41](../spec/quotes.md#quote41) | a callout |
| [Quote42](../spec/quotes.md#quote42) | a quote |
| [Quote43](../spec/quotes.md#quote43) | a callout |
| [Quote43b](../spec/quotes.md#quote43b) | option editInMarkup: refuse |
| [Quote44](../spec/quotes.md#quote44) | a quote |
| [Quote45](../spec/quotes.md#quote45) | a quote |
| [Quote46](../spec/quotes.md#quote46) | a quote |
| [Quote47](../spec/quotes.md#quote47) | tag free-form |
| [Quote48](../spec/quotes.md#quote48) | a quote |
| [Quote49](../spec/quotes.md#quote49) | a quote |
| [Quote50](../spec/quotes.md#quote50) | a quote |
| [Quote51](../spec/quotes.md#quote51) | tag free-form |
| [Quote52](../spec/quotes.md#quote52) | a quote |
| [Quote53](../spec/quotes.md#quote53) | a quote |
| [Quote54](../spec/quotes.md#quote54) | tag free-form |
| [Quote55](../spec/quotes.md#quote55) | option backspaceAtTopItem: refuse |
| [Quote56](../spec/quotes.md#quote56) | a quote |
| [Quote57](../spec/quotes.md#quote57) | a callout |
| [Quote58](../spec/quotes.md#quote58) | a callout |
| [Quote59](../spec/quotes.md#quote59) | tag free-form |
| [Quote60](../spec/quotes.md#quote60) | a callout |
| [Quote61](../spec/quotes.md#quote61) | a callout |
| [Quote62](../spec/quotes.md#quote62) | a callout |
| [Quote63](../spec/quotes.md#quote63) | option pasteStructuredAtEnd: the app's join |
| [Quote64](../spec/quotes.md#quote64) | a quote |
| [Quote65](../spec/quotes.md#quote65) | a quote |
| [Quote66](../spec/quotes.md#quote66) | a quote |
| [Quote67](../spec/quotes.md#quote67) | a quote |
| [Quote68](../spec/quotes.md#quote68) | a quote |
| [Quote71](../spec/quotes.md#quote71) | a callout |
| [Quote72](../spec/quotes.md#quote72) | option outdent: the app's logical |
| [Quote73](../spec/quotes.md#quote73) | tag free-form |
| [Quote74](../spec/quotes.md#quote74) | a quote |
| [Quote75](../spec/quotes.md#quote75) | a quote |
| [Quote76](../spec/quotes.md#quote76) | a quote |
| [Quote77](../spec/quotes.md#quote77) | a quote |
| [Quote78](../spec/quotes.md#quote78) | a quote |
| [Quote79](../spec/quotes.md#quote79) | a callout |
| [Quote80](../spec/quotes.md#quote80) | a quote |
| [Quote81](../spec/quotes.md#quote81) | a quote |
| [Quote82](../spec/quotes.md#quote82) | a quote |
| [Quote88](../spec/quotes.md#quote88) | a quote |
| [Quote83](../spec/quotes.md#quote83) | a quote |
| [Quote84](../spec/quotes.md#quote84) | a callout |
| [Quote85](../spec/quotes.md#quote85) | option outdent: the app's logical |
| [Quote86](../spec/quotes.md#quote86) | a quote |
| [Quote87](../spec/quotes.md#quote87) | a quote |
| [Quote69](../spec/quotes.md#quote69) | a quote |
| [Quote70](../spec/quotes.md#quote70) | a quote |
| **scenarios.md** | |
| [Scenario6](../spec/scenarios.md#scenario6) | tag free-form |
| [Scenario10](../spec/scenarios.md#scenario10) | option outdent: the app's logical |
| [Scenario15](../spec/scenarios.md#scenario15) | tag free-form |
| [Scenario17](../spec/scenarios.md#scenario17) | option pasteStructuredAtEnd: the app's join |
| [Scenario21](../spec/scenarios.md#scenario21) | tag free-form |
| [Scenario24](../spec/scenarios.md#scenario24) | tag free-form |
| **shift-enter.md** | |
| [ShiftEnter10](../spec/shift-enter.md#shiftenter10) | tag free-form |
| [ShiftEnter11](../spec/shift-enter.md#shiftenter11) | tag free-form |
| [ShiftEnter12](../spec/shift-enter.md#shiftenter12) | tag free-form |
| [ShiftEnter13](../spec/shift-enter.md#shiftenter13) | tag free-form |
| [ShiftEnter14](../spec/shift-enter.md#shiftenter14) | tag free-form |
| [ShiftEnter15](../spec/shift-enter.md#shiftenter15) | tag free-form |
| [ShiftEnter16](../spec/shift-enter.md#shiftenter16) | tag free-form |
| [ShiftEnter22](../spec/shift-enter.md#shiftenter22) | tag free-form |
| [ShiftEnter22b](../spec/shift-enter.md#shiftenter22b) | tag free-form |
| [ShiftEnter24](../spec/shift-enter.md#shiftenter24) | tag free-form |
| [ShiftEnter25](../spec/shift-enter.md#shiftenter25) | tag free-form |
| **tasks.md** | |
| [TaskEnter1](../spec/tasks.md#taskenter1) | tag free-form |
| [TaskBackspace1](../spec/tasks.md#taskbackspace1) | a caret in a task's checkbox or a heading's #s |
| [TaskBackspace4](../spec/tasks.md#taskbackspace4) | option taskEditing: block |
| [TaskBackspace5](../spec/tasks.md#taskbackspace5) | option taskEditing: text |
| [TaskBackspace6](../spec/tasks.md#taskbackspace6) | a caret in a task's checkbox or a heading's #s |
| [TaskBackspace7](../spec/tasks.md#taskbackspace7) | option taskEditing: block |
| **typing.md** | |
| [Typing1](../spec/typing.md#typing1) | tag free-form |
| [Typing2](../spec/typing.md#typing2) | tag free-form |
| [Typing3](../spec/typing.md#typing3) | tag free-form |
| [Typing4](../spec/typing.md#typing4) | option editInMarkup: refuse |
| **undo.md** | |
| [Undo2](../spec/undo.md#undo2) | tag free-form |
| [Undo3](../spec/undo.md#undo3) | tag free-form |
| **z-open.md** | |
| [Open2](../spec/z-open.md#open2) | a caret in a task's checkbox or a heading's #s |
