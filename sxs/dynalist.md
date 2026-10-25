---
type: "SxS"
app: "dynalist"
version: "9 (build 20260830132109, 5cc489d)"
url: "https://dynalist.io/demo"
model: "block"
command: "node sxs/run.ts dynalist"
elapsed_s: 87
workers: 4
---

# Dynalist vs ourus

Summary:

|  | agree | caret | whitespace | disagree | error | skipped | total |
| --- | --- | --- | --- | --- | --- | --- | --- |
| original | 154 | [2](#caret-2) | [6](#whitespace-6) | [5](#disagree-5) |  |  | **167** |
| adapted | 395 | [5](#adapted-caret-5) | [16](#adapted-whitespace-16) | [102](#adapted-disagree-102) |  |  | **518** |
| **total** | **549 (48%)** | **7 (0.61%)** | **22 (1.9%)** | **107 (9.4%)** | **0 (0%)** | **[458](#skipped-458) (40%)** | **1143** |

Per-file:

|  | agree | caret | whitespace | disagree | error | skipped | total | original | adapted |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [backspace.md](../spec/backspace.md) | 42 | 3 |  | 4 |  | 36 | **85** | 16 | 33 |
| [backtick.md](../spec/backtick.md) | 1 |  |  |  |  | 32 | **33** |  | 1 |
| [copy.md](../spec/copy.md) | 4 |  |  |  |  | 9 | **13** | 1 | 3 |
| [cursor.md](../spec/cursor.md) | 30 |  |  |  |  | 6 | **36** | 12 | 18 |
| [delete-subtree.md](../spec/delete-subtree.md) | 7 | 2 |  | 1 |  | 3 | **13** | 2 | 8 |
| [delete.md](../spec/delete.md) | 28 |  |  | 2 |  | 26 | **56** | 11 | 19 |
| [duplicate-subtree.md](../spec/duplicate-subtree.md) |  |  |  |  |  | 10 | **10** |  |  |
| [enter.md](../spec/enter.md) | 58 |  | 4 | 5 |  | 31 | **98** | 26 | 41 |
| [fences.md](../spec/fences.md) | 7 |  |  | 1 |  | 62 | **70** |  | 8 |
| [gaps.md](../spec/gaps.md) | 15 |  |  |  |  | 4 | **19** | 1 | 14 |
| [indent.md](../spec/indent.md) | 23 |  |  | 2 |  | 17 | **42** | 13 | 12 |
| [lists.md](../spec/lists.md) | 5 |  |  |  |  | 11 | **16** |  | 5 |
| [move-subtree-down.md](../spec/move-subtree-down.md) | 22 |  |  | 1 |  | 17 | **40** | 8 | 15 |
| [move-subtree-up.md](../spec/move-subtree-up.md) | 22 |  |  | 2 |  | 18 | **42** | 9 | 15 |
| [obsidian-true-outliner.md](../spec/obsidian-true-outliner.md) | 43 |  | 4 | 5 |  | 15 | **67** | 19 | 33 |
| [outdent.md](../spec/outdent.md) | 13 |  |  |  |  | 23 | **36** | 6 | 7 |
| [paste-conv.md](../spec/paste-conv.md) | 3 |  |  | 3 |  |  | **6** | 5 | 1 |
| [paste-html.md](../spec/paste-html.md) | 1 |  |  | 17 |  | 1 | **19** |  | 18 |
| [paste-list-form.md](../spec/paste-list-form.md) | 4 |  |  | 1 |  | 1 | **6** |  | 5 |
| [paste-list.md](../spec/paste-list.md) | 14 |  |  | 10 |  | 5 | **29** | 2 | 22 |
| [paste-plain.md](../spec/paste-plain.md) | 18 |  | 1 | 7 |  | 10 | **36** | 1 | 25 |
| [paste.md](../spec/paste.md) | 9 |  |  | 14 |  | 13 | **36** |  | 23 |
| [placeholders.md](../spec/placeholders.md) | 11 |  | 5 |  |  | 4 | **20** | 5 | 11 |
| [quirks.md](../spec/quirks.md) | 4 |  |  |  |  | 3 | **7** |  | 4 |
| [quotes.md](../spec/quotes.md) | 84 |  | 3 | 16 |  | 40 | **143** |  | 103 |
| [regressions.md](../spec/regressions.md) | 20 | 2 | 2 | 10 |  | 30 | **64** | 4 | 30 |
| [scenarios.md](../spec/scenarios.md) | 21 |  |  | 2 |  | 3 | **26** | 11 | 12 |
| [shift-enter.md](../spec/shift-enter.md) | 26 |  | 3 |  |  | 7 | **36** | 12 | 17 |
| [tasks.md](../spec/tasks.md) | 9 |  |  | 4 |  | 17 | **30** |  | 13 |
| [typing.md](../spec/typing.md) |  |  |  |  |  | 3 | **3** |  |  |
| [undo.md](../spec/undo.md) | 4 |  |  |  |  | 1 | **5** | 3 | 1 |
| [z-open.md](../spec/z-open.md) | 1 |  |  |  |  |  | **1** |  | 1 |
| **total** | **549 (48%)** | **7 (0.61%)** | **22 (1.9%)** | **107 (9.4%)** | **0 (0%)** | **458 (40%)** | **1143** | **167 (15%)** | **518 (45%)** |

## Disagree (5)

### [Indent4](../spec/indent.md#indent4)

> indent

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
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

### [MoveDown6](../spec/move-subtree-down.md#movedown6)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
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

### [MoveUp5](../spec/move-subtree-up.md#moveup5)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- ax
- y
- ┃
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
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- a- x
- - y┃
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

## Whitespace (6)

### [Enter16](../spec/enter.md#enter16)

> enter

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
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
<tr><th>dynalist</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
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

### [ShiftEnter33](../spec/shift-enter.md#shiftenter33)

> shiftEnter

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
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

## Caret (2)

### [Backspace17](../spec/backspace.md#backspace17)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
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

### [Regression46](../spec/regressions.md#regression46)

> outdent

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
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

## Adapted: disagree (102)

### [Backspace18e](../spec/backspace.md#backspace18e)

> deleteContentBackward

Adapted: as blocks, heading

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- # ┃H
```

</td><td>

```buffer
- # a┃H
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

Adapted: as blocks, heading

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- # ┃H
  text
```

</td><td>

```buffer
- # a┃H
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

### [Backspace26](../spec/backspace.md#backspace26)

> deleteContentBackward

Adapted: as blocks, paragraph

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
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
<tr><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer

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

### [DeleteSubtree6](../spec/delete-subtree.md#deletesubtree6)

> deleteSubtree "x"

Adapted: paragraph

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
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
<tr><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # a┃H1
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
<tr><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # a┃1
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
<tr><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # a┃H
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
<tr><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # a┃
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
<tr><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # one two┃ three
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
<tr><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # one two┃ - x
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
<tr><th>dynalist</th><th>ourus</th></tr>
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
<tr><th>dynalist</th><th>ourus</th></tr>
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
<tr><th>dynalist</th><th>ourus</th></tr>
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
<tr><th>dynalist</th><th>ourus</th></tr>
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
<tr><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # title┃ - x
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

### [Enter60b](../spec/enter.md#enter60b)

> enter deleteContentBackward

Adapted: heading, paragraph, under enterSplitSpace: start, under quirkEnterMidHeading: workflowy

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # title┃ - x
```

</td><td>

```buffer
- # title┃ - x
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

### [Fence62](../spec/fences.md#fence62)

> deleteContentBackward

Adapted: as blocks, code block

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
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

### [MoveUp21](../spec/move-subtree-up.md#moveup21)

Adapted: as blocks, paragraph

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- para
  - a┃
  - b
```

</td></tr>
</table>

> moveSubtreeUp

<table>
<tr><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- para
  - b
```

</td><td>

```buffer
- para
  - a┃
  - b
```

</td></tr>
</table>

> moveSubtreeDown

<table>
<tr><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- para
  - b
- a┃
```

</td><td>

```buffer
- para
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

</td></tr>
</table>

### [TO-E10](../spec/obsidian-true-outliner.md#to-e10)

> enter

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
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
<tr><th>dynalist</th><th>ourus</th></tr>
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
<tr><th>dynalist</th><th>ourus</th></tr>
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

Adapted: escape, under quirkPasteText: dynalist

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- top
  - sib┃
```

</td><td>

```buffer
- top
  - sib- a
    - - b
      - - c
  - ┃
```

</td><td>

```buffer
- top
  - sib- a
  - - b
  - - c
  - ┃
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
  - sib- a
  - \- b
  - \- c
  - ┃
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

Adapted: escape, under quirkPasteText: dynalist

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- top
  - sib┃
```

</td><td>

```buffer
- top
  - sib- a
    - - b
      - - c
  - ┃
```

</td><td>

```buffer
- top
  - sib- a
  - - b
  - - c
  - ┃
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
→- sib- a
→- \- b
→- \- c
→- ┃
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

Adapted: heading, paragraph, under pasteOnParent: after, under quirkPasteText: dynalist

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ## H┃
  - below
```

</td><td>

```buffer
- ## Hfirst
  - below
- 
  - > quote
- ┃
```

</td><td>

```buffer
- ## H┃
  - below
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
## H┃
below
```

</td></tr>
</table>

### [PasteConvPhraseInCode](../spec/paste-conv.md#pasteconvphraseincode)

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

Adapted: as blocks, code block

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- ```
  a┃
  ```
````

</td><td>

````buffer
- ```
  ax **y**┃
  ```
````

</td><td>

````buffer
- ```
  ax y┃
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
  ax y┃
  ```
````

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
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- 
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
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- 
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
- x
  - y
- z┃
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
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- x **b**y
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
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- 
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
- x
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
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- 
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
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- 
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
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- let a = 1;
- let b = 2;
- ┃
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
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- Title
- para **bold** c┃
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
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- q1q2┃
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
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- ab
- 12┃
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
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- 
- a **b** *i* c s [l](https://e.x/p)
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
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- 
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
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- Setup
- [](#setup)
- npm install
- ┃
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
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- 
- Bold start
  - nested┃
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
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- one
  - nested
- ┃
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
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
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

Adapted: escape, under quirkPasteText: dynalist

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
```

</td><td>

```buffer
- a- x
  - 1\. x1
- - y┃
```

</td><td>

```buffer
- a- x
- 1\. x1
- - y┃
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
- a- x
- 1\. x1
- \- y┃
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

Adapted: escape, under pasteOnParent: after, under quirkPasteText: dynalist

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - kid
```

</td><td>

```buffer
- a- x
  - kid
- - y┃
```

</td><td>

```buffer
- a- x
  - - y┃
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
- a- x
  - \- y┃
  - kid
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

Adapted: escape, under pasteOnParent: after, under quirkPasteText: dynalist

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
  - kid
```

</td><td>

```buffer
- - x
  - kid
- - y┃
```

</td><td>

```buffer
- - x
  - - y┃
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
- \- x
  - \- y┃
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

Adapted: as blocks, task, under quirkPasteText: dynalist

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] ┃
```

</td><td>

```buffer
- [ ] - x
- - y┃
```

</td><td>

```buffer
- [ ] - x
- [ ] - y┃
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
- [ ] - x
- [ ] - y┃
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

Adapted: blank lines, escape, paragraph, under pasteParagraphList: children, under quirkPasteText: dynalist

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
```

</td><td>

```buffer
- aone
- two
- 
- - x┃
```

</td><td>

```buffer
- aone
- two
- - x┃
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
- two

\- x┃
```

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

Adapted: escape, under quirkPasteText: dynalist

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - kid
```

</td><td>

````buffer
- a```
  - kid
- c
- ```┃
````

</td><td>

````buffer
- a```
  - c
  - ```┃
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
- a```
  - c
  - \```┃
  - kid
````

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

Adapted: escape, under quirkPasteText: dynalist

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
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
  - b1
- ┃
```

</td><td>

```buffer
- a
- > q
  - ┃
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
- \> q
  - ┃◌
  - b1
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

Adapted: escape, under quirkPasteText: dynalist

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - kid
- b
```

</td><td>

```buffer
- a- x
  - kid
- - y┃
- b
```

</td><td>

```buffer
- a- x
  - - y┃
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
- a- x
  - \- y┃
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

Adapted: as blocks, escape, paragraph, under quirkPasteText: dynalist

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Notes┃
  - z
```

</td><td>

```buffer
- Notes- x
  - z
- - y┃
```

</td><td>

```buffer
- Notes- x
  - - y┃
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
- Notes- x
  - \- y┃
  - z
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

Adapted: escape, under quirkPasteText: dynalist

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

````buffer
- a- ```
  - code
  - ```
- ┃
- b
````

</td><td>

````buffer
- a- ```
- code
- ```
- ┃
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
- a- ```
- code
- \```
- ┃
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

Adapted: under quirkPasteText: dynalist

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

````buffer
- a- ```
  - code┃
- b
````

</td><td>

````buffer
- a- ```
- code┃
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
- a- ```
- code┃
- b
````

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

Adapted: under pastePlainLines: enter

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃b
- c
```

</td><td>

```buffer
- ax
- 
- y
- ┃b
- c
```

</td><td>

```buffer
- ax
- y
- ┃
- b
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
- y
- ┃
- b
- c
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

Adapted: as blocks, blank lines, escape, paragraph, under pastePlainLines: enter

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- p┃
```

</td><td>

```buffer
- px
- 
- [a]: /u┃
```

</td><td>

```buffer
- px
- [a]: /u┃
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

[a]\: /u┃
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

Adapted: under pastePlainLines: enter

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
<tr><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- x
  - c
- y┃ b
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

Adapted: as blocks, paragraph, under pastePlainLines: enter

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃abc
```

</td><td>

```buffer
- 
- x┃abc
```

</td><td>

```buffer
- x┃
- abc
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
- x┃
- abc
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

Adapted: as blocks, blank lines, paragraph, under pastePlainLines: enter

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- p
- ┃abc
```

</td><td>

```buffer
- p
- 
- 
- x┃abc
```

</td><td>

```buffer
- p
- 
- x┃
- abc
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
- 
- x┃
- abc
```

</td></tr>
</table>

### [PastePlain28](../spec/paste-plain.md#pasteplain28)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
a = 1
  b = 2
```

</td></tr>
</table>

> pastePlain

Adapted: as blocks, code block, paragraph, under pastePlainLines: enter

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- code
  - ```
    ┃
    ```
````

</td><td>

````buffer
- code
  - ```
    a = 1
    - b = 2┃
      ```
````

</td><td>

````buffer
- code
  - ```
    a = 1
  - b = 2┃
  -   ```
````

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- code
  ```
  ┃
  ```
````

</td><td>

````buffer
- code
  - ```
    a = 1
  b = 2┃
    ```
````

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

Adapted: code block, under pastePlainLines: enter

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
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
  - b┃
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

Adapted: blank lines, heading, paragraph, under pasteLines: items, under pasteOnParent: after, under quirkPasteText: dynalist

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # T┃
  - para
```

</td><td>

```buffer
- # Tx
  - para
- y┃
```

</td><td>

```buffer
- # Tx
  - y┃
  - para
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
# Tx
y┃

para
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

Adapted: blank lines, escape, heading, paragraph, under pasteOnParent: after, under quirkPasteText: dynalist

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # T┃
  - z
```

</td><td>

```buffer
- # T- x
  - z
- - y┃
```

</td><td>

```buffer
- # T- x
  - - y┃
    - z
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
# T- x
\- y┃

- z
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

Adapted: as blocks, blank lines, escape, under quirkPasteText: dynalist

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  
  p┃
- b
```

</td><td>

```buffer
- a
  
  p- x
- - y┃
- b
```

</td><td>

```buffer
- a
  
  p- x
  
  \- y┃
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
  
  p- x

  \- y┃
- b
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

Adapted: blank lines, heading, paragraph, under pasteOnParent: after, under quirkPasteText: dynalist

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ## A┃
  - p
- ## B
```

</td><td>

```buffer
- ## A## h
  - p
- text┃
- ## B
```

</td><td>

```buffer
- ## A## h
  - text┃
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
## A## h
text┃

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

Adapted: blank lines, heading, paragraph, under pasteOnParent: after, under quirkPasteText: dynalist

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ## A┃
  - p
```

</td><td>

```buffer
- ## A### h
  - p
- text┃
```

</td><td>

```buffer
- ## A### h
  - text┃
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
## A### h
text┃

p
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

Adapted: as blocks, blank lines, paragraph, under quirkPasteText: dynalist

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
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
- ┃
- b
```

</td><td>

```buffer
- a
  - x
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
  - x
┃
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

Adapted: as blocks, blank lines, code block

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
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
- - y
- ┃
  ```
````

</td><td>

````buffer
- ```
  a- x
- y
  - ```
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

### [Paste15](../spec/paste.md#paste15)

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

Adapted: as blocks, blank lines, code block, paragraph, under quirkPasteText: dynalist

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- ```
  a
  ```┃
- after
````

</td><td>

````buffer
- ```
  a
  ```- x
- - y┃
- after
````

</td><td>

````buffer
- ```
  a
  ```- x
- y┃
- after
````

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
```
a
```┃

after
````

</td><td>

````buffer
- ```
  a
  ```- x
- y┃
- after
````

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

Adapted: blank lines, heading, paragraph, under quirkPasteText: dynalist

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ## A
  - p┃
  - q
- ## B
```

</td><td>

```buffer
- ## A
  - px
  - 
  - # h┃
  - q
- ## B
```

</td><td>

```buffer
- ## A
  - p┃
  - q
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

p┃

q

## B
```

</td><td>

```buffer
## A

p┃

q

## B
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

Adapted: as blocks, blank lines, paragraph, quote, under quirkPasteText: dynalist, under quotes: atom

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- > [!note] q┃
- after
```

</td><td>

```buffer
- > [!note] q## h
- text┃
- after
```

</td><td>

```buffer
- > [!note] q## h
  text┃
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
- > [!note] q## h
text┃
- after
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

Adapted: blank lines, escape, heading, paragraph, under quirkPasteText: dynalist

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # h1
  - ┃
```

</td><td>

```buffer
- # h1
  - - a
    - - b┃
```

</td><td>

```buffer
- # h1
  - - a
  - - b┃
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
\- a

\- b┃
```

</td></tr>
</table>

### [Paste25](../spec/paste.md#paste25)

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

Adapted: as blocks, paragraph, quote, under pasteLines: items, under pasteOnParent: after, under quirkPasteText: dynalist, under quotes: atom

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- > [!note] q┃
  > body
```

</td><td>

```buffer
- > [!note] qx
- y┃
  > body
```

</td><td>

```buffer
- > [!note] qx
- y┃
-   > body
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> [!note] q┃
> body
```

</td><td>

```buffer
- > [!note] qx
y┃
  > body
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

Adapted: as blocks, paragraph

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- p┃
```

</td><td>

```buffer
- p
  \- a
- - b┃
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
p┃
```

</td><td>

```buffer
- p
  - a
- b┃
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
<tr><th>dynalist</th><th>ourus</th></tr>
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
<tr><th>dynalist</th><th>ourus</th></tr>
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

Adapted: as blocks, quote, under closeBackticks: none, under copyAtCaret: host, under copySelection: nodes, under emptyItemWithChildren: refuse, under enterInQuote: split, under enterSplitSpace: start, under joinWithChildren: refuse, under pasteLines: items, under pasteOnParent: after, under pasteParagraphList: children, under pastePlainLines: enter, under quirkEnterMidHeading: workflowy, under quirkPasteText: dynalist, under quotes: atom

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
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

### [Quote63](../spec/quotes.md#quote63)

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

Adapted: as blocks, blank lines, quote, under quirkPasteText: dynalist, under quotes: atom

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- > - a┃
```

</td><td>

```buffer
- > - a- x
  - - y
- ┃
```

</td><td>

```buffer
- > - a- x
  - y
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a┃
```

</td><td>

```buffer
- > - a- x
  - y
┃
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

Adapted: as blocks, quote, under pastePlainLines: enter

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- > a┃b
```

</td><td>

```buffer
- > ax
- y
- ┃b
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
y
┃b
```

</td></tr>
</table>

### [Quote82](../spec/quotes.md#quote82)

> deleteSubtree

Adapted: as blocks, empty document, quote, under quotes: atom

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
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

### [QuoteText4](../spec/quotes.md#quotetext4)

> moveSubtreeUp

Adapted: as blocks, quote

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- > q
  - ┃g
```

</td><td>

```buffer
- ┃g
- > q
```

</td><td>

```buffer
- > q
  - ┃g
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- > q
  - ┃g
```

</td><td>

```buffer
- > q
  - ┃g
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
<tr><th>dynalist</th><th>ourus</th></tr>
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
<tr><th>dynalist</th><th>ourus</th></tr>
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
<tr><th>dynalist</th><th>ourus</th></tr>
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

Adapted: as blocks, blank lines, paragraph, quote, under pastePlainLines: enter, under quotes: atom

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- > See ┃here.
```

</td><td>

```buffer
- > See x
- 
- y
- ┃here.
```

</td><td>

```buffer
- > See x
- y
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
- > See x

y
┃here.
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

Adapted: as blocks, blank lines, paragraph, quote, under quirkPasteText: dynalist

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- > p┃
- after
```

</td><td>

```buffer
- > p- x
- - y
- ┃
- after
```

</td><td>

```buffer
- > p- x
- y
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
- > p- x
- y
┃
- after
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
<tr><th>dynalist</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
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

Adapted: as blocks, paragraph, under pastePlainLines: enter

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- «ab»c
```

</td><td>

```buffer
- 
- x┃c
```

</td><td>

```buffer
- x┃
- c
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
- x┃
- c
```

</td></tr>
</table>

### [Regression33](../spec/regressions.md#regression33)

> deleteSoftLineBackward

Adapted: as blocks, quote, under quotes: atom

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
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

Adapted: blank lines, escape, paragraph, under pasteOnParent: after, under quirkPasteText: dynalist

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- foo┃
  - 
- para
```

</td><td>

```buffer
- foox
  - 
- 
- [a]: /u┃
- para
```

</td><td>

```buffer
- foox
  - 
  - [a]: /u┃
  - 
- para
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
- foox

  - 

  - [a]\: /u┃

  - 

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

Adapted: as blocks, blank lines, code block, quote, under pastePlainLines: enter, under quotes: atom

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- > a┃b
  > c
```

</td><td>

````buffer
- > a- x
- 
  - ```
  - c
  - ```┃b
    > c
````

</td><td>

````buffer
- > a- x
  - ```
    c
    ```┃b
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

  ```
  c
  ```┃b
  > c
````

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

Adapted: under pastePlainLines: enter

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
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
   - # y┃
```

</td><td>

```buffer
1. x
   - 
     [x] 
       contx
   - [ ] # y┃
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
    - [ ] # y┃
```

</td></tr>
</table>

### [Regression56](../spec/regressions.md#regression56)

> enter

Adapted: as blocks, quote, task, under quotes: atom

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
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
  > 
- [ ] ┃q
- b
```

</td><td>

```buffer
- a
- [ ] 
  >
  
  ┃q
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
  >

  ┃q
- b
```

</td></tr>
</table>

### [Regression64](../spec/regressions.md#regression64)

> indent

Adapted: blank lines, quote

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
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
<tr><th>dynalist</th><th>ourus</th></tr>
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
<tr><th>dynalist</th><th>ourus</th></tr>
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
<tr><th>dynalist</th><th>ourus</th></tr>
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
<tr><th>dynalist</th><th>ourus</th></tr>
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

### [TaskEnter7](../spec/tasks.md#taskenter7)

> enter

Adapted: as blocks, task, under enterSplitSpace: start

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
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
<tr><th>dynalist</th><th>ourus</th></tr>
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
<tr><th>dynalist</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- [x] ┃b
```

</td><td>

```buffer
- [x] a┃b
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
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- [ ] b
```

</td><td>

```buffer
- [ ] a┃b
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

## Adapted: whitespace (16)

### [Enter52](../spec/enter.md#enter52)

> enter

Adapted: blank lines, heading, paragraph, setext heading, under quirkEnterMidHeading: workflowy

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
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
<tr><th>dynalist</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
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

Adapted: under pastePlainLines: enter

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  ┃b
```

</td><td>

```buffer
- a
  
- x┃b
```

</td><td>

```buffer
- a
- x┃b
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
- x┃b
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
<tr><th>dynalist</th><th>ourus</th></tr>
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
<tr><th>dynalist</th><th>ourus</th></tr>
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
<tr><th>dynalist</th><th>ourus</th></tr>
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
<tr><th>dynalist</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
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

Adapted: as blocks, quote, under closeBackticks: none, under copyAtCaret: host, under copySelection: nodes, under emptyItemWithChildren: refuse, under enterInQuote: split, under enterSplitSpace: start, under joinWithChildren: refuse, under pasteLines: items, under pasteOnParent: after, under pasteParagraphList: children, under pastePlainLines: enter, under quirkEnterMidHeading: workflowy, under quirkPasteText: dynalist, under quotes: atom

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
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

Adapted: heading, paragraph, setext heading, under pastePlainLines: enter

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ## Title
  ┃more
```

</td><td>

```buffer
- ## Title
  
- x┃more
```

</td><td>

```buffer
- ## Title
  - x┃more
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
---
x┃more
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
<tr><th>dynalist</th><th>ourus</th></tr>
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
<tr><th>dynalist</th><th>ourus</th></tr>
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

## Adapted: caret (5)

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
<tr><th>dynalist</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
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

### [DeleteSubtree9](../spec/delete-subtree.md#deletesubtree9)

> deleteSubtree

Adapted: blank lines, heading, paragraph, setext heading, thematic break

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
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

### [Regression62](../spec/regressions.md#regression62)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard

```

</td></tr>
</table>

> pastePlain

Adapted: as blocks, quote, under pastePlainLines: enter

<table>
<tr><th>buffer</th><th>dynalist</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃> ab
```

</td><td>

```buffer
- 
- ┃> ab
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
┃> ab
```

</td><td>

```buffer
- ┃
- > ab
```

</td></tr>
</table>

## Skipped (458)

| example | why |
| --- | --- |
| **backspace.md** | |
| [Backspace2](../spec/backspace.md#backspace2) | caret in a marker |
| [Backspace4](../spec/backspace.md#backspace4) | heading's closing #s |
| [Backspace12e](../spec/backspace.md#backspace12e) | tag free-form |
| [Backspace14](../spec/backspace.md#backspace14) | tag free-form |
| [Backspace16](../spec/backspace.md#backspace16) | tag markup-fence |
| [Backspace17e](../spec/backspace.md#backspace17e) | tag free-form |
| [Backspace18](../spec/backspace.md#backspace18) | tag free-form |
| [Backspace18b](../spec/backspace.md#backspace18b) | tag free-form |
| [Backspace18c](../spec/backspace.md#backspace18c) | tag free-form |
| [Backspace18d](../spec/backspace.md#backspace18d) | tag free-form |
| [Backspace18f](../spec/backspace.md#backspace18f) | option headingEditing: block |
| [Backspace19b](../spec/backspace.md#backspace19b) | tag free-form |
| [Backspace23](../spec/backspace.md#backspace23) | tag free-form |
| [Backspace24](../spec/backspace.md#backspace24) | tag markup-fence |
| [Backspace27](../spec/backspace.md#backspace27) | tag free-form |
| [Backspace28](../spec/backspace.md#backspace28) | tag markup-fence |
| [Backspace31](../spec/backspace.md#backspace31) | selection across blocks |
| [Backspace33](../spec/backspace.md#backspace33) | tag free-form |
| [Backspace34](../spec/backspace.md#backspace34) | option backspaceAtTopItem: refuse |
| [Backspace35](../spec/backspace.md#backspace35) | tag free-form |
| [Backspace40](../spec/backspace.md#backspace40) | list numbered in part, or not from 1 |
| [Backspace40b](../spec/backspace.md#backspace40b) | list numbered in part, or not from 1 |
| [SoftBackspace4](../spec/backspace.md#softbackspace4) | heading's closing #s |
| [SoftBackspace6](../spec/backspace.md#softbackspace6) | caret on a blank line |
| [SoftBackspace7](../spec/backspace.md#softbackspace7) | tag free-form |
| [SoftBackspace8](../spec/backspace.md#softbackspace8) | tag free-form |
| [SoftBackspace9](../spec/backspace.md#softbackspace9) | tag markup-fence |
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
| [Copy4](../spec/copy.md#copy4) | nothing to compare |
| [Copy5](../spec/copy.md#copy5) | selection across blocks |
| [Copy6](../spec/copy.md#copy6) | nothing to compare |
| [Copy7](../spec/copy.md#copy7) | selection across blocks |
| [Copy8](../spec/copy.md#copy8) | nothing to compare |
| [Copy9](../spec/copy.md#copy9) | nothing to compare |
| [Cut2](../spec/copy.md#cut2) | selection across blocks |
| [Cut3](../spec/copy.md#cut3) | selection across blocks |
| **cursor.md** | |
| [CursorDown2](../spec/cursor.md#cursordown2) | indented code |
| [CursorHome3](../spec/cursor.md#cursorhome3) | caret in a marker |
| [CursorHome4](../spec/cursor.md#cursorhome4) | caret in a marker |
| [CursorHome7](../spec/cursor.md#cursorhome7) | list numbered in part, or not from 1 |
| [CursorHome15](../spec/cursor.md#cursorhome15) | caret in a marker |
| [CursorDocEndLeft1](../spec/cursor.md#cursordocendleft1) | cursorCharLeft after cursorDocEnd |
| **delete-subtree.md** | |
| [DeleteSubtree5](../spec/delete-subtree.md#deletesubtree5) | selection across blocks |
| [DeleteSubtree12](../spec/delete-subtree.md#deletesubtree12) | option quotes: container |
| [DeleteSubtree13](../spec/delete-subtree.md#deletesubtree13) | list numbered in part, or not from 1 |
| **delete.md** | |
| [Delete4](../spec/delete.md#delete4) | heading's closing #s |
| [Delete4b](../spec/delete.md#delete4b) | heading's closing #s |
| [Delete9](../spec/delete.md#delete9) | tag free-form |
| [Delete10](../spec/delete.md#delete10) | option quotes: container |
| [Delete11](../spec/delete.md#delete11) | tag markup-fence |
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
| [Enter30](../spec/enter.md#enter30) | option enterOnEmptyItem: outdent |
| [Enter32b](../spec/enter.md#enter32b) | option enterAtTextStart: stay |
| [Enter33b](../spec/enter.md#enter33b) | option enterAtTextStart: stay |
| [Enter34](../spec/enter.md#enter34) | caret in a marker |
| [Enter40](../spec/enter.md#enter40) | tag free-form |
| [Enter41](../spec/enter.md#enter41) | tag free-form |
| [Enter64](../spec/enter.md#enter64) | option enterSplitSpace: drop |
| [Enter46](../spec/enter.md#enter46) | option quotes: container |
| [Enter50](../spec/enter.md#enter50) | tag free-form |
| [Enter54](../spec/enter.md#enter54) | caret in a task's checkbox or a heading's #s |
| [Enter54b](../spec/enter.md#enter54b) | caret in a task's checkbox or a heading's #s |
| [Enter55](../spec/enter.md#enter55) | caret in a task's checkbox or a heading's #s |
| [Enter55b](../spec/enter.md#enter55b) | caret in a task's checkbox or a heading's #s |
| [Enter55c](../spec/enter.md#enter55c) | tag free-form |
| [Enter56](../spec/enter.md#enter56) | selection across blocks |
| [Enter61](../spec/enter.md#enter61) | heading's closing #s |
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
| **gaps.md** | |
| [Gap15](../spec/gaps.md#gap15) | caret on a blank line |
| [Gap16](../spec/gaps.md#gap16) | caret on a blank line |
| [Gap18](../spec/gaps.md#gap18) | caret on a blank line |
| [Gap19](../spec/gaps.md#gap19) | frontmatter |
| **indent.md** | |
| [Indent9](../spec/indent.md#indent9) | selection across blocks |
| [Indent11](../spec/indent.md#indent11) | changes only what blocks can't show |
| [Indent12](../spec/indent.md#indent12) | tag free-form |
| [Indent16](../spec/indent.md#indent16) | tag free-form |
| [Indent22](../spec/indent.md#indent22) | tag free-form |
| [Indent23](../spec/indent.md#indent23) | tag free-form |
| [Indent24](../spec/indent.md#indent24) | heading deeper than H3 |
| [Indent25](../spec/indent.md#indent25) | tag free-form |
| [Indent27](../spec/indent.md#indent27) | selection across blocks |
| [Indent28](../spec/indent.md#indent28) | caret in a marker |
| [Indent29b](../spec/indent.md#indent29b) | list numbered in part, or not from 1 |
| [Indent30](../spec/indent.md#indent30) | caret in a marker |
| [Indent31](../spec/indent.md#indent31) | tag markup-fence |
| [Indent31b](../spec/indent.md#indent31b) | tag markup-fence |
| [Indent32](../spec/indent.md#indent32) | changes only what blocks can't show |
| [Indent37b](../spec/indent.md#indent37b) | changes only what blocks can't show |
| [Indent38](../spec/indent.md#indent38) | indented code |
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
| [MoveDown11](../spec/move-subtree-down.md#movedown11) | selection across blocks |
| [MoveDown12](../spec/move-subtree-down.md#movedown12) | selection across blocks |
| [MoveDown14](../spec/move-subtree-down.md#movedown14) | selection across blocks |
| [MoveDown17](../spec/move-subtree-down.md#movedown17) | tag free-form |
| [MoveDown19](../spec/move-subtree-down.md#movedown19) | tag free-form |
| [MoveDown20](../spec/move-subtree-down.md#movedown20) | tag free-form |
| [MoveDown23](../spec/move-subtree-down.md#movedown23) | list numbered in part, or not from 1 |
| [MoveDown25](../spec/move-subtree-down.md#movedown25) | tag free-form |
| [MoveDown28](../spec/move-subtree-down.md#movedown28) | tag free-form |
| [MoveDown29](../spec/move-subtree-down.md#movedown29) | list numbered in part, or not from 1 |
| [MoveDown30](../spec/move-subtree-down.md#movedown30) | list numbered in part, or not from 1 |
| [MoveDown32](../spec/move-subtree-down.md#movedown32) | caret in a marker |
| [MoveDown34](../spec/move-subtree-down.md#movedown34) | tag markup-fence |
| [MoveDown37](../spec/move-subtree-down.md#movedown37) | tag markup-fence |
| [MoveDown38](../spec/move-subtree-down.md#movedown38) | tag free-form |
| [MoveDown40](../spec/move-subtree-down.md#movedown40) | selection across blocks |
| **move-subtree-up.md** | |
| [MoveUp10](../spec/move-subtree-up.md#moveup10) | selection across blocks |
| [MoveUp11](../spec/move-subtree-up.md#moveup11) | selection across blocks |
| [MoveUp12](../spec/move-subtree-up.md#moveup12) | tag free-form |
| [MoveUp15](../spec/move-subtree-up.md#moveup15) | list numbered in part, or not from 1 |
| [MoveUp18](../spec/move-subtree-up.md#moveup18) | indented code |
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
| [TO-Bug228](../spec/obsidian-true-outliner.md#to-bug228) | list numbered in part, or not from 1 |
| [TO-E7-E8](../spec/obsidian-true-outliner.md#to-e7-e8) | option enterMidItem: child |
| [TO-E11](../spec/obsidian-true-outliner.md#to-e11) | option enterMidItem: child |
| [TO-E18](../spec/obsidian-true-outliner.md#to-e18) | caret on a blank line |
| [TO-E19-E21b](../spec/obsidian-true-outliner.md#to-e19-e21b) | tag free-form |
| [TO-S5](../spec/obsidian-true-outliner.md#to-s5) | tag free-form |
| [TO-S7-S8](../spec/obsidian-true-outliner.md#to-s7-s8) | option enterSplitSpace: the app's start, as blocks |
| [TO-S7-S8b](../spec/obsidian-true-outliner.md#to-s7-s8b) | caret on a blank line |
| [TO1](../spec/obsidian-true-outliner.md#to1) | option markup: decorated |
| [TO4](../spec/obsidian-true-outliner.md#to4) | list numbered in part, or not from 1 |
| [TO6](../spec/obsidian-true-outliner.md#to6) | list numbered in part, or not from 1 |
| [TO-Seamsd](../spec/obsidian-true-outliner.md#to-seamsd) | indented code |
| [TO18](../spec/obsidian-true-outliner.md#to18) | tag free-form |
| [TO19](../spec/obsidian-true-outliner.md#to19) | option enterOnEmptyItem: outdent |
| [TO-Bug197](../spec/obsidian-true-outliner.md#to-bug197) | option quotes: container |
| **outdent.md** | |
| [Outdent2](../spec/outdent.md#outdent2) | tag free-form |
| [Outdent4](../spec/outdent.md#outdent4) | tag free-form |
| [Outdent8](../spec/outdent.md#outdent8) | selection across blocks |
| [Outdent10](../spec/outdent.md#outdent10) | selection across blocks |
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
| [Outdent17](../spec/outdent.md#outdent17) | caret in a task's checkbox or a heading's #s |
| [Outdent17b](../spec/outdent.md#outdent17b) | caret in a task's checkbox or a heading's #s |
| [Outdent18](../spec/outdent.md#outdent18) | caret in a task's checkbox or a heading's #s |
| [Outdent19](../spec/outdent.md#outdent19) | tag free-form |
| [Outdent19b](../spec/outdent.md#outdent19b) | tag free-form |
| [Outdent20](../spec/outdent.md#outdent20) | tag free-form |
| [Outdent20b](../spec/outdent.md#outdent20b) | tag free-form |
| **paste-html.md** | |
| [PasteHtml6](../spec/paste-html.md#pastehtml6) | option pasteParagraphList: the app's children, as blocks |
| **paste-list-form.md** | |
| [PasteListForm6](../spec/paste-list-form.md#pastelistform6) | option pasteListForm: own |
| **paste-list.md** | |
| [PasteList7b](../spec/paste-list.md#pastelist7b) | option enterTask: plain |
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
| [PastePlain32](../spec/paste-plain.md#pasteplain32) | option pastePlainLines: items |
| [PastePlain33](../spec/paste-plain.md#pasteplain33) | option pastePlainLines: items |
| [PastePlain33b](../spec/paste-plain.md#pasteplain33b) | option pastePlainLines: items |
| [PastePlain33c](../spec/paste-plain.md#pasteplain33c) | option pastePlainLines: items |
| [PastePlain34](../spec/paste-plain.md#pasteplain34) | option pastePlainLines: host |
| **paste.md** | |
| [Paste4b](../spec/paste.md#paste4b) | option pasteSeams: open |
| [Paste9](../spec/paste.md#paste9) | option quotes: container |
| [Paste16](../spec/paste.md#paste16) | caret in a marker |
| [Paste17b](../spec/paste.md#paste17b) | option pasteOverSelection: ignore |
| [Paste17c](../spec/paste.md#paste17c) | option pasteOverSelection: ignore |
| [Paste17d](../spec/paste.md#paste17d) | option pasteOverSelection: ignore |
| [Paste17e](../spec/paste.md#paste17e) | option pasteOverSelection: ignore |
| [Paste17f](../spec/paste.md#paste17f) | option pasteOverSelection: ignore |
| [Paste17g](../spec/paste.md#paste17g) | option pasteOverSelection: ignore |
| [Paste20](../spec/paste.md#paste20) | option pasteAtTextStart: before |
| [Paste21](../spec/paste.md#paste21) | option pasteSeams: open |
| [Paste24b](../spec/paste.md#paste24b) | option pasteSeams: open |
| [Paste26b](../spec/paste.md#paste26b) | option pasteSeams: open |
| **placeholders.md** | |
| [Placeholder2](../spec/placeholders.md#placeholder2) | tag free-form |
| [Placeholder10](../spec/placeholders.md#placeholder10) | caret on a blank line |
| [Placeholder12](../spec/placeholders.md#placeholder12) | caret on a blank line |
| [Placeholder16](../spec/placeholders.md#placeholder16) | action selectDocStart |
| **quirks.md** | |
| [Quirk2](../spec/quirks.md#quirk2) | option quirkPasteCaret: roam |
| [Quirk2b](../spec/quirks.md#quirk2b) | option quirkPasteCaret: athens |
| [Quirk3](../spec/quirks.md#quirk3) | option backspaceAtItemStart: logseq |
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
| [Quote55](../spec/quotes.md#quote55) | option backspaceAtTopItem: refuse |
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
| [Quote69](../spec/quotes.md#quote69) | option quotes: container |
| [Quote70](../spec/quotes.md#quote70) | option quotes: container |
| [Quote96](../spec/quotes.md#quote96) | action duplicateSubtree |
| [Quote97](../spec/quotes.md#quote97) | tag free-form |
| [QuoteAtom15](../spec/quotes.md#quoteatom15) | option enterAtTextStart: stay |
| **regressions.md** | |
| [Regression1](../spec/regressions.md#regression1) | list numbered in part, or not from 1 |
| [Regression7](../spec/regressions.md#regression7) | tag markup-fence |
| [Regression8](../spec/regressions.md#regression8) | list numbered in part, or not from 1 |
| [Regression9](../spec/regressions.md#regression9) | changes only what blocks can't show |
| [Regression16](../spec/regressions.md#regression16) | option enterMidItem: child |
| [Regression18](../spec/regressions.md#regression18) | option headingEditing: block |
| [Regression19](../spec/regressions.md#regression19) | option headingEditing: block |
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
| [Regression45](../spec/regressions.md#regression45) | selection across blocks |
| [Regression48](../spec/regressions.md#regression48) | indented code |
| [Regression49](../spec/regressions.md#regression49) | list numbered in part, or not from 1 |
| [Regression50](../spec/regressions.md#regression50) | option quotes: container |
| [Regression51](../spec/regressions.md#regression51) | action duplicateSubtree |
| [Regression52](../spec/regressions.md#regression52) | action duplicateSubtree |
| [Regression53](../spec/regressions.md#regression53) | changes only what blocks can't show |
| [Regression54](../spec/regressions.md#regression54) | indented code |
| [Regression58](../spec/regressions.md#regression58) | caret in a marker |
| [Regression59](../spec/regressions.md#regression59) | caret in a marker |
| [Regression60](../spec/regressions.md#regression60) | option listParent: block |
| [Regression61](../spec/regressions.md#regression61) | option listParent: container |
| [Regression63](../spec/regressions.md#regression63) | list numbered in part, or not from 1 |
| **scenarios.md** | |
| [Scenario6](../spec/scenarios.md#scenario6) | tag free-form |
| [Scenario24](../spec/scenarios.md#scenario24) | tag free-form |
| [Scenario25](../spec/scenarios.md#scenario25) | tag free-form |
| **shift-enter.md** | |
| [ShiftEnter14](../spec/shift-enter.md#shiftenter14) | tag free-form |
| [ShiftEnter22](../spec/shift-enter.md#shiftenter22) | tag free-form |
| [ShiftEnter22b](../spec/shift-enter.md#shiftenter22b) | tag free-form |
| [ShiftEnter24](../spec/shift-enter.md#shiftenter24) | tag free-form |
| [ShiftEnter26](../spec/shift-enter.md#shiftenter26) | tag free-form |
| [ShiftEnter26b](../spec/shift-enter.md#shiftenter26b) | option markup: decorated |
| [ShiftEnter27](../spec/shift-enter.md#shiftenter27) | selection across blocks |
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
| [TaskBackspace8](../spec/tasks.md#taskbackspace8) | caret in a task's checkbox or a heading's #s |
| [TaskBackspace8b](../spec/tasks.md#taskbackspace8b) | caret in a task's checkbox or a heading's #s |
| [TaskBackspace9](../spec/tasks.md#taskbackspace9) | caret in a task's checkbox or a heading's #s |
| [TaskBackspace10](../spec/tasks.md#taskbackspace10) | caret in a task's checkbox or a heading's #s |
| [TaskBackspace11](../spec/tasks.md#taskbackspace11) | option taskEditing: block |
| [TaskDelete4](../spec/tasks.md#taskdelete4) | caret in a task's checkbox or a heading's #s |
| **typing.md** | |
| [Typing1](../spec/typing.md#typing1) | tag free-form |
| [Typing2](../spec/typing.md#typing2) | tag free-form |
| [Typing3](../spec/typing.md#typing3) | tag free-form |
| **undo.md** | |
| [Undo2](../spec/undo.md#undo2) | tag free-form |
