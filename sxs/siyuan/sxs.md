---
type: "SxS"
app: "siyuan"
version: "3.8.6"
url: "http://127.0.0.1:6816/stage/build/desktop/"
model: "block"
command: "node sxs/run.ts siyuan"
elapsed_s: 421
---

# SiYuan vs ourus

Summary:

|  | agree | caret | whitespace | disagree | error | skipped | total |
| --- | --- | --- | --- | --- | --- | --- | --- |
| original | 101 |  | [21](#whitespace-21) | [38](#disagree-38) | [3](#error-3) |  | **163** |
| adapted | 118 | [8](#adapted-caret-8) | [16](#adapted-whitespace-16) | [47](#adapted-disagree-47) | [5](#adapted-error-5) |  | **194** |
| **total** | **219 (28%)** | **8 (1%)** | **37 (4.7%)** | **85 (11%)** | **8 (1%)** | **[430](#skipped-430) (55%)** | **787** |

Per-file:

|  | agree | caret | whitespace | disagree | error | skipped | total | original | adapted |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [backspace.md](../../spec/backspace.md) | 9 |  | 7 | 13 | 2 | 34 | **65** | 14 | 17 |
| [cursor.md](../../spec/cursor.md) | 24 | 4 |  |  |  | 8 | **36** | 13 | 15 |
| [del.md](../../spec/del.md) | 3 |  | 5 | 10 |  | 30 | **48** | 12 | 6 |
| [delete-subtree.md](../../spec/delete-subtree.md) |  |  |  |  |  | 10 | **10** |  |  |
| [duplicate-subtree.md](../../spec/duplicate-subtree.md) |  |  |  | 1 |  | 7 | **8** | 1 |  |
| [enter.md](../../spec/enter.md) | 19 | 1 | 5 | 11 | 3 | 20 | **59** | 21 | 18 |
| [fences.md](../../spec/fences.md) | 7 |  | 1 |  | 1 | 42 | **51** |  | 9 |
| [gaps.md](../../spec/gaps.md) | 13 |  |  |  |  | 6 | **19** |  | 13 |
| [indent.md](../../spec/indent.md) | 18 |  |  |  |  | 12 | **30** | 11 | 7 |
| [move-subtree-down.md](../../spec/move-subtree-down.md) | 20 |  |  |  | 1 | 16 | **37** | 11 | 10 |
| [move-subtree-up.md](../../spec/move-subtree-up.md) | 19 |  |  |  |  | 19 | **38** | 9 | 10 |
| [obsidian-true-outliner.md](../../spec/obsidian-true-outliner.md) | 24 |  | 9 | 9 | 1 | 24 | **67** | 25 | 18 |
| [outdent.md](../../spec/outdent.md) | 10 |  |  |  |  | 19 | **29** | 6 | 4 |
| [paste.md](../../spec/paste.md) | 21 | 1 | 3 | 27 |  | 55 | **107** | 18 | 34 |
| [placeholders.md](../../spec/placeholders.md) | 5 |  | 3 |  |  | 8 | **16** | 2 | 6 |
| [quotes.md](../../spec/quotes.md) |  |  |  |  |  | 90 | **90** |  |  |
| [scenarios.md](../../spec/scenarios.md) | 12 |  |  | 6 |  | 6 | **24** | 11 | 7 |
| [shift-enter.md](../../spec/shift-enter.md) | 9 | 1 | 3 | 2 |  | 11 | **26** | 6 | 9 |
| [tasks.md](../../spec/tasks.md) | 3 | 1 | 1 | 6 |  | 6 | **17** |  | 11 |
| [typing.md](../../spec/typing.md) |  |  |  |  |  | 4 | **4** |  |  |
| [undo.md](../../spec/undo.md) | 3 |  |  |  |  | 2 | **5** | 3 |  |
| [z-open.md](../../spec/z-open.md) |  |  |  |  |  | 1 | **1** |  |  |
| **total** | **219 (28%)** | **8 (1%)** | **37 (4.7%)** | **85 (11%)** | **8 (1%)** | **430 (55%)** | **787** | **163 (21%)** | **194 (25%)** |

## Disagree (38)

### [Backspace1](../../spec/backspace.md#backspace1)

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
  - ┃two
```

</td><td>

```buffer
- one┃two
```

</td></tr>
</table>

### [Backspace3](../../spec/backspace.md#backspace3)

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

### [Backspace8](../../spec/backspace.md#backspace8)

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

### [Backspace17](../../spec/backspace.md#backspace17)

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

### [Backspace17b](../../spec/backspace.md#backspace17b)

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

### [Backspace30](../../spec/backspace.md#backspace30)

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

### [Delete1](../../spec/del.md#delete1)

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

### [Delete2](../../spec/del.md#delete2)

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
  - two
```

</td><td>

```buffer
- one┃two
```

</td></tr>
</table>

### [Delete5c](../../spec/del.md#delete5c)

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

### [Delete7](../../spec/del.md#delete7)

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

### [Delete12](../../spec/del.md#delete12)

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
  - c
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

### [DuplicateSubtree1](../../spec/duplicate-subtree.md#duplicatesubtree1)

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
  - ▮ ┃a
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

### [Enter3d](../../spec/enter.md#enter3d)

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

### [Enter7](../../spec/enter.md#enter7)

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

</td></tr>
</table>

### [Enter21](../../spec/enter.md#enter21)

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
- ┃
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

### [Enter27](../../spec/enter.md#enter27)

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
  ┃
  - b
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

### [Enter28](../../spec/enter.md#enter28)

> enter

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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

</td><td>

```buffer
- a
  - ┃
  - 
  - c
```

</td></tr>
</table>

### [Enter35](../../spec/enter.md#enter35)

> enter

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- 1. abc ┃2. def
```

</td><td>

```buffer
- 1. abc
- 2. 
  - 2. ┃def
```

</td><td>

```buffer
- 1. abc
- 2. ┃2\. def
```

</td></tr>
</table>

### [Enter38](../../spec/enter.md#enter38)

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
  - ┃two
- next
```

</td><td>

```buffer
- one┃two
- next
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
<tr><th>siyuan</th><th>ourus</th></tr>
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
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one two
  - ┃ three
```

</td><td>

```buffer
- one two┃three
```

</td></tr>
</table>

### [Place inside a multi-line item](../../spec/obsidian-true-outliner.md#place-inside-a-multi-line-item)

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
  - ┃bar
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
  - x┃bar
```

</td><td>

```buffer
- foo
  x┃
  bar
```

</td></tr>
</table>

### [Children move to the joined node](../../spec/obsidian-true-outliner.md#children-move-to-the-joined-node)

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

### [Delete forward absorbs child with grandchildren](../../spec/obsidian-true-outliner.md#delete-forward-absorbs-child-with-grandchildren)

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

### [Joining across ordered runs](../../spec/obsidian-true-outliner.md#joining-across-ordered-runs)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- 1. a
- 2. b
- ┃x
- 3. c
```

</td><td>

```buffer
- 1. a
- 2. b
- ┃x
  - 3. c
```

</td><td>

```buffer
- 1. a
- 2. b┃x
- 3. c
```

</td></tr>
</table>

### [Next item becomes the new 1.](../../spec/obsidian-true-outliner.md#next-item-becomes-the-new-1)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- p
  - 1. ┃a
  - 2. b
```

</td><td>

```buffer
- p
  - ┃a
  - 1. b
```

</td><td>

```buffer
- p┃a
  - 1. b
```

</td></tr>
</table>

### [List starting at 3 keeps its start](../../spec/obsidian-true-outliner.md#list-starting-at-3-keeps-its-start)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- 3. a
- 4. ┃b
- 5. c
```

</td><td>

```buffer
- 3. a
  - ┃b
- 4. c
```

</td><td>

```buffer
- 3. a┃b
- 4. c
```

</td></tr>
</table>

### [Enter, then Shift-Enter and Backspace](../../spec/obsidian-true-outliner.md#enter-then-shift-enter-and-backspace)

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
  ┃
```

</td><td>

```buffer
- foo
- ┃
```

</td></tr>
</table>

### [Paste3](../../spec/paste.md#paste3)

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

### [Paste7](../../spec/paste.md#paste7)

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

### [Paste31](../../spec/paste.md#paste31)

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

### [Paste38](../../spec/paste.md#paste38)

> pasteStructured

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
    - x
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

### [Paste78](../../spec/paste.md#paste78)

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

### [Scenario3](../../spec/scenarios.md#scenario3)

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
<tr><th>siyuan</th><th>ourus</th></tr>
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
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- buy milk
  -  ┃ and eggs
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
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- buy milk
  - ┃  and eggs
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
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- buy milk
  
  - today:┃  and eggs
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
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- buy milk
  
  - today:  and eggs
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
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- buy milk
  
  - today:  and eggs┃
  - call A
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
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- amore┃
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
  - b
```

</td><td>

```buffer
- amore┃b
```

</td></tr>
</table>

### [Scenario12](../../spec/scenarios.md#scenario12)

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
- one two┃three
```

</td></tr>
</table>

## Whitespace (21)

### [Backspace5](../../spec/backspace.md#backspace5)

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
  ┃b
```

</td><td>

```buffer
- ┃b
```

</td></tr>
</table>

### [Backspace7](../../spec/backspace.md#backspace7)

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
  ┃
  - b
```

</td><td>

```buffer
- a
  - b┃
```

</td></tr>
</table>

### [Backspace17c](../../spec/backspace.md#backspace17c)

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
  ┃
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

### [Backspace17d](../../spec/backspace.md#backspace17d)

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
  ┃
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

### [Delete5](../../spec/del.md#delete5)

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
  a
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

### [Delete5b](../../spec/del.md#delete5b)

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
    b
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

### [Delete6](../../spec/del.md#delete6)

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
  b
```

</td><td>

```buffer
- a
- ┃b
```

</td></tr>
</table>

### [Delete20](../../spec/del.md#delete20)

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
  
- b
```

</td><td>

```buffer
- a┃
- b
```

</td></tr>
</table>

### [Enter1](../../spec/enter.md#enter1)

> enter

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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

### [Enter3c](../../spec/enter.md#enter3c)

> enter

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- 9. a┃ b
  - c
- 10. d
```

</td><td>

```buffer
- 9. a
- 10. ┃ b
  - c
- 11. d
```

</td><td>

```buffer
- 9. a
- 10. ┃b
  - c
- 11. d
```

</td></tr>
</table>

### [Enter39](../../spec/enter.md#enter39)

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
  ┃
- c
```

</td><td>

```buffer
- ab┃
- c
```

</td></tr>
</table>

### [E4](../../spec/obsidian-true-outliner.md#e4)

> enter

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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

### [Emptied middle item removed and renumbered](../../spec/obsidian-true-outliner.md#emptied-middle-item-removed-and-renumbered)

> deleteContentBackward deleteContentBackward

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- 1. p
- 2. a┃
- 3. q
```

</td><td>

```buffer
- 1. p
  ┃
- 2. q
```

</td><td>

```buffer
- 1. p┃
- 2. q
```

</td></tr>
</table>

### [Paste5](../../spec/paste.md#paste5)

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

### [Paste10](../../spec/paste.md#paste10)

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
<tr><th>siyuan</th><th>ourus</th></tr>
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

### [ShiftEnter2](../../spec/shift-enter.md#shiftenter2)

> shiftEnter

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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

## Error (3)

### [Backspace41](../../spec/backspace.md#backspace41)

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

> deleteContentBackward

Error: SiYuan holds the starting state differently:
  meant:
    - - ┃a
      - a
      - b
  holds:
    - 
      - a
      - a
      - b

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

Error: SiYuan holds the starting state differently:
  meant:
    - - ┃a
      - a
      - b
  holds:
    - 
      - a
      - a
      - b

> moveSubtreeUp

### [Renumbering stops at a delimiter change](../../spec/obsidian-true-outliner.md#renumbering-stops-at-a-delimiter-change)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- 1. a┃
- 1. b
- 2. c
```

</td></tr>
</table>

> enter

Error: SiYuan holds the starting state differently:
  meant:
    - 1. a┃
    - 1. b
    - 2. c
  holds:
    - 1. a┃
    - 2. b
    - 3. c

## Adapted: disagree (47)

### [Backspace11](../../spec/backspace.md#backspace11)

> deleteContentBackward

Adapted: blank lines, paragraph

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
- a┃b
```

</td></tr>
</table>

### [Backspace15](../../spec/backspace.md#backspace15)

> deleteContentBackward

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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

### [Backspace22](../../spec/backspace.md#backspace22)

> deleteContentBackward

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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

### [Backspace36](../../spec/backspace.md#backspace36)

> deleteContentBackward

Adapted: heading, paragraph, setext heading

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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

### [Backspace37](../../spec/backspace.md#backspace37)

> deleteContentBackward

Adapted: heading, paragraph, setext heading

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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

### [Backspace40](../../spec/backspace.md#backspace40)

> deleteContentBackward

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- p
  - ┃t
  - 2. m
```

</td><td>

```buffer
- p
- ┃t
  - 2. m
```

</td><td>

```buffer
- p┃t
  - 2. m
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

### [Delete13](../../spec/del.md#delete13)

> deleteContentForward

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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

### [Delete13g](../../spec/del.md#delete13g)

> deleteContentForward

Adapted: heading

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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

### [Delete17](../../spec/del.md#delete17)

> deleteContentForward

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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

### [Delete26](../../spec/del.md#delete26)

> deleteContentForward

Adapted: heading, paragraph, setext heading

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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

### [Delete27](../../spec/del.md#delete27)

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
  - b
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

### [Enter43](../../spec/enter.md#enter43)

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
  - ┃- def
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
<tr><th>buffer</th></tr>
<tr valign="top"><td>

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
  - ┃c
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

### [Split title above a subheading](../../spec/obsidian-true-outliner.md#split-title-above-a-subheading)

> enter

Adapted: heading, paragraph

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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

### [Split title above an existing paragraph](../../spec/obsidian-true-outliner.md#split-title-above-an-existing-paragraph)

> enter

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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

### [Paste4](../../spec/paste.md#paste4)

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

### [Paste19](../../spec/paste.md#paste19)

> pasteStructured

Adapted: heading, paragraph

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
  - # h
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

### [Paste20](../../spec/paste.md#paste20)

> pasteStructured

Adapted: blank lines, paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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
  - x
  - z
- p
- q┃
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
<tr><th>clipboard</th><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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
  - x
- p
- q┃
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

### [Paste27d](../../spec/paste.md#paste27d)

> pasteStructured

Adapted: task

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

### [Paste32](../../spec/paste.md#paste32)

> pasteStructured

Adapted: blank lines, heading, paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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
<tr><th>clipboard</th><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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
<tr><th>clipboard</th><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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
<tr><th>clipboard</th><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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

### [Paste45](../../spec/paste.md#paste45)

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

### [Paste51](../../spec/paste.md#paste51)

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

### [Paste53](../../spec/paste.md#paste53)

> pasteStructured

Adapted: blank lines, heading, paragraph, setext heading

<table>
<tr><th>clipboard</th><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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
  - ## Summary
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

### [Paste58](../../spec/paste.md#paste58)

> pasteStructured

Adapted: blank lines, heading, paragraph, setext heading, thematic break

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
- Intro
- ┃
- Outro
```

</td><td>

```buffer
- Intro
- ---
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
<tr><th>clipboard</th><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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

### [Paste64](../../spec/paste.md#paste64)

> pastePlain

Adapted: escape, paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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
- ab┃words
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

### [Paste66](../../spec/paste.md#paste66)

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
  - ```js
          // greet
            f();
          ‍```┃
    ```
````

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

### [Paste68](../../spec/paste.md#paste68)

> pastePlain

Adapted: escape, paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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

### [Paste69](../../spec/paste.md#paste69)

> pastePlain

Adapted: escape, paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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
- [x] : x┃b c
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

### [Paste79](../../spec/paste.md#paste79)

> pasteStructured

Adapted: blank lines, math, paragraph

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
- a┃
```

</td><td>

```buffer
- a
  - $$
    x
    $$
```

</td><td>

```buffer
- a
- $$
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

### [Paste80](../../spec/paste.md#paste80)

> pastePlain

Adapted: paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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
- 1. a
  b┃
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

### [Paste81](../../spec/paste.md#paste81)

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

### [Scenario16](../../spec/scenarios.md#scenario16)

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
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Work
  - email
  - [x] toda┃review
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
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Plan
- 
  - 2. revise ┃draft
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
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Plan
- 
  - 2. revise
    ┃draft
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
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Plan
- 
  - 2. revis┃draft
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

### [ShiftEnter6](../../spec/shift-enter.md#shiftenter6)

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
  - 1. ┃def
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

### [TaskEnter2](../../spec/tasks.md#taskenter2)

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

### [TaskEnter5](../../spec/tasks.md#taskenter5)

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

### [TaskEnter6](../../spec/tasks.md#taskenter6)

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

### [TaskDelete1](../../spec/tasks.md#taskdelete1)

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

### [TaskDelete2](../../spec/tasks.md#taskdelete2)

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
- a
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

### [TaskDelete3](../../spec/tasks.md#taskdelete3)

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
- 
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

## Adapted: whitespace (16)

### [Backspace10](../../spec/backspace.md#backspace10)

> deleteContentBackward

Adapted: blank lines, paragraph

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
  ┃
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
- a

┃◌
```

</td><td>

```buffer
- a┃
```

</td></tr>
</table>

### [Backspace25](../../spec/backspace.md#backspace25)

> deleteContentBackward

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- 
- ┃para
```

</td><td>

```buffer
- a
- 
  ┃para
```

</td><td>

```buffer
- a
- ┃para
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

┃para
```

</td><td>

```buffer
- a
- ┃para
```

</td></tr>
</table>

### [Backspace39](../../spec/backspace.md#backspace39)

> deleteContentBackward

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃
- p
```

</td><td>

```buffer
- a
  ┃
- p
```

</td><td>

```buffer
- a┃
- p
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
p
```

</td><td>

```buffer
- a┃

p
```

</td></tr>
</table>

### [Delete28](../../spec/del.md#delete28)

> deleteContentForward

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃
- p
```

</td><td>

```buffer
- a
- ┃
  p
```

</td><td>

```buffer
- a
- ┃p
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
p
```

</td><td>

```buffer
- a

┃p
```

</td></tr>
</table>

### [Enter12](../../spec/enter.md#enter12)

> enter

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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

### [Fence3](../../spec/fences.md#fence3)

> enter

Adapted: code block

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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

### [E9](../../spec/obsidian-true-outliner.md#e9)

> enter

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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

### [E17](../../spec/obsidian-true-outliner.md#e17)

> enter

Adapted: heading, paragraph, setext heading

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Hello┃ world
```

</td><td>

```buffer
- # Hello
- ┃ world
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
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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

### [S4](../../spec/obsidian-true-outliner.md#s4)

> shiftEnter

Adapted: paragraph

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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

### [Paste75](../../spec/paste.md#paste75)

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

### [Placeholder13](../../spec/placeholders.md#placeholder13)

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
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # H1
  - ┃
    \## H2
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

### [Placeholder14](../../spec/placeholders.md#placeholder14)

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- para
- ┃x
- text
```

</td></tr>
</table>

> deleteContentForward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- para
- ┃
- text
```

</td></tr>
</table>

> deleteContentForward

<table>
<tr><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- para
- ┃
  text
```

</td><td>

```buffer
- para
- ┃text
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>deleteContentForward</th><th>deleteContentForward</th></tr>
<tr valign="top"><td>

```buffer
para

┃x

text
```

</td><td>

```buffer
para

┃◌

text
```

</td><td>

```buffer
para

┃text
```

</td></tr>
</table>

### [TaskEnter7](../../spec/tasks.md#taskenter7)

> enter

Adapted: task

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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

## Adapted: caret (8)

### [CursorUp1](../../spec/cursor.md#cursorup1)

> cursorLineUp

Adapted: paragraph

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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

### [CursorUp2](../../spec/cursor.md#cursorup2)

> cursorLineUp

Adapted: heading

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ## Title
  - ┃a
```

</td><td>

```buffer
- ## Titl┃e
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

### [CursorDown1](../../spec/cursor.md#cursordown1)

> cursorLineDown cursorLineDown

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
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

### [Enter9](../../spec/enter.md#enter9)

> enter

Adapted: escape

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

### [Paste44](../../spec/paste.md#paste44)

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

### [ShiftEnter18](../../spec/shift-enter.md#shiftenter18)

> shiftEnter

Adapted: escape

<table>
<tr><th>buffer</th><th>siyuan</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- 1. abc ┃2. x
```

</td><td>

```buffer
- 1. abc
  2\. ┃x
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

### [TaskEnter3](../../spec/tasks.md#taskenter3)

> enter

Adapted: task

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

## Adapted: error (5)

### [SoftBackspace5](../../spec/backspace.md#softbackspace5)

Adapted: escape, heading, setext heading

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- # first
  abc ┃- x
```

</td></tr>
</table>

> deleteSoftLineBackward

Error: SiYuan holds the starting state differently:
  meant:
    - # first
      abc ┃- x
  holds:
    - # first
      - abc - x

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

### [Enter49](../../spec/enter.md#enter49)

Adapted: blank lines, paragraph, table

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- | a | b |
  | --- | --- |
  | 1 | 2 |┃
```

</td></tr>
</table>

> enter

Error: SiYuan holds the starting state differently:
  meant:
    - | a | b |
      | --- | --- |
      | 1 | 2 |┃
  holds:
    - | a | b |
      | --- | --- |
      | 1 | 2 |

> deleteContentBackward

> enter "after"

Original:
<table>
<tr><th>buffer</th><th>enter</th><th>deleteContentBackward</th><th>enter "after"</th></tr>
<tr valign="top"><td>

```buffer
| a | b |
| --- | --- |
| 1 | 2 |┃
```

</td><td>

```buffer
| a | b |
| --- | --- |
| 1 | 2 |

┃◌
```

</td><td>

```buffer
| a | b |
| --- | --- |
| 1 | 2 |┃
```

</td><td>

```buffer
| a | b |
| --- | --- |
| 1 | 2 |

after┃
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

Error: SiYuan holds the starting state differently:
  meant:
    - ## one
      ┃two
      three
  holds:
    - ## one
      - two
        three

> undo

> cursorLineBoundaryForward enter

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

Adapted: blank lines, heading, paragraph, setext heading

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- ## one
  ┃two
- ## three
```

</td></tr>
</table>

> enter

Error: SiYuan holds the starting state differently:
  meant:
    - ## one
      ┃two
    - ## three
  holds:
    - ## one
      - two
    - ## three

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

### [Fence42](../../spec/fences.md#fence42)

Adapted: math

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- Euler:
  - $$
    e^{i\pi}+1=0┃
    $$
```

</td></tr>
</table>

> enter

Error: SiYuan holds the starting state differently:
  meant:
    - Euler:
      - $$
        e^{i\pi}+1=0┃
        $$
  holds:
    - Euler:
      - $$
        e^{i\pi}+1=0
        $$

> deleteContentBackward

> enter "x"

Original:
<table>
<tr><th>buffer</th><th>enter</th><th>deleteContentBackward</th><th>enter "x"</th></tr>
<tr valign="top"><td>

```buffer
- Euler:
  $$
  e^{i\pi}+1=0┃
  $$
```

</td><td>

```buffer
- Euler:
  $$
  e^{i\pi}+1=0
  ┃
  $$
```

</td><td>

```buffer
- Euler:
  $$
  e^{i\pi}+1=0┃
  $$
```

</td><td>

```buffer
- Euler:
  $$
  e^{i\pi}+1=0
  x┃
  $$
```

</td></tr>
</table>

## Skipped (430)

| example | why |
| --- | --- |
| **backspace.md** | |
| [Backspace2](../../spec/backspace.md#backspace2) | a caret in a marker |
| [Backspace4](../../spec/backspace.md#backspace4) | a heading's closing #s |
| [Backspace12](../../spec/backspace.md#backspace12) | tag free-form |
| [Backspace12b](../../spec/backspace.md#backspace12b) | tag free-form |
| [Backspace12c](../../spec/backspace.md#backspace12c) | tag free-form |
| [Backspace14](../../spec/backspace.md#backspace14) | tag free-form |
| [Backspace16](../../spec/backspace.md#backspace16) | tag markup-fence |
| [Backspace17e](../../spec/backspace.md#backspace17e) | tag free-form |
| [Backspace17f](../../spec/backspace.md#backspace17f) | option emptyItemWithChildren: refuse |
| [Backspace17g](../../spec/backspace.md#backspace17g) | option emptyItemWithChildren: refuse |
| [Backspace17h](../../spec/backspace.md#backspace17h) | option emptyItemWithChildren: refuse |
| [Backspace18](../../spec/backspace.md#backspace18) | tag free-form |
| [Backspace18b](../../spec/backspace.md#backspace18b) | tag free-form |
| [Backspace18c](../../spec/backspace.md#backspace18c) | tag free-form |
| [Backspace18d](../../spec/backspace.md#backspace18d) | tag free-form |
| [Backspace18f](../../spec/backspace.md#backspace18f) | option headingEditing: block |
| [Backspace19](../../spec/backspace.md#backspace19) | tag free-form |
| [Backspace20](../../spec/backspace.md#backspace20) | tag free-form |
| [Backspace21b](../../spec/backspace.md#backspace21b) | option deleteAtGap: gap |
| [Backspace23](../../spec/backspace.md#backspace23) | tag free-form |
| [Backspace24](../../spec/backspace.md#backspace24) | tag markup-fence |
| [Backspace27](../../spec/backspace.md#backspace27) | tag free-form |
| [Backspace28](../../spec/backspace.md#backspace28) | tag markup-fence |
| [Backspace29](../../spec/backspace.md#backspace29) | a line's trailing whitespace |
| [Backspace31](../../spec/backspace.md#backspace31) | a selection across blocks |
| [Backspace33](../../spec/backspace.md#backspace33) | tag free-form |
| [Backspace34](../../spec/backspace.md#backspace34) | option backspaceAtTopItem: refuse |
| [Backspace35](../../spec/backspace.md#backspace35) | tag free-form |
| [Backspace38](../../spec/backspace.md#backspace38) | tag free-form |
| [SoftBackspace4](../../spec/backspace.md#softbackspace4) | a heading's closing #s |
| [SoftBackspace6](../../spec/backspace.md#softbackspace6) | a caret on a blank line |
| [SoftBackspace7](../../spec/backspace.md#softbackspace7) | tag free-form |
| [SoftBackspace8](../../spec/backspace.md#softbackspace8) | tag free-form |
| [SoftBackspace9](../../spec/backspace.md#softbackspace9) | tag markup-fence |
| **cursor.md** | |
| [CursorDown2](../../spec/cursor.md#cursordown2) | indented code |
| [CursorHome3](../../spec/cursor.md#cursorhome3) | a caret in a marker |
| [CursorHome4](../../spec/cursor.md#cursorhome4) | a caret in a marker |
| [CursorHome11](../../spec/cursor.md#cursorhome11) | a quote |
| [CursorHome15](../../spec/cursor.md#cursorhome15) | a caret in a marker |
| [CursorHome16](../../spec/cursor.md#cursorhome16) | a quote |
| [CursorHome17](../../spec/cursor.md#cursorhome17) | a callout |
| [CursorDocEndLeft1](../../spec/cursor.md#cursordocendleft1) | cursorCharLeft after cursorDocEnd |
| **del.md** | |
| [Delete4](../../spec/del.md#delete4) | a heading's closing #s |
| [Delete4b](../../spec/del.md#delete4b) | a heading's closing #s |
| [Delete5d](../../spec/del.md#delete5d) | a block's text starting with whitespace |
| [Delete5e](../../spec/del.md#delete5e) | option emptyItemWithChildren: refuse |
| [Delete9](../../spec/del.md#delete9) | tag free-form |
| [Delete10](../../spec/del.md#delete10) | a quote |
| [Delete11](../../spec/del.md#delete11) | tag markup-fence |
| [Delete13b](../../spec/del.md#delete13b) | option headingEditing: block |
| [Delete13c](../../spec/del.md#delete13c) | tag free-form |
| [Delete13d](../../spec/del.md#delete13d) | tag free-form |
| [Delete13e](../../spec/del.md#delete13e) | tag free-form |
| [Delete13f](../../spec/del.md#delete13f) | option headingEditing: block |
| [Delete14](../../spec/del.md#delete14) | tag free-form |
| [Delete15](../../spec/del.md#delete15) | a heading's closing #s |
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
| [Delete19](../../spec/del.md#delete19) | a caret in a task's checkbox |
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
| [DuplicateSubtree2](../../spec/duplicate-subtree.md#duplicatesubtree2) | action deleteSubtree |
| [DuplicateSubtree3](../../spec/duplicate-subtree.md#duplicatesubtree3) | a selection across blocks |
| [DuplicateSubtree4](../../spec/duplicate-subtree.md#duplicatesubtree4) | tag free-form |
| [DuplicateSubtree5](../../spec/duplicate-subtree.md#duplicatesubtree5) | a quote |
| [DuplicateSubtree6](../../spec/duplicate-subtree.md#duplicatesubtree6) | tag free-form |
| [DuplicateSubtree7](../../spec/duplicate-subtree.md#duplicatesubtree7) | a caret in a marker |
| [DuplicateSubtree8](../../spec/duplicate-subtree.md#duplicatesubtree8) | tag markup-fence |
| **enter.md** | |
| [Enter3b](../../spec/enter.md#enter3b) | option enterMidItem: child |
| [Enter6](../../spec/enter.md#enter6) | tag free-form |
| [Enter7b](../../spec/enter.md#enter7b) | tag free-form |
| [Enter14](../../spec/enter.md#enter14) | tag free-form |
| [Enter15b](../../spec/enter.md#enter15b) | tag free-form |
| [Enter23](../../spec/enter.md#enter23) | indented code |
| [Enter26b](../../spec/enter.md#enter26b) | option enterAtTextStart: stay |
| [Enter29b](../../spec/enter.md#enter29b) | option enterAtTextStart: stay |
| [Enter30](../../spec/enter.md#enter30) | option enterOnEmptyItem: outdent |
| [Enter32b](../../spec/enter.md#enter32b) | option enterAtTextStart: stay |
| [Enter33b](../../spec/enter.md#enter33b) | option enterAtTextStart: stay |
| [Enter34](../../spec/enter.md#enter34) | a caret in a marker |
| [Enter36b](../../spec/enter.md#enter36b) | a quote |
| [Enter37](../../spec/enter.md#enter37) | a caret on a blank line |
| [Enter40](../../spec/enter.md#enter40) | tag free-form |
| [Enter41](../../spec/enter.md#enter41) | tag free-form |
| [Enter46](../../spec/enter.md#enter46) | a quote |
| [Enter47](../../spec/enter.md#enter47) | tag free-form |
| [Enter50](../../spec/enter.md#enter50) | tag free-form |
| [Enter53](../../spec/enter.md#enter53) | tag free-form |
| **fences.md** | |
| [Fence4](../../spec/fences.md#fence4) | a quote |
| [Fence6](../../spec/fences.md#fence6) | tag markup-fence |
| [Fence7](../../spec/fences.md#fence7) | tag markup-fence |
| [Fence7b](../../spec/fences.md#fence7b) | tag markup-fence |
| [Fence7c](../../spec/fences.md#fence7c) | tag markup-fence |
| [Fence7d](../../spec/fences.md#fence7d) | tag markup-fence |
| [Fence9](../../spec/fences.md#fence9) | tag markup-fence |
| [Fence10](../../spec/fences.md#fence10) | option handleFenceContents: false |
| [Fence11](../../spec/fences.md#fence11) | tag markup-fence |
| [Fence12](../../spec/fences.md#fence12) | tag markup-fence |
| [Fence13](../../spec/fences.md#fence13) | tag markup-fence |
| [Fence14](../../spec/fences.md#fence14) | tag markup-fence |
| [Fence15](../../spec/fences.md#fence15) | tag markup-fence |
| [Fence17](../../spec/fences.md#fence17) | tag markup-fence |
| [Fence19](../../spec/fences.md#fence19) | tag markup-fence |
| [Fence20](../../spec/fences.md#fence20) | a quote |
| [Fence21](../../spec/fences.md#fence21) | nothing to compare |
| [Fence22](../../spec/fences.md#fence22) | tag markup-fence |
| [Fence23](../../spec/fences.md#fence23) | tag markup-fence |
| [Fence24](../../spec/fences.md#fence24) | tag markup-fence |
| [Fence25](../../spec/fences.md#fence25) | tag markup-fence |
| [Fence26](../../spec/fences.md#fence26) | tag markup-fence |
| [Fence27](../../spec/fences.md#fence27) | tag markup-fence |
| [Fence28](../../spec/fences.md#fence28) | tag markup-fence |
| [Fence29](../../spec/fences.md#fence29) | tag markup-fence |
| [Fence30](../../spec/fences.md#fence30) | tag markup-fence |
| [Fence31](../../spec/fences.md#fence31) | tag markup-fence |
| [Fence32](../../spec/fences.md#fence32) | tag markup-fence |
| [Fence33](../../spec/fences.md#fence33) | tag markup-fence |
| [Fence34](../../spec/fences.md#fence34) | tag markup-fence |
| [Fence35](../../spec/fences.md#fence35) | tag markup-fence |
| [Fence36](../../spec/fences.md#fence36) | tag markup-fence |
| [Fence37](../../spec/fences.md#fence37) | tag markup-fence |
| [Fence38](../../spec/fences.md#fence38) | tag markup-fence |
| [Fence39](../../spec/fences.md#fence39) | tag markup-fence |
| [Fence40](../../spec/fences.md#fence40) | tag markup-fence |
| [Fence41](../../spec/fences.md#fence41) | tag markup-fence |
| [Fence43](../../spec/fences.md#fence43) | a quote |
| [Fence44](../../spec/fences.md#fence44) | indented code |
| [Fence45](../../spec/fences.md#fence45) | tag markup-fence |
| [Fence46](../../spec/fences.md#fence46) | a quote |
| [Fence47](../../spec/fences.md#fence47) | tag markup-fence |
| **gaps.md** | |
| [Gap14](../../spec/gaps.md#gap14) | a caret on a blank line |
| [Gap15](../../spec/gaps.md#gap15) | a caret on a blank line |
| [Gap16](../../spec/gaps.md#gap16) | a caret on a blank line |
| [Gap17](../../spec/gaps.md#gap17) | a caret on a blank line |
| [Gap18](../../spec/gaps.md#gap18) | a caret on a blank line |
| [Gap19](../../spec/gaps.md#gap19) | frontmatter |
| **indent.md** | |
| [Indent9](../../spec/indent.md#indent9) | a selection across blocks |
| [Indent12](../../spec/indent.md#indent12) | tag free-form |
| [Indent16](../../spec/indent.md#indent16) | tag free-form |
| [Indent18](../../spec/indent.md#indent18) | option bullet: + |
| [Indent19](../../spec/indent.md#indent19) | a line's trailing whitespace |
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
| [MoveDown25](../../spec/move-subtree-down.md#movedown25) | tag free-form |
| [MoveDown28](../../spec/move-subtree-down.md#movedown28) | tag free-form |
| [MoveDown31](../../spec/move-subtree-down.md#movedown31) | a thematic break as an item |
| [MoveDown32](../../spec/move-subtree-down.md#movedown32) | a caret in a marker |
| [MoveDown34](../../spec/move-subtree-down.md#movedown34) | tag markup-fence |
| [MoveDown36](../../spec/move-subtree-down.md#movedown36) | tag free-form |
| [MoveDown37](../../spec/move-subtree-down.md#movedown37) | tag markup-fence |
| **move-subtree-up.md** | |
| [MoveUp7](../../spec/move-subtree-up.md#moveup7) | tag free-form |
| [MoveUp10](../../spec/move-subtree-up.md#moveup10) | a selection across blocks |
| [MoveUp11](../../spec/move-subtree-up.md#moveup11) | a selection across blocks |
| [MoveUp12](../../spec/move-subtree-up.md#moveup12) | tag free-form |
| [MoveUp18](../../spec/move-subtree-up.md#moveup18) | indented code |
| [MoveUp19](../../spec/move-subtree-up.md#moveup19) | a thematic break as an item |
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
| [MoveUp37](../../spec/move-subtree-up.md#moveup37) | tag markup-fence |
| [MoveUp38](../../spec/move-subtree-up.md#moveup38) | tag markup-fence |
| **obsidian-true-outliner.md** | |
| [Split item becomes first tab-indented child](../../spec/obsidian-true-outliner.md#split-item-becomes-first-tab-indented-child) | option enterMidItem: child |
| [E11](../../spec/obsidian-true-outliner.md#e11) | option enterMidItem: child |
| [E15](../../spec/obsidian-true-outliner.md#e15) | tag free-form |
| [E18](../../spec/obsidian-true-outliner.md#e18) | a caret on a blank line |
| [Empty paragraph before a section list](../../spec/obsidian-true-outliner.md#empty-paragraph-before-a-section-list) | tag free-form |
| [#267, E5](../../spec/obsidian-true-outliner.md#267-e5) | a quote |
| [S5](../../spec/obsidian-true-outliner.md#s5) | tag free-form |
| [Line break in setext title refused](../../spec/obsidian-true-outliner.md#line-break-in-setext-title-refused) | tag free-form |
| [Line break in setext underline refused](../../spec/obsidian-true-outliner.md#line-break-in-setext-underline-refused) | a caret on a blank line |
| [Leaving the place removes it](../../spec/obsidian-true-outliner.md#leaving-the-place-removes-it) | tag free-form |
| [Backspace before the checkbox](../../spec/obsidian-true-outliner.md#backspace-before-the-checkbox) | a caret in a task's checkbox |
| [Outdented child leaves quote above alone](../../spec/obsidian-true-outliner.md#outdented-child-leaves-quote-above-alone) | a quote |
| [Indented item keeps its quote](../../spec/obsidian-true-outliner.md#indented-item-keeps-its-quote) | a quote |
| [Outdented item keeps its quote](../../spec/obsidian-true-outliner.md#outdented-item-keeps-its-quote) | a quote |
| [Indented item keeps its thematic break](../../spec/obsidian-true-outliner.md#indented-item-keeps-its-thematic-break) | a thematic break as an item |
| [Outdented item keeps its code block](../../spec/obsidian-true-outliner.md#outdented-item-keeps-its-code-block) | indented code |
| [Blank line added below a quote](../../spec/obsidian-true-outliner.md#blank-line-added-below-a-quote) | a quote |
| [Outdenting the head of a nested list](../../spec/obsidian-true-outliner.md#outdenting-the-head-of-a-nested-list) | option outdent: logical |
| [Carried place removed on leaving](../../spec/obsidian-true-outliner.md#carried-place-removed-on-leaving) | tag free-form |
| [Doubly indented place removed on leaving](../../spec/obsidian-true-outliner.md#doubly-indented-place-removed-on-leaving) | tag free-form |
| [Empty paragraph and blank lines removed](../../spec/obsidian-true-outliner.md#empty-paragraph-and-blank-lines-removed) | tag free-form |
| [Indented list under paragraph restored](../../spec/obsidian-true-outliner.md#indented-list-under-paragraph-restored) | tag free-form |
| [Pasted quote set off from paragraph](../../spec/obsidian-true-outliner.md#pasted-quote-set-off-from-paragraph) | a quote |
| [Pasted list and block become children](../../spec/obsidian-true-outliner.md#pasted-list-and-block-become-children) | option pasteStructuredOnParent: the app's after |
| **outdent.md** | |
| [Outdent4](../../spec/outdent.md#outdent4) | tag free-form |
| [Outdent5](../../spec/outdent.md#outdent5) | tag free-form |
| [Outdent8](../../spec/outdent.md#outdent8) | a selection across blocks |
| [Outdent10](../../spec/outdent.md#outdent10) | a selection across blocks |
| [Outdent11](../../spec/outdent.md#outdent11) | tag free-form |
| [Outdent12](../../spec/outdent.md#outdent12) | tag free-form |
| [Outdent14](../../spec/outdent.md#outdent14) | a caret in a marker |
| [DirectOutdent2](../../spec/outdent.md#directoutdent2) | tag free-form |
| [DirectOutdent3](../../spec/outdent.md#directoutdent3) | tag free-form |
| [LogicalOutdent1](../../spec/outdent.md#logicaloutdent1) | option outdent: logical |
| [LogicalOutdent2](../../spec/outdent.md#logicaloutdent2) | tag free-form |
| [LogicalOutdent3](../../spec/outdent.md#logicaloutdent3) | tag free-form |
| [LogicalOutdent4](../../spec/outdent.md#logicaloutdent4) | option outdent: logical |
| [LogicalOutdent5](../../spec/outdent.md#logicaloutdent5) | tag free-form |
| [Outdent16](../../spec/outdent.md#outdent16) | tag free-form |
| [Outdent17](../../spec/outdent.md#outdent17) | tag free-form |
| [Outdent17b](../../spec/outdent.md#outdent17b) | tag free-form |
| [Outdent18](../../spec/outdent.md#outdent18) | tag free-form |
| [Outdent19](../../spec/outdent.md#outdent19) | tag free-form |
| **paste.md** | |
| [Paste2b](../../spec/paste.md#paste2b) | option pasteStructuredListForm: own |
| [Paste6](../../spec/paste.md#paste6) | tag free-form |
| [Paste8](../../spec/paste.md#paste8) | option pasteStructuredLines: items |
| [Paste8b](../../spec/paste.md#paste8b) | option pasteStructuredLines: items |
| [Paste8c](../../spec/paste.md#paste8c) | option pasteStructuredLines: items |
| [Paste12](../../spec/paste.md#paste12) | a quote |
| [Paste13](../../spec/paste.md#paste13) | option pasteStructuredListForm: the app's drop |
| [Paste13c](../../spec/paste.md#paste13c) | option pasteStructuredListForm: own |
| [Paste13d](../../spec/paste.md#paste13d) | option pasteStructuredAtEnd: join |
| [Paste13e](../../spec/paste.md#paste13e) | option pasteStructuredAtEnd: join |
| [Paste14](../../spec/paste.md#paste14) | option pasteStructuredListForm: the app's drop |
| [Paste15](../../spec/paste.md#paste15) | option pasteStructuredListForm: the app's drop |
| [Paste15b](../../spec/paste.md#paste15b) | option pasteStructuredListForm: literal |
| [Paste15d](../../spec/paste.md#paste15d) | option pasteStructuredListForm: own |
| [Paste16](../../spec/paste.md#paste16) | a line's trailing whitespace |
| [Paste16b](../../spec/paste.md#paste16b) | option pasteStructuredListForm: own |
| [Paste17](../../spec/paste.md#paste17) | option pasteStructuredListForm: the app's drop |
| [Paste17b](../../spec/paste.md#paste17b) | option pasteStructuredListForm: literal |
| [Paste17d](../../spec/paste.md#paste17d) | option pasteStructuredAtEnd: join |
| [Paste18b](../../spec/paste.md#paste18b) | option pasteStructuredListForm: literal |
| [Paste19b](../../spec/paste.md#paste19b) | option pasteStructuredAtEnd: join |
| [Paste20b](../../spec/paste.md#paste20b) | option pasteStructuredAtEnd: join |
| [Paste23](../../spec/paste.md#paste23) | a quote |
| [Paste26b](../../spec/paste.md#paste26b) | option pasteStructuredAtEnd: join |
| [Paste27](../../spec/paste.md#paste27) | option pasteStructuredOnParent: the app's after |
| [Paste27b](../../spec/paste.md#paste27b) | option pasteStructuredAtEnd: join |
| [Paste27c](../../spec/paste.md#paste27c) | option pasteStructuredAtEnd: join |
| [Paste28](../../spec/paste.md#paste28) | a callout |
| [Paste29](../../spec/paste.md#paste29) | a quote |
| [Paste36](../../spec/paste.md#paste36) | option pasteStructuredMidText: the app's after |
| [Paste36b](../../spec/paste.md#paste36b) | option pasteStructuredParagraphList: children |
| [Paste37](../../spec/paste.md#paste37) | option pasteStructuredMidText: the app's after |
| [Paste38b](../../spec/paste.md#paste38b) | option pasteStructuredParagraphList: children |
| [Paste39](../../spec/paste.md#paste39) | option pasteStructuredLines: items |
| [Paste40](../../spec/paste.md#paste40) | tag free-form |
| [Paste41](../../spec/paste.md#paste41) | tag free-form |
| [Paste42](../../spec/paste.md#paste42) | option pasteStructuredMidText: the app's after |
| [Paste43](../../spec/paste.md#paste43) | option enterMidItem: child |
| [Paste46](../../spec/paste.md#paste46) | tag markup-fence |
| [Paste47](../../spec/paste.md#paste47) | tag markup-fence |
| [Paste50](../../spec/paste.md#paste50) | option pasteStructuredMidText: the app's after |
| [Paste54](../../spec/paste.md#paste54) | tag free-form |
| [Paste55](../../spec/paste.md#paste55) | tag free-form |
| [Paste56](../../spec/paste.md#paste56) | tag free-form |
| [Paste59](../../spec/paste.md#paste59) | option pasteStructuredOnParent: the app's after |
| [Paste62](../../spec/paste.md#paste62) | option pasteStructuredMidText: the app's after |
| [Paste63](../../spec/paste.md#paste63) | option pasteStructuredMidText: the app's after |
| [Paste65](../../spec/paste.md#paste65) | a caret on a blank line |
| [Paste67](../../spec/paste.md#paste67) | a caret on a blank line |
| [Paste70](../../spec/paste.md#paste70) | option pasteStructuredMidText: the app's after |
| [Paste71](../../spec/paste.md#paste71) | tag markup-fence |
| [Paste72](../../spec/paste.md#paste72) | a quote |
| [Paste73](../../spec/paste.md#paste73) | a block's text starting with whitespace |
| [Paste76](../../spec/paste.md#paste76) | option pasteStructuredOnParent: the app's after |
| [Paste77](../../spec/paste.md#paste77) | a quote |
| **placeholders.md** | |
| [Placeholder2](../../spec/placeholders.md#placeholder2) | tag free-form |
| [Placeholder3](../../spec/placeholders.md#placeholder3) | tag free-form |
| [Placeholder4](../../spec/placeholders.md#placeholder4) | tag free-form |
| [Placeholder9](../../spec/placeholders.md#placeholder9) | cursorCharLeft after cursorDocEnd |
| [Placeholder10](../../spec/placeholders.md#placeholder10) | a caret on a blank line |
| [Placeholder11](../../spec/placeholders.md#placeholder11) | cursorCharLeft after cursorDocEnd |
| [Placeholder12](../../spec/placeholders.md#placeholder12) | a caret on a blank line |
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
| [Quote12](../../spec/quotes.md#quote12) | a quote |
| [Quote12b](../../spec/quotes.md#quote12b) | option outdent: logical |
| [Quote13](../../spec/quotes.md#quote13) | a callout |
| [Quote14](../../spec/quotes.md#quote14) | a quote |
| [Quote15](../../spec/quotes.md#quote15) | a quote |
| [Quote16](../../spec/quotes.md#quote16) | a quote |
| [Quote17](../../spec/quotes.md#quote17) | a quote |
| [Quote18](../../spec/quotes.md#quote18) | a quote |
| [Quote19](../../spec/quotes.md#quote19) | a quote |
| [Quote20](../../spec/quotes.md#quote20) | option outdent: logical |
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
| [Quote72](../../spec/quotes.md#quote72) | a quote |
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
| [Quote85](../../spec/quotes.md#quote85) | a quote |
| [Quote86](../../spec/quotes.md#quote86) | a quote |
| [Quote87](../../spec/quotes.md#quote87) | a quote |
| [Quote69](../../spec/quotes.md#quote69) | a quote |
| [Quote70](../../spec/quotes.md#quote70) | a quote |
| **scenarios.md** | |
| [Scenario6](../../spec/scenarios.md#scenario6) | tag free-form |
| [Scenario10](../../spec/scenarios.md#scenario10) | action deleteSubtree |
| [Scenario15](../../spec/scenarios.md#scenario15) | tag free-form |
| [Scenario17](../../spec/scenarios.md#scenario17) | option pasteStructuredLines: items |
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
| [TaskBackspace1](../../spec/tasks.md#taskbackspace1) | a caret in a task's checkbox |
| [TaskBackspace4](../../spec/tasks.md#taskbackspace4) | option taskEditing: block |
| [TaskBackspace5](../../spec/tasks.md#taskbackspace5) | option taskEditing: text |
| [TaskBackspace6](../../spec/tasks.md#taskbackspace6) | a caret in a task's checkbox |
| [TaskBackspace7](../../spec/tasks.md#taskbackspace7) | option taskEditing: block |
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
