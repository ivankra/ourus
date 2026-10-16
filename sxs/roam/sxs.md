---
type: "SxS"
app: "roam"
version: "0.13.12 (39a714f3; API 1.1.5)"
url: "https://roamresearch.com/#/app/help"
model: "block"
command: "node sxs/run.ts roam"
elapsed_s: 194
---

# Roam vs ourus

Spec test suite replayed in Roam and compared against ourus.

Model: [block](../lib/outline.ts) (free-form cases had to be adapted into outlines of blocks)

## Summary

|  | agree | caret | whitespace | disagree | error | skipped | total |
| --- | --- | --- | --- | --- | --- | --- | --- |
| original | 96 | 7 | 13 | 31 |  |  | **147** |
| adapted | 117 | 17 | 23 | 138 |  |  | **295** |
| **total** | **213 (28%)** | **24 (3.2%)** | **36 (4.8%)** | **169 (22%)** | **0 (0%)** | **313 (41%)** | **755** |

Per-file:

|  | agree | caret | whitespace | disagree | error | skipped | total | original | adapted |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [backspace.md](../../spec/backspace.md) | 25 |  |  | 22 |  | 14 | **61** | 14 | 33 |
| [cursor.md](../../spec/cursor.md) | 21 | 7 |  |  |  | 8 | **36** | 12 | 16 |
| [del.md](../../spec/del.md) | 13 |  |  | 17 |  | 17 | **47** | 13 | 17 |
| [delete-subtree.md](../../spec/delete-subtree.md) |  |  |  |  |  | 10 | **10** |  |  |
| [duplicate-subtree.md](../../spec/duplicate-subtree.md) |  |  |  |  |  | 8 | **8** |  |  |
| [enter.md](../../spec/enter.md) | 21 |  | 12 | 13 |  | 13 | **59** | 18 | 28 |
| [fences.md](../../spec/fences.md) |  |  |  |  |  | 51 | **51** |  |  |
| [gaps.md](../../spec/gaps.md) | 11 | 1 |  |  |  | 7 | **19** |  | 12 |
| [indent.md](../../spec/indent.md) | 17 |  |  | 4 |  | 9 | **30** | 9 | 12 |
| [move-subtree-down.md](../../spec/move-subtree-down.md) | 20 |  |  | 10 |  | 7 | **37** | 7 | 23 |
| [move-subtree-up.md](../../spec/move-subtree-up.md) | 19 |  |  | 9 |  | 10 | **38** | 7 | 21 |
| [obsidian-true-outliner.md](../../spec/obsidian-true-outliner.md) | 26 | 2 | 8 | 16 |  | 15 | **67** | 22 | 30 |
| [outdent.md](../../spec/outdent.md) | 8 |  |  | 12 |  | 9 | **29** | 6 | 14 |
| [paste.md](../../spec/paste.md) | 10 | 12 | 2 | 28 |  | 28 | **80** | 17 | 35 |
| [placeholders.md](../../spec/placeholders.md) | 6 |  | 2 | 3 |  | 5 | **16** | 2 | 9 |
| [quotes.md](../../spec/quotes.md) |  |  |  |  |  | 90 | **90** |  |  |
| [scenarios.md](../../spec/scenarios.md) | 11 | 1 |  | 10 |  | 2 | **24** | 11 | 11 |
| [shift-enter.md](../../spec/shift-enter.md) | 3 |  | 12 | 8 |  | 3 | **26** | 6 | 17 |
| [tasks.md](../../spec/tasks.md) |  | 1 |  | 13 |  | 3 | **17** |  | 14 |
| [typing.md](../../spec/typing.md) |  |  |  | 2 |  | 2 | **4** |  | 2 |
| [undo.md](../../spec/undo.md) | 2 |  |  | 2 |  | 1 | **5** | 3 | 1 |
| [z-open.md](../../spec/z-open.md) |  |  |  |  |  | 1 | **1** |  |  |
| **total** | **213 (28%)** | **24 (3.2%)** | **36 (4.8%)** | **169 (22%)** | **0 (0%)** | **313 (41%)** | **755** | **147 (19%)** | **295 (39%)** |

## Original cases

### Disagree (31)

#### [Backspace17](../../spec/backspace.md#backspace17)

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

#### [Backspace17b](../../spec/backspace.md#backspace17b)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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

#### [Backspace17c](../../spec/backspace.md#backspace17c)

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
<tr><th>roam</th><th>ourus</th></tr>
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

#### [Backspace41](../../spec/backspace.md#backspace41)

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

#### [Delete5](../../spec/del.md#delete5)

> deleteContentForward

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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

</td></tr>
</table>

#### [Delete5b](../../spec/del.md#delete5b)

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
<tr><th>roam</th><th>ourus</th></tr>
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

#### [Delete5c](../../spec/del.md#delete5c)

> deleteContentForward

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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

#### [Delete5d](../../spec/del.md#delete5d)

> deleteContentForward

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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

#### [Enter27](../../spec/enter.md#enter27)

> enter

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
  - c
- ┃
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

#### [Enter28](../../spec/enter.md#enter28)

> enter

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃
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
  - ┃
  - 
  - c
```

</td></tr>
</table>

#### [Enter44](../../spec/enter.md#enter44)

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

#### [MoveDown33](../../spec/move-subtree-down.md#movedown33)

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

#### [Backspace › Joining an item with children › Children move to the joined node](../../spec/obsidian-true-outliner.md#children-move-to-the-joined-node)

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

#### [Backspace › Joining an item with children › Delete forward absorbs child with grandchildren](../../spec/obsidian-true-outliner.md#delete-forward-absorbs-child-with-grandchildren)

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

#### [Abandoning an empty place › Enter twice, then leave › Empty paragraph and blank lines removed](../../spec/obsidian-true-outliner.md#empty-paragraph-and-blank-lines-removed)

> enter enter cursorDocStart

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- ┃a
- 
- 
- b
```

</td><td>

```buffer
- a
- b
```

</td></tr>
</table>

#### [Outdent13](../../spec/outdent.md#outdent13)

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
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - d
- b┃
  - c
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

> indent

<table>
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - d
  - b┃
    - c
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

#### [Direct outdent › DirectOutdent1](../../spec/outdent.md#directoutdent1)

> outdent

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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

</td><td>

```buffer
- a
- b┃
  - b1
  - c
- d
```

</td></tr>
</table>

#### [Paste7](../../spec/paste.md#paste7)

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
- a┃b
```

</td><td>

```buffer
- ab
- x┃
- y
```

</td><td>

```buffer
- ax
  y
  ┃b
```

</td></tr>
</table>

#### [Paste8](../../spec/paste.md#paste8)

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
- a┃b
```

</td><td>

```buffer
- ab
- x┃
- y
```

</td><td>

```buffer
- ax
- y
- ┃b
```

</td></tr>
</table>

#### [Paste8b](../../spec/paste.md#paste8b)

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
- a┃b
```

</td><td>

```buffer
- ab
- x┃
- y
```

</td><td>

```buffer
- ax
- y┃b
```

</td></tr>
</table>

#### [Paste10](../../spec/paste.md#paste10)

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
  y
  ┃
```

</td></tr>
</table>

#### [Paste26](../../spec/paste.md#paste26)

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

#### [Paste36](../../spec/paste.md#paste36)

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
  - See x
    - y
  - ┃here.
```

</td></tr>
</table>

#### [Paste42](../../spec/paste.md#paste42)

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
- a┃b
  - child
```

</td><td>

```buffer
- ab
  - x┃
  - y
  - child
```

</td><td>

```buffer
- ax
- y
- ┃b
  - child
```

</td></tr>
</table>

#### [Paste48](../../spec/paste.md#paste48)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
new
better
```

</td><td>

```buffer
- the «old» plan
```

</td><td>

```buffer
- the old plan
- new┃
- better
```

</td><td>

```buffer
- the new
  better┃ plan
```

</td></tr>
</table>

#### [Paste49](../../spec/paste.md#paste49)

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

#### [Paste73](../../spec/paste.md#paste73)

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
-  ┃
  - kid
```

</td><td>

```buffer
-  
  - x┃
  - y
  - kid
```

</td><td>

```buffer
- x
  y
  ┃
  - kid
```

</td></tr>
</table>

#### [Outliner flows › Scenario7](../../spec/scenarios.md#scenario7)

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

#### [Outliner flows › Scenario11](../../spec/scenarios.md#scenario11)

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

#### [ShiftEnter21](../../spec/shift-enter.md#shiftenter21)

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

#### [Undo5](../../spec/undo.md#undo5)

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
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - x┃
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
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - x┃
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
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - x┃
```

</td><td>

```buffer
- a
  - ┃
```

</td></tr>
</table>

### Whitespace (13)

#### [Enter1](../../spec/enter.md#enter1)

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

#### [Enter3](../../spec/enter.md#enter3)

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

#### [Enter16](../../spec/enter.md#enter16)

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

#### [Enter › E4](../../spec/obsidian-true-outliner.md#e4)

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

#### [Shift-Enter › S13](../../spec/obsidian-true-outliner.md#s13)

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

#### [Abandoning an empty place › Shift-Enter, Tab, then leave › Carried place removed on leaving](../../spec/obsidian-true-outliner.md#carried-place-removed-on-leaving)

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

#### [Abandoning an empty place › Shift-Enter, Tab, then leave › Doubly indented place removed on leaving](../../spec/obsidian-true-outliner.md#doubly-indented-place-removed-on-leaving)

> shiftEnter indent indent cursorDocStart

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

#### [Abandoning an empty place › Shift-Enter, Tab, then Enter](../../spec/obsidian-true-outliner.md#shift-enter-tab-then-enter)

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

#### [Paste78](../../spec/paste.md#paste78)

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

#### [Placeholder8](../../spec/placeholders.md#placeholder8)

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

#### [ShiftEnter1](../../spec/shift-enter.md#shiftenter1)

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

#### [ShiftEnter3](../../spec/shift-enter.md#shiftenter3)

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

#### [ShiftEnter13](../../spec/shift-enter.md#shiftenter13)

> shiftEnter

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃one
```

</td><td>

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

### Caret (7)

#### [CursorUp3](../../spec/cursor.md#cursorup3)

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

#### [CursorDown4](../../spec/cursor.md#cursordown4)

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

#### [Paste › #216 › Pasted list takes space indent unit](../../spec/obsidian-true-outliner.md#pasted-list-takes-space-indent-unit)

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

#### [Paste › #216 › Pasted list takes tab indent unit](../../spec/obsidian-true-outliner.md#pasted-list-takes-tab-indent-unit)

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

#### [Paste38](../../spec/paste.md#paste38)

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

#### [Paste39](../../spec/paste.md#paste39)

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

#### [Outliner flows › Scenario17](../../spec/scenarios.md#scenario17)

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

### Agree (96)

