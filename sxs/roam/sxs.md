---
type: "SxS"
app: "roam"
version: "0.13.12 (39a714f3; API 1.1.5)"
url: "https://roamresearch.com/#/app/help"
model: "block"
command: "node sxs/run.ts roam"
elapsed_s: 165
---

# Roam vs ourus

Summary:

|  | agree | caret | whitespace | disagree | error | skipped | total |
| --- | --- | --- | --- | --- | --- | --- | --- |
| original | 112 | [13](#caret-13) | [12](#whitespace-12) | [12](#disagree-12) |  |  | **149** |
| adapted | 92 | [12](#adapted-caret-12) | [18](#adapted-whitespace-18) | [23](#adapted-disagree-23) |  |  | **145** |
| **total** | **204 (26%)** | **25 (3.2%)** | **30 (3.8%)** | **35 (4.4%)** | **0 (0%)** | **[493](#skipped-493) (63%)** | **787** |

Per-file:

|  | agree | caret | whitespace | disagree | error | skipped | total | original | adapted |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [backspace.md](../../spec/backspace.md) | 26 |  |  | 2 |  | 37 | **65** | 16 | 12 |
| [cursor.md](../../spec/cursor.md) | 20 | 7 |  |  |  | 9 | **36** | 12 | 15 |
| [del.md](../../spec/del.md) | 14 |  |  |  |  | 34 | **48** | 10 | 4 |
| [delete-subtree.md](../../spec/delete-subtree.md) |  |  |  |  |  | 10 | **10** |  |  |
| [duplicate-subtree.md](../../spec/duplicate-subtree.md) |  |  |  |  |  | 8 | **8** |  |  |
| [enter.md](../../spec/enter.md) | 16 |  | 10 | 5 |  | 28 | **59** | 16 | 15 |
| [fences.md](../../spec/fences.md) |  |  |  |  |  | 51 | **51** |  |  |
| [gaps.md](../../spec/gaps.md) | 11 | 1 |  |  |  | 7 | **19** |  | 12 |
| [indent.md](../../spec/indent.md) | 16 |  |  | 1 |  | 13 | **30** | 12 | 5 |
| [move-subtree-down.md](../../spec/move-subtree-down.md) | 17 |  |  | 1 |  | 19 | **37** | 9 | 9 |
| [move-subtree-up.md](../../spec/move-subtree-up.md) | 18 |  |  |  |  | 20 | **38** | 8 | 10 |
| [obsidian-true-outliner.md](../../spec/obsidian-true-outliner.md) | 23 | 2 | 6 | 9 |  | 27 | **67** | 23 | 17 |
| [outdent.md](../../spec/outdent.md) | 7 |  |  |  |  | 22 | **29** | 5 | 2 |
| [paste.md](../../spec/paste.md) | 11 | 14 | 2 | 10 |  | 70 | **107** | 15 | 22 |
| [placeholders.md](../../spec/placeholders.md) | 6 |  | 1 |  |  | 9 | **16** | 2 | 5 |
| [quotes.md](../../spec/quotes.md) |  |  |  |  |  | 90 | **90** |  |  |
| [scenarios.md](../../spec/scenarios.md) | 13 | 1 |  | 4 |  | 6 | **24** | 12 | 6 |
| [shift-enter.md](../../spec/shift-enter.md) | 3 |  | 11 | 1 |  | 11 | **26** | 6 | 9 |
| [tasks.md](../../spec/tasks.md) |  |  |  | 2 |  | 15 | **17** |  | 2 |
| [typing.md](../../spec/typing.md) |  |  |  |  |  | 4 | **4** |  |  |
| [undo.md](../../spec/undo.md) | 3 |  |  |  |  | 2 | **5** | 3 |  |
| [z-open.md](../../spec/z-open.md) |  |  |  |  |  | 1 | **1** |  |  |
| **total** | **204 (26%)** | **25 (3.2%)** | **30 (3.8%)** | **35 (4.4%)** | **0 (0%)** | **493 (63%)** | **787** | **149 (19%)** | **145 (18%)** |

## Disagree (12)

### [Backspace17](../../spec/backspace.md#backspace17)

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

### [Backspace41](../../spec/backspace.md#backspace41)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
<tr><th>roam</th><th>ourus</th></tr>
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
<tr><th>roam</th><th>ourus</th></tr>
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

### [Indent4](../../spec/indent.md#indent4)

> indent

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- 1. a
- 2. b┃
- 3. c
```

</td><td>

```buffer
- 1. a
  - b┃
- 2. c
```

</td><td>

```buffer
- 1. a
  - 1. b┃
- 2. c
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
<tr><th>roam</th><th>ourus</th></tr>
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

### [Children move to the joined node](../../spec/obsidian-true-outliner.md#children-move-to-the-joined-node)

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

### [Delete forward absorbs child with grandchildren](../../spec/obsidian-true-outliner.md#delete-forward-absorbs-child-with-grandchildren)

> deleteContentForward

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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

### [Paste26](../../spec/paste.md#paste26)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
- x
```

</td><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- ax┃
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

### [Paste49](../../spec/paste.md#paste49)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
- a
- b
```

</td><td>

```buffer
- «placeholder»
- next
```

</td><td>

```buffer
- placeholder
- a┃
- b
- next
```

</td><td>

```buffer
- a
- b┃
- next
```

</td></tr>
</table>

### [Scenario7](../../spec/scenarios.md#scenario7)

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
<tr><th>roam</th><th>ourus</th></tr>
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
<tr><th>roam</th><th>ourus</th></tr>
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
<tr><th>roam</th><th>ourus</th></tr>
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
<tr><th>roam</th><th>ourus</th></tr>
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
<tr><th>roam</th><th>ourus</th></tr>
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
<tr><th>roam</th><th>ourus</th></tr>
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

### [Scenario11](../../spec/scenarios.md#scenario11)

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
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
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
<tr><th>roam</th><th>ourus</th></tr>
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
<tr><th>roam</th><th>ourus</th></tr>
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

## Whitespace (12)

### [Enter1](../../spec/enter.md#enter1)

> enter

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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

### [Enter16](../../spec/enter.md#enter16)

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

### [Enter35](../../spec/enter.md#enter35)

> enter

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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

### [S13](../../spec/obsidian-true-outliner.md#s13)

> shiftEnter

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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

### [Shift-Enter, Tab, then Enter](../../spec/obsidian-true-outliner.md#shift-enter-tab-then-enter)

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

### [Paste78](../../spec/paste.md#paste78)

> pastePlain

<table>
<tr><th>clipboard</th><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
<tr><th>roam</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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

## Caret (13)

### [CursorUp3](../../spec/cursor.md#cursorup3)

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

### [CursorDown4](../../spec/cursor.md#cursordown4)

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

### [Pasted list takes space indent unit](../../spec/obsidian-true-outliner.md#pasted-list-takes-space-indent-unit)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
- a
	- b
		- c
```

</td><td>

```buffer
- top
  - sib┃
```

</td><td>

```buffer
- top
  - sib
  - a┃
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

### [Pasted list takes tab indent unit](../../spec/obsidian-true-outliner.md#pasted-list-takes-tab-indent-unit)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
- a
  - b
    - c
```

</td><td>

```buffer
- top
  - sib┃
```

</td><td>

```buffer
- top
  - sib
  - a┃
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

### [Paste2](../../spec/paste.md#paste2)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
- x
- y
```

</td><td>

```buffer
- 1. a┃
- 2. b
```

</td><td>

```buffer
- 1. a
- 2. x┃
- 3. y
- 4. b
```

</td><td>

```buffer
- 1. a
- 2. x
- 3. y┃
- 4. b
```

</td></tr>
</table>

### [Paste13b](../../spec/paste.md#paste13b)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
- a
- x┃
- y
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

### [Paste15c](../../spec/paste.md#paste15c)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
1. x
2. y
```

</td><td>

```buffer
- ┃
- b
```

</td><td>

```buffer
- x┃
- y
- b
```

</td><td>

```buffer
- x
- y┃
- b
```

</td></tr>
</table>

### [Paste16](../../spec/paste.md#paste16)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
- x
- y
```

</td><td>

```buffer
- 1. ┃
- 2. b
```

</td><td>

```buffer
- 1. x┃
- 2. y
- 3. b
```

</td><td>

```buffer
- 1. x
- 2. y┃
- 3. b
```

</td></tr>
</table>

### [Paste17c](../../spec/paste.md#paste17c)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
1. x
   1. x1
2. y
```

</td><td>

```buffer
- a┃
```

</td><td>

```buffer
- a
- x┃
  - 1. x1
- y
```

</td><td>

```buffer
- a
- x
  - 1. x1
- y┃
```

</td></tr>
</table>

### [Paste18](../../spec/paste.md#paste18)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
1. x
2. y
```

</td><td>

```buffer
- 1. a┃
- 2. b
```

</td><td>

```buffer
- 1. a
- 2. x┃
- 3. y
- 4. b
```

</td><td>

```buffer
- 1. a
- 2. x
- 3. y┃
- 4. b
```

</td></tr>
</table>

### [Paste38b](../../spec/paste.md#paste38b)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
  - x┃
    - y
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

### [Paste39](../../spec/paste.md#paste39)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
- x┃
- y
```

</td><td>

```buffer
- a
- x
- y┃
```

</td></tr>
</table>

### [Scenario17](../../spec/scenarios.md#scenario17)

<table>
<tr><th>clipboard</th><th>buffer</th></tr>
<tr valign="top"><td>

```clipboard
bread
butter
```

</td><td>

```buffer
- milk┃
```

</td></tr>
</table>

> enter

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- milk
- ┃
```

</td></tr>
</table>

> pasteStructured

<table>
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- milk
- bread┃
- butter
```

</td><td>

```buffer
- milk
- bread
- butter┃
```

</td></tr>
</table>

> cursorDocStart cursorLineBoundaryForward pasteStructured

<table>
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- milk
- bread┃
- butter
- bread
- butter
```

</td><td>

```buffer
- milk
- bread
- butter┃
- bread
- butter
```

</td></tr>
</table>

## Adapted: disagree (23)

### [Enter42](../../spec/enter.md#enter42)

> enter

Adapted: escape, heading, paragraph, setext heading

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
<tr><th>roam</th><th>ourus</th></tr>
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
<tr><th>roam</th><th>ourus</th></tr>
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
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  
- ## ┃two
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

### [E17](../../spec/obsidian-true-outliner.md#e17)

> enter

Adapted: heading, paragraph, setext heading

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
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] alpha┃ beta
```

</td><td>

```buffer
- [ ] alpha
- ┃ beta
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

### [Checked task gives unchecked new item](../../spec/obsidian-true-outliner.md#checked-task-gives-unchecked-new-item)

> enter

Adapted: task

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [x] done┃
```

</td><td>

```buffer
- [x] done
- ┃
```

</td><td>

```buffer
- [x] done
- [ ] ┃
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
- [x] done
- [ ] ┃
```

</td></tr>
</table>

### [Split title above a subheading](../../spec/obsidian-true-outliner.md#split-title-above-a-subheading)

> enter

Adapted: heading, paragraph

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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

### [Split title above an existing paragraph](../../spec/obsidian-true-outliner.md#split-title-above-an-existing-paragraph)

> enter

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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

### [An empty ordered child kept with a blank line](../../spec/obsidian-true-outliner.md#an-empty-ordered-child-kept-with-a-blank-line)

Adapted: blank lines

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- 1. a┃
- 2. b
```

</td></tr>
</table>

> enter indent

<table>
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- 1. a
  - ┃
- 2. b
```

</td><td>

```buffer
- 1. a
  - 1. ┃
- 2. b
```

</td></tr>
</table>

> cursorDocStart

<table>
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- 1. ┃a
  - 
- 2. b
```

</td><td>

```buffer
- 1. a
  - 1. 
- 2. b
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

### [Paste32](../../spec/paste.md#paste32)

> pasteStructured

Adapted: blank lines, heading, paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
<tr><th>clipboard</th><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
<tr><th>clipboard</th><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
<tr><th>clipboard</th><th>buffer</th><th>roam</th><th>ourus</th></tr>
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

### [Paste53](../../spec/paste.md#paste53)

> pasteStructured

Adapted: blank lines, heading, paragraph, setext heading

<table>
<tr><th>clipboard</th><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
<tr><th>clipboard</th><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
- ## Summary┃
  - The fix:
    - parser
    - test
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

### [Paste58](../../spec/paste.md#paste58)

> pasteStructured

Adapted: blank lines, heading, paragraph, setext heading, thematic break

<table>
<tr><th>clipboard</th><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
---
title: x
---
```

</td><td>

```buffer
- Intro
- ┃
- Outro
```

</td><td>

```buffer
- Intro
- ---┃
- title: x
- ---
- Outro
```

</td><td>

```buffer
- Intro
- ---
- ## title: x┃
  - Outro
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

### [Paste61](../../spec/paste.md#paste61)

> pasteStructured

Adapted: heading, paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Trip
- ┃
- Pack light.
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
<tr><th>roam</th><th>ourus</th></tr>
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
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Plan
- # revise 
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
<tr><th>roam</th><th>ourus</th></tr>
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

### [TaskEnter3](../../spec/tasks.md#taskenter3)

> enter

Adapted: task

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] abc ┃# x
```

</td><td>

```buffer
- [ ] abc 
- ┃# x
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
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [x] a┃ b
  - c
```

</td><td>

```buffer
- [x] a
- ┃ b
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

## Adapted: whitespace (18)

### [Enter8](../../spec/enter.md#enter8)

> enter

Adapted: escape

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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

### [E9](../../spec/obsidian-true-outliner.md#e9)

> enter

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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

### [S4](../../spec/obsidian-true-outliner.md#s4)

> shiftEnter

Adapted: paragraph

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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

### [Paste68](../../spec/paste.md#paste68)

> pastePlain

Adapted: escape, paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
- px
  ┃ ---
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

### [ShiftEnter5](../../spec/shift-enter.md#shiftenter5)

> shiftEnter

Adapted: escape

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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

## Adapted: caret (12)

### [CursorUp1](../../spec/cursor.md#cursorup1)

> cursorLineUp

Adapted: paragraph

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ab┃
```

</td><td>

```buffer
- ab┃
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

### [CursorDown1](../../spec/cursor.md#cursordown1)

> cursorLineDown cursorLineDown

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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

### [CursorHome8](../../spec/cursor.md#cursorhome8)

> cursorLineBoundaryBackward

Adapted: task

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

### [CursorHome9](../../spec/cursor.md#cursorhome9)

> cursorLineBoundaryBackward

Adapted: task

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

### [Gap13](../../spec/gaps.md#gap13)

> pasteStructured

Adapted: blank lines, paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
- a
- b
```

</td><td>

```buffer
- t┃
- para
```

</td><td>

```buffer
- t
- a┃
- b
- para
```

</td><td>

```buffer
- t
- a
- b┃
- para
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
- t
- a
- b┃

para
```

</td></tr>
</table>

### [Paste19](../../spec/paste.md#paste19)

> pasteStructured

Adapted: heading, paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
- # h┃
  - text
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

### [Paste20](../../spec/paste.md#paste20)

> pasteStructured

Adapted: blank lines, paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
- Notes
  - p┃
  - q
  - x
  - z
```

</td><td>

```buffer
- Notes
  - p
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
Notes

- p
- q┃
- x
- z
```

</td></tr>
</table>

### [Paste21](../../spec/paste.md#paste21)

> pasteStructured

Adapted: paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
- p
- q
```

</td><td>

```buffer
- Notes┃
  - x
```

</td><td>

```buffer
- Notes
  - p┃
  - q
  - x
```

</td><td>

```buffer
- Notes
  - p
  - q┃
  - x
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
```

</td><td>

```buffer
Notes
- p
- q┃
- x
```

</td></tr>
</table>

### [Paste27](../../spec/paste.md#paste27)

> pasteStructured

Adapted: task

<table>
<tr><th>clipboard</th><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
  - a┃
  - b
  - g
```

</td><td>

```buffer
- [ ] t
  - a
  - b┃
  - g
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
    - a
    - b┃
    - g
```

</td></tr>
</table>

### [Paste59](../../spec/paste.md#paste59)

> pasteStructured

Adapted: blank lines, heading

<table>
<tr><th>clipboard</th><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
- # Groceries
  - milk┃
  - eggs
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

### [Paste60](../../spec/paste.md#paste60)

> pasteStructured

Adapted: blank lines

<table>
<tr><th>clipboard</th><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
- x
- y
```

</td><td>

```buffer
- a
- ┃
```

</td><td>

```buffer
- a
- x┃
- y
```

</td><td>

```buffer
- a
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
- a

- ┃
```

</td><td>

```buffer
- a

- x

- y┃
```

</td></tr>
</table>

## Skipped (493)

| example | why |
| --- | --- |
| **backspace.md** | |
| [Backspace2](../../spec/backspace.md#backspace2) | a caret in a marker |
| [Backspace4](../../spec/backspace.md#backspace4) | tag markup-heading |
| [Backspace12](../../spec/backspace.md#backspace12) | tag free-form |
| [Backspace12b](../../spec/backspace.md#backspace12b) | tag free-form |
| [Backspace12c](../../spec/backspace.md#backspace12c) | tag free-form |
| [Backspace14](../../spec/backspace.md#backspace14) | tag free-form |
| [Backspace16](../../spec/backspace.md#backspace16) | code block |
| [Backspace17b](../../spec/backspace.md#backspace17b) | option emptyItemWithChildren: the app's refuse |
| [Backspace17c](../../spec/backspace.md#backspace17c) | option emptyItemWithChildren: the app's refuse |
| [Backspace17e](../../spec/backspace.md#backspace17e) | tag free-form |
| [Backspace18](../../spec/backspace.md#backspace18) | tag free-form |
| [Backspace18b](../../spec/backspace.md#backspace18b) | tag free-form |
| [Backspace18c](../../spec/backspace.md#backspace18c) | tag free-form |
| [Backspace18d](../../spec/backspace.md#backspace18d) | tag free-form |
| [Backspace18e](../../spec/backspace.md#backspace18e) | tag markup-heading |
| [Backspace18f](../../spec/backspace.md#backspace18f) | tag markup-heading |
| [Backspace18g](../../spec/backspace.md#backspace18g) | tag markup-heading |
| [Backspace19](../../spec/backspace.md#backspace19) | tag free-form |
| [Backspace20](../../spec/backspace.md#backspace20) | tag free-form |
| [Backspace21b](../../spec/backspace.md#backspace21b) | option deleteAtGap: gap |
| [Backspace23](../../spec/backspace.md#backspace23) | tag free-form |
| [Backspace24](../../spec/backspace.md#backspace24) | code block |
| [Backspace27](../../spec/backspace.md#backspace27) | tag free-form |
| [Backspace28](../../spec/backspace.md#backspace28) | code block |
| [Backspace31](../../spec/backspace.md#backspace31) | a selection across blocks |
| [Backspace33](../../spec/backspace.md#backspace33) | tag free-form |
| [Backspace34](../../spec/backspace.md#backspace34) | option backspaceAtTopItem: refuse |
| [Backspace35](../../spec/backspace.md#backspace35) | tag free-form |
| [Backspace38](../../spec/backspace.md#backspace38) | tag free-form |
| [Backspace40](../../spec/backspace.md#backspace40) | a list numbered in part, or not from 1 |
| [SoftBackspace1](../../spec/backspace.md#softbackspace1) | tag markup-task |
| [SoftBackspace3](../../spec/backspace.md#softbackspace3) | tag markup-heading |
| [SoftBackspace4](../../spec/backspace.md#softbackspace4) | tag markup-heading |
| [SoftBackspace6](../../spec/backspace.md#softbackspace6) | tag markup-heading |
| [SoftBackspace7](../../spec/backspace.md#softbackspace7) | tag free-form |
| [SoftBackspace8](../../spec/backspace.md#softbackspace8) | tag free-form |
| [SoftBackspace9](../../spec/backspace.md#softbackspace9) | code block |
| **cursor.md** | |
| [CursorDown2](../../spec/cursor.md#cursordown2) | indented code |
| [CursorHome3](../../spec/cursor.md#cursorhome3) | a caret in a marker |
| [CursorHome4](../../spec/cursor.md#cursorhome4) | a caret in a marker |
| [CursorHome7](../../spec/cursor.md#cursorhome7) | a list numbered in part, or not from 1 |
| [CursorHome11](../../spec/cursor.md#cursorhome11) | a quote |
| [CursorHome15](../../spec/cursor.md#cursorhome15) | a caret in a marker |
| [CursorHome16](../../spec/cursor.md#cursorhome16) | a quote |
| [CursorHome17](../../spec/cursor.md#cursorhome17) | a callout |
| [CursorDocEndLeft1](../../spec/cursor.md#cursordocendleft1) | cursorCharLeft after cursorDocEnd |
| **del.md** | |
| [Delete4](../../spec/del.md#delete4) | tag markup-heading |
| [Delete4b](../../spec/del.md#delete4b) | tag markup-heading |
| [Delete5](../../spec/del.md#delete5) | option emptyItemWithChildren: the app's refuse |
| [Delete5b](../../spec/del.md#delete5b) | option emptyItemWithChildren: the app's refuse |
| [Delete5c](../../spec/del.md#delete5c) | option emptyItemWithChildren: the app's refuse |
| [Delete5d](../../spec/del.md#delete5d) | option emptyItemWithChildren: the app's refuse |
| [Delete9](../../spec/del.md#delete9) | tag free-form |
| [Delete10](../../spec/del.md#delete10) | a quote |
| [Delete11](../../spec/del.md#delete11) | indented code |
| [Delete13](../../spec/del.md#delete13) | tag markup-heading |
| [Delete13b](../../spec/del.md#delete13b) | tag markup-heading |
| [Delete13c](../../spec/del.md#delete13c) | tag free-form |
| [Delete13d](../../spec/del.md#delete13d) | tag free-form |
| [Delete13e](../../spec/del.md#delete13e) | tag free-form |
| [Delete13f](../../spec/del.md#delete13f) | tag markup-heading |
| [Delete13g](../../spec/del.md#delete13g) | tag markup-heading |
| [Delete14](../../spec/del.md#delete14) | tag free-form |
| [Delete15](../../spec/del.md#delete15) | tag markup-heading |
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
| [Delete19](../../spec/del.md#delete19) | tag markup-task |
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
| [DuplicateSubtree8](../../spec/duplicate-subtree.md#duplicatesubtree8) | action duplicateSubtree |
| **enter.md** | |
| [Enter3b](../../spec/enter.md#enter3b) | option enterMidItem: child |
| [Enter3c](../../spec/enter.md#enter3c) | a list numbered in part, or not from 1 |
| [Enter6](../../spec/enter.md#enter6) | tag free-form |
| [Enter7](../../spec/enter.md#enter7) | option enterOnEmptyItem: the app's outdent |
| [Enter7b](../../spec/enter.md#enter7b) | tag free-form |
| [Enter14](../../spec/enter.md#enter14) | tag free-form |
| [Enter15](../../spec/enter.md#enter15) | option enterOnEmptyItem: the app's outdent |
| [Enter15b](../../spec/enter.md#enter15b) | tag free-form |
| [Enter23](../../spec/enter.md#enter23) | indented code |
| [Enter25](../../spec/enter.md#enter25) | a list numbered in part, or not from 1 |
| [Enter26b](../../spec/enter.md#enter26b) | option enterAtTextStart: stay |
| [Enter27](../../spec/enter.md#enter27) | option enterOnEmptyItem: the app's outdent |
| [Enter28](../../spec/enter.md#enter28) | option enterOnEmptyItem: the app's outdent |
| [Enter29b](../../spec/enter.md#enter29b) | option enterAtTextStart: stay |
| [Enter32](../../spec/enter.md#enter32) | tag markup-heading |
| [Enter32b](../../spec/enter.md#enter32b) | tag markup-heading |
| [Enter33b](../../spec/enter.md#enter33b) | option enterAtTextStart: stay |
| [Enter34](../../spec/enter.md#enter34) | a caret in a marker |
| [Enter36b](../../spec/enter.md#enter36b) | a quote |
| [Enter37](../../spec/enter.md#enter37) | a caret on a blank line |
| [Enter40](../../spec/enter.md#enter40) | tag free-form |
| [Enter41](../../spec/enter.md#enter41) | tag free-form |
| [Enter45](../../spec/enter.md#enter45) | tag markup-heading |
| [Enter46](../../spec/enter.md#enter46) | a quote |
| [Enter47](../../spec/enter.md#enter47) | tag free-form |
| [Enter49](../../spec/enter.md#enter49) | table |
| [Enter50](../../spec/enter.md#enter50) | tag free-form |
| [Enter53](../../spec/enter.md#enter53) | tag free-form |
| **fences.md** | |
| [Fence1](../../spec/fences.md#fence1) | code block |
| [Fence2](../../spec/fences.md#fence2) | code block |
| [Fence3](../../spec/fences.md#fence3) | code block |
| [Fence4](../../spec/fences.md#fence4) | a quote |
| [Fence5](../../spec/fences.md#fence5) | code block |
| [Fence6](../../spec/fences.md#fence6) | code block |
| [Fence7](../../spec/fences.md#fence7) | code block |
| [Fence7b](../../spec/fences.md#fence7b) | code block |
| [Fence7c](../../spec/fences.md#fence7c) | code block |
| [Fence7d](../../spec/fences.md#fence7d) | code block |
| [Fence8](../../spec/fences.md#fence8) | code block |
| [Fence9](../../spec/fences.md#fence9) | code block |
| [Fence10](../../spec/fences.md#fence10) | option handleFenceContents: false |
| [Fence11](../../spec/fences.md#fence11) | option handleFenceContents: false |
| [Fence12](../../spec/fences.md#fence12) | code block |
| [Fence13](../../spec/fences.md#fence13) | code block |
| [Fence14](../../spec/fences.md#fence14) | code block |
| [Fence15](../../spec/fences.md#fence15) | code block |
| [Fence16](../../spec/fences.md#fence16) | code block |
| [Fence17](../../spec/fences.md#fence17) | code block |
| [Fence18](../../spec/fences.md#fence18) | code block |
| [Fence19](../../spec/fences.md#fence19) | code block |
| [Fence20](../../spec/fences.md#fence20) | a quote |
| [Fence21](../../spec/fences.md#fence21) | code block |
| [Fence22](../../spec/fences.md#fence22) | code block |
| [Fence23](../../spec/fences.md#fence23) | code block |
| [Fence24](../../spec/fences.md#fence24) | code block |
| [Fence25](../../spec/fences.md#fence25) | code block |
| [Fence26](../../spec/fences.md#fence26) | code block |
| [Fence27](../../spec/fences.md#fence27) | code block |
| [Fence28](../../spec/fences.md#fence28) | code block |
| [Fence29](../../spec/fences.md#fence29) | code block |
| [Fence30](../../spec/fences.md#fence30) | code block |
| [Fence31](../../spec/fences.md#fence31) | code block |
| [Fence32](../../spec/fences.md#fence32) | code block |
| [Fence33](../../spec/fences.md#fence33) | code block |
| [Fence34](../../spec/fences.md#fence34) | code block |
| [Fence35](../../spec/fences.md#fence35) | code block |
| [Fence36](../../spec/fences.md#fence36) | code block |
| [Fence37](../../spec/fences.md#fence37) | code block |
| [Fence38](../../spec/fences.md#fence38) | code block |
| [Fence39](../../spec/fences.md#fence39) | code block |
| [Fence40](../../spec/fences.md#fence40) | a quote |
| [Fence41](../../spec/fences.md#fence41) | code block |
| [Fence48](../../spec/fences.md#fence48) | code block |
| [Fence42](../../spec/fences.md#fence42) | math |
| [Fence43](../../spec/fences.md#fence43) | a quote |
| [Fence44](../../spec/fences.md#fence44) | indented code |
| [Fence45](../../spec/fences.md#fence45) | math |
| [Fence46](../../spec/fences.md#fence46) | a quote |
| [Fence47](../../spec/fences.md#fence47) | math |
| **gaps.md** | |
| [Gap7](../../spec/gaps.md#gap7) | code block |
| [Gap14](../../spec/gaps.md#gap14) | a caret on a blank line |
| [Gap15](../../spec/gaps.md#gap15) | a caret on a blank line |
| [Gap16](../../spec/gaps.md#gap16) | a caret on a blank line |
| [Gap17](../../spec/gaps.md#gap17) | a caret on a blank line |
| [Gap18](../../spec/gaps.md#gap18) | a caret on a blank line |
| [Gap19](../../spec/gaps.md#gap19) | frontmatter |
| **indent.md** | |
| [Indent9](../../spec/indent.md#indent9) | a selection across blocks |
| [Indent12](../../spec/indent.md#indent12) | tag free-form |
| [Indent13](../../spec/indent.md#indent13) | code block |
| [Indent16](../../spec/indent.md#indent16) | tag free-form |
| [Indent18](../../spec/indent.md#indent18) | option bullet: + |
| [Indent20](../../spec/indent.md#indent20) | code block |
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
| [MoveDown21](../../spec/move-subtree-down.md#movedown21) | code block |
| [MoveDown23](../../spec/move-subtree-down.md#movedown23) | a list numbered in part, or not from 1 |
| [MoveDown25](../../spec/move-subtree-down.md#movedown25) | tag free-form |
| [MoveDown28](../../spec/move-subtree-down.md#movedown28) | tag free-form |
| [MoveDown29](../../spec/move-subtree-down.md#movedown29) | a list numbered in part, or not from 1 |
| [MoveDown30](../../spec/move-subtree-down.md#movedown30) | a list numbered in part, or not from 1 |
| [MoveDown32](../../spec/move-subtree-down.md#movedown32) | a caret in a marker |
| [MoveDown34](../../spec/move-subtree-down.md#movedown34) | code block |
| [MoveDown36](../../spec/move-subtree-down.md#movedown36) | tag free-form |
| [MoveDown37](../../spec/move-subtree-down.md#movedown37) | code block |
| **move-subtree-up.md** | |
| [MoveUp7](../../spec/move-subtree-up.md#moveup7) | tag free-form |
| [MoveUp10](../../spec/move-subtree-up.md#moveup10) | a selection across blocks |
| [MoveUp11](../../spec/move-subtree-up.md#moveup11) | a selection across blocks |
| [MoveUp12](../../spec/move-subtree-up.md#moveup12) | tag free-form |
| [MoveUp13](../../spec/move-subtree-up.md#moveup13) | code block |
| [MoveUp15](../../spec/move-subtree-up.md#moveup15) | a list numbered in part, or not from 1 |
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
| [MoveUp37](../../spec/move-subtree-up.md#moveup37) | math |
| [MoveUp38](../../spec/move-subtree-up.md#moveup38) | math |
| **obsidian-true-outliner.md** | |
| [Renumbering stops at a delimiter change](../../spec/obsidian-true-outliner.md#renumbering-stops-at-a-delimiter-change) | a list numbered in part, or not from 1 |
| [Split item becomes first tab-indented child](../../spec/obsidian-true-outliner.md#split-item-becomes-first-tab-indented-child) | option enterMidItem: child |
| [E11](../../spec/obsidian-true-outliner.md#e11) | option enterMidItem: child |
| [E15](../../spec/obsidian-true-outliner.md#e15) | tag free-form |
| [E18](../../spec/obsidian-true-outliner.md#e18) | tag markup-heading |
| [Empty paragraph before a section list](../../spec/obsidian-true-outliner.md#empty-paragraph-before-a-section-list) | tag free-form |
| [#267, E5](../../spec/obsidian-true-outliner.md#267-e5) | a quote |
| [S5](../../spec/obsidian-true-outliner.md#s5) | tag free-form |
| [Line break in setext title refused](../../spec/obsidian-true-outliner.md#line-break-in-setext-title-refused) | tag free-form |
| [Line break in setext underline refused](../../spec/obsidian-true-outliner.md#line-break-in-setext-underline-refused) | tag markup-heading |
| [Leaving the place removes it](../../spec/obsidian-true-outliner.md#leaving-the-place-removes-it) | tag free-form |
| [Backspace before the checkbox](../../spec/obsidian-true-outliner.md#backspace-before-the-checkbox) | tag markup-task |
| [Joining across ordered runs](../../spec/obsidian-true-outliner.md#joining-across-ordered-runs) | a list numbered in part, or not from 1 |
| [List starting at 3 keeps its start](../../spec/obsidian-true-outliner.md#list-starting-at-3-keeps-its-start) | a list numbered in part, or not from 1 |
| [Outdented child leaves quote above alone](../../spec/obsidian-true-outliner.md#outdented-child-leaves-quote-above-alone) | a quote |
| [Indented item keeps its quote](../../spec/obsidian-true-outliner.md#indented-item-keeps-its-quote) | a quote |
| [Outdented item keeps its quote](../../spec/obsidian-true-outliner.md#outdented-item-keeps-its-quote) | a quote |
| [Outdented item keeps its code block](../../spec/obsidian-true-outliner.md#outdented-item-keeps-its-code-block) | indented code |
| [Blank line added below a quote](../../spec/obsidian-true-outliner.md#blank-line-added-below-a-quote) | a quote |
| [No blank line needed after a fence](../../spec/obsidian-true-outliner.md#no-blank-line-needed-after-a-fence) | code block |
| [No blank line needed before a fence](../../spec/obsidian-true-outliner.md#no-blank-line-needed-before-a-fence) | code block |
| [Carried place removed on leaving](../../spec/obsidian-true-outliner.md#carried-place-removed-on-leaving) | tag free-form |
| [Doubly indented place removed on leaving](../../spec/obsidian-true-outliner.md#doubly-indented-place-removed-on-leaving) | tag free-form |
| [Empty paragraph and blank lines removed](../../spec/obsidian-true-outliner.md#empty-paragraph-and-blank-lines-removed) | tag free-form |
| [Indented list under paragraph restored](../../spec/obsidian-true-outliner.md#indented-list-under-paragraph-restored) | tag free-form |
| [Pasted quote set off from paragraph](../../spec/obsidian-true-outliner.md#pasted-quote-set-off-from-paragraph) | a quote |
| [Pasted list and block become children](../../spec/obsidian-true-outliner.md#pasted-list-and-block-become-children) | a quote |
| **outdent.md** | |
| [Outdent4](../../spec/outdent.md#outdent4) | tag free-form |
| [Outdent5](../../spec/outdent.md#outdent5) | tag free-form |
| [Outdent6](../../spec/outdent.md#outdent6) | option outdent: the app's logical |
| [Outdent7](../../spec/outdent.md#outdent7) | option outdent: the app's logical |
| [Outdent8](../../spec/outdent.md#outdent8) | a selection across blocks |
| [Outdent10](../../spec/outdent.md#outdent10) | a selection across blocks |
| [Outdent11](../../spec/outdent.md#outdent11) | tag free-form |
| [Outdent12](../../spec/outdent.md#outdent12) | tag free-form |
| [Outdent13](../../spec/outdent.md#outdent13) | option outdent: the app's logical |
| [Outdent14](../../spec/outdent.md#outdent14) | a caret in a marker |
| [DirectOutdent1](../../spec/outdent.md#directoutdent1) | option outdent: the app's logical |
| [DirectOutdent2](../../spec/outdent.md#directoutdent2) | tag free-form |
| [DirectOutdent3](../../spec/outdent.md#directoutdent3) | tag free-form |
| [DirectOutdent4](../../spec/outdent.md#directoutdent4) | option outdent: the app's logical |
| [LogicalOutdent2](../../spec/outdent.md#logicaloutdent2) | tag free-form |
| [LogicalOutdent3](../../spec/outdent.md#logicaloutdent3) | tag free-form |
| [LogicalOutdent5](../../spec/outdent.md#logicaloutdent5) | tag free-form |
| [Outdent16](../../spec/outdent.md#outdent16) | tag free-form |
| [Outdent17](../../spec/outdent.md#outdent17) | tag free-form |
| [Outdent17b](../../spec/outdent.md#outdent17b) | tag free-form |
| [Outdent18](../../spec/outdent.md#outdent18) | tag free-form |
| [Outdent19](../../spec/outdent.md#outdent19) | tag free-form |
| **paste.md** | |
| [Paste1](../../spec/paste.md#paste1) | code block (expected) |
| [Paste2b](../../spec/paste.md#paste2b) | option pasteStructuredListForm: own |
| [Paste6](../../spec/paste.md#paste6) | tag free-form |
| [Paste7](../../spec/paste.md#paste7) | option pasteStructuredLines: the app's items |
| [Paste8](../../spec/paste.md#paste8) | option pasteStructuredMidText: the app's after |
| [Paste8b](../../spec/paste.md#paste8b) | option pasteStructuredMidText: the app's after |
| [Paste8c](../../spec/paste.md#paste8c) | option pasteStructuredAtEnd: join |
| [Paste9](../../spec/paste.md#paste9) | code block (expected) |
| [Paste10](../../spec/paste.md#paste10) | option pasteStructuredLines: the app's items |
| [Paste11](../../spec/paste.md#paste11) | code block (expected) |
| [Paste12](../../spec/paste.md#paste12) | a quote |
| [Paste13](../../spec/paste.md#paste13) | option pasteStructuredListForm: the app's drop |
| [Paste13c](../../spec/paste.md#paste13c) | option pasteStructuredListForm: own |
| [Paste13d](../../spec/paste.md#paste13d) | option pasteStructuredAtEnd: join |
| [Paste13e](../../spec/paste.md#paste13e) | option pasteStructuredAtEnd: join |
| [Paste14](../../spec/paste.md#paste14) | option pasteStructuredListForm: the app's drop |
| [Paste14b](../../spec/paste.md#paste14b) | option pasteStructuredOnParent: after |
| [Paste15](../../spec/paste.md#paste15) | option pasteStructuredListForm: the app's drop |
| [Paste15b](../../spec/paste.md#paste15b) | option pasteStructuredListForm: literal |
| [Paste15d](../../spec/paste.md#paste15d) | option pasteStructuredListForm: own |
| [Paste16b](../../spec/paste.md#paste16b) | option pasteStructuredListForm: own |
| [Paste17](../../spec/paste.md#paste17) | option pasteStructuredListForm: the app's drop |
| [Paste17b](../../spec/paste.md#paste17b) | option pasteStructuredListForm: literal |
| [Paste17d](../../spec/paste.md#paste17d) | option pasteStructuredAtEnd: join |
| [Paste18b](../../spec/paste.md#paste18b) | option pasteStructuredListForm: literal |
| [Paste19b](../../spec/paste.md#paste19b) | option pasteStructuredAtEnd: join |
| [Paste20b](../../spec/paste.md#paste20b) | option pasteStructuredAtEnd: join |
| [Paste22](../../spec/paste.md#paste22) | code block |
| [Paste23](../../spec/paste.md#paste23) | a quote |
| [Paste25](../../spec/paste.md#paste25) | code block (expected) |
| [Paste26b](../../spec/paste.md#paste26b) | option pasteStructuredAtEnd: join |
| [Paste27b](../../spec/paste.md#paste27b) | option pasteStructuredAtEnd: join |
| [Paste27c](../../spec/paste.md#paste27c) | option pasteStructuredAtEnd: join |
| [Paste27d](../../spec/paste.md#paste27d) | option pasteStructuredOnParent: after |
| [Paste28](../../spec/paste.md#paste28) | a callout |
| [Paste29](../../spec/paste.md#paste29) | a quote |
| [Paste36](../../spec/paste.md#paste36) | option pasteStructuredMidText: the app's after |
| [Paste36b](../../spec/paste.md#paste36b) | option pasteStructuredMidText: the app's after |
| [Paste37](../../spec/paste.md#paste37) | option pasteStructuredMidText: the app's after |
| [Paste38](../../spec/paste.md#paste38) | option pasteStructuredParagraphList: the app's children |
| [Paste40](../../spec/paste.md#paste40) | tag free-form |
| [Paste41](../../spec/paste.md#paste41) | tag free-form |
| [Paste42](../../spec/paste.md#paste42) | option pasteStructuredMidText: the app's after |
| [Paste42b](../../spec/paste.md#paste42b) | option pasteStructuredOnParent: after |
| [Paste43](../../spec/paste.md#paste43) | option enterMidItem: child |
| [Paste44](../../spec/paste.md#paste44) | math (expected) |
| [Paste46](../../spec/paste.md#paste46) | code block |
| [Paste47](../../spec/paste.md#paste47) | code block |
| [Paste48](../../spec/paste.md#paste48) | option pasteStructuredLines: the app's items |
| [Paste50](../../spec/paste.md#paste50) | option pasteStructuredMidText: the app's after |
| [Paste51](../../spec/paste.md#paste51) | option pasteStructuredLines: the app's items |
| [Paste52](../../spec/paste.md#paste52) | code block (expected) |
| [Paste54](../../spec/paste.md#paste54) | tag free-form |
| [Paste55](../../spec/paste.md#paste55) | tag free-form |
| [Paste56](../../spec/paste.md#paste56) | tag free-form |
| [Paste59b](../../spec/paste.md#paste59b) | option pasteStructuredOnParent: after |
| [Paste62](../../spec/paste.md#paste62) | option pasteStructuredMidText: the app's after |
| [Paste63](../../spec/paste.md#paste63) | option pasteStructuredMidText: the app's after |
| [Paste65](../../spec/paste.md#paste65) | a caret on a blank line |
| [Paste66](../../spec/paste.md#paste66) | code block (expected) |
| [Paste67](../../spec/paste.md#paste67) | a caret on a blank line |
| [Paste70](../../spec/paste.md#paste70) | option pasteStructuredMidText: the app's after |
| [Paste71](../../spec/paste.md#paste71) | code block |
| [Paste72](../../spec/paste.md#paste72) | tag markup-task |
| [Paste73](../../spec/paste.md#paste73) | option pasteStructuredLines: the app's items |
| [Paste74](../../spec/paste.md#paste74) | code block (expected) |
| [Paste75](../../spec/paste.md#paste75) | tag markup-task |
| [Paste76](../../spec/paste.md#paste76) | tag markup-heading |
| [Paste77](../../spec/paste.md#paste77) | a quote |
| [Paste79](../../spec/paste.md#paste79) | math (expected) |
| **placeholders.md** | |
| [Placeholder2](../../spec/placeholders.md#placeholder2) | tag free-form |
| [Placeholder3](../../spec/placeholders.md#placeholder3) | tag free-form |
| [Placeholder4](../../spec/placeholders.md#placeholder4) | tag free-form |
| [Placeholder9](../../spec/placeholders.md#placeholder9) | cursorCharLeft after cursorDocEnd |
| [Placeholder10](../../spec/placeholders.md#placeholder10) | a caret on a blank line |
| [Placeholder11](../../spec/placeholders.md#placeholder11) | cursorCharLeft after cursorDocEnd |
| [Placeholder12](../../spec/placeholders.md#placeholder12) | a caret on a blank line |
| [Placeholder13](../../spec/placeholders.md#placeholder13) | tag markup-heading |
| [Placeholder15](../../spec/placeholders.md#placeholder15) | cursorCharLeft after cursorDocEnd |
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
| [Quote12](../../spec/quotes.md#quote12) | option outdent: the app's logical |
| [Quote12b](../../spec/quotes.md#quote12b) | a quote |
| [Quote13](../../spec/quotes.md#quote13) | a callout |
| [Quote14](../../spec/quotes.md#quote14) | a quote |
| [Quote15](../../spec/quotes.md#quote15) | a quote |
| [Quote16](../../spec/quotes.md#quote16) | a quote |
| [Quote17](../../spec/quotes.md#quote17) | a quote |
| [Quote18](../../spec/quotes.md#quote18) | a quote |
| [Quote19](../../spec/quotes.md#quote19) | a quote |
| [Quote20](../../spec/quotes.md#quote20) | a quote |
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
| [Quote37](../../spec/quotes.md#quote37) | a quote |
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
| [Quote63](../../spec/quotes.md#quote63) | a quote |
| [Quote64](../../spec/quotes.md#quote64) | a quote |
| [Quote65](../../spec/quotes.md#quote65) | a quote |
| [Quote66](../../spec/quotes.md#quote66) | a quote |
| [Quote67](../../spec/quotes.md#quote67) | a quote |
| [Quote68](../../spec/quotes.md#quote68) | a quote |
| [Quote71](../../spec/quotes.md#quote71) | a callout |
| [Quote72](../../spec/quotes.md#quote72) | option outdent: the app's logical |
| [Quote73](../../spec/quotes.md#quote73) | tag free-form |
| [Quote74](../../spec/quotes.md#quote74) | a quote |
| [Quote75](../../spec/quotes.md#quote75) | a quote |
| [Quote76](../../spec/quotes.md#quote76) | a quote |
| [Quote77](../../spec/quotes.md#quote77) | a quote |
| [Quote78](../../spec/quotes.md#quote78) | a quote |
| [Quote79](../../spec/quotes.md#quote79) | a callout |
| [Quote80](../../spec/quotes.md#quote80) | a quote |
| [Quote81](../../spec/quotes.md#quote81) | a quote |
| [Quote82](../../spec/quotes.md#quote82) | action deleteSubtree |
| [Quote88](../../spec/quotes.md#quote88) | a quote |
| [Quote83](../../spec/quotes.md#quote83) | a quote |
| [Quote84](../../spec/quotes.md#quote84) | a callout |
| [Quote85](../../spec/quotes.md#quote85) | option outdent: the app's logical |
| [Quote86](../../spec/quotes.md#quote86) | action duplicateSubtree |
| [Quote87](../../spec/quotes.md#quote87) | a quote |
| [Quote69](../../spec/quotes.md#quote69) | a quote |
| [Quote70](../../spec/quotes.md#quote70) | a quote |
| **scenarios.md** | |
| [Scenario6](../../spec/scenarios.md#scenario6) | tag free-form |
| [Scenario10](../../spec/scenarios.md#scenario10) | action deleteSubtree |
| [Scenario15](../../spec/scenarios.md#scenario15) | tag free-form |
| [Scenario18](../../spec/scenarios.md#scenario18) | code block (expected) |
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
| [TaskEnter2](../../spec/tasks.md#taskenter2) | tag markup-task |
| [TaskEnter4](../../spec/tasks.md#taskenter4) | tag markup-task |
| [TaskEnter5](../../spec/tasks.md#taskenter5) | tag markup-task |
| [TaskEnter6](../../spec/tasks.md#taskenter6) | tag markup-task |
| [TaskBackspace1](../../spec/tasks.md#taskbackspace1) | tag markup-task |
| [TaskBackspace2](../../spec/tasks.md#taskbackspace2) | tag markup-task |
| [TaskBackspace3](../../spec/tasks.md#taskbackspace3) | tag markup-task |
| [TaskBackspace4](../../spec/tasks.md#taskbackspace4) | tag markup-task |
| [TaskBackspace5](../../spec/tasks.md#taskbackspace5) | tag markup-task |
| [TaskBackspace6](../../spec/tasks.md#taskbackspace6) | tag markup-task |
| [TaskBackspace7](../../spec/tasks.md#taskbackspace7) | tag markup-task |
| [TaskDelete1](../../spec/tasks.md#taskdelete1) | tag markup-task |
| [TaskDelete2](../../spec/tasks.md#taskdelete2) | tag markup-task |
| [TaskDelete3](../../spec/tasks.md#taskdelete3) | tag markup-task |
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
