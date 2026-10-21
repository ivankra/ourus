---
type: "SxS"
app: "tine"
version: "guide of 2026-09-28"
url: "https://tine.page/guide/app/"
model: "block"
command: "node sxs/run.ts tine"
elapsed_s: 296
workers: 5
---

# Tine vs ourus

Summary:

|  | agree | caret | whitespace | disagree | error | skipped | total |
| --- | --- | --- | --- | --- | --- | --- | --- |
| original | 140 | [6](#caret-6) | [7](#whitespace-7) | [20](#disagree-20) |  |  | **173** |
| adapted | 179 | [12](#adapted-caret-12) | [18](#adapted-whitespace-18) | [38](#adapted-disagree-38) |  |  | **247** |
| **total** | **319 (33%)** | **18 (1.9%)** | **25 (2.6%)** | **58 (6%)** | **0 (0%)** | **[550](#skipped-550) (57%)** | **970** |

Per-file:

|  | agree | caret | whitespace | disagree | error | skipped | total | original | adapted |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [backspace.md](../spec/backspace.md) | 28 |  |  | 4 |  | 50 | **82** | 17 | 15 |
| [backtick.md](../spec/backtick.md) |  |  |  | 1 |  | 31 | **32** |  | 1 |
| [copy.md](../spec/copy.md) | 2 |  |  | 3 |  | 8 | **13** | 1 | 4 |
| [cursor.md](../spec/cursor.md) | 21 | 6 |  |  |  | 9 | **36** | 12 | 15 |
| [delete-subtree.md](../spec/delete-subtree.md) |  | 6 |  | 1 |  | 3 | **10** | 2 | 5 |
| [delete.md](../spec/delete.md) | 17 |  |  | 4 |  | 34 | **55** | 15 | 6 |
| [duplicate-subtree.md](../spec/duplicate-subtree.md) |  |  |  |  |  | 9 | **9** |  |  |
| [enter.md](../spec/enter.md) | 47 |  | 1 | 4 |  | 40 | **92** | 22 | 30 |
| [fences.md](../spec/fences.md) | 8 |  | 1 | 1 |  | 58 | **68** |  | 10 |
| [gaps.md](../spec/gaps.md) | 13 |  |  |  |  | 6 | **19** |  | 13 |
| [indent.md](../spec/indent.md) | 20 |  |  | 1 |  | 15 | **36** | 13 | 8 |
| [move-subtree-down.md](../spec/move-subtree-down.md) | 20 |  |  |  |  | 19 | **39** | 8 | 12 |
| [move-subtree-up.md](../spec/move-subtree-up.md) | 20 |  |  |  |  | 21 | **41** | 9 | 11 |
| [obsidian-true-outliner.md](../spec/obsidian-true-outliner.md) | 33 | 2 | 3 | 5 |  | 24 | **67** | 21 | 22 |
| [outdent.md](../spec/outdent.md) | 9 |  |  |  |  | 26 | **35** | 5 | 4 |
| [paste-conv.md](../spec/paste-conv.md) | 4 |  |  | 2 |  |  | **6** | 5 | 1 |
| [paste-html.md](../spec/paste-html.md) | 4 |  |  | 14 |  | 1 | **19** |  | 18 |
| [paste-list-form.md](../spec/paste-list-form.md) | 3 |  |  | 2 |  | 1 | **6** | 4 | 1 |
| [paste-list.md](../spec/paste-list.md) | 13 | 2 |  | 7 |  | 6 | **28** | 9 | 13 |
| [paste-plain.md](../spec/paste-plain.md) | 16 |  | 5 |  |  | 13 | **34** | 5 | 16 |
| [paste.md](../spec/paste.md) | 8 | 1 |  | 7 |  | 11 | **27** | 2 | 14 |
| [placeholders.md](../spec/placeholders.md) | 8 |  |  |  |  | 12 | **20** | 3 | 5 |
| [quotes.md](../spec/quotes.md) |  |  |  |  |  | 97 | **97** |  |  |
| [scenarios.md](../spec/scenarios.md) | 15 | 1 | 1 | 2 |  | 7 | **26** | 11 | 8 |
| [shift-enter.md](../spec/shift-enter.md) | 5 |  | 14 |  |  | 17 | **36** | 6 | 13 |
| [tasks.md](../spec/tasks.md) | 2 |  |  |  |  | 26 | **28** |  | 2 |
| [typing.md](../spec/typing.md) |  |  |  |  |  | 3 | **3** |  |  |
| [undo.md](../spec/undo.md) | 3 |  |  |  |  | 2 | **5** | 3 |  |
| [z-open.md](../spec/z-open.md) |  |  |  |  |  | 1 | **1** |  |  |
| **total** | **319 (33%)** | **18 (1.9%)** | **25 (2.6%)** | **58 (6%)** | **0 (0%)** | **550 (57%)** | **970** | **173 (18%)** | **247 (25%)** |

## Disagree (20)

### [Backspace17b](../spec/backspace.md#backspace17b)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
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
<tr><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - e
  - b
    - c
  - d
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

### [Backspace29](../spec/backspace.md#backspace29)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a
2. ┃
3. c
```

</td><td>

```buffer
1. a
- ┃
1. c
```

</td><td>

```buffer
1. a┃
2. c
```

</td></tr>
</table>

### [Backspace45](../spec/backspace.md#backspace45)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
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

### [Delete5](../spec/delete.md#delete5)

> deleteContentForward

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
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
<tr><th>tine</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
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

### [Delete31](../spec/delete.md#delete31)

> deleteContentForward

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
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

### [Enter5](../spec/enter.md#enter5)

> enter

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
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
  - 
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

### [TO-E33](../spec/obsidian-true-outliner.md#to-e33)

> enter

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
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

### [TO-Bug269](../spec/obsidian-true-outliner.md#to-bug269)

> deleteContentBackward deleteContentBackward

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. p
2. a┃
3. q
```

</td><td>

```buffer
1. p
- ┃
1. q
```

</td><td>

```buffer
1. p┃
2. q
```

</td></tr>
</table>

### [TO5](../spec/obsidian-true-outliner.md#to5)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- p
  1. ┃a
  2. b
```

</td><td>

```buffer
- p
  - ┃a
  1. b
```

</td><td>

```buffer
- p┃a
  1. b
```

</td></tr>
</table>

### [TO17](../spec/obsidian-true-outliner.md#to17)

> enter enter cursorDocStart

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b┃
```

</td><td>

```buffer
- ┃a
  - b
  - 
  - 
```

</td><td>

```buffer
- a
  - b
- 
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
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- ax
  y
  ┃
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
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- a1. x
  2\. y┃
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
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
```

</td><td>

```buffer
- a
- x
  - x1
- y┃
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
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
```

</td><td>

```buffer
- a
- one
- two
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
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a«bc»d
- e
```

</td><td>

```buffer
- abcd
- x
- y┃
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

### [Scenario2](../spec/scenarios.md#scenario2)

> enter indent enter

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
```

</td><td>

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

## Whitespace (7)

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
<tr><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one two
- 
  ┃ three
```

</td><td>

```buffer
- one two
- ┃ three
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- one two
- ┃ three
```

</td></tr>
</table>

### [TO-S13](../spec/obsidian-true-outliner.md#to-s13)

> shiftEnter

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
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

### [ShiftEnter1](../spec/shift-enter.md#shiftenter1)

> shiftEnter

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
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

### [ShiftEnter2](../spec/shift-enter.md#shiftenter2)

> shiftEnter

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a
   - b┃ c
```

</td><td>

```buffer
1. a
   - b
     ┃ c
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
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
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
<tr><th>tine</th><th>ourus</th></tr>
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
<tr><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one two┃ three
```

</td><td>

```buffer
- one two ┃three
```

</td></tr>
</table>

## Caret (6)

### [CursorUp3](../spec/cursor.md#cursorup3)

> cursorLineUp

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
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

### [DeleteSubtree1](../spec/delete-subtree.md#deletesubtree1)

> deleteSubtree

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
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
- d
```

</td><td>

```buffer
- a┃
- d
```

</td></tr>
</table>

### [DeleteSubtree2](../spec/delete-subtree.md#deletesubtree2)

> deleteSubtree

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a
2. b┃
3. c
```

</td><td>

```buffer
1. a
2. ▮ c
```

</td><td>

```buffer
1. a┃
2. c
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
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

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
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

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
<tr><th>buffer</th></tr>
<tr valign="top"><td>

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
<tr><th>tine</th><th>ourus</th></tr>
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

## Adapted: disagree (38)

### [Backtick18](../spec/backtick.md#backtick18)

> "`"

Adapted: paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- use ┃ here
```

</td><td>

```buffer
- use `┃` here
```

</td><td>

```buffer
- use `┃ here
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
use ┃ here
```

</td><td>

```buffer
use `┃ here
```

</td></tr>
</table>

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
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
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

### [DeleteSubtree6](../spec/delete-subtree.md#deletesubtree6)

> deleteSubtree "x"

Adapted: paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - b
```

</td><td>

```buffer
- 
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

### [Enter22](../spec/enter.md#enter22)

> enter

Adapted: blank lines, escape, paragraph, under enterSplitSpace: start

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
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

### [Enter56b](../spec/enter.md#enter56b)

> enter

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
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
a

┃d
```

</td></tr>
</table>

### [Enter59](../spec/enter.md#enter59)

> enter

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
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
┃◌

cd
```

</td></tr>
</table>

### [Fence62](../spec/fences.md#fence62)

> deleteContentBackward

Adapted: code block

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
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
  ```
  body
  ```┃
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
````
┃```
body
````
`````

</td></tr>
</table>

### [Indent29b](../spec/indent.md#indent29b)

> indent

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a
- para┃
```

</td><td>

```buffer
1. a
   - para┃
```

</td><td>

```buffer
1. a
2. para┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a

para┃
```

</td><td>

```buffer
1. a
2. para┃
```

</td></tr>
</table>

### [TO-E9](../spec/obsidian-true-outliner.md#to-e9)

> enter

Adapted: blank lines, paragraph, under enterSplitSpace: start

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
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
- ┃ two
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

┃ two
- child
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
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
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

Adapted: blank lines, empty document, paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
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
x

- y

z┃
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
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- done
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
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

````buffer
- ```
  let a = 1;
  let b = 2;┃
  ```
````

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

Adapted: blank lines, empty document, paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- line one
- line two
- p2┃
```

</td><td>

```buffer
- line one
  line two
- p2┃
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
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- | a | b |
  | --- | --- |
  | 1 | 2 |┃
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
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- a **b** _i_ `c` ~s~ [l](https://e.x/p)
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
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
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

Adapted: blank lines, code block, empty document, heading

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- ## Setup
- [](#setup)
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
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- **
- Bold start
- nested
- **┃
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
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- javascript
- Copy code
- `let a = 1;`┃
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
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

````buffer
- a```
  c
  ```┃
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

Adapted: code block

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

````buffer
- a
- x
- ```
  c┃
  ```
- b
````

</td><td>

````buffer
- a
- x
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
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - kid
```

</td><td>

````buffer
- a```
  c
  ```┃
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

Adapted: heading, paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- a
- # h
- text┃
- b
```

</td><td>

```buffer
- a
- # h
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
- a
- # h
  text┃
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

Adapted: paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
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
- Notes
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
Notes┃
- z
```

</td><td>

```buffer
Notes
- z
- x
- y┃
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
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
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
  - ```
    
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

Adapted: blank lines, heading, paragraph, under pasteOnParent: after

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # T┃
  - para
```

</td><td>

```buffer
- # Tx
  y┃
  - para
```

</td><td>

```buffer
- # T
  - para
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

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Notes┃
- more
```

</td><td>

```buffer
- Notes
- x
- y┃
- more
```

</td><td>

```buffer
- Notes
  - x
  - y┃
- more
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Notes┃

more
```

</td><td>

```buffer
Notes

- x
- y┃

more
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

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- See ┃here.
```

</td><td>

```buffer
- See here.
- x
- y┃
```

</td><td>

```buffer
- See here.
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
See ┃here.
```

</td><td>

```buffer
See here.

- x
- y┃
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

Adapted: blank lines, code block, paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- p┃
- q
```

</td><td>

````buffer
- p```
  c
  ```┃
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
p

```
c┃
```

q
````

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

> paste

Adapted: paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- p
  ┃
```

</td><td>

```buffer
- p
  
- a
- b┃
```

</td><td>

```buffer
- p
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
p
┃◌
```

</td><td>

```buffer
p
- a
- b┃
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
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- example┃
- next
```

</td><td>

````buffer
- example```
  code
  ```
  !┃
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

## Adapted: whitespace (18)

### [Fence3](../spec/fences.md#fence3)

> enter

Adapted: code block

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
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

### [TO-S4](../spec/obsidian-true-outliner.md#to-s4)

> shiftEnter

Adapted: paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
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

### [TO-S9](../spec/obsidian-true-outliner.md#to-s9)

> shiftEnter

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
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

Adapted: escape, paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

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

Adapted: paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
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
x┃abc
```

</td></tr>
</table>

### [PastePlain27](../spec/paste-plain.md#pasteplain27)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard

```

</td></tr>
</table>

> pastePlain

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- p
- ┃
```

</td><td>

```buffer
- p
- 
  ┃
```

</td><td>

```buffer
- p
- ┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
p

┃◌
```

</td><td>

```buffer
p

┃◌
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
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
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
<tr><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Plan
- revise 
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
<tr><th>buffer</th></tr>
<tr valign="top"><td>

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
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
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

### [ShiftEnter6](../spec/shift-enter.md#shiftenter6)

> shiftEnter

Adapted: escape

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
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

### [ShiftEnter7](../spec/shift-enter.md#shiftenter7)

> shiftEnter

Adapted: escape, paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
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

### [ShiftEnter8](../spec/shift-enter.md#shiftenter8)

> shiftEnter

Adapted: escape, paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
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

### [ShiftEnter9](../spec/shift-enter.md#shiftenter9)

> shiftEnter

Adapted: escape

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
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
<tr><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
-  
  ┃``` x
````

</td><td>

````buffer
- ┃``` x
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

### [ShiftEnter18](../spec/shift-enter.md#shiftenter18)

> shiftEnter

Adapted: escape

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. abc ┃2. x
```

</td><td>

```buffer
1. abc 
   ┃2\. x
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
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
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

### [ShiftEnter23](../spec/shift-enter.md#shiftenter23)

> shiftEnter

Adapted: escape, paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
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
<tr><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- 
  ┃ # b
```

</td><td>

```buffer
- ┃# b
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

## Adapted: caret (12)

### [CursorUp2](../spec/cursor.md#cursorup2)

> cursorLineUp

Adapted: heading

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
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

Adapted: task

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- [ ] task
```

</td><td>

```buffer
- a
- [┃ ] task
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

Adapted: task

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
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

Adapted: task

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
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

### [DeleteSubtree3](../spec/delete-subtree.md#deletesubtree3)

> deleteSubtree

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
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

### [DeleteSubtree9](../spec/delete-subtree.md#deletesubtree9)

> deleteSubtree

Adapted: blank lines, heading, paragraph, setext heading, thematic break

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃Intro
- ---
- ## title: x
```

</td><td>

```buffer
- ▮ ---
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
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃a
- ***
- ## title
```

</td><td>

```buffer
- ▮ ***
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
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
- b
```

</td><td>

````buffer
- ```
  c
  ```┃
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
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
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

Adapted: heading, paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # h1
  - ┃
```

</td><td>

```buffer
- # h1
  - a┃
    - b
```

</td><td>

```buffer
- # h1
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
# h1
┃◌
```

</td><td>

```buffer
# h1
- a
  - b┃
```

</td></tr>
</table>

## Skipped (550)

| example | why |
| --- | --- |
| **backspace.md** | |
| [Backspace2](../spec/backspace.md#backspace2) | caret in a marker |
| [Backspace4](../spec/backspace.md#backspace4) | tag markup-heading |
| [Backspace12](../spec/backspace.md#backspace12) | tag free-form |
| [Backspace12b](../spec/backspace.md#backspace12b) | tag free-form |
| [Backspace12c](../spec/backspace.md#backspace12c) | tag free-form |
| [Backspace12d](../spec/backspace.md#backspace12d) | tag free-form |
| [Backspace12e](../spec/backspace.md#backspace12e) | tag free-form |
| [Backspace14](../spec/backspace.md#backspace14) | tag free-form |
| [Backspace16](../spec/backspace.md#backspace16) | tag markup-fence |
| [Backspace17e](../spec/backspace.md#backspace17e) | tag free-form |
| [Backspace17f](../spec/backspace.md#backspace17f) | option emptyItemWithChildren: refuse |
| [Backspace17g](../spec/backspace.md#backspace17g) | option emptyItemWithChildren: refuse |
| [Backspace17h](../spec/backspace.md#backspace17h) | option emptyItemWithChildren: refuse |
| [Backspace18](../spec/backspace.md#backspace18) | tag free-form |
| [Backspace18b](../spec/backspace.md#backspace18b) | tag free-form |
| [Backspace18c](../spec/backspace.md#backspace18c) | tag free-form |
| [Backspace18d](../spec/backspace.md#backspace18d) | tag free-form |
| [Backspace18e](../spec/backspace.md#backspace18e) | tag markup-heading |
| [Backspace18f](../spec/backspace.md#backspace18f) | tag markup-heading |
| [Backspace18g](../spec/backspace.md#backspace18g) | tag markup-heading |
| [Backspace19](../spec/backspace.md#backspace19) | tag free-form |
| [Backspace19b](../spec/backspace.md#backspace19b) | tag free-form |
| [Backspace20](../spec/backspace.md#backspace20) | tag free-form |
| [Backspace23](../spec/backspace.md#backspace23) | tag free-form |
| [Backspace24](../spec/backspace.md#backspace24) | tag markup-fence |
| [Backspace26](../spec/backspace.md#backspace26) | option backspaceAtTopItem: the app's refuse, as blocks |
| [Backspace27](../spec/backspace.md#backspace27) | tag free-form |
| [Backspace28](../spec/backspace.md#backspace28) | tag markup-fence |
| [Backspace31](../spec/backspace.md#backspace31) | selection across blocks |
| [Backspace33](../spec/backspace.md#backspace33) | tag free-form |
| [Backspace35](../spec/backspace.md#backspace35) | tag free-form |
| [Backspace38](../spec/backspace.md#backspace38) | tag free-form |
| [Backspace40](../spec/backspace.md#backspace40) | numbered list from another number than 1 |
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
| [Backspace43](../spec/backspace.md#backspace43) | tag free-form |
| [Backspace43b](../spec/backspace.md#backspace43b) | tag free-form |
| [Backspace43c](../spec/backspace.md#backspace43c) | tag free-form |
| [Backspace45b](../spec/backspace.md#backspace45b) | option joinWithChildren: refuse |
| [Backspace47](../spec/backspace.md#backspace47) | tag free-form |
| [Backspace49](../spec/backspace.md#backspace49) | tag free-form |
| **backtick.md** | |
| [Backtick1](../spec/backtick.md#backtick1) | tag markup-fence |
| [Backtick2](../spec/backtick.md#backtick2) | tag markup-fence |
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
| [Copy3](../spec/copy.md#copy3) | quote |
| [Copy5](../spec/copy.md#copy5) | selection across blocks |
| [Copy6](../spec/copy.md#copy6) | nothing to compare |
| [Copy7](../spec/copy.md#copy7) | selection across blocks |
| [Copy8](../spec/copy.md#copy8) | callout |
| [Cut2](../spec/copy.md#cut2) | selection across blocks |
| [Cut3](../spec/copy.md#cut3) | selection across blocks |
| **cursor.md** | |
| [CursorDown2](../spec/cursor.md#cursordown2) | indented code |
| [CursorHome3](../spec/cursor.md#cursorhome3) | caret in a marker |
| [CursorHome4](../spec/cursor.md#cursorhome4) | caret in a marker |
| [CursorHome7](../spec/cursor.md#cursorhome7) | numbered list from another number than 1 |
| [CursorHome11](../spec/cursor.md#cursorhome11) | quote |
| [CursorHome15](../spec/cursor.md#cursorhome15) | caret in a marker |
| [CursorHome16](../spec/cursor.md#cursorhome16) | quote |
| [CursorHome17](../spec/cursor.md#cursorhome17) | callout |
| [CursorDocEndLeft1](../spec/cursor.md#cursordocendleft1) | cursorCharLeft after cursorDocEnd |
| **delete-subtree.md** | |
| [DeleteSubtree5](../spec/delete-subtree.md#deletesubtree5) | selection across blocks |
| [DeleteSubtree7](../spec/delete-subtree.md#deletesubtree7) | quote |
| [DeleteSubtree8](../spec/delete-subtree.md#deletesubtree8) | caret on a code block's fence |
| **delete.md** | |
| [Delete4](../spec/delete.md#delete4) | tag markup-heading |
| [Delete4b](../spec/delete.md#delete4b) | tag markup-heading |
| [Delete5e](../spec/delete.md#delete5e) | option emptyItemWithChildren: refuse |
| [Delete9](../spec/delete.md#delete9) | tag free-form |
| [Delete10](../spec/delete.md#delete10) | quote |
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
| [Delete16g](../spec/delete.md#delete16g) | option markup: decorated |
| [Delete18](../spec/delete.md#delete18) | tag free-form |
| [Delete18b](../spec/delete.md#delete18b) | tag free-form |
| [Delete18c](../spec/delete.md#delete18c) | tag free-form |
| [Delete18d](../spec/delete.md#delete18d) | tag free-form |
| [Delete19](../spec/delete.md#delete19) | tag markup-task |
| [Delete21](../spec/delete.md#delete21) | selection across blocks |
| [Delete23](../spec/delete.md#delete23) | tag free-form |
| [Delete24](../spec/delete.md#delete24) | tag free-form |
| [Delete25](../spec/delete.md#delete25) | tag free-form |
| [Delete29](../spec/delete.md#delete29) | tag free-form |
| [Delete31b](../spec/delete.md#delete31b) | option joinWithChildren: refuse |
| [Delete34](../spec/delete.md#delete34) | quote |
| **duplicate-subtree.md** | |
| [DuplicateSubtree1](../spec/duplicate-subtree.md#duplicatesubtree1) | action duplicateSubtree |
| [DuplicateSubtree2](../spec/duplicate-subtree.md#duplicatesubtree2) | action duplicateSubtree |
| [DuplicateSubtree3](../spec/duplicate-subtree.md#duplicatesubtree3) | action duplicateSubtree |
| [DuplicateSubtree4](../spec/duplicate-subtree.md#duplicatesubtree4) | tag free-form |
| [DuplicateSubtree5](../spec/duplicate-subtree.md#duplicatesubtree5) | action duplicateSubtree |
| [DuplicateSubtree6](../spec/duplicate-subtree.md#duplicatesubtree6) | tag free-form |
| [DuplicateSubtree7](../spec/duplicate-subtree.md#duplicatesubtree7) | action duplicateSubtree |
| [DuplicateSubtree8](../spec/duplicate-subtree.md#duplicatesubtree8) | tag markup-fence |
| [DuplicateSubtree9](../spec/duplicate-subtree.md#duplicatesubtree9) | tag markup-fence |
| **enter.md** | |
| [Enter3c](../spec/enter.md#enter3c) | numbered list from another number than 1 |
| [Enter6](../spec/enter.md#enter6) | tag free-form |
| [Enter7b](../spec/enter.md#enter7b) | tag free-form |
| [Enter14](../spec/enter.md#enter14) | tag free-form |
| [Enter15b](../spec/enter.md#enter15b) | tag free-form |
| [Enter23](../spec/enter.md#enter23) | indented code |
| [Enter25](../spec/enter.md#enter25) | numbered list from another number than 1 |
| [Enter26b](../spec/enter.md#enter26b) | option enterAtTextStart: stay |
| [Enter29b](../spec/enter.md#enter29b) | option enterAtTextStart: stay |
| [Enter30](../spec/enter.md#enter30) | option enterOnEmptyItem: outdent |
| [Enter32](../spec/enter.md#enter32) | tag markup-heading |
| [Enter32b](../spec/enter.md#enter32b) | tag markup-heading |
| [Enter33b](../spec/enter.md#enter33b) | option enterAtTextStart: stay |
| [Enter34](../spec/enter.md#enter34) | caret in a marker |
| [Enter36b](../spec/enter.md#enter36b) | quote |
| [Enter37](../spec/enter.md#enter37) | caret on a blank line |
| [Enter40](../spec/enter.md#enter40) | tag free-form |
| [Enter41](../spec/enter.md#enter41) | tag free-form |
| [Enter64](../spec/enter.md#enter64) | option enterSplitSpace: drop |
| [Enter65g](../spec/enter.md#enter65g) | tag markup-task |
| [Enter65i](../spec/enter.md#enter65i) | tag free-form |
| [Enter65l](../spec/enter.md#enter65l) | tag markup-heading |
| [Enter65m](../spec/enter.md#enter65m) | tag markup-heading |
| [Enter45](../spec/enter.md#enter45) | tag markup-heading |
| [Enter46](../spec/enter.md#enter46) | quote |
| [Enter47](../spec/enter.md#enter47) | tag free-form |
| [Enter50](../spec/enter.md#enter50) | tag free-form |
| [Enter53](../spec/enter.md#enter53) | tag free-form |
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
| [Enter68](../spec/enter.md#enter68) | callout |
| **fences.md** | |
| [Fence4](../spec/fences.md#fence4) | quote |
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
| **gaps.md** | |
| [Gap14](../spec/gaps.md#gap14) | caret on a blank line |
| [Gap15](../spec/gaps.md#gap15) | caret on a blank line |
| [Gap16](../spec/gaps.md#gap16) | caret on a blank line |
| [Gap17](../spec/gaps.md#gap17) | caret on a blank line |
| [Gap18](../spec/gaps.md#gap18) | caret on a blank line |
| [Gap19](../spec/gaps.md#gap19) | frontmatter |
| **indent.md** | |
| [Indent9](../spec/indent.md#indent9) | selection across blocks |
| [Indent12](../spec/indent.md#indent12) | tag free-form |
| [Indent16](../spec/indent.md#indent16) | tag free-form |
| [Indent22](../spec/indent.md#indent22) | tag free-form |
| [Indent23](../spec/indent.md#indent23) | tag free-form |
| [Indent24](../spec/indent.md#indent24) | tag free-form |
| [Indent25](../spec/indent.md#indent25) | tag free-form |
| [Indent27](../spec/indent.md#indent27) | selection across blocks |
| [Indent28](../spec/indent.md#indent28) | caret in a marker |
| [Indent29](../spec/indent.md#indent29) | changes only what blocks can't show |
| [Indent29c](../spec/indent.md#indent29c) | changes only what blocks can't show |
| [Indent30](../spec/indent.md#indent30) | caret in a marker |
| [Indent31](../spec/indent.md#indent31) | tag markup-fence |
| [Indent31b](../spec/indent.md#indent31b) | tag markup-fence |
| [Indent32](../spec/indent.md#indent32) | changes only what blocks can't show |
| **move-subtree-down.md** | |
| [MoveDown2](../spec/move-subtree-down.md#movedown2) | tag free-form |
| [MoveDown8](../spec/move-subtree-down.md#movedown8) | tag free-form |
| [MoveDown11](../spec/move-subtree-down.md#movedown11) | selection across blocks |
| [MoveDown12](../spec/move-subtree-down.md#movedown12) | selection across blocks |
| [MoveDown13](../spec/move-subtree-down.md#movedown13) | tag free-form |
| [MoveDown14](../spec/move-subtree-down.md#movedown14) | selection across blocks |
| [MoveDown17](../spec/move-subtree-down.md#movedown17) | tag free-form |
| [MoveDown19](../spec/move-subtree-down.md#movedown19) | tag free-form |
| [MoveDown20](../spec/move-subtree-down.md#movedown20) | tag free-form |
| [MoveDown23](../spec/move-subtree-down.md#movedown23) | numbered list from another number than 1 |
| [MoveDown25](../spec/move-subtree-down.md#movedown25) | tag free-form |
| [MoveDown28](../spec/move-subtree-down.md#movedown28) | tag free-form |
| [MoveDown30](../spec/move-subtree-down.md#movedown30) | numbered list from another number than 1 |
| [MoveDown32](../spec/move-subtree-down.md#movedown32) | caret in a marker |
| [MoveDown34](../spec/move-subtree-down.md#movedown34) | tag markup-fence |
| [MoveDown36](../spec/move-subtree-down.md#movedown36) | tag free-form |
| [MoveDown37](../spec/move-subtree-down.md#movedown37) | tag markup-fence |
| [MoveDown38](../spec/move-subtree-down.md#movedown38) | tag free-form |
| [MoveDown39](../spec/move-subtree-down.md#movedown39) | tag free-form |
| **move-subtree-up.md** | |
| [MoveUp7](../spec/move-subtree-up.md#moveup7) | tag free-form |
| [MoveUp10](../spec/move-subtree-up.md#moveup10) | selection across blocks |
| [MoveUp11](../spec/move-subtree-up.md#moveup11) | selection across blocks |
| [MoveUp12](../spec/move-subtree-up.md#moveup12) | tag free-form |
| [MoveUp15](../spec/move-subtree-up.md#moveup15) | numbered list from another number than 1 |
| [MoveUp18](../spec/move-subtree-up.md#moveup18) | indented code |
| [MoveUp21](../spec/move-subtree-up.md#moveup21) | tag free-form |
| [MoveUp23](../spec/move-subtree-up.md#moveup23) | tag free-form |
| [MoveUp24](../spec/move-subtree-up.md#moveup24) | tag free-form |
| [MoveUp27](../spec/move-subtree-up.md#moveup27) | tag free-form |
| [MoveUp28](../spec/move-subtree-up.md#moveup28) | tag free-form |
| [MoveUp29](../spec/move-subtree-up.md#moveup29) | tag free-form |
| [MoveUp31](../spec/move-subtree-up.md#moveup31) | selection across blocks |
| [MoveUp33](../spec/move-subtree-up.md#moveup33) | tag free-form |
| [MoveUp34](../spec/move-subtree-up.md#moveup34) | caret in a marker |
| [MoveUp35](../spec/move-subtree-up.md#moveup35) | tag free-form |
| [MoveUp36](../spec/move-subtree-up.md#moveup36) | tag free-form |
| [MoveUp37](../spec/move-subtree-up.md#moveup37) | tag markup-fence |
| [MoveUp38](../spec/move-subtree-up.md#moveup38) | tag markup-fence |
| [MoveUp39](../spec/move-subtree-up.md#moveup39) | caret on a blank line |
| [MoveUp41](../spec/move-subtree-up.md#moveup41) | tag markup-fence |
| **obsidian-true-outliner.md** | |
| [TO-Bug228](../spec/obsidian-true-outliner.md#to-bug228) | numbered list from another number than 1 |
| [TO-E15](../spec/obsidian-true-outliner.md#to-e15) | tag free-form |
| [TO-E18](../spec/obsidian-true-outliner.md#to-e18) | tag markup-heading |
| [TO-E19-E21b](../spec/obsidian-true-outliner.md#to-e19-e21b) | tag free-form |
| [TO-Bug267-E5](../spec/obsidian-true-outliner.md#to-bug267-e5) | quote |
| [TO-S5](../spec/obsidian-true-outliner.md#to-s5) | tag free-form |
| [TO-S7-S8](../spec/obsidian-true-outliner.md#to-s7-s8) | tag markup-heading |
| [TO-S7-S8b](../spec/obsidian-true-outliner.md#to-s7-s8b) | tag markup-heading |
| [TO-S11b](../spec/obsidian-true-outliner.md#to-s11b) | tag free-form |
| [TO1](../spec/obsidian-true-outliner.md#to1) | tag markup-task |
| [TO4](../spec/obsidian-true-outliner.md#to4) | numbered list from another number than 1 |
| [TO6](../spec/obsidian-true-outliner.md#to6) | numbered list from another number than 1 |
| [TO-Bug255](../spec/obsidian-true-outliner.md#to-bug255) | quote |
| [TO-Seams](../spec/obsidian-true-outliner.md#to-seams) | quote |
| [TO-Seamsb](../spec/obsidian-true-outliner.md#to-seamsb) | quote |
| [TO-Seamsd](../spec/obsidian-true-outliner.md#to-seamsd) | indented code |
| [TO-Lazy](../spec/obsidian-true-outliner.md#to-lazy) | quote |
| [TO7](../spec/obsidian-true-outliner.md#to7) | option outdent: logical |
| [TO8](../spec/obsidian-true-outliner.md#to8) | tag free-form |
| [TO9](../spec/obsidian-true-outliner.md#to9) | tag free-form |
| [TO18](../spec/obsidian-true-outliner.md#to18) | tag free-form |
| [TO19](../spec/obsidian-true-outliner.md#to19) | tag free-form |
| [TO-Bug264](../spec/obsidian-true-outliner.md#to-bug264) | quote |
| [TO-Bug197](../spec/obsidian-true-outliner.md#to-bug197) | quote |
| **outdent.md** | |
| [Outdent2](../spec/outdent.md#outdent2) | tag free-form |
| [Outdent4](../spec/outdent.md#outdent4) | tag free-form |
| [Outdent5](../spec/outdent.md#outdent5) | tag free-form |
| [Outdent8](../spec/outdent.md#outdent8) | selection across blocks |
| [Outdent10](../spec/outdent.md#outdent10) | selection across blocks |
| [Outdent11](../spec/outdent.md#outdent11) | tag free-form |
| [Outdent12](../spec/outdent.md#outdent12) | tag free-form |
| [Outdent14](../spec/outdent.md#outdent14) | caret in a marker |
| [DirectOutdent2](../spec/outdent.md#directoutdent2) | tag free-form |
| [DirectOutdent3](../spec/outdent.md#directoutdent3) | tag free-form |
| [DirectOutdent5](../spec/outdent.md#directoutdent5) | tag free-form |
| [DirectOutdent6](../spec/outdent.md#directoutdent6) | tag free-form |
| [LogicalOutdent1](../spec/outdent.md#logicaloutdent1) | option outdent: logical |
| [LogicalOutdent2](../spec/outdent.md#logicaloutdent2) | tag free-form |
| [LogicalOutdent3](../spec/outdent.md#logicaloutdent3) | tag free-form |
| [LogicalOutdent4](../spec/outdent.md#logicaloutdent4) | option outdent: logical |
| [LogicalOutdent6](../spec/outdent.md#logicaloutdent6) | tag free-form |
| [LogicalOutdent5](../spec/outdent.md#logicaloutdent5) | tag free-form |
| [Outdent16](../spec/outdent.md#outdent16) | tag free-form |
| [Outdent17](../spec/outdent.md#outdent17) | tag free-form |
| [Outdent17b](../spec/outdent.md#outdent17b) | tag free-form |
| [Outdent18](../spec/outdent.md#outdent18) | tag free-form |
| [Outdent19](../spec/outdent.md#outdent19) | tag free-form |
| [Outdent19b](../spec/outdent.md#outdent19b) | tag free-form |
| [Outdent20](../spec/outdent.md#outdent20) | tag free-form |
| [Outdent20b](../spec/outdent.md#outdent20b) | tag free-form |
| **paste-html.md** | |
| [PasteHtml12](../spec/paste-html.md#pastehtml12) | quote |
| **paste-list-form.md** | |
| [PasteListForm6](../spec/paste-list-form.md#pastelistform6) | option pasteListForm: own |
| **paste-list.md** | |
| [PasteList17](../spec/paste-list.md#pastelist17) | quote |
| [PasteList20](../spec/paste-list.md#pastelist20) | option pasteAtTextStart: before |
| [PasteList21](../spec/paste-list.md#pastelist21) | option pasteParagraphList: children |
| [PasteList22](../spec/paste-list.md#pastelist22) | option pasteSeams: open |
| [PasteList23](../spec/paste-list.md#pastelist23) | option pasteSeams: open |
| [PasteList24](../spec/paste-list.md#pastelist24) | option pasteSeams: open |
| **paste-plain.md** | |
| [PastePlain3](../spec/paste-plain.md#pasteplain3) | tag free-form |
| [PastePlain4](../spec/paste-plain.md#pasteplain4) | tag free-form |
| [PastePlain12](../spec/paste-plain.md#pasteplain12) | tag free-form |
| [PastePlain18](../spec/paste-plain.md#pasteplain18) | quote |
| [PastePlain21](../spec/paste-plain.md#pasteplain21) | tag free-form |
| [PastePlain22](../spec/paste-plain.md#pasteplain22) | tag free-form |
| [PastePlain24](../spec/paste-plain.md#pasteplain24) | tag free-form |
| [PastePlain26](../spec/paste-plain.md#pasteplain26) | tag free-form |
| [PastePlain29](../spec/paste-plain.md#pasteplain29) | tag markup-fence |
| [PastePlain31](../spec/paste-plain.md#pasteplain31) | option pastePlainLines: enter |
| [PastePlain32](../spec/paste-plain.md#pasteplain32) | option pastePlainLines: items |
| [PastePlain33](../spec/paste-plain.md#pasteplain33) | option pastePlainLines: items |
| [PastePlain34](../spec/paste-plain.md#pasteplain34) | option pastePlainLines: host |
| **paste.md** | |
| [Paste9](../spec/paste.md#paste9) | quote |
| [Paste13](../spec/paste.md#paste13) | caret on a blank line |
| [Paste15](../spec/paste.md#paste15) | caret on a code block's fence |
| [Paste16](../spec/paste.md#paste16) | caret in a marker |
| [Paste18](../spec/paste.md#paste18) | option pasteLines: items |
| [Paste19](../spec/paste.md#paste19) | option pasteLines: items |
| [Paste20](../spec/paste.md#paste20) | option pasteAtTextStart: before |
| [Paste21](../spec/paste.md#paste21) | option pasteSeams: open |
| [Paste23](../spec/paste.md#paste23) | callout |
| [Paste25](../spec/paste.md#paste25) | callout |
| [Paste27](../spec/paste.md#paste27) | quote |
| **placeholders.md** | |
| [Placeholder2](../spec/placeholders.md#placeholder2) | tag free-form |
| [Placeholder3](../spec/placeholders.md#placeholder3) | tag free-form |
| [Placeholder4](../spec/placeholders.md#placeholder4) | tag free-form |
| [Placeholder9](../spec/placeholders.md#placeholder9) | cursorCharLeft after cursorDocEnd |
| [Placeholder17](../spec/placeholders.md#placeholder17) | cursorCharLeft after cursorDocEnd |
| [Placeholder10](../spec/placeholders.md#placeholder10) | caret on a blank line |
| [Placeholder11](../spec/placeholders.md#placeholder11) | cursorCharLeft after cursorDocEnd |
| [Placeholder12](../spec/placeholders.md#placeholder12) | caret on a blank line |
| [Placeholder13](../spec/placeholders.md#placeholder13) | tag markup-heading |
| [Placeholder15](../spec/placeholders.md#placeholder15) | cursorCharLeft after cursorDocEnd |
| [Placeholder18](../spec/placeholders.md#placeholder18) | cursorCharLeft after cursorDocEnd |
| [Placeholder19](../spec/placeholders.md#placeholder19) | cursorCharLeft after cursorDocEnd |
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
| [Quote26](../spec/quotes.md#quote26) | quote |
| [Quote27](../spec/quotes.md#quote27) | tag free-form |
| [Quote28](../spec/quotes.md#quote28) | tag free-form |
| [Quote29](../spec/quotes.md#quote29) | quote |
| [Quote30](../spec/quotes.md#quote30) | quote |
| [Quote31](../spec/quotes.md#quote31) | quote |
| [Quote32](../spec/quotes.md#quote32) | tag free-form |
| [Quote33](../spec/quotes.md#quote33) | tag free-form |
| [Quote34](../spec/quotes.md#quote34) | tag free-form |
| [Quote35](../spec/quotes.md#quote35) | quote |
| [Quote36](../spec/quotes.md#quote36) | quote |
| [Quote37](../spec/quotes.md#quote37) | quote |
| [Quote38](../spec/quotes.md#quote38) | callout |
| [Quote39](../spec/quotes.md#quote39) | callout |
| [Quote40](../spec/quotes.md#quote40) | callout |
| [Quote41](../spec/quotes.md#quote41) | callout |
| [Quote42](../spec/quotes.md#quote42) | quote |
| [Quote43](../spec/quotes.md#quote43) | callout |
| [Quote43b](../spec/quotes.md#quote43b) | option markup: decorated |
| [Quote44](../spec/quotes.md#quote44) | quote |
| [Quote45](../spec/quotes.md#quote45) | quote |
| [Quote46](../spec/quotes.md#quote46) | quote |
| [Quote47](../spec/quotes.md#quote47) | tag free-form |
| [Quote48](../spec/quotes.md#quote48) | quote |
| [Quote49](../spec/quotes.md#quote49) | quote |
| [Quote50](../spec/quotes.md#quote50) | quote |
| [Quote51](../spec/quotes.md#quote51) | tag free-form |
| [Quote52](../spec/quotes.md#quote52) | quote |
| [Quote53](../spec/quotes.md#quote53) | quote |
| [Quote54](../spec/quotes.md#quote54) | tag free-form |
| [Quote55](../spec/quotes.md#quote55) | quote |
| [Quote56](../spec/quotes.md#quote56) | quote |
| [Quote57](../spec/quotes.md#quote57) | callout |
| [Quote58](../spec/quotes.md#quote58) | callout |
| [Quote59](../spec/quotes.md#quote59) | tag free-form |
| [Quote89](../spec/quotes.md#quote89) | quote |
| [Quote90](../spec/quotes.md#quote90) | tag markup-fence |
| [Quote60](../spec/quotes.md#quote60) | callout |
| [Quote61](../spec/quotes.md#quote61) | callout |
| [Quote62](../spec/quotes.md#quote62) | callout |
| [Quote63](../spec/quotes.md#quote63) | quote |
| [Quote64](../spec/quotes.md#quote64) | quote |
| [Quote65](../spec/quotes.md#quote65) | quote |
| [Quote66](../spec/quotes.md#quote66) | quote |
| [Quote67](../spec/quotes.md#quote67) | quote |
| [Quote68](../spec/quotes.md#quote68) | quote |
| [Quote71](../spec/quotes.md#quote71) | callout |
| [Quote72](../spec/quotes.md#quote72) | quote |
| [Quote73](../spec/quotes.md#quote73) | tag free-form |
| [Quote74](../spec/quotes.md#quote74) | quote |
| [Quote75](../spec/quotes.md#quote75) | quote |
| [Quote76](../spec/quotes.md#quote76) | quote |
| [Quote77](../spec/quotes.md#quote77) | quote |
| [Quote78](../spec/quotes.md#quote78) | quote |
| [Quote79](../spec/quotes.md#quote79) | callout |
| [Quote80](../spec/quotes.md#quote80) | quote |
| [Quote81](../spec/quotes.md#quote81) | quote |
| [Quote82](../spec/quotes.md#quote82) | quote |
| [Quote88](../spec/quotes.md#quote88) | quote |
| [Quote83](../spec/quotes.md#quote83) | quote |
| [Quote84](../spec/quotes.md#quote84) | callout |
| [Quote85](../spec/quotes.md#quote85) | quote |
| [Quote86](../spec/quotes.md#quote86) | action duplicateSubtree |
| [Quote87](../spec/quotes.md#quote87) | quote |
| [Quote91](../spec/quotes.md#quote91) | quote |
| [Quote91b](../spec/quotes.md#quote91b) | quote |
| [Quote92](../spec/quotes.md#quote92) | quote |
| [Quote93](../spec/quotes.md#quote93) | tag markup-heading |
| [Quote69](../spec/quotes.md#quote69) | quote |
| [Quote70](../spec/quotes.md#quote70) | quote |
| [Quote94](../spec/quotes.md#quote94) | tag markup-task |
| **scenarios.md** | |
| [Scenario6](../spec/scenarios.md#scenario6) | tag free-form |
| [Scenario15](../spec/scenarios.md#scenario15) | tag markup-task |
| [Scenario17](../spec/scenarios.md#scenario17) | option pasteLines: items |
| [Scenario21](../spec/scenarios.md#scenario21) | tag free-form |
| [Scenario21b](../spec/scenarios.md#scenario21b) | tag free-form |
| [Scenario24](../spec/scenarios.md#scenario24) | tag free-form |
| [Scenario25](../spec/scenarios.md#scenario25) | tag free-form |
| **shift-enter.md** | |
| [ShiftEnter10](../spec/shift-enter.md#shiftenter10) | tag free-form |
| [ShiftEnter11](../spec/shift-enter.md#shiftenter11) | tag free-form |
| [ShiftEnter12](../spec/shift-enter.md#shiftenter12) | tag free-form |
| [ShiftEnter13](../spec/shift-enter.md#shiftenter13) | tag free-form |
| [ShiftEnter13b](../spec/shift-enter.md#shiftenter13b) | tag free-form |
| [ShiftEnter14](../spec/shift-enter.md#shiftenter14) | tag free-form |
| [ShiftEnter15](../spec/shift-enter.md#shiftenter15) | tag free-form |
| [ShiftEnter16](../spec/shift-enter.md#shiftenter16) | tag free-form |
| [ShiftEnter22](../spec/shift-enter.md#shiftenter22) | tag free-form |
| [ShiftEnter22b](../spec/shift-enter.md#shiftenter22b) | tag free-form |
| [ShiftEnter24](../spec/shift-enter.md#shiftenter24) | tag free-form |
| [ShiftEnter25](../spec/shift-enter.md#shiftenter25) | tag free-form |
| [ShiftEnter26](../spec/shift-enter.md#shiftenter26) | tag free-form |
| [ShiftEnter26b](../spec/shift-enter.md#shiftenter26b) | tag markup-task |
| [ShiftEnter27](../spec/shift-enter.md#shiftenter27) | selection across blocks |
| [ShiftEnter29](../spec/shift-enter.md#shiftenter29) | tag markup-heading |
| [ShiftEnter33](../spec/shift-enter.md#shiftenter33) | caret in a marker |
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
| [Undo3](../spec/undo.md#undo3) | tag free-form |
| **z-open.md** | |
| [Open2](../spec/z-open.md#open2) | caret on a code block's fence |