1. [Backspace1](../../spec/backspace.md#backspace1)
2. [Backspace3](../../spec/backspace.md#backspace3)
3. [Backspace5](../../spec/backspace.md#backspace5)
4. [Backspace7](../../spec/backspace.md#backspace7)
5. [Backspace8](../../spec/backspace.md#backspace8)
6. [Backspace9](../../spec/backspace.md#backspace9)
7. [Backspace13](../../spec/backspace.md#backspace13)
8. [Backspace17d](../../spec/backspace.md#backspace17d)
9. [Backspace30](../../spec/backspace.md#backspace30)
10. [Backspace32](../../spec/backspace.md#backspace32)
11. [CursorDown3](../../spec/cursor.md#cursordown3)
12. [CursorHome1](../../spec/cursor.md#cursorhome1)
13. [CursorHome2](../../spec/cursor.md#cursorhome2)
14. [CursorHome5](../../spec/cursor.md#cursorhome5)
15. [CursorHome6](../../spec/cursor.md#cursorhome6)
16. [CursorHome12](../../spec/cursor.md#cursorhome12)
17. [CursorHome13](../../spec/cursor.md#cursorhome13)
18. [CursorEnd1](../../spec/cursor.md#cursorend1)
19. [CursorDocStart1](../../spec/cursor.md#cursordocstart1)
20. [SelectHome1](../../spec/cursor.md#selecthome1)
21. [Delete1](../../spec/del.md#delete1)
22. [Delete2](../../spec/del.md#delete2)
23. [Delete3](../../spec/del.md#delete3)
24. [Delete6](../../spec/del.md#delete6)
25. [Delete7](../../spec/del.md#delete7)
26. [Delete8](../../spec/del.md#delete8)
27. [Delete12](../../spec/del.md#delete12)
28. [Delete20](../../spec/del.md#delete20)
29. [Delete22](../../spec/del.md#delete22)
30. [Enter3d](../../spec/enter.md#enter3d)
31. [Enter4](../../spec/enter.md#enter4)
32. [Enter5](../../spec/enter.md#enter5)
33. [Enter7](../../spec/enter.md#enter7)
34. [Enter15](../../spec/enter.md#enter15)
35. [Enter21](../../spec/enter.md#enter21)
36. [Enter26](../../spec/enter.md#enter26)
37. [Enter29](../../spec/enter.md#enter29)
38. [Enter30](../../spec/enter.md#enter30)
39. [Enter31](../../spec/enter.md#enter31)
40. [Enter38](../../spec/enter.md#enter38)
41. [Enter39](../../spec/enter.md#enter39)
42. [Indent1](../../spec/indent.md#indent1)
43. [Indent14](../../spec/indent.md#indent14)
44. [Indent2](../../spec/indent.md#indent2)
45. [Indent6](../../spec/indent.md#indent6)
46. [Indent7](../../spec/indent.md#indent7)
47. [Indent8](../../spec/indent.md#indent8)
48. [Indent10](../../spec/indent.md#indent10)
49. [Indent19](../../spec/indent.md#indent19)
50. [Indent26](../../spec/indent.md#indent26)
51. [MoveDown3](../../spec/move-subtree-down.md#movedown3)
52. [MoveDown6](../../spec/move-subtree-down.md#movedown6)
53. [MoveDown7](../../spec/move-subtree-down.md#movedown7)
54. [MoveDown9](../../spec/move-subtree-down.md#movedown9)
55. [MoveDown10](../../spec/move-subtree-down.md#movedown10)
56. [MoveDown15](../../spec/move-subtree-down.md#movedown15)
57. [MoveUp1](../../spec/move-subtree-up.md#moveup1)
58. [MoveUp2](../../spec/move-subtree-up.md#moveup2)
59. [MoveUp5](../../spec/move-subtree-up.md#moveup5)
60. [MoveUp6](../../spec/move-subtree-up.md#moveup6)
61. [MoveUp8](../../spec/move-subtree-up.md#moveup8)
62. [MoveUp9](../../spec/move-subtree-up.md#moveup9)
63. [MoveUp32](../../spec/move-subtree-up.md#moveup32)
64. [Enter › E7, E8 › End of parent opens empty first child](../../spec/obsidian-true-outliner.md#end-of-parent-opens-empty-first-child)
65. [Enter › E33](../../spec/obsidian-true-outliner.md#e33)
66. [Shift-Enter › S11 › Place inside a multi-line item](../../spec/obsidian-true-outliner.md#place-inside-a-multi-line-item)
67. [Backspace › #153 › Undoing a fresh line break](../../spec/obsidian-true-outliner.md#undoing-a-fresh-line-break)
68. [Backspace › delete-to-content-start](../../spec/obsidian-true-outliner.md#delete-to-content-start)
69. [Indentation › list-marker-content-column](../../spec/obsidian-true-outliner.md#list-marker-content-column)
70. [Indentation › indent-unit-on-every-line](../../spec/obsidian-true-outliner.md#indent-unit-on-every-line)
71. [Moving › lone-block-id › Block id moves with its item](../../spec/obsidian-true-outliner.md#block-id-moves-with-its-item)
72. [Abandoning an empty place › Shift-Enter, Tab, then leave › Backspace returns to the start](../../spec/obsidian-true-outliner.md#backspace-returns-to-the-start)
73. [Abandoning an empty place › Shift-Enter, Tab, then leave › Shift-Tab then Backspace returns to start](../../spec/obsidian-true-outliner.md#shift-tab-then-backspace-returns-to-start)
74. [Abandoning an empty place › Enter, then Shift-Enter and Backspace](../../spec/obsidian-true-outliner.md#enter-then-shift-enter-and-backspace)
75. [Abandoning an empty place › Enter, Shift-Tab, then leave › Second Enter outdents to a kept item](../../spec/obsidian-true-outliner.md#second-enter-outdents-to-a-kept-item)
76. [Outdent1](../../spec/outdent.md#outdent1)
77. [Outdent3](../../spec/outdent.md#outdent3)
78. [Outdent2](../../spec/outdent.md#outdent2)
79. [Logical outdent › LogicalOutdent1](../../spec/outdent.md#logicaloutdent1)
80. [Paste3](../../spec/paste.md#paste3)
81. [Paste5](../../spec/paste.md#paste5)
82. [Paste24](../../spec/paste.md#paste24)
83. [Paste31](../../spec/paste.md#paste31)
84. [Placeholder6](../../spec/placeholders.md#placeholder6)
85. [Outliner flows › Scenario1](../../spec/scenarios.md#scenario1)
86. [Outliner flows › Scenario2](../../spec/scenarios.md#scenario2)
87. [Outliner flows › Scenario3](../../spec/scenarios.md#scenario3)
88. [Outliner flows › Scenario5](../../spec/scenarios.md#scenario5)
89. [Outliner flows › Scenario8](../../spec/scenarios.md#scenario8)
90. [Outliner flows › Scenario9](../../spec/scenarios.md#scenario9)
91. [Outliner flows › Scenario12](../../spec/scenarios.md#scenario12)
92. [Outliner flows › Scenario14](../../spec/scenarios.md#scenario14)
93. [ShiftEnter4](../../spec/shift-enter.md#shiftenter4)
94. [ShiftEnter17](../../spec/shift-enter.md#shiftenter17)
95. [Undo1](../../spec/undo.md#undo1)
96. [Undo4](../../spec/undo.md#undo4)

## Adapted cases

### Disagree (138)

#### [Backspace4](../../spec/backspace.md#backspace4)

> deleteContentBackward

Adapted: heading

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Title #
  - ┃more
```

</td><td>

```buffer
- # Title #┃more
```

</td><td>

```buffer
- # Title┃more #
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Title #
- ┃more
```

</td><td>

```buffer
# Title┃more #
```

</td></tr>
</table>

#### [Backspace12](../../spec/backspace.md#backspace12)

> deleteContentBackward

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃b
```

</td><td>

```buffer
- a┃b
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
a

┃b
```

</td><td>

```buffer
a
┃b
```

</td></tr>
</table>

#### [Backspace12b](../../spec/backspace.md#backspace12b)

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a┃b
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
```

</td></tr>
</table>

> deleteContentBackward deleteContentBackward

<table>
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃b
```

</td><td>

```buffer
- a┃b
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter</th><th>deleteContentBackward deleteContentBackward</th></tr>
<tr valign="top"><td>

```buffer
a┃b
```

</td><td>

```buffer
a

┃b
```

</td><td>

```buffer
a┃b
```

</td></tr>
</table>

#### [Backspace12c](../../spec/backspace.md#backspace12c)

> deleteContentBackward

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃b
  - x
```

</td><td>

```buffer
- a┃b
  - x
```

</td><td>

```buffer
- a
  ┃b
  - x
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
a

┃b
- x
```

</td><td>

```buffer
a
┃b
- x
```

</td></tr>
</table>

#### [Backspace14](../../spec/backspace.md#backspace14)

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- # H1
  - a┃
  - ## H2
```

</td></tr>
</table>

> deleteContentBackward

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

> cursorDocStart

<table>
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # ┃H1
  - 
  - ## H2
```

</td><td>

```buffer
- ┃# H1
  - ## H2
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>deleteContentBackward</th><th>cursorDocStart</th></tr>
<tr valign="top"><td>

```buffer
# H1

a┃

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
┃# H1

## H2
```

</td></tr>
</table>

#### [Backspace18](../../spec/backspace.md#backspace18)

> deleteContentBackward

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- para
- # ┃Hello
  - body
```

</td><td>

```buffer
- para
- ┃Hello
  - body
```

</td><td>

```buffer
- para
- ┃Hello
- body
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
para

┃Hello

body
```

</td></tr>
</table>

#### [Backspace18c](../../spec/backspace.md#backspace18c)

> deleteContentBackward

Adapted: blank lines, heading, paragraph, setext heading

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # ┃Title
  - text
```

</td><td>

```buffer
- ┃Title
  - text
```

</td><td>

```buffer
- ┃Title
- text
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

text
```

</td></tr>
</table>

#### [Backspace18d](../../spec/backspace.md#backspace18d)

> deleteContentBackward

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- # ┃H1
  - text
```

</td><td>

```buffer
- a
- ┃H1
  - text
```

</td><td>

```buffer
- a
- ┃H1
- text
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
a

┃H1

text
```

</td></tr>
</table>

#### [Backspace19](../../spec/backspace.md#backspace19)

> deleteContentBackward

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃bc
```

</td><td>

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

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

  ┃bc
```

</td><td>

```buffer
- a
  ┃bc
```

</td></tr>
</table>

#### [Backspace20](../../spec/backspace.md#backspace20)

> deleteContentBackward

Adapted: blank lines, paragraph

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

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

┃◌

- b
```

</td><td>

```buffer
- a┃

- b
```

</td></tr>
</table>

#### [Backspace23](../../spec/backspace.md#backspace23)

> deleteContentBackward

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

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

</td><td>

```buffer
- # Title
  - ┃more
    lines
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
lines
```

</td><td>

```buffer
# Title

┃more
lines
```

</td></tr>
</table>

#### [Backspace33](../../spec/backspace.md#backspace33)

> deleteContentBackward

Adapted: paragraph

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃a
- b
```

</td><td>

```buffer
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
- ┃a
- b
```

</td><td>

```buffer
┃a
- b
```

</td></tr>
</table>

#### [Backspace35](../../spec/backspace.md#backspace35)

> deleteContentBackward

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # A
  - intro
  - ## ┃B
    - para
      - item
  - ## C
```

</td><td>

```buffer
- # A
  - intro
  - ┃B
    - para
      - item
  - ## C
```

</td><td>

```buffer
- # A
  - intro
  - ┃B
  - para
    - item
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

intro

## ┃B

para

- item

## C
```

</td><td>

```buffer
# A

intro

┃B

para

- item

## C
```

</td></tr>
</table>

#### [Backspace38](../../spec/backspace.md#backspace38)

> deleteContentBackward

Adapted: blank lines, escape, paragraph

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [a]:
- ┃b
```

</td><td>

```buffer
- [a]:┃b
```

</td><td>

```buffer
- [a]:
  ┃b
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
[a]:

┃b
```

</td><td>

```buffer
\[a]:
┃b
```

</td></tr>
</table>

#### [Cmd-Backspace › SoftBackspace1](../../spec/backspace.md#softbackspace1)

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
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃def
```

</td><td>

```buffer
- [ ] ┃def
```

</td></tr>
</table>

> deleteSoftLineBackward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

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

#### [Cmd-Backspace › SoftBackspace3](../../spec/backspace.md#softbackspace3)

> deleteSoftLineBackward

Adapted: heading, setext heading

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # abc ┃- x tail
```

</td><td>

```buffer
- # ┃- x tail
```

</td><td>

```buffer
- # ┃\- x tail
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
abc ┃- x tail
===
```

</td><td>

```buffer
┃\- x tail
===
```

</td></tr>
</table>

#### [Cmd-Backspace › SoftBackspace5](../../spec/backspace.md#softbackspace5)

> deleteSoftLineBackward

Adapted: heading, setext heading

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # first
  abc ┃- x
```

</td><td>

```buffer
- # first
  ┃\- x
```

</td><td>

```buffer
- # first
  ┃\- x
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
first
abc ┃- x
===
```

</td><td>

```buffer
first
┃\- x
===
```

</td></tr>
</table>

#### [Cmd-Backspace › SoftBackspace8](../../spec/backspace.md#softbackspace8)

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
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
  m
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
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- 
  ┃m
```

</td><td>

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

#### [Delete4](../../spec/del.md#delete4)

> deleteContentForward

Adapted: heading

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Title┃ #
  - more
```

</td><td>

```buffer
- # Title┃#
  - more
```

</td><td>

```buffer
- # Title┃more #
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Title┃ #
- more
```

</td><td>

```buffer
# Title┃more #
```

</td></tr>
</table>

#### [Delete4b](../../spec/del.md#delete4b)

> deleteContentForward

Adapted: heading

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Title #┃
  - more
```

</td><td>

```buffer
- # Title #┃more
```

</td><td>

```buffer
- # Title┃more #
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Title #┃
- more
```

</td><td>

```buffer
# Title┃more #
```

</td></tr>
</table>

#### [Delete9](../../spec/del.md#delete9)

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

> cursorDocStart

<table>
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # ┃H1
  - 
  - ## H2
```

</td><td>

```buffer
- ┃# H1
  - ## H2
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>deleteContentForward</th><th>cursorDocStart</th></tr>
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
┃# H1

## H2
```

</td></tr>
</table>

#### [Delete13](../../spec/del.md#delete13)

> deleteContentForward

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- # H1
```

</td><td>

```buffer
- a┃H1
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

#### [Delete13c](../../spec/del.md#delete13c)

> deleteContentForward

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- # H1
  - text
```

</td><td>

```buffer
- a┃H1
  - text
```

</td><td>

```buffer
- a┃# H1
- text
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
text
```

</td><td>

```buffer
a┃# H1

text
```

</td></tr>
</table>

#### [Delete13e](../../spec/del.md#delete13e)

> deleteContentForward

Adapted: blank lines, heading, paragraph, setext heading

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- # Title
```

</td><td>

```buffer
- a┃Title
```

</td><td>

```buffer
- a┃
- # Title
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
a┃

Title
=====
```

</td><td>

```buffer
a┃

Title
=====
```

</td></tr>
</table>

#### [Delete13g](../../spec/del.md#delete13g)

> deleteContentForward

Adapted: heading

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- # H
```

</td><td>

```buffer
- a┃H
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

#### [Delete14](../../spec/del.md#delete14)

> deleteContentForward

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- # H1
  - body
```

</td><td>

```buffer
- a┃H1
  - body
```

</td><td>

```buffer
- a┃# H1
- body
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

body
```

</td><td>

```buffer
a┃# H1

body
```

</td></tr>
</table>

#### [Delete15](../../spec/del.md#delete15)

> deleteContentForward

Adapted: heading

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ## A┃
- # H1 ##
```

</td><td>

```buffer
- ## A┃H1 ##
```

</td><td>

```buffer
- ## A┃# H1 ##
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
## A┃
# H1 ##
```

</td><td>

```buffer
## A┃# H1 ##
```

</td></tr>
</table>

#### [Delete18](../../spec/del.md#delete18)

> deleteContentForward

Adapted: blank lines, paragraph; Also: [del.md › Delete18c](../../spec/del.md#delete18c)

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- a┃b
```

</td><td>

```buffer
- a┃
  b
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
a┃
b
```

</td></tr>
</table>

#### [Delete18b](../../spec/del.md#delete18b)

> deleteContentForward

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - bc
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
- a┃
  bc
```

</td></tr>
</table>

#### [Delete19](../../spec/del.md#delete19)

> deleteContentForward

Adapted: task

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃[ ] task
```

</td><td>

```buffer
- ┃{[[TODO]]}} task
```

</td><td>

```buffer
- ┃task
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃[ ] task
```

</td><td>

```buffer
- ┃task
```

</td></tr>
</table>

#### [Enter7b](../../spec/enter.md#enter7b)

> enter

Adapted: blank lines, paragraph; Also: [enter.md › Enter15b](../../spec/enter.md#enter15b)

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

#### [Enter14](../../spec/enter.md#enter14)

> enter enter enter "p"

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b┃
```

</td><td>

```buffer
- a
  - b
- 
- p┃
```

</td><td>

```buffer
- a
  - b
- p┃
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
```

</td><td>

```buffer
- a
  - b

p┃
```

</td></tr>
</table>

#### [Enter40](../../spec/enter.md#enter40)

Adapted: blank lines, paragraph

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
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- 
- ┃
```

</td><td>

```buffer
- a
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
- 
- 
- ┃
```

</td><td>

```buffer
- a
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
- ┃
```

</td><td>

```buffer
- a

┃◌
```

</td><td>

```buffer
- a

┃◌
```

</td></tr>
</table>

#### [Enter41](../../spec/enter.md#enter41)

> enter

Adapted: escape, heading, paragraph

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Title ┃- x
  - y
```

</td><td>

```buffer
- Title 
- # ┃- x
  - y
```

</td><td>

```buffer
- # Title
  - ┃- x
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

#### [Enter42](../../spec/enter.md#enter42)

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

#### [Enter48](../../spec/enter.md#enter48)

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

#### [Enter51](../../spec/enter.md#enter51)

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

#### [Enter52](../../spec/enter.md#enter52)

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

#### [Enter53](../../spec/enter.md#enter53)

Adapted: blank lines, escape, paragraph

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- -┃a
```

</td></tr>
</table>

> enter

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- -
- ┃a
```

</td></tr>
</table>

> deleteContentBackward deleteContentBackward

<table>
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃a
```

</td><td>

```buffer
- -┃a
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter</th><th>deleteContentBackward deleteContentBackward</th></tr>
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

#### [Indent12](../../spec/indent.md#indent12)

> indent

Adapted: heading

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # A
  - ## B┃
    - ### C
```

</td><td>

```buffer
- # A
  - ## B┃
    - ### C
```

</td><td>

```buffer
- # A
  - ### B┃
    - #### C
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# A
## B┃
### C
```

</td><td>

```buffer
# A
### B┃
#### C
```

</td></tr>
</table>

#### [Indent16](../../spec/indent.md#indent16)

> indent

Adapted: blank lines, heading, setext heading

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Title┃
  - ## Sub
```

</td><td>

```buffer
- # Title┃
  - ## Sub
```

</td><td>

```buffer
- ## Title┃
  - ### Sub
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

#### [Indent23](../../spec/indent.md#indent23)

> indent

Adapted: heading

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # A
  - ## B
  - ## C┃
    - ### D
```

</td><td>

```buffer
- # A
  - ## B
    - ## C┃
      - ### D
```

</td><td>

```buffer
- # A
  - ## B
    - ### C┃
      - #### D
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
## C┃
### D
```

</td><td>

```buffer
# A
## B
### C┃
#### D
```

</td></tr>
</table>

#### [Indent25](../../spec/indent.md#indent25)

> indent

Adapted: blank lines, heading, setext heading

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ## Title┃
  - ### Sub
```

</td><td>

```buffer
- ## Title┃
  - ### Sub
```

</td><td>

```buffer
- ### Title┃
  - #### Sub
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
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

</td></tr>
</table>

#### [MoveDown2](../../spec/move-subtree-down.md#movedown2)

> moveSubtreeDown

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # H
  - a┃
  - para
```

</td><td>

```buffer
- # H
  - para
  - a┃
```

</td><td>

```buffer
- # H
  - para
    - a┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# H
- a┃

para
```

</td><td>

```buffer
# H
para

- a┃
```

</td></tr>
</table>

#### [MoveDown8](../../spec/move-subtree-down.md#movedown8)

> moveSubtreeDown

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b┃
- para
  - c
```

</td><td>

```buffer
- a
- para
  - c
- b┃
```

</td><td>

```buffer
- a
- para
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
- b┃

para

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

#### [MoveDown13](../../spec/move-subtree-down.md#movedown13)

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- b┃
  - b1
- intro
```

</td></tr>
</table>

> moveSubtreeDown

<table>
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- intro
- b┃
  - b1
```

</td><td>

```buffer
- intro
  - b┃
    - b1
```

</td></tr>
</table>

> moveSubtreeUp

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- b┃
  - b1
- intro
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>moveSubtreeDown</th><th>moveSubtreeUp</th></tr>
<tr valign="top"><td>

```buffer
- b┃
  - b1

intro
```

</td><td>

```buffer
intro

- b┃
  - b1
```

</td><td>

```buffer
- b┃
  - b1

intro
```

</td></tr>
</table>

#### [MoveDown17](../../spec/move-subtree-down.md#movedown17)

> moveSubtreeDown

Adapted: heading

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ## ┃H
- # H
  - a
```

</td><td>

```buffer
- # H
  - a
- ## ┃H
```

</td><td>

```buffer
- ## ┃H
- # H
  - a
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
## ┃H
# H
- a
```

</td><td>

```buffer
## ┃H
# H
- a
```

</td></tr>
</table>

#### [MoveDown19](../../spec/move-subtree-down.md#movedown19)

> moveSubtreeDown

Adapted: blank lines, heading

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # A
  - ## s┃
- # B
  - x
```

</td><td>

```buffer
- # A
- # B
  - ## s┃
  - x
```

</td><td>

```buffer
- # A
  - ## s┃
- # B
  - x
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# A
## s┃

# B
- x
```

</td><td>

```buffer
# A
## s┃

# B
- x
```

</td></tr>
</table>

#### [MoveDown20](../../spec/move-subtree-down.md#movedown20)

> moveSubtreeDown

Adapted: blank lines, heading

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Todo
  - one
  - two┃
  - ## Later
    - three
```

</td><td>

```buffer
- # Todo
  - one
  - ## Later
    - three
  - two┃
```

</td><td>

```buffer
- # Todo
  - one
  - ## Later
    - two┃
    - three
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Todo
- one
- two┃

## Later
- three
```

</td><td>

```buffer
# Todo
- one

## Later
- two┃
- three
```

</td></tr>
</table>

#### [MoveDown25](../../spec/move-subtree-down.md#movedown25)

> moveSubtreeDown

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # A
  - para┃
- # B
  - x
```

</td><td>

```buffer
- # A
- # B
  - para┃
  - x
```

</td><td>

```buffer
- # A
  - para┃
- # B
  - x
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

# B
- x
```

</td><td>

```buffer
# A
para┃

# B
- x
```

</td></tr>
</table>

#### [MoveDown28](../../spec/move-subtree-down.md#movedown28)

> moveSubtreeDown

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # A
  - ## sub
    - s1
    - ┃para
- # B
```

</td><td>

```buffer
- # A
  - ## sub
    - s1
    - ┃para
- # B
```

</td><td>

```buffer
- # A
  - ## sub
    - s1
- # B
  - ┃para
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# A
## sub
- s1

┃para

# B
```

</td><td>

```buffer
# A
## sub
- s1

# B
┃para
```

</td></tr>
</table>

#### [MoveDown36](../../spec/move-subtree-down.md#movedown36)

> moveSubtreeDown

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- item
  - ┃a
  - para
```

</td><td>

```buffer
- item
  - para
  - ┃a
```

</td><td>

```buffer
- item
  - ┃a
  - para
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- item
  - ┃a

  para
```

</td><td>

```buffer
- item
  - ┃a

  para
```

</td></tr>
</table>

#### [MoveUp7](../../spec/move-subtree-up.md#moveup7)

> moveSubtreeUp

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- para
  - b┃
  - c
```

</td><td>

```buffer
- a
  - b┃
- para
  - c
```

</td><td>

```buffer
- a
- b┃
- para
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
- b┃

para

- c
```

</td></tr>
</table>

#### [MoveUp12](../../spec/move-subtree-up.md#moveup12)

> moveSubtreeUp

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- intro
  - b┃
    - b1
```

</td><td>

```buffer
- intro
  - b┃
    - b1
```

</td><td>

```buffer
- b┃
  - b1
- intro
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
intro

- b┃
  - b1
```

</td><td>

```buffer
- b┃
  - b1

intro
```

</td></tr>
</table>

#### [MoveUp21](../../spec/move-subtree-up.md#moveup21)

> moveSubtreeUp

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- para
  - a┃
  - b
```

</td><td>

```buffer
- para
  - a┃
  - b
```

</td><td>

```buffer
- a┃
- para
  - b
```

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

```buffer
- a┃

para
- b
```

</td></tr>
</table>

#### [MoveUp23](../../spec/move-subtree-up.md#moveup23)

> moveSubtreeUp

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # A
  - ## sub
    - s1
- # B
  - ┃para
```

</td><td>

```buffer
- # A
  - ## sub
    - s1
  - ┃para
- # B
```

</td><td>

```buffer
- # A
  - ## sub
    - s1
    - ┃para
- # B
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# A
## sub
- s1

# B
┃para
```

</td><td>

```buffer
# A
## sub
- s1

┃para

# B
```

</td></tr>
</table>

#### [MoveUp24](../../spec/move-subtree-up.md#moveup24)

> moveSubtreeUp

Adapted: blank lines, heading

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Todo
  - one
  - ## Later
    - ┃two
    - three
```

</td><td>

```buffer
- # Todo
  - one
    - ┃two
  - ## Later
    - three
```

</td><td>

```buffer
- # Todo
  - one
  - ┃two
  - ## Later
    - three
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Todo
- one

## Later
- ┃two
- three
```

</td><td>

```buffer
# Todo
- one
- ┃two

## Later
- three
```

</td></tr>
</table>

#### [MoveUp27](../../spec/move-subtree-up.md#moveup27)

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- # Work
  - para
- # Home
  - ┃review
```

</td></tr>
</table>

> moveSubtreeUp

<table>
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Work
  - para
  - ┃review
- # Home
```

</td><td>

```buffer
- # Work
  - para
    - ┃review
- # Home
```

</td></tr>
</table>

> moveSubtreeDown

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- # Work
  - para
- # Home
  - ┃review
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>moveSubtreeUp</th><th>moveSubtreeDown</th></tr>
<tr valign="top"><td>

```buffer
# Work
para

# Home
- ┃review
```

</td><td>

```buffer
# Work
para
- ┃review

# Home
```

</td><td>

```buffer
# Work
para

# Home
- ┃review
```

</td></tr>
</table>

#### [MoveUp28](../../spec/move-subtree-up.md#moveup28)

> moveSubtreeUp

Adapted: heading

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ## X
- # A┃
  - a
```

</td><td>

```buffer
- # A┃
  - a
- ## X
```

</td><td>

```buffer
- ## X
- # A┃
  - a
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
## X
# A┃
- a
```

</td><td>

```buffer
## X
# A┃
- a
```

</td></tr>
</table>

#### [MoveUp29](../../spec/move-subtree-up.md#moveup29)

> moveSubtreeUp

Adapted: heading

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # H
  - ┃a
  - b
```

</td><td>

```buffer
- # H
  - ┃a
  - b
```

</td><td>

```buffer
- ┃a
- # H
  - b
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# H
- ┃a
- b
```

</td><td>

```buffer
- ┃a
# H
- b
```

</td></tr>
</table>

#### [MoveUp33](../../spec/move-subtree-up.md#moveup33)

> moveSubtreeUp

Adapted: heading

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # H
  - a
  - ## ┃H
```

</td><td>

```buffer
- # H
  - ## ┃H
  - a
```

</td><td>

```buffer
- # H
  - a
  - ## ┃H
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# H
- a
## ┃H
```

</td><td>

```buffer
# H
- a
## ┃H
```

</td></tr>
</table>

#### [Enter › E15](../../spec/obsidian-true-outliner.md#e15)

> enter

Adapted: heading, paragraph

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Head┃line
  - item
```

</td><td>

```buffer
- Head
- # ┃line
  - item
```

</td><td>

```buffer
- # Head
  - ┃line
    - item
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Head┃line
- item
```

</td><td>

```buffer
# Head
┃line
- item
```

</td></tr>
</table>

#### [Enter › E17](../../spec/obsidian-true-outliner.md#e17)

> enter

Adapted: heading, paragraph, setext heading; Also: [obsidian-true-outliner.md › Enter › E13, E16 › Rest of title becomes first paragraph](../../spec/obsidian-true-outliner.md#rest-of-title-becomes-first-paragraph)

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

#### [Enter › E19, E21 › End of lone heading starts a paragraph](../../spec/obsidian-true-outliner.md#end-of-lone-heading-starts-a-paragraph)

> enter "x"

Adapted: heading, paragraph

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Head┃
```

</td><td>

```buffer
- # Head
- x┃
```

</td><td>

```buffer
- # Head
  - x┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Head┃
```

</td><td>

```buffer
# Head
x┃
```

</td></tr>
</table>

#### [Enter › E19, E21 › Empty paragraph before a section list](../../spec/obsidian-true-outliner.md#empty-paragraph-before-a-section-list)

> enter

Adapted: heading, paragraph

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Head┃
  - item
```

</td><td>

```buffer
- # Head
  - ┃
  - item
```

</td><td>

```buffer
- # Head
  - ┃
    - item
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Head┃
- item
```

</td><td>

```buffer
# Head
┃◌
- item
```

</td></tr>
</table>

#### [Enter › E32 › Task checkbox carries over unchecked](../../spec/obsidian-true-outliner.md#task-checkbox-carries-over-unchecked)

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

#### [Enter › E32 › Checked task gives unchecked new item](../../spec/obsidian-true-outliner.md#checked-task-gives-unchecked-new-item)

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

#### [Enter › E13, E16 › Split title above a subheading](../../spec/obsidian-true-outliner.md#split-title-above-a-subheading)

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

#### [Enter › E14, E20 › Split title above an existing paragraph](../../spec/obsidian-true-outliner.md#split-title-above-an-existing-paragraph)

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

#### [Shift-Enter › S7, S8 › Line break in setext title refused](../../spec/obsidian-true-outliner.md#line-break-in-setext-title-refused)

> shiftEnter

Adapted: heading, setext heading

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Hello┃ world
```

</td><td>

```buffer
- # Hello
  ┃ world
```

</td><td>

```buffer
- # Hello┃ world
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
Hello┃ world
====
```

</td></tr>
</table>

#### [Shift-Enter › S11 › Leaving the place removes it](../../spec/obsidian-true-outliner.md#leaving-the-place-removes-it)

> shiftEnter cursorDocStart

Adapted: paragraph

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- foo┃
  bar
```

</td><td>

```buffer
- ┃foo
  
  bar
```

</td><td>

```buffer
- ┃foo
  bar
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
foo┃
bar
```

</td><td>

```buffer
┃foo
bar
```

</td></tr>
</table>

#### [Backspace › Joining a task › Backspace before the checkbox](../../spec/obsidian-true-outliner.md#backspace-before-the-checkbox)

> deleteContentBackward

Adapted: task

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃[ ] b
```

</td><td>

```buffer
- a┃{{[[TODO]]}} b
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
- ┃[ ] b
```

</td><td>

```buffer
- a┃b
```

</td></tr>
</table>

#### [Abandoning an empty place › Enter twice, then leave › Indented list under paragraph restored](../../spec/obsidian-true-outliner.md#indented-list-under-paragraph-restored)

> enter enter cursorDocStart

Adapted: paragraph

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- para
  - a┃
  - b
```

</td><td>

```buffer
- ┃para
  - a
  - b
- 
```

</td><td>

```buffer
- ┃para
  - a
  - b
```

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

```buffer
┃para
  - a
  - b
```

</td></tr>
</table>

#### [Outdent4](../../spec/outdent.md#outdent4)

> outdent

Adapted: heading

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ## A┃
  - ### B
```

</td><td>

```buffer
- ## A┃
  - ### B
```

</td><td>

```buffer
- # A┃
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
### B
```

</td><td>

```buffer
# A┃
## B
```

</td></tr>
</table>

#### [Outdent6](../../spec/outdent.md#outdent6)

> outdent

Adapted: blank lines

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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

</td><td>

```buffer
- a
- b┃
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

#### [Outdent7](../../spec/outdent.md#outdent7)

> outdent

Adapted: blank lines

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃x
  - 
```

</td><td>

```buffer
- a
  - 
- ┃x
```

</td><td>

```buffer
- a
- ┃x
  - 
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃x
  - 
```

</td><td>

```buffer
- a
- ┃x

  - 
```

</td></tr>
</table>

#### [Outdent11](../../spec/outdent.md#outdent11)

> outdent

Adapted: heading; Also: [outdent.md › Logical outdent › LogicalOutdent5](../../spec/outdent.md#logicaloutdent5)

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # T
  - ## A┃
  - ## B
```

</td><td>

```buffer
- # T
  - ## B
- ## A┃
```

</td><td>

```buffer
- # T
- # A┃
  - ## B
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# T
## A┃
## B
```

</td><td>

```buffer
# T
# A┃
## B
```

</td></tr>
</table>

#### [Direct outdent › DirectOutdent2](../../spec/outdent.md#directoutdent2)

> outdent

Adapted: paragraph

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
- a┃
- b
```

</td><td>

```buffer
a┃
- b
```

</td></tr>
</table>

#### [Direct outdent › DirectOutdent3](../../spec/outdent.md#directoutdent3)

> outdent

Adapted: paragraph

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
- a┃
  - a1
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
  - a1
- b
```

</td><td>

```buffer
a┃
- a1
- b
```

</td></tr>
</table>

#### [Direct outdent › DirectOutdent4](../../spec/outdent.md#directoutdent4)

> outdent

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- para
  - a┃
  - b
```

</td><td>

```buffer
- para
  - b
- a┃
```

</td><td>

```buffer
- para
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
para
- a┃
- b
```

</td><td>

```buffer
para

a┃
- b
```

</td></tr>
</table>

#### [Logical outdent › LogicalOutdent2](../../spec/outdent.md#logicaloutdent2)

> outdent

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
- b
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
- b
```

</td><td>

```buffer
- b

a┃
```

</td></tr>
</table>

#### [Logical outdent › LogicalOutdent3](../../spec/outdent.md#logicaloutdent3)

> outdent

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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

a┃
- a1
```

</td></tr>
</table>

#### [Paste6](../../spec/paste.md#paste6)

> pastePlain

Adapted: heading

<table>
<tr><th>clipboard</th><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
x
y
```

</td><td>

```buffer
- # H┃
```

</td><td>

```buffer
- # Hx
  y
  ┃
```

</td><td>

```buffer
- # H┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# H┃
```

</td><td>

```buffer
# H┃
```

</td></tr>
</table>

#### [Paste15](../../spec/paste.md#paste15)

> pasteStructured

Adapted: numbered list

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
- 1. x┃
- 2. y
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

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
- b
```

</td><td>

```buffer
1. x
2. y┃
3. b
```

</td></tr>
</table>

#### [Paste17](../../spec/paste.md#paste17)

> pasteStructured

Adapted: escape, numbered list

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
- 1. x┃
  - 1. x1
- 2. y
```

</td><td>

```buffer
- a
- 1. x
  - x1
- 2. y┃
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
- 1\. x
  1. x1
- 2\. y┃
```

</td></tr>
</table>

#### [Paste18](../../spec/paste.md#paste18)

> pasteStructured

Adapted: numbered list

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
- 1. x┃
- 2. y
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
1. a┃
2. b
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

#### [Paste32](../../spec/paste.md#paste32)

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
- para# h
  ┃
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

#### [Paste33](../../spec/paste.md#paste33)

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
  - para## h
    ┃
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

#### [Paste34](../../spec/paste.md#paste34)

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
- para# h
  ┃
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

#### [Paste35](../../spec/paste.md#paste35)

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
  - para## h
    ┃
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

#### [Paste37](../../spec/paste.md#paste37)

> pasteStructured

Adapted: blank lines, paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
- See here.
- x┃
  - y
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

#### [Paste40](../../spec/paste.md#paste40)

> pastePlain

Adapted: blank lines, paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
- ax
  
  y
  ┃b
- c
```

</td><td>

```buffer
- ax
  - y
    ┃b
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

  y
  ┃b
- c
```

</td></tr>
</table>

#### [Paste53](../../spec/paste.md#paste53)

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
- paraTitle
  =====
  ┃
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

#### [Paste54](../../spec/paste.md#paste54)

> pasteStructured

Adapted: blank lines, heading, paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
x
y
```

</td><td>

```buffer
- # Hel┃lo
```

</td><td>

```buffer
- # Hello
- x┃
- y
```

</td><td>

```buffer
- # Hello
  - x
    y┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Hel┃lo
```

</td><td>

```buffer
# Hello

x
y┃
```

</td></tr>
</table>

#### [Paste57](../../spec/paste.md#paste57)

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

#### [Paste58](../../spec/paste.md#paste58)

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

#### [Paste61](../../spec/paste.md#paste61)

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
    - text# Z
      ┃
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

#### [Paste63](../../spec/paste.md#paste63)

> pasteStructured

Adapted: escape

<table>
<tr><th>clipboard</th><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
1. x
2. y
```

</td><td>

```buffer
- see ┃here
```

</td><td>

```buffer
- see here
- 1. x┃
- 2. y
```

</td><td>

```buffer
- see 1. x
- 2. y
- ┃here
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- see ┃here
```

</td><td>

```buffer
- see 1. x
- 2\. y
- ┃here
```

</td></tr>
</table>

#### [Paste75](../../spec/paste.md#paste75)

> pasteStructured

Adapted: task

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
- [ ] ┃
```

</td><td>

```buffer
- a
- [ ] 
- x┃
- y
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

#### [Paste76](../../spec/paste.md#paste76)

> pasteStructured

Adapted: blank lines, heading, paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
- a
- b
```

</td><td>

```buffer
- # ┃Hello
  - body
```

</td><td>

```buffer
- a┃
- b
- # Hello
  - body
```

</td><td>

```buffer
- # Hello
  - a
  - b┃
  - body
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

- a
- b┃

body
```

</td></tr>
</table>

#### [Placeholder2](../../spec/placeholders.md#placeholder2)

Adapted: blank lines, paragraph

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
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- 
- ┃
```

</td><td>

```buffer
- a
- ┃
```

</td></tr>
</table>

> cursorDocStart

<table>
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃a
- 
- 
```

</td><td>

```buffer
- a
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter</th><th>enter</th><th>cursorDocStart</th></tr>
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

┃◌
```

</td><td>

```buffer
┃- a
```

</td></tr>
</table>

#### [Placeholder3](../../spec/placeholders.md#placeholder3)

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- para┃
```

</td></tr>
</table>

> enter

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- para
- ┃
```

</td></tr>
</table>

> cursorDocStart

<table>
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃para
- 
```

</td><td>

```buffer
- ┃para
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter</th><th>cursorDocStart</th></tr>
<tr valign="top"><td>

```buffer
para┃
```

</td><td>

```buffer
para

┃◌
```

</td><td>

```buffer
┃para
```

</td></tr>
</table>

#### [Placeholder13](../../spec/placeholders.md#placeholder13)

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
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # H1
  - ┃H2
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

#### [Outliner flows › Scenario6](../../spec/scenarios.md#scenario6)

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- Groceries┃
```

</td></tr>
</table>

> enter

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- Groceries
- ┃
```

</td></tr>
</table>

> "- milk"

<table>
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Groceries
- - milk┃
```

</td><td>

```buffer
- Groceries
  - milk┃
```

</td></tr>
</table>

> enter "eggs"

> enter indent "brown"

<table>
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Groceries
- - milk
- eggs
  - brown┃
```

</td><td>

```buffer
- Groceries
  - milk
  - eggs
    - brown┃
```

</td></tr>
</table>

> enter enter

<table>
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Groceries
- - milk
- eggs
  - brown
- ┃
```

</td><td>

```buffer
- Groceries
  - milk
  - eggs
    - brown
  - ┃
```

</td></tr>
</table>

> enter "Done."

<table>
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Groceries
- - milk
- eggs
  - brown
- 
- Done.┃
```

</td><td>

```buffer
- Groceries
  - milk
  - eggs
    - brown
- Done.┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter</th><th>"- milk"</th><th>enter indent "brown"</th><th>enter enter</th><th>enter "Done."</th></tr>
<tr valign="top"><td>

```buffer
Groceries┃
```

</td><td>

```buffer
Groceries

┃◌
```

</td><td>

```buffer
Groceries

- milk┃
```

</td><td>

```buffer
Groceries

- milk
- eggs
  - brown┃
```

</td><td>

```buffer
Groceries

- milk
- eggs
  - brown
- ┃
```

</td><td>

```buffer
Groceries

- milk
- eggs
  - brown

Done.┃
```

</td></tr>
</table>

#### [Outliner flows › Scenario15](../../spec/scenarios.md#scenario15)

Adapted: blank lines, paragraph, task

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
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] milk
- bread
- ┃
```

</td><td>

```buffer
- [ ] milk
- [ ] bread
- [ ] ┃
```

</td></tr>
</table>

> deleteContentBackward "two loaves" indent

<table>
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] milk
  - breadtwo loaves┃
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
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] milk
  - breadtwo loaves
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

> enter

<table>
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] milk
  - breadtwo loaves
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

> enter "Shop closes at six."

<table>
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] milk
  - breadtwo loaves
- 
- Shop closes at six.┃
```

</td><td>

```buffer
- [ ] milk
- [ ] bread
  - two loaves
- Shop closes at six.┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter "bread" enter</th><th>deleteContentBackward "two loaves" indent</th><th>enter</th><th>enter</th><th>enter "Shop closes at six."</th></tr>
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

</td><td>

```buffer
- [ ] milk
- [ ] bread
  - two loaves

Shop closes at six.┃
```

</td></tr>
</table>

#### [Outliner flows › Scenario16](../../spec/scenarios.md#scenario16)

Adapted: blank lines, heading, task

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- # Work
  - email
- # Home
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
- # Work
  - email
  - [x] ┃review
- # Home
  - water
```

</td></tr>
</table>

> "today "

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- # Work
  - email
  - [x] today ┃review
- # Home
  - water
```

</td></tr>
</table>

> undo undo

<table>
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Work
  - email
  - [x] today ┃review
- # Home
  - water
```

</td><td>

```buffer
- # Work
  - email
- # Home
  - [x] ┃review
  - water
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>moveSubtreeUp</th><th>"today "</th><th>undo undo</th></tr>
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
- [x] today ┃review

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

#### [Notes and sections › Scenario19](../../spec/scenarios.md#scenario19)

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- # Notes┃
```

</td></tr>
</table>

> enter "first idea"

<table>
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Notes
- first idea┃
```

</td><td>

```buffer
- # Notes
  - first idea┃
```

</td></tr>
</table>

> enter "second"

<table>
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Notes
- first idea
- second┃
```

</td><td>

```buffer
- # Notes
  - first idea
  - second┃
```

</td></tr>
</table>

> moveSubtreeUp

<table>
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Notes
- second┃
- first idea
```

</td><td>

```buffer
- # Notes
  - second┃
  - first idea
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter "first idea"</th><th>enter "second"</th><th>moveSubtreeUp</th></tr>
<tr valign="top"><td>

```buffer
# Notes┃
```

</td><td>

```buffer
# Notes
first idea┃
```

</td><td>

```buffer
# Notes
first idea

second┃
```

</td><td>

```buffer
# Notes
second┃

first idea
```

</td></tr>
</table>

#### [Notes and sections › Scenario20](../../spec/scenarios.md#scenario20)

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
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Trip
- Pack light.
- Book the train.┃
```

</td><td>

```buffer
- # Trip
  - Pack light.
  - Book the train.┃
```

</td></tr>
</table>

> shiftEnter "Seat 42."

<table>
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Trip
- Pack light.
- Book the train.
  Seat 42.┃
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

> moveSubtreeUp

<table>
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Trip
- Book the train.
  Seat 42.┃
- Pack light.
```

</td><td>

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
- Book the train.
  Seat 42.┃
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

#### [Notes and sections › Scenario21](../../spec/scenarios.md#scenario21)

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- one┃two
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
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one┃two
```

</td><td>

```buffer
- one
  ┃two
```

</td></tr>
</table>

> cursorLineUp cursorLineBoundaryForward

<table>
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- onetwo┃
```

</td><td>

```buffer
- one┃
  two
```

</td></tr>
</table>

> deleteContentForward

<table>
<tr><th>roam</th><th>ourus</th></tr>
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

Original:
<table>
<tr><th>buffer</th><th>enter</th><th>deleteContentBackward</th><th>cursorLineUp cursorLineBoundaryForward</th><th>deleteContentForward</th></tr>
<tr valign="top"><td>

```buffer
one┃two
```

</td><td>

```buffer
one

┃two
```

</td><td>

```buffer
one
┃two
```

</td><td>

```buffer
one┃
two
```

</td><td>

```buffer
one┃two
```

</td></tr>
</table>

#### [Notes and sections › Scenario23](../../spec/scenarios.md#scenario23)

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
- Plan
- # revise 
  ┃2\. draft
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

#### [Notes and sections › Scenario24](../../spec/scenarios.md#scenario24)

Adapted: paragraph

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- Shopping:
  ┃milk
  bread
```

</td></tr>
</table>

> "- "

<table>
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Shopping:
  \- ┃milk
  bread
```

</td><td>

```buffer
- Shopping:
  - ┃milk
    bread
```

</td></tr>
</table>

> cursorLineDown cursorLineBoundaryBackward "- "

<table>
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Shopping:
  \- milk
  \- ┃bread
```

</td><td>

```buffer
- Shopping:
  - milk
  - ┃bread
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>"- "</th><th>cursorLineDown cursorLineBoundaryBackward "- "</th></tr>
<tr valign="top"><td>

```buffer
Shopping:
┃milk
bread
```

</td><td>

```buffer
Shopping:
- ┃milk
bread
```

</td><td>

```buffer
Shopping:
- milk
- ┃bread
```

</td></tr>
</table>

#### [ShiftEnter10](../../spec/shift-enter.md#shiftenter10)

Adapted: blank lines, paragraph

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
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  
  ┃bc
```

</td><td>

```buffer
- a
  - ┃bc
```

</td></tr>
</table>

> "x"

<table>
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  
  x┃bc
```

</td><td>

```buffer
- a
  - x┃bc
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>shiftEnter</th><th>"x"</th></tr>
<tr valign="top"><td>

```buffer
- a
  ┃bc
```

</td><td>

```buffer
- a

  ┃bc
```

</td><td>

```buffer
- a

  x┃bc
```

</td></tr>
</table>

#### [ShiftEnter11](../../spec/shift-enter.md#shiftenter11)

> shiftEnter

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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

</td><td>

```buffer
- one
  - ┃
- two
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  ┃◌
- two
```

</td><td>

```buffer
- one

  ┃◌
- two
```

</td></tr>
</table>

#### [ShiftEnter12](../../spec/shift-enter.md#shiftenter12)

> shiftEnter

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- para
  ┃
```

</td><td>

```buffer
- para
  
  ┃
```

</td><td>

```buffer
- para
- ┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para
┃◌
```

</td><td>

```buffer
para

┃◌
```

</td></tr>
</table>

#### [ShiftEnter14](../../spec/shift-enter.md#shiftenter14)

> shiftEnter

Adapted: heading

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Title┃ more
```

</td><td>

```buffer
- # Title
  ┃ more
```

</td><td>

```buffer
- # Title┃ more
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
# Title┃ more
```

</td></tr>
</table>

#### [ShiftEnter15](../../spec/shift-enter.md#shiftenter15)

> shiftEnter shiftEnter "p"

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
  - p┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one┃
```

</td><td>

```buffer
- one

  p┃
```

</td></tr>
</table>

#### [ShiftEnter16](../../spec/shift-enter.md#shiftenter16)

> shiftEnter shiftEnter "p"

Adapted: CR line endings, blank lines, paragraph

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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
  - p┃
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

#### [ShiftEnter25](../../spec/shift-enter.md#shiftenter25)

> shiftEnter

Adapted: blank lines, escape, paragraph

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- p
  ┃[r]: /u
```

</td><td>

```buffer
- p
  
  ┃[r]: /u
```

</td><td>

```buffer
- p
- ┃[r]: /u
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

┃\[r]: /u
```

</td></tr>
</table>

#### [TaskEnter1](../../spec/tasks.md#taskenter1)

> enter

Adapted: blank lines, paragraph, task

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- [ ] ┃
```

</td><td>

```buffer
- a
- [ ] 
- ┃
```

</td><td>

```buffer
- a
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
- [ ] ┃
```

</td><td>

```buffer
- a

┃◌
```

</td></tr>
</table>

#### [TaskEnter2](../../spec/tasks.md#taskenter2)

> enter

Adapted: task

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - [ ] ┃
```

</td><td>

```buffer
- a
  - [ ] 
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

#### [TaskEnter3](../../spec/tasks.md#taskenter3)

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

#### [TaskEnter4](../../spec/tasks.md#taskenter4)

> enter

Adapted: task

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] ┃abc
```

</td><td>

```buffer
- [ ] 
- ┃abc
```

</td><td>

```buffer
- [ ] ┃
- [ ] abc
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] ┃abc
```

</td><td>

```buffer
- [ ] ┃
- [ ] abc
```

</td></tr>
</table>

#### [TaskEnter5](../../spec/tasks.md#taskenter5)

> enter

Adapted: task

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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

#### [TaskEnter6](../../spec/tasks.md#taskenter6)

> enter

Adapted: task

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
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

#### [TaskEnter7](../../spec/tasks.md#taskenter7)

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

#### [TaskBackspace1](../../spec/tasks.md#taskbackspace1)

> deleteContentBackward

Adapted: task

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- 
  - ┃[ ] task
    - child
```

</td><td>

```buffer
- a
- 
  - ┃[ ] task
    - child
```

</td><td>

```buffer
- a
- [ ] ┃task
  - child
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- 
  - ┃[ ] task
    - child
```

</td><td>

```buffer
- a
- [ ] ┃task
  - child
```

</td></tr>
</table>

#### [TaskBackspace2](../../spec/tasks.md#taskbackspace2)

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
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- [ ]┃
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
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- {{[[TODO]]}┃
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

#### [TaskBackspace3](../../spec/tasks.md#taskbackspace3)

> deleteContentBackward

Adapted: task

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- [x] ┃b
```

</td><td>

```buffer
- a
- [x]┃b
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

#### [TaskBackspace6](../../spec/tasks.md#taskbackspace6)

> deleteContentBackward

Adapted: task

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] 
- ┃[x] a
```

</td><td>

```buffer
- [ ] ┃{{[[DONE]]}} a
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
- [ ] 
- ┃[x] a
```

</td><td>

```buffer
- [x] ┃a
```

</td></tr>
</table>

#### [TaskDelete1](../../spec/tasks.md#taskdelete1)

> deleteContentForward

Adapted: task

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- [ ] b
```

</td><td>

```buffer
- a┃{{[[TODO]]}} b
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

#### [TaskDelete3](../../spec/tasks.md#taskdelete3)

> deleteContentForward

Adapted: task

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- [ ] 
```

</td><td>

```buffer
- a┃{{[[TODO]]}} 
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

#### [Typing2](../../spec/typing.md#typing2)

> deleteContentBackward

Adapted: heading, paragraph, setext heading

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- para
  ---x┃
```

</td><td>

```buffer
- para
  ---┃
```

</td><td>

```buffer
- ## para
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

#### [Typing3](../../spec/typing.md#typing3)

> "- "

Adapted: paragraph

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- para
  ┃more
```

</td><td>

```buffer
- para
  \- ┃more
```

</td><td>

```buffer
- para
  - ┃more
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para
┃more
```

</td><td>

```buffer
para
- ┃more
```

</td></tr>
</table>

#### [Undo3](../../spec/undo.md#undo3)

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
<tr><th>roam</th><th>ourus</th></tr>
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

> cursorDocStart cursorLineBoundaryForward

<table>
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
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
  - ┃◌
```

</td><td>

```buffer
- a┃

  - 
```

</td></tr>
</table>

### Whitespace (23)

#### [Enter3c](../../spec/enter.md#enter3c)

> enter

Adapted: numbered list

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃ b
  - c
- d
```

</td><td>

```buffer
- a
- ┃ b
  - c
- d
```

</td><td>

```buffer
- a
- ┃b
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
9. a┃ b
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

#### [Enter8](../../spec/enter.md#enter8)

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

#### [Enter9](../../spec/enter.md#enter9)

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

#### [Enter10](../../spec/enter.md#enter10)

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

#### [Enter11](../../spec/enter.md#enter11)

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

#### [Enter12](../../spec/enter.md#enter12)

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

#### [Enter22](../../spec/enter.md#enter22)

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

#### [Enter35](../../spec/enter.md#enter35)

> enter

Adapted: escape, numbered list

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc ┃2. def
```

</td><td>

```buffer
- abc 
- ┃2. def
```

</td><td>

```buffer
- abc
- ┃2. def
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

#### [Enter47](../../spec/enter.md#enter47)

Adapted: blank lines, escape, paragraph

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- [Note]: this ┃matters a lot
```

</td></tr>
</table>

> enter

<table>
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [Note]: this 
- ┃matters a lot
```

</td><td>

```buffer
- [Note]: this
- ┃matters a lot
```

</td></tr>
</table>

> deleteContentBackward deleteContentBackward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- [Note]: this┃matters a lot
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter</th><th>deleteContentBackward deleteContentBackward</th></tr>
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
[Note]: this┃matters a lot
```

</td></tr>
</table>

#### [Enter › E9](../../spec/obsidian-true-outliner.md#e9)

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

#### [Shift-Enter › S4](../../spec/obsidian-true-outliner.md#s4)

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

#### [Shift-Enter › S9](../../spec/obsidian-true-outliner.md#s9)

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

#### [Paste68](../../spec/paste.md#paste68)

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

#### [Placeholder4](../../spec/placeholders.md#placeholder4)

Adapted: paragraph

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
- ┃para
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
para
┃◌
```

</td><td>

```buffer
┃para
```

</td></tr>
</table>

#### [ShiftEnter2](../../spec/shift-enter.md#shiftenter2)

> shiftEnter

Adapted: numbered list

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b┃ c
```

</td><td>

```buffer
- a
  - b
    ┃ c
```

</td><td>

```buffer
- a
  - b
    ┃c
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a
   - b┃ c
```

</td><td>

```buffer
1. a
   - b
     ┃c
```

</td></tr>
</table>

#### [ShiftEnter5](../../spec/shift-enter.md#shiftenter5)

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

#### [ShiftEnter6](../../spec/shift-enter.md#shiftenter6)

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

#### [ShiftEnter7](../../spec/shift-enter.md#shiftenter7)

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

#### [ShiftEnter8](../../spec/shift-enter.md#shiftenter8)

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

#### [ShiftEnter9](../../spec/shift-enter.md#shiftenter9)

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

#### [ShiftEnter18](../../spec/shift-enter.md#shiftenter18)

> shiftEnter

Adapted: escape, numbered list

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc ┃2. x
```

</td><td>

```buffer
- abc 
  ┃2\. x
```

</td><td>

```buffer
- abc
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

#### [ShiftEnter19](../../spec/shift-enter.md#shiftenter19)

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

#### [ShiftEnter23](../../spec/shift-enter.md#shiftenter23)

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

### Caret (17)

#### [CursorUp1](../../spec/cursor.md#cursorup1)

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

#### [CursorDown1](../../spec/cursor.md#cursordown1)

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

#### [CursorDown5](../../spec/cursor.md#cursordown5)

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

#### [CursorHome8](../../spec/cursor.md#cursorhome8)

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

#### [CursorHome9](../../spec/cursor.md#cursorhome9)

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

#### [New text and gaps › Gap13](../../spec/gaps.md#gap13)

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

#### [Paste2](../../spec/paste.md#paste2)

> pasteStructured

Adapted: numbered list

<table>
<tr><th>clipboard</th><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
- x
- y
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
1. a
2. x
3. y┃
4. b
```

</td></tr>
</table>

#### [Paste13](../../spec/paste.md#paste13)

> pasteStructured

Adapted: escape

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
- 1. x┃
- 2. y
- b
```

</td><td>

```buffer
- a
- 1. x
- 2. y┃
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
- 1\. x
- 2\. y┃
- b
```

</td></tr>
</table>

#### [Paste14](../../spec/paste.md#paste14)

> pasteStructured

Adapted: escape

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
  - kid
```

</td><td>

```buffer
- a
  - 1. x┃
  - 2. y
  - kid
```

</td><td>

```buffer
- a
  - 1. x
  - 2. y┃
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
- a
  - 1\. x
  - 2\. y┃
  - kid
```

</td></tr>
</table>

#### [Paste16](../../spec/paste.md#paste16)

> pasteStructured

Adapted: numbered list

<table>
<tr><th>clipboard</th><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
- x
- y
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

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. ┃
2. b
```

</td><td>

```buffer
1. x
2. y┃
3. b
```

</td></tr>
</table>

#### [Paste19](../../spec/paste.md#paste19)

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

#### [Paste20](../../spec/paste.md#paste20)

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

#### [Paste21](../../spec/paste.md#paste21)

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

#### [Paste27](../../spec/paste.md#paste27)

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

#### [Paste59](../../spec/paste.md#paste59)

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

#### [Paste60](../../spec/paste.md#paste60)

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

#### [TaskDelete2](../../spec/tasks.md#taskdelete2)

> deleteContentForward

Adapted: task

<table>
<tr><th>buffer</th><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
- [x] a
```

</td><td>

```buffer
- ┃[x] a
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

### Agree (117)

1. [Backspace10](../../spec/backspace.md#backspace10) (blank lines, paragraph)
2. [Backspace11](../../spec/backspace.md#backspace11) (blank lines, paragraph)
3. [Backspace21](../../spec/backspace.md#backspace21) (blank lines, paragraph)
4. [Backspace15](../../spec/backspace.md#backspace15) (blank lines, paragraph)
5. [Backspace18e](../../spec/backspace.md#backspace18e) (heading)
6. [Backspace22](../../spec/backspace.md#backspace22) (blank lines, heading, paragraph)
7. [Backspace25](../../spec/backspace.md#backspace25) (blank lines, paragraph)
8. [Backspace26](../../spec/backspace.md#backspace26) (paragraph)
9. [Backspace29](../../spec/backspace.md#backspace29) (numbered list)
10. [Backspace36](../../spec/backspace.md#backspace36) (heading, paragraph, setext heading)
11. [Backspace37](../../spec/backspace.md#backspace37) (heading, paragraph, setext heading)
12. [Backspace39](../../spec/backspace.md#backspace39) (blank lines, paragraph)
13. [Backspace40](../../spec/backspace.md#backspace40) (blank lines, numbered list, paragraph)
14. [Cmd-Backspace › SoftBackspace2](../../spec/backspace.md#softbackspace2) (escape, paragraph)
15. [Cmd-Backspace › SoftBackspace4](../../spec/backspace.md#softbackspace4) (heading)
16. [CursorLeft1](../../spec/cursor.md#cursorleft1) (paragraph)
17. [CursorLeft2](../../spec/cursor.md#cursorleft2) (paragraph)
18. [CursorLeft3](../../spec/cursor.md#cursorleft3) (paragraph)
19. [CursorRight1](../../spec/cursor.md#cursorright1) (paragraph)
20. [CursorRight2](../../spec/cursor.md#cursorright2) (paragraph)
21. [CursorUp2](../../spec/cursor.md#cursorup2) (heading)
22. [CursorHome7](../../spec/cursor.md#cursorhome7) (numbered list)
23. [CursorHome10](../../spec/cursor.md#cursorhome10) (heading)
24. [CursorHome14](../../spec/cursor.md#cursorhome14) (paragraph)
25. [SelectLeft1](../../spec/cursor.md#selectleft1) (paragraph)
26. [SelectRightEnd1](../../spec/cursor.md#selectrightend1) (paragraph)
27. [Delete17](../../spec/del.md#delete17) (blank lines, paragraph)
28. [Delete26](../../spec/del.md#delete26) (heading, paragraph, setext heading)
29. [Delete27](../../spec/del.md#delete27) (escape)
30. [Delete28](../../spec/del.md#delete28) (blank lines, paragraph)
31. [Enter2](../../spec/enter.md#enter2) (numbered list)
32. [Enter17](../../spec/enter.md#enter17) (CR line endings)
33. [Enter18](../../spec/enter.md#enter18) (CR line endings)
34. [Enter25](../../spec/enter.md#enter25) (numbered list)
35. [Enter32](../../spec/enter.md#enter32) (blank lines, heading, paragraph)
36. [Enter33](../../spec/enter.md#enter33) (blank lines, paragraph)
37. [Enter36](../../spec/enter.md#enter36) (blank lines)
38. [Enter43](../../spec/enter.md#enter43) (escape)
39. [Enter45](../../spec/enter.md#enter45) (blank lines, heading, paragraph)
40. [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap1](../../spec/gaps.md#gap1) (blank lines, paragraph)
41. [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap4](../../spec/gaps.md#gap4) (blank lines, paragraph)
42. [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap2](../../spec/gaps.md#gap2) (blank lines, paragraph)
43. [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap11](../../spec/gaps.md#gap11) (blank lines, paragraph)
44. [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap3](../../spec/gaps.md#gap3) (blank lines, heading, paragraph)
45. [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap5](../../spec/gaps.md#gap5) (blank lines)
46. [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap6](../../spec/gaps.md#gap6) (heading, paragraph)
47. [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap8](../../spec/gaps.md#gap8) (blank lines, paragraph)
48. [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap9](../../spec/gaps.md#gap9) (blank lines)
49. [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap10](../../spec/gaps.md#gap10) (blank lines, paragraph)
50. [MoveUp14](../../spec/move-subtree-up.md#moveup14) (blank lines, paragraph)
51. [New text and gaps › Gap12](../../spec/gaps.md#gap12) (blank lines, heading, paragraph)
52. [Indent3](../../spec/indent.md#indent3) (bullet *)
53. [Indent5](../../spec/indent.md#indent5) (bullet *)
54. [Indentation › destination-list-style](../../spec/obsidian-true-outliner.md#destination-list-style) (bullet *)
55. [Indent4](../../spec/indent.md#indent4) (numbered list)
56. [Indent11](../../spec/indent.md#indent11) (blank lines, paragraph)
57. [Indent15](../../spec/indent.md#indent15) (numbered list)
58. [Indent17](../../spec/indent.md#indent17) (CR line endings)
59. [Indent21](../../spec/indent.md#indent21) (blank lines, paragraph)
60. [Indent29](../../spec/indent.md#indent29) (blank lines, paragraph)
61. [MoveDown1](../../spec/move-subtree-down.md#movedown1) (blank lines)
62. [MoveDown4](../../spec/move-subtree-down.md#movedown4) (blank lines, heading, paragraph)
63. [MoveDown5](../../spec/move-subtree-down.md#movedown5) (blank lines, paragraph)
64. [MoveDown16](../../spec/move-subtree-down.md#movedown16) (heading)
65. [MoveDown18](../../spec/move-subtree-down.md#movedown18) (blank lines, heading)
66. [MoveDown22](../../spec/move-subtree-down.md#movedown22) (numbered list)
67. [MoveDown23](../../spec/move-subtree-down.md#movedown23) (numbered list)
68. [MoveDown24](../../spec/move-subtree-down.md#movedown24) (blank lines, paragraph)
69. [MoveDown26](../../spec/move-subtree-down.md#movedown26) (blank lines, heading, paragraph)
70. [MoveDown27](../../spec/move-subtree-down.md#movedown27) (blank lines, heading)
71. [MoveDown29](../../spec/move-subtree-down.md#movedown29) (blank lines, numbered list, paragraph)
72. [MoveDown30](../../spec/move-subtree-down.md#movedown30) (numbered list)
73. [MoveDown31](../../spec/move-subtree-down.md#movedown31) (blank lines, paragraph, thematic break)
74. [MoveDown35](../../spec/move-subtree-down.md#movedown35) (numbered list)
75. [MoveUp3](../../spec/move-subtree-up.md#moveup3) (blank lines, heading, paragraph)
76. [MoveUp4](../../spec/move-subtree-up.md#moveup4) (blank lines, paragraph)
77. [MoveUp15](../../spec/move-subtree-up.md#moveup15) (numbered list)
78. [MoveUp16](../../spec/move-subtree-up.md#moveup16) (heading)
79. [MoveUp17](../../spec/move-subtree-up.md#moveup17) (blank lines, paragraph)
80. [MoveUp19](../../spec/move-subtree-up.md#moveup19) (blank lines, paragraph, thematic break)
81. [MoveUp20](../../spec/move-subtree-up.md#moveup20) (blank lines, link reference definition, paragraph)
82. [MoveUp22](../../spec/move-subtree-up.md#moveup22) (blank lines, heading)
83. [MoveUp25](../../spec/move-subtree-up.md#moveup25) (blank lines)
84. [MoveUp26](../../spec/move-subtree-up.md#moveup26) (blank lines, heading)
85. [MoveUp30](../../spec/move-subtree-up.md#moveup30) (blank lines, link reference definition, paragraph)
86. [Enter › #228 › Renumbering stops at a delimiter change](../../spec/obsidian-true-outliner.md#renumbering-stops-at-a-delimiter-change) (numbered list)
87. [Enter › E10](../../spec/obsidian-true-outliner.md#e10) (blank lines, paragraph)
88. [Enter › E14, E20 › End of heading above a paragraph](../../spec/obsidian-true-outliner.md#end-of-heading-above-a-paragraph) (blank lines, heading, paragraph)
89. [Backspace › #269 › Emptied middle item removed and renumbered](../../spec/obsidian-true-outliner.md#emptied-middle-item-removed-and-renumbered) (numbered list)
90. [Backspace › Joining across ordered runs](../../spec/obsidian-true-outliner.md#joining-across-ordered-runs) (numbered list)
91. [Backspace › Joining away the head of a list › Next item becomes the new 1.](../../spec/obsidian-true-outliner.md#next-item-becomes-the-new-1) (numbered list)
92. [Backspace › Joining away the head of a list › List starting at 3 keeps its start](../../spec/obsidian-true-outliner.md#list-starting-at-3-keeps-its-start) (numbered list)
93. [Indentation › seams-across-a-re-indent › Indented item keeps its thematic break](../../spec/obsidian-true-outliner.md#indented-item-keeps-its-thematic-break) (blank lines, thematic break)
94. [Moving › lone-block-id › Block id moves with its paragraph](../../spec/obsidian-true-outliner.md#block-id-moves-with-its-paragraph) (blank lines, paragraph)
95. [Ordered lists › Outdenting the head of a nested list](../../spec/obsidian-true-outliner.md#outdenting-the-head-of-a-nested-list) (numbered list)
96. [Abandoning an empty place › Enter, Tab, then leave › An empty ordered child kept with a blank line](../../spec/obsidian-true-outliner.md#an-empty-ordered-child-kept-with-a-blank-line) (blank lines, numbered list)
97. [Abandoning an empty place › Enter, Tab, then leave › Blank line after the list stays](../../spec/obsidian-true-outliner.md#blank-line-after-the-list-stays) (blank lines, paragraph)
98. [Abandoning an empty place › Enter, Shift-Tab, then leave › Outdented empty ordered item stays](../../spec/obsidian-true-outliner.md#outdented-empty-ordered-item-stays) (numbered list)
99. [Outdent5](../../spec/outdent.md#outdent5) (heading)
100. [Outdent9](../../spec/outdent.md#outdent9) (numbered list)
101. [Outdent15](../../spec/outdent.md#outdent15) (blank lines, paragraph)
102. [Logical outdent › LogicalOutdent4](../../spec/outdent.md#logicaloutdent4) (blank lines, paragraph)
103. [Paste4](../../spec/paste.md#paste4) (escape)
104. [Paste30](../../spec/paste.md#paste30) (escape)
105. [Paste45](../../spec/paste.md#paste45) (escape)
106. [Paste51](../../spec/paste.md#paste51) (escape)
107. [Paste64](../../spec/paste.md#paste64) (escape, paragraph)
108. [Paste69](../../spec/paste.md#paste69) (escape, paragraph)
109. [Placeholder1](../../spec/placeholders.md#placeholder1) (blank lines)
110. [Placeholder5](../../spec/placeholders.md#placeholder5) (blank lines)
111. [Placeholder7](../../spec/placeholders.md#placeholder7) (blank lines)
112. [Placeholder14](../../spec/placeholders.md#placeholder14) (blank lines, paragraph)
113. [Placeholder16](../../spec/placeholders.md#placeholder16) (blank lines)
114. [Outliner flows › Scenario4](../../spec/scenarios.md#scenario4) (blank lines)
115. [Outliner flows › Scenario13](../../spec/scenarios.md#scenario13) (numbered list)
116. [Notes and sections › Scenario22](../../spec/scenarios.md#scenario22) (blank lines, heading)
117. [ShiftEnter20](../../spec/shift-enter.md#shiftenter20) (escape)

## Skipped

### a quote (96)

1. [backspace.md › Backspace27](../../spec/backspace.md#backspace27)
2. [backspace.md › Cmd-Backspace › SoftBackspace7](../../spec/backspace.md#softbackspace7)
3. [cursor.md › CursorHome11](../../spec/cursor.md#cursorhome11)
4. [cursor.md › CursorHome16](../../spec/cursor.md#cursorhome16)
5. [del.md › Delete10](../../spec/del.md#delete10)
6. [enter.md › Enter36b](../../spec/enter.md#enter36b)
7. [enter.md › Enter46](../../spec/enter.md#enter46)
8. [fences.md › Fence4](../../spec/fences.md#fence4)
9. [fences.md › Fence20](../../spec/fences.md#fence20)
10. [fences.md › Fence40](../../spec/fences.md#fence40)
11. [fences.md › Math, comments and indented code › Fence43](../../spec/fences.md#fence43)
12. [fences.md › Math, comments and indented code › Fence46](../../spec/fences.md#fence46)
13. [move-subtree-up.md › MoveUp35](../../spec/move-subtree-up.md#moveup35)
14. [obsidian-true-outliner.md › Enter › #267, E5](../../spec/obsidian-true-outliner.md#267-e5)
15. [obsidian-true-outliner.md › Indentation › #255 › Outdented child leaves quote above alone](../../spec/obsidian-true-outliner.md#outdented-child-leaves-quote-above-alone)
16. [obsidian-true-outliner.md › Indentation › seams-across-a-re-indent › Indented item keeps its quote](../../spec/obsidian-true-outliner.md#indented-item-keeps-its-quote)
17. [obsidian-true-outliner.md › Indentation › seams-across-a-re-indent › Outdented item keeps its quote](../../spec/obsidian-true-outliner.md#outdented-item-keeps-its-quote)
18. [obsidian-true-outliner.md › Moving › lazy-continuation-at-seams › Blank line added below a quote](../../spec/obsidian-true-outliner.md#blank-line-added-below-a-quote)
19. [obsidian-true-outliner.md › Paste › #264 › Pasted quote set off from paragraph](../../spec/obsidian-true-outliner.md#pasted-quote-set-off-from-paragraph)
20. [obsidian-true-outliner.md › Paste › #197 › Pasted list and block become children](../../spec/obsidian-true-outliner.md#pasted-list-and-block-become-children)
21. [paste.md › Paste12](../../spec/paste.md#paste12)
22. [paste.md › Paste23](../../spec/paste.md#paste23)
23. [paste.md › Paste29](../../spec/paste.md#paste29)
24. [paste.md › Paste41](../../spec/paste.md#paste41)
25. [paste.md › Paste72](../../spec/paste.md#paste72)
26. [paste.md › Paste77](../../spec/paste.md#paste77)
27. [quotes.md › Quote1](../../spec/quotes.md#quote1)
28. [quotes.md › Indent inside a quote › Quote2](../../spec/quotes.md#quote2)
29. [quotes.md › Indent inside a quote › Quote3](../../spec/quotes.md#quote3)
30. [quotes.md › Indent inside a quote › Quote4](../../spec/quotes.md#quote4)
31. [quotes.md › Indent inside a quote › Quote5](../../spec/quotes.md#quote5)
32. [quotes.md › Indent inside a quote › Quote6](../../spec/quotes.md#quote6)
33. [quotes.md › Indent inside a quote › Quote8](../../spec/quotes.md#quote8)
34. [quotes.md › Indent inside a quote › Quote9](../../spec/quotes.md#quote9)
35. [quotes.md › Quote10](../../spec/quotes.md#quote10)
36. [quotes.md › Outdent out of a quote › Quote11](../../spec/quotes.md#quote11)
37. [quotes.md › Outdent out of a quote › Quote12](../../spec/quotes.md#quote12)
38. [quotes.md › Outdent out of a quote › Quote12b](../../spec/quotes.md#quote12b)
39. [quotes.md › Outdent out of a quote › Quote14](../../spec/quotes.md#quote14)
40. [quotes.md › Outdent out of a quote › Quote15](../../spec/quotes.md#quote15)
41. [quotes.md › Outdent out of a quote › Quote16](../../spec/quotes.md#quote16)
42. [quotes.md › Indent into a quote › Quote17](../../spec/quotes.md#quote17)
43. [quotes.md › Indent into a quote › Quote18](../../spec/quotes.md#quote18)
44. [quotes.md › Indent into a quote › Quote19](../../spec/quotes.md#quote19)
45. [quotes.md › Moving between quotes › Quote20](../../spec/quotes.md#quote20)
46. [quotes.md › Moving between quotes › Quote21](../../spec/quotes.md#quote21)
47. [quotes.md › Moving between quotes › Quote22](../../spec/quotes.md#quote22)
48. [quotes.md › Moving between quotes › Quote23](../../spec/quotes.md#quote23)
49. [quotes.md › Moving inside a quote › Quote24](../../spec/quotes.md#quote24)
50. [quotes.md › Moving inside a quote › Quote25](../../spec/quotes.md#quote25)
51. [quotes.md › Moving inside a quote › Quote26](../../spec/quotes.md#quote26)
52. [quotes.md › A quote and a heading don't swap › Quote27](../../spec/quotes.md#quote27)
53. [quotes.md › A quote and a heading don't swap › Quote28](../../spec/quotes.md#quote28)
54. [quotes.md › Enter in a quote › Quote29](../../spec/quotes.md#quote29)
55. [quotes.md › Enter in a quote › Quote30](../../spec/quotes.md#quote30)
56. [quotes.md › Enter in a quote › Quote31](../../spec/quotes.md#quote31)
57. [quotes.md › Enter in a quote › Quote32](../../spec/quotes.md#quote32)
58. [quotes.md › Enter in a quote › Quote33](../../spec/quotes.md#quote33)
59. [quotes.md › Enter in a quote › Quote34](../../spec/quotes.md#quote34)
60. [quotes.md › Enter in a quote › Quote35](../../spec/quotes.md#quote35)
61. [quotes.md › Enter in a quote › Quote36](../../spec/quotes.md#quote36)
62. [quotes.md › Enter in a quote › Quote37](../../spec/quotes.md#quote37)
63. [quotes.md › Enter in a quote › Quote42](../../spec/quotes.md#quote42)
64. [quotes.md › Shift-Enter in a quote › Quote44](../../spec/quotes.md#quote44)
65. [quotes.md › Shift-Enter in a quote › Quote45](../../spec/quotes.md#quote45)
66. [quotes.md › Shift-Enter in a quote › Quote46](../../spec/quotes.md#quote46)
67. [quotes.md › Joining in a quote › Quote48](../../spec/quotes.md#quote48)
68. [quotes.md › Joining in a quote › Quote49](../../spec/quotes.md#quote49)
69. [quotes.md › Joining in a quote › Quote50](../../spec/quotes.md#quote50)
70. [quotes.md › Joining in a quote › Quote51](../../spec/quotes.md#quote51)
71. [quotes.md › Joining across a quote's edge › Quote52](../../spec/quotes.md#quote52)
72. [quotes.md › Backspace at a quote's start › Quote53](../../spec/quotes.md#quote53)
73. [quotes.md › Backspace at a quote's start › Quote54](../../spec/quotes.md#quote54)
74. [quotes.md › Backspace at a quote's start › Quote56](../../spec/quotes.md#quote56)
75. [quotes.md › Backspace at a quote's start › Quote59](../../spec/quotes.md#quote59)
76. [quotes.md › Quote63](../../spec/quotes.md#quote63)
77. [quotes.md › Quote64](../../spec/quotes.md#quote64)
78. [quotes.md › Indenting a paragraph into a quote › Quote65](../../spec/quotes.md#quote65)
79. [quotes.md › Indenting a paragraph into a quote › Quote66](../../spec/quotes.md#quote66)
80. [quotes.md › Quote67](../../spec/quotes.md#quote67)
81. [quotes.md › Quote68](../../spec/quotes.md#quote68)
82. [quotes.md › Quote72](../../spec/quotes.md#quote72)
83. [quotes.md › Quote73](../../spec/quotes.md#quote73)
84. [quotes.md › Quote74](../../spec/quotes.md#quote74)
85. [quotes.md › Quote75](../../spec/quotes.md#quote75)
86. [quotes.md › Quote76](../../spec/quotes.md#quote76)
87. [quotes.md › Quote77](../../spec/quotes.md#quote77)
88. [quotes.md › Quote78](../../spec/quotes.md#quote78)
89. [quotes.md › Quote80](../../spec/quotes.md#quote80)
90. [quotes.md › Quote81](../../spec/quotes.md#quote81)
91. [quotes.md › Quote88](../../spec/quotes.md#quote88)
92. [quotes.md › Quote83](../../spec/quotes.md#quote83)
93. [quotes.md › Quote85](../../spec/quotes.md#quote85)
94. [quotes.md › Quote87](../../spec/quotes.md#quote87)
95. [quotes.md › A paragraph outdented out of a nested quote › Quote69](../../spec/quotes.md#quote69)
96. [quotes.md › A paragraph outdented out of a nested quote › Quote70](../../spec/quotes.md#quote70)

### code block (64)

1. [backspace.md › Backspace16](../../spec/backspace.md#backspace16)
2. [backspace.md › Backspace24](../../spec/backspace.md#backspace24)
3. [backspace.md › Backspace28](../../spec/backspace.md#backspace28)
4. [backspace.md › Cmd-Backspace › SoftBackspace9](../../spec/backspace.md#softbackspace9)
5. [cursor.md › CursorDown2](../../spec/cursor.md#cursordown2)
6. [del.md › Delete11](../../spec/del.md#delete11)
7. [enter.md › Enter23](../../spec/enter.md#enter23)
8. [fences.md › Fence1](../../spec/fences.md#fence1)
9. [fences.md › Fence2](../../spec/fences.md#fence2)
10. [fences.md › Fence3](../../spec/fences.md#fence3)
11. [fences.md › Fence5](../../spec/fences.md#fence5)
12. [fences.md › Fence6](../../spec/fences.md#fence6)
13. [fences.md › Fence7](../../spec/fences.md#fence7)
14. [fences.md › Fence7b](../../spec/fences.md#fence7b)
15. [fences.md › Fence7c](../../spec/fences.md#fence7c)
16. [fences.md › Fence7d](../../spec/fences.md#fence7d)
17. [fences.md › Fence8](../../spec/fences.md#fence8)
18. [fences.md › Fence9](../../spec/fences.md#fence9)
19. [fences.md › Fence12](../../spec/fences.md#fence12)
20. [fences.md › Fence13](../../spec/fences.md#fence13)
21. [fences.md › Fence14](../../spec/fences.md#fence14)
22. [fences.md › Fence15](../../spec/fences.md#fence15)
23. [fences.md › Fence16](../../spec/fences.md#fence16)
24. [fences.md › Fence17](../../spec/fences.md#fence17)
25. [fences.md › Fence18](../../spec/fences.md#fence18)
26. [fences.md › Fence19](../../spec/fences.md#fence19)
27. [fences.md › Fence21](../../spec/fences.md#fence21)
28. [fences.md › Fence22](../../spec/fences.md#fence22)
29. [fences.md › Fence23](../../spec/fences.md#fence23)
30. [fences.md › Fence24](../../spec/fences.md#fence24)
31. [fences.md › Fence25](../../spec/fences.md#fence25)
32. [fences.md › Fence26](../../spec/fences.md#fence26)
33. [fences.md › Fence27](../../spec/fences.md#fence27)
34. [fences.md › Fence28](../../spec/fences.md#fence28)
35. [fences.md › Fence29](../../spec/fences.md#fence29)
36. [fences.md › Fence30](../../spec/fences.md#fence30)
37. [fences.md › Fence31](../../spec/fences.md#fence31)
38. [fences.md › Fence32](../../spec/fences.md#fence32)
39. [fences.md › Fence33](../../spec/fences.md#fence33)
40. [fences.md › Fence34](../../spec/fences.md#fence34)
41. [fences.md › Fence35](../../spec/fences.md#fence35)
42. [fences.md › Fence36](../../spec/fences.md#fence36)
43. [fences.md › Fence37](../../spec/fences.md#fence37)
44. [fences.md › Fence38](../../spec/fences.md#fence38)
45. [fences.md › Fence39](../../spec/fences.md#fence39)
46. [fences.md › Fence41](../../spec/fences.md#fence41)
47. [fences.md › Fence48](../../spec/fences.md#fence48)
48. [fences.md › Math, comments and indented code › Fence44](../../spec/fences.md#fence44)
49. [gaps.md › moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap7](../../spec/gaps.md#gap7)
50. [indent.md › Indent13](../../spec/indent.md#indent13)
51. [indent.md › Indent20](../../spec/indent.md#indent20)
52. [move-subtree-down.md › MoveDown21](../../spec/move-subtree-down.md#movedown21)
53. [move-subtree-down.md › MoveDown34](../../spec/move-subtree-down.md#movedown34)
54. [move-subtree-down.md › MoveDown37](../../spec/move-subtree-down.md#movedown37)
55. [move-subtree-up.md › MoveUp13](../../spec/move-subtree-up.md#moveup13)
56. [move-subtree-up.md › MoveUp18](../../spec/move-subtree-up.md#moveup18)
57. [obsidian-true-outliner.md › Indentation › seams-across-a-re-indent › Outdented item keeps its code block](../../spec/obsidian-true-outliner.md#outdented-item-keeps-its-code-block)
58. [obsidian-true-outliner.md › Moving › lazy-continuation-at-seams › No blank line needed after a fence](../../spec/obsidian-true-outliner.md#no-blank-line-needed-after-a-fence)
59. [obsidian-true-outliner.md › Moving › lazy-continuation-at-seams › No blank line needed before a fence](../../spec/obsidian-true-outliner.md#no-blank-line-needed-before-a-fence)
60. [outdent.md › Outdent19](../../spec/outdent.md#outdent19)
61. [paste.md › Paste22](../../spec/paste.md#paste22)
62. [paste.md › Paste46](../../spec/paste.md#paste46)
63. [paste.md › Paste47](../../spec/paste.md#paste47)
64. [paste.md › Paste71](../../spec/paste.md#paste71)

### a caret in a marker (22)

1. [backspace.md › Backspace2](../../spec/backspace.md#backspace2)
2. [cursor.md › CursorHome3](../../spec/cursor.md#cursorhome3)
3. [cursor.md › CursorHome4](../../spec/cursor.md#cursorhome4)
4. [cursor.md › CursorHome15](../../spec/cursor.md#cursorhome15)
5. [del.md › Delete16](../../spec/del.md#delete16)
6. [del.md › Delete16d](../../spec/del.md#delete16d)
7. [del.md › Delete16e](../../spec/del.md#delete16e)
8. [del.md › Delete16f](../../spec/del.md#delete16f)
9. [del.md › Delete16g](../../spec/del.md#delete16g)
10. [del.md › Delete23](../../spec/del.md#delete23)
11. [del.md › Delete24](../../spec/del.md#delete24)
12. [del.md › Delete25](../../spec/del.md#delete25)
13. [enter.md › Enter34](../../spec/enter.md#enter34)
14. [indent.md › Indent28](../../spec/indent.md#indent28)
15. [indent.md › Indent30](../../spec/indent.md#indent30)
16. [move-subtree-down.md › MoveDown32](../../spec/move-subtree-down.md#movedown32)
17. [move-subtree-up.md › MoveUp34](../../spec/move-subtree-up.md#moveup34)
18. [move-subtree-up.md › MoveUp36](../../spec/move-subtree-up.md#moveup36)
19. [obsidian-true-outliner.md › Shift-Enter › S5](../../spec/obsidian-true-outliner.md#s5)
20. [outdent.md › Outdent14](../../spec/outdent.md#outdent14)
21. [outdent.md › Outdent16](../../spec/outdent.md#outdent16)
22. [shift-enter.md › ShiftEnter22](../../spec/shift-enter.md#shiftenter22)

### a callout (19)

1. [cursor.md › CursorHome17](../../spec/cursor.md#cursorhome17)
2. [paste.md › Paste28](../../spec/paste.md#paste28)
3. [paste.md › Paste55](../../spec/paste.md#paste55)
4. [quotes.md › Indent inside a quote › Quote7](../../spec/quotes.md#quote7)
5. [quotes.md › Outdent out of a quote › Quote13](../../spec/quotes.md#quote13)
6. [quotes.md › Enter in a quote › Quote38](../../spec/quotes.md#quote38)
7. [quotes.md › Enter in a quote › Quote39](../../spec/quotes.md#quote39)
8. [quotes.md › Enter in a quote › Quote40](../../spec/quotes.md#quote40)
9. [quotes.md › Enter in a quote › Quote41](../../spec/quotes.md#quote41)
10. [quotes.md › Enter in a quote › Quote43](../../spec/quotes.md#quote43)
11. [quotes.md › Shift-Enter in a quote › Quote47](../../spec/quotes.md#quote47)
12. [quotes.md › Backspace at a quote's start › Quote57](../../spec/quotes.md#quote57)
13. [quotes.md › Backspace at a quote's start › Quote58](../../spec/quotes.md#quote58)
14. [quotes.md › Joining into a callout's title › Quote60](../../spec/quotes.md#quote60)
15. [quotes.md › Joining into a callout's title › Quote61](../../spec/quotes.md#quote61)
16. [quotes.md › Joining into a callout's title › Quote62](../../spec/quotes.md#quote62)
17. [quotes.md › Quote71](../../spec/quotes.md#quote71)
18. [quotes.md › Quote79](../../spec/quotes.md#quote79)
19. [quotes.md › Quote84](../../spec/quotes.md#quote84)

### a caret on a blank line (14)

1. [backspace.md › Cmd-Backspace › SoftBackspace6](../../spec/backspace.md#softbackspace6)
2. [enter.md › Enter37](../../spec/enter.md#enter37)
3. [gaps.md › Keys on a blank line › Gap14](../../spec/gaps.md#gap14)
4. [gaps.md › Keys on a blank line › Gap15](../../spec/gaps.md#gap15)
5. [gaps.md › Keys on a blank line › Gap16](../../spec/gaps.md#gap16)
6. [gaps.md › Keys on a blank line › Gap17](../../spec/gaps.md#gap17)
7. [gaps.md › Keys on a blank line › Gap18](../../spec/gaps.md#gap18)
8. [obsidian-true-outliner.md › Enter › E18](../../spec/obsidian-true-outliner.md#e18)
9. [obsidian-true-outliner.md › Shift-Enter › S7, S8 › Line break in setext underline refused](../../spec/obsidian-true-outliner.md#line-break-in-setext-underline-refused)
10. [paste.md › Paste65](../../spec/paste.md#paste65)
11. [paste.md › Paste67](../../spec/paste.md#paste67)
12. [placeholders.md › Placeholder10](../../spec/placeholders.md#placeholder10)
13. [placeholders.md › Placeholder12](../../spec/placeholders.md#placeholder12)
14. [typing.md › Typing1](../../spec/typing.md#typing1)

### a selection across blocks (14)

1. [backspace.md › Backspace31](../../spec/backspace.md#backspace31)
2. [del.md › Delete21](../../spec/del.md#delete21)
3. [indent.md › Indent9](../../spec/indent.md#indent9)
4. [indent.md › Indent27](../../spec/indent.md#indent27)
5. [move-subtree-down.md › MoveDown11](../../spec/move-subtree-down.md#movedown11)
6. [move-subtree-down.md › MoveDown12](../../spec/move-subtree-down.md#movedown12)
7. [move-subtree-down.md › MoveDown14](../../spec/move-subtree-down.md#movedown14)
8. [move-subtree-up.md › MoveUp10](../../spec/move-subtree-up.md#moveup10)
9. [move-subtree-up.md › MoveUp11](../../spec/move-subtree-up.md#moveup11)
10. [move-subtree-up.md › MoveUp31](../../spec/move-subtree-up.md#moveup31)
11. [outdent.md › Outdent8](../../spec/outdent.md#outdent8)
12. [outdent.md › Outdent10](../../spec/outdent.md#outdent10)
13. [outdent.md › Outdent12](../../spec/outdent.md#outdent12)
14. [paste.md › Paste50](../../spec/paste.md#paste50)

### action deleteSubtree (13)

1. [delete-subtree.md › DeleteSubtree1](../../spec/delete-subtree.md#deletesubtree1)
2. [delete-subtree.md › DeleteSubtree2](../../spec/delete-subtree.md#deletesubtree2)
3. [delete-subtree.md › DeleteSubtree3](../../spec/delete-subtree.md#deletesubtree3)
4. [delete-subtree.md › DeleteSubtree4](../../spec/delete-subtree.md#deletesubtree4)
5. [delete-subtree.md › DeleteSubtree5](../../spec/delete-subtree.md#deletesubtree5)
6. [delete-subtree.md › DeleteSubtree6](../../spec/delete-subtree.md#deletesubtree6)
7. [delete-subtree.md › DeleteSubtree7](../../spec/delete-subtree.md#deletesubtree7)
8. [delete-subtree.md › DeleteSubtree8](../../spec/delete-subtree.md#deletesubtree8)
9. [delete-subtree.md › DeleteSubtree9](../../spec/delete-subtree.md#deletesubtree9)
10. [delete-subtree.md › DeleteSubtree10](../../spec/delete-subtree.md#deletesubtree10)
11. [quotes.md › Quote82](../../spec/quotes.md#quote82)
12. [scenarios.md › Outliner flows › Scenario10](../../spec/scenarios.md#scenario10)
13. [z-open.md › Open2](../../spec/z-open.md#open2)

### code block (expected) (10)

1. [paste.md › Paste1](../../spec/paste.md#paste1)
2. [paste.md › Paste9](../../spec/paste.md#paste9)
3. [paste.md › Paste11](../../spec/paste.md#paste11)
4. [paste.md › Paste25](../../spec/paste.md#paste25)
5. [paste.md › Paste52](../../spec/paste.md#paste52)
6. [paste.md › Paste62](../../spec/paste.md#paste62)
7. [paste.md › Paste66](../../spec/paste.md#paste66)
8. [paste.md › Paste70](../../spec/paste.md#paste70)
9. [paste.md › Paste74](../../spec/paste.md#paste74)
10. [scenarios.md › Outliner flows › Scenario18](../../spec/scenarios.md#scenario18)

### action duplicateSubtree (9)

1. [duplicate-subtree.md › DuplicateSubtree1](../../spec/duplicate-subtree.md#duplicatesubtree1)
2. [duplicate-subtree.md › DuplicateSubtree2](../../spec/duplicate-subtree.md#duplicatesubtree2)
3. [duplicate-subtree.md › DuplicateSubtree3](../../spec/duplicate-subtree.md#duplicatesubtree3)
4. [duplicate-subtree.md › DuplicateSubtree4](../../spec/duplicate-subtree.md#duplicatesubtree4)
5. [duplicate-subtree.md › DuplicateSubtree5](../../spec/duplicate-subtree.md#duplicatesubtree5)
6. [duplicate-subtree.md › DuplicateSubtree6](../../spec/duplicate-subtree.md#duplicatesubtree6)
7. [duplicate-subtree.md › DuplicateSubtree7](../../spec/duplicate-subtree.md#duplicatesubtree7)
8. [duplicate-subtree.md › DuplicateSubtree8](../../spec/duplicate-subtree.md#duplicatesubtree8)
9. [quotes.md › Quote86](../../spec/quotes.md#quote86)

### cursorCharLeft after cursorDocEnd (5)

1. [cursor.md › CursorDocEndLeft1](../../spec/cursor.md#cursordocendleft1)
2. [placeholders.md › Placeholder9](../../spec/placeholders.md#placeholder9)
3. [placeholders.md › Placeholder11](../../spec/placeholders.md#placeholder11)
4. [placeholders.md › Placeholder15](../../spec/placeholders.md#placeholder15)
5. [undo.md › Undo2](../../spec/undo.md#undo2)

### math (5)

1. [fences.md › Math, comments and indented code › Fence42](../../spec/fences.md#fence42)
2. [fences.md › Math, comments and indented code › Fence45](../../spec/fences.md#fence45)
3. [fences.md › Math, comments and indented code › Fence47](../../spec/fences.md#fence47)
4. [move-subtree-up.md › MoveUp37](../../spec/move-subtree-up.md#moveup37)
5. [move-subtree-up.md › MoveUp38](../../spec/move-subtree-up.md#moveup38)

### option editInMarkup: refuse (5)

1. [del.md › Delete16b](../../spec/del.md#delete16b)
2. [del.md › Delete16c](../../spec/del.md#delete16c)
3. [quotes.md › Enter in a quote › Quote43b](../../spec/quotes.md#quote43b)
4. [shift-enter.md › ShiftEnter22b](../../spec/shift-enter.md#shiftenter22b)
5. [typing.md › Typing4](../../spec/typing.md#typing4)

### option headingEditing: block (5)

1. [backspace.md › Backspace18b](../../spec/backspace.md#backspace18b)
2. [backspace.md › Backspace18f](../../spec/backspace.md#backspace18f)
3. [del.md › Delete13b](../../spec/del.md#delete13b)
4. [del.md › Delete13d](../../spec/del.md#delete13d)
5. [del.md › Delete13f](../../spec/del.md#delete13f)

### option enterAtTextStart: stay (4)

1. [enter.md › Enter26b](../../spec/enter.md#enter26b)
2. [enter.md › Enter29b](../../spec/enter.md#enter29b)
3. [enter.md › Enter32b](../../spec/enter.md#enter32b)
4. [enter.md › Enter33b](../../spec/enter.md#enter33b)

### option enterMidItem: child (4)

1. [enter.md › Enter3b](../../spec/enter.md#enter3b)
2. [obsidian-true-outliner.md › Enter › E7, E8 › Split item becomes first tab-indented child](../../spec/obsidian-true-outliner.md#split-item-becomes-first-tab-indented-child)
3. [obsidian-true-outliner.md › Enter › E11](../../spec/obsidian-true-outliner.md#e11)
4. [paste.md › Paste43](../../spec/paste.md#paste43)

### table (4)

1. [enter.md › Enter49](../../spec/enter.md#enter49)
2. [enter.md › Enter50](../../spec/enter.md#enter50)
3. [paste.md › Paste56](../../spec/paste.md#paste56)
4. [shift-enter.md › ShiftEnter24](../../spec/shift-enter.md#shiftenter24)

### a caret in a heading's #s (3)

1. [outdent.md › Outdent17](../../spec/outdent.md#outdent17)
2. [outdent.md › Outdent17b](../../spec/outdent.md#outdent17b)
3. [outdent.md › Outdent18](../../spec/outdent.md#outdent18)

### changes only what blocks can't show (2)

1. [enter.md › Enter6](../../spec/enter.md#enter6)
2. [indent.md › Indent22](../../spec/indent.md#indent22)

### math (expected) (2)

1. [paste.md › Paste44](../../spec/paste.md#paste44)
2. [paste.md › Paste79](../../spec/paste.md#paste79)

### option backspaceAtTopItem: refuse (2)

1. [backspace.md › Backspace34](../../spec/backspace.md#backspace34)
2. [quotes.md › Backspace at a quote's start › Quote55](../../spec/quotes.md#quote55)

### option deleteAtGap: gap (2)

1. [backspace.md › Backspace21b](../../spec/backspace.md#backspace21b)
2. [del.md › Delete17b](../../spec/del.md#delete17b)

### option handleFenceContents: false (2)

1. [fences.md › Fence10](../../spec/fences.md#fence10)
2. [fences.md › Fence11](../../spec/fences.md#fence11)

### option taskEditing: block (2)

1. [tasks.md › TaskBackspace4](../../spec/tasks.md#taskbackspace4)
2. [tasks.md › TaskBackspace7](../../spec/tasks.md#taskbackspace7)

### a heading deeper than H3 (1)

1. [indent.md › Indent24](../../spec/indent.md#indent24)

### frontmatter (1)

1. [gaps.md › Keys on a blank line › Gap19](../../spec/gaps.md#gap19)

### no nodes (1)

1. [backspace.md › Backspace17e](../../spec/backspace.md#backspace17e)

### option bullet: + (1)

1. [indent.md › Indent18](../../spec/indent.md#indent18)

### option taskEditing: text (1)

1. [tasks.md › TaskBackspace5](../../spec/tasks.md#taskbackspace5)
