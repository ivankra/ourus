---
type: "SxS"
app: "roam"
version: "0.13.12 (39a714f3; API 1.1.5)"
url: "https://roamresearch.com/#/app/help"
model: "block"
command: "node sxs/run.ts roam"
elapsed_s: 166
workers: 4
---

# Roam vs ourus

Summary:

|  | agree | caret | whitespace | disagree | error | skipped | total |
| --- | --- | --- | --- | --- | --- | --- | --- |
| original | 153 | [2](#caret-2) | [6](#whitespace-6) | [4](#disagree-4) |  |  | **165** |
| adapted | 269 | [7](#adapted-caret-7) | [17](#adapted-whitespace-17) | [24](#adapted-disagree-24) |  |  | **317** |
| **total** | **422 (40%)** | **9 (0.86%)** | **23 (2.2%)** | **28 (2.7%)** | **0 (0%)** | **[562](#skipped-562) (54%)** | **1045** |

Per-file:

|  | agree | caret | whitespace | disagree | error | skipped | total | original | adapted |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [backspace.md](../spec/backspace.md) | 42 |  |  | 3 |  | 40 | **85** | 17 | 28 |
| [backtick.md](../spec/backtick.md) | 1 |  |  |  |  | 32 | **33** |  | 1 |
| [copy.md](../spec/copy.md) | 2 |  | 3 |  |  | 8 | **13** | 1 | 4 |
| [cursor.md](../spec/cursor.md) | 22 | 5 |  |  |  | 9 | **36** | 12 | 15 |
| [delete-subtree.md](../spec/delete-subtree.md) | 3 | 3 |  |  |  | 7 | **13** | 2 | 4 |
| [delete.md](../spec/delete.md) | 28 |  |  |  |  | 28 | **56** | 11 | 17 |
| [duplicate-subtree.md](../spec/duplicate-subtree.md) |  |  |  |  |  | 10 | **10** |  |  |
| [enter.md](../spec/enter.md) | 50 | 1 | 3 | 4 |  | 39 | **97** | 23 | 35 |
| [fences.md](../spec/fences.md) |  |  |  |  |  | 70 | **70** |  |  |
| [gaps.md](../spec/gaps.md) | 14 |  |  |  |  | 5 | **19** | 1 | 13 |
| [indent.md](../spec/indent.md) | 18 |  |  | 1 |  | 17 | **36** | 13 | 6 |
| [move-subtree-down.md](../spec/move-subtree-down.md) | 22 |  |  |  |  | 18 | **40** | 8 | 14 |
| [move-subtree-up.md](../spec/move-subtree-up.md) | 22 |  |  |  |  | 20 | **42** | 9 | 13 |
| [obsidian-true-outliner.md](../spec/obsidian-true-outliner.md) | 39 |  | 4 | 2 |  | 22 | **67** | 19 | 26 |
| [outdent.md](../spec/outdent.md) | 13 |  |  |  |  | 23 | **36** | 3 | 10 |
| [paste-conv.md](../spec/paste-conv.md) | 4 |  |  | 1 |  | 1 | **6** | 1 | 4 |
| [paste-html.md](../spec/paste-html.md) | 9 |  |  | 6 |  | 4 | **19** |  | 15 |
| [paste-list-form.md](../spec/paste-list-form.md) | 3 |  |  | 2 |  | 1 | **6** |  | 5 |
| [paste-list.md](../spec/paste-list.md) | 12 |  |  | 4 |  | 13 | **29** | 3 | 13 |
| [paste-plain.md](../spec/paste-plain.md) | 19 |  | 3 |  |  | 14 | **36** | 9 | 13 |
| [paste.md](../spec/paste.md) | 20 |  | 1 | 3 |  | 12 | **36** | 2 | 22 |
| [placeholders.md](../spec/placeholders.md) | 11 |  | 5 |  |  | 4 | **20** | 5 | 11 |
| [quirks.md](../spec/quirks.md) | 4 |  |  |  |  | 3 | **7** |  | 4 |
| [quotes.md](../spec/quotes.md) |  |  |  |  |  | 100 | **100** |  |  |
| [regressions.md](../spec/regressions.md) | 13 |  | 1 | 1 |  | 17 | **32** | 1 | 14 |
| [scenarios.md](../spec/scenarios.md) | 20 |  |  | 1 |  | 5 | **26** | 10 | 11 |
| [shift-enter.md](../spec/shift-enter.md) | 25 |  | 3 |  |  | 8 | **36** | 12 | 16 |
| [tasks.md](../spec/tasks.md) | 2 |  |  |  |  | 28 | **30** |  | 2 |
| [typing.md](../spec/typing.md) |  |  |  |  |  | 3 | **3** |  |  |
| [undo.md](../spec/undo.md) | 4 |  |  |  |  | 1 | **5** | 3 | 1 |
| [z-open.md](../spec/z-open.md) |  |  |  |  |  | 1 | **1** |  |  |
| **total** | **422 (40%)** | **9 (0.86%)** | **23 (2.2%)** | **28 (2.7%)** | **0 (0%)** | **563 (54%)** | **1045** | **165 (16%)** | **317 (30%)** |

## Disagree (4)

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

## Whitespace (6)

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

## Caret (2)

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

## Adapted: disagree (24)

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
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ## ┃one
  two
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
<tr><th>roam</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
- ## ┃
  two
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

## Adapted: whitespace (17)

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

## Adapted: caret (7)

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

## Skipped (563)

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
| **copy.md** | |
| [Copy2](../spec/copy.md#copy2) | selection across blocks |
| [Copy3](../spec/copy.md#copy3) | quote |
| [Copy5](../spec/copy.md#copy5) | option copySelection: nodes |
| [Copy6](../spec/copy.md#copy6) | nothing to compare |
| [Copy7](../spec/copy.md#copy7) | option copySelection: nodes |
| [Copy8](../spec/copy.md#copy8) | callout |
| [Cut2](../spec/copy.md#cut2) | selection across blocks |
| [Cut3](../spec/copy.md#cut3) | option copySelection: nodes |
| **cursor.md** | |
| [CursorDown2](../spec/cursor.md#cursordown2) | indented code |
| [CursorHome3](../spec/cursor.md#cursorhome3) | caret in a marker |
| [CursorHome4](../spec/cursor.md#cursorhome4) | caret in a marker |
| [CursorHome7](../spec/cursor.md#cursorhome7) | list numbered in part, or not from 1 |
| [CursorHome11](../spec/cursor.md#cursorhome11) | quote |
| [CursorHome15](../spec/cursor.md#cursorhome15) | caret in a marker |
| [CursorHome16](../spec/cursor.md#cursorhome16) | quote |
| [CursorHome17](../spec/cursor.md#cursorhome17) | callout |
| [CursorDocEndLeft1](../spec/cursor.md#cursordocendleft1) | cursorCharLeft after cursorDocEnd |
| **delete-subtree.md** | |
| [DeleteSubtree5](../spec/delete-subtree.md#deletesubtree5) | selection across blocks |
| [DeleteSubtree6](../spec/delete-subtree.md#deletesubtree6) | no text focus after deleteSubtree |
| [DeleteSubtree7](../spec/delete-subtree.md#deletesubtree7) | quote |
| [DeleteSubtree8](../spec/delete-subtree.md#deletesubtree8) | code block |
| [DeleteSubtree11](../spec/delete-subtree.md#deletesubtree11) | quote |
| [DeleteSubtree12](../spec/delete-subtree.md#deletesubtree12) | quote |
| [DeleteSubtree13](../spec/delete-subtree.md#deletesubtree13) | list numbered in part, or not from 1 |
| **delete.md** | |
| [Delete4](../spec/delete.md#delete4) | tag markup-heading |
| [Delete4b](../spec/delete.md#delete4b) | tag markup-heading |
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
| [Delete18d](../spec/delete.md#delete18d) | tag free-form |
| [Delete19](../spec/delete.md#delete19) | tag markup-task |
| [Delete21](../spec/delete.md#delete21) | selection across blocks |
| [Delete23](../spec/delete.md#delete23) | tag free-form |
| [Delete24](../spec/delete.md#delete24) | tag free-form |
| [Delete25](../spec/delete.md#delete25) | tag free-form |
| [Delete29](../spec/delete.md#delete29) | tag free-form |
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
| [Enter32](../spec/enter.md#enter32) | tag markup-heading |
| [Enter32b](../spec/enter.md#enter32b) | tag markup-heading |
| [Enter33b](../spec/enter.md#enter33b) | option enterAtTextStart: stay |
| [Enter34](../spec/enter.md#enter34) | caret in a marker |
| [Enter36b](../spec/enter.md#enter36b) | quote |
| [Enter40](../spec/enter.md#enter40) | tag free-form |
| [Enter41](../spec/enter.md#enter41) | tag free-form |
| [Enter64](../spec/enter.md#enter64) | option enterSplitSpace: drop |
| [Enter65g](../spec/enter.md#enter65g) | tag markup-task |
| [Enter65l](../spec/enter.md#enter65l) | tag markup-heading |
| [Enter65m](../spec/enter.md#enter65m) | tag markup-heading |
| [Enter45](../spec/enter.md#enter45) | tag markup-heading |
| [Enter46](../spec/enter.md#enter46) | quote |
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
| [Enter68](../spec/enter.md#enter68) | callout |
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
| [Fence20](../spec/fences.md#fence20) | quote |
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
| [Fence62](../spec/fences.md#fence62) | code block |
| [Fence63](../spec/fences.md#fence63) | tag markup-fence |
| [Fence64](../spec/fences.md#fence64) | tag markup-fence |
| **gaps.md** | |
| [Gap7](../spec/gaps.md#gap7) | code block |
| [Gap15](../spec/gaps.md#gap15) | caret on a blank line |
| [Gap16](../spec/gaps.md#gap16) | caret on a blank line |
| [Gap18](../spec/gaps.md#gap18) | caret on a blank line |
| [Gap19](../spec/gaps.md#gap19) | frontmatter |
| **indent.md** | |
| [Indent9](../spec/indent.md#indent9) | selection across blocks |
| [Indent11](../spec/indent.md#indent11) | changes only what blocks can't show |
| [Indent12](../spec/indent.md#indent12) | tag free-form |
| [Indent13](../spec/indent.md#indent13) | code block |
| [Indent16](../spec/indent.md#indent16) | tag free-form |
| [Indent20](../spec/indent.md#indent20) | code block |
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
| **move-subtree-down.md** | |
| [MoveDown2](../spec/move-subtree-down.md#movedown2) | tag free-form |
| [MoveDown11](../spec/move-subtree-down.md#movedown11) | selection across blocks |
| [MoveDown12](../spec/move-subtree-down.md#movedown12) | selection across blocks |
| [MoveDown14](../spec/move-subtree-down.md#movedown14) | selection across blocks |
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
| [MoveDown40](../spec/move-subtree-down.md#movedown40) | selection across blocks |
| **move-subtree-up.md** | |
| [MoveUp10](../spec/move-subtree-up.md#moveup10) | selection across blocks |
| [MoveUp11](../spec/move-subtree-up.md#moveup11) | selection across blocks |
| [MoveUp12](../spec/move-subtree-up.md#moveup12) | tag free-form |
| [MoveUp13](../spec/move-subtree-up.md#moveup13) | code block |
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
| [MoveUp42](../spec/move-subtree-up.md#moveup42) | quote |
| **obsidian-true-outliner.md** | |
| [TO-Bug228](../spec/obsidian-true-outliner.md#to-bug228) | list numbered in part, or not from 1 |
| [TO-E7-E8](../spec/obsidian-true-outliner.md#to-e7-e8) | option enterMidItem: child |
| [TO-E11](../spec/obsidian-true-outliner.md#to-e11) | option enterMidItem: child |
| [TO-E18](../spec/obsidian-true-outliner.md#to-e18) | tag markup-heading |
| [TO-E19-E21b](../spec/obsidian-true-outliner.md#to-e19-e21b) | tag free-form |
| [TO-Bug267-E5](../spec/obsidian-true-outliner.md#to-bug267-e5) | quote |
| [TO-S5](../spec/obsidian-true-outliner.md#to-s5) | tag free-form |
| [TO-S7-S8](../spec/obsidian-true-outliner.md#to-s7-s8) | tag markup-heading |
| [TO-S7-S8b](../spec/obsidian-true-outliner.md#to-s7-s8b) | tag markup-heading |
| [TO1](../spec/obsidian-true-outliner.md#to1) | tag markup-task |
| [TO4](../spec/obsidian-true-outliner.md#to4) | list numbered in part, or not from 1 |
| [TO6](../spec/obsidian-true-outliner.md#to6) | list numbered in part, or not from 1 |
| [TO-Bug255](../spec/obsidian-true-outliner.md#to-bug255) | quote |
| [TO-Seams](../spec/obsidian-true-outliner.md#to-seams) | quote |
| [TO-Seamsb](../spec/obsidian-true-outliner.md#to-seamsb) | quote |
| [TO-Seamsd](../spec/obsidian-true-outliner.md#to-seamsd) | indented code |
| [TO-Lazy](../spec/obsidian-true-outliner.md#to-lazy) | quote |
| [TO-Lazyb](../spec/obsidian-true-outliner.md#to-lazyb) | code block |
| [TO-Lazyc](../spec/obsidian-true-outliner.md#to-lazyc) | code block |
| [TO18](../spec/obsidian-true-outliner.md#to18) | tag free-form |
| [TO-Bug264](../spec/obsidian-true-outliner.md#to-bug264) | quote |
| [TO-Bug197](../spec/obsidian-true-outliner.md#to-bug197) | quote |
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
| [Outdent17](../spec/outdent.md#outdent17) | caret in a heading's #s |
| [Outdent17b](../spec/outdent.md#outdent17b) | caret in a heading's #s |
| [Outdent18](../spec/outdent.md#outdent18) | caret in a heading's #s |
| [Outdent19](../spec/outdent.md#outdent19) | tag free-form |
| [Outdent19b](../spec/outdent.md#outdent19b) | tag free-form |
| [Outdent20](../spec/outdent.md#outdent20) | tag free-form |
| [Outdent20b](../spec/outdent.md#outdent20b) | tag free-form |
| **paste-conv.md** | |
| [PasteConvPhraseInCode](../spec/paste-conv.md#pasteconvphraseincode) | code block |
| **paste-html.md** | |
| [PasteHtml9](../spec/paste-html.md#pastehtml9) | code block (expected) |
| [PasteHtml12](../spec/paste-html.md#pastehtml12) | quote |
| [PasteHtml16](../spec/paste-html.md#pastehtml16) | code block (expected) |
| [PasteHtml19](../spec/paste-html.md#pastehtml19) | code block (expected) |
| **paste-list-form.md** | |
| [PasteListForm6](../spec/paste-list-form.md#pastelistform6) | option pasteListForm: own |
| **paste-list.md** | |
| [PasteList12](../spec/paste-list.md#pastelist12) | code block (expected) |
| [PasteList13](../spec/paste-list.md#pastelist13) | code block (expected) |
| [PasteList14](../spec/paste-list.md#pastelist14) | code block (expected) |
| [PasteList15](../spec/paste-list.md#pastelist15) | code block (expected) |
| [PasteList17](../spec/paste-list.md#pastelist17) | quote |
| [PasteList17b](../spec/paste-list.md#pastelist17b) | quote |
| [PasteList18](../spec/paste-list.md#pastelist18) | option pasteOnParent: after |
| [PasteList19](../spec/paste-list.md#pastelist19) | option pasteOnParent: after |
| [PasteList22](../spec/paste-list.md#pastelist22) | option pasteSeams: open |
| [PasteList23](../spec/paste-list.md#pastelist23) | option pasteSeams: open |
| [PasteList24](../spec/paste-list.md#pastelist24) | option pasteSeams: open |
| [PasteList26](../spec/paste-list.md#pastelist26) | code block (expected) |
| [PasteList27](../spec/paste-list.md#pastelist27) | code block (expected) |
| **paste-plain.md** | |
| [PastePlain4](../spec/paste-plain.md#pasteplain4) | tag free-form |
| [PastePlain18](../spec/paste-plain.md#pasteplain18) | quote |
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
| [Paste9](../spec/paste.md#paste9) | quote |
| [Paste14](../spec/paste.md#paste14) | code block |
| [Paste15](../spec/paste.md#paste15) | code block |
| [Paste16](../spec/paste.md#paste16) | caret in a marker |
| [Paste21](../spec/paste.md#paste21) | option pasteSeams: open |
| [Paste23](../spec/paste.md#paste23) | callout |
| [Paste24b](../spec/paste.md#paste24b) | option pasteSeams: open |
| [Paste25](../spec/paste.md#paste25) | callout |
| [Paste26b](../spec/paste.md#paste26b) | option pasteSeams: open |
| [Paste27](../spec/paste.md#paste27) | quote |
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
| [Quote95](../spec/quotes.md#quote95) | quote |
| [Quote96](../spec/quotes.md#quote96) | action duplicateSubtree |
| [Quote97](../spec/quotes.md#quote97) | tag free-form |
| **regressions.md** | |
| [Regression1](../spec/regressions.md#regression1) | list numbered in part, or not from 1 |
| [Regression3](../spec/regressions.md#regression3) | quote |
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
| [Regression28](../spec/regressions.md#regression28) | callout |
| [Regression29](../spec/regressions.md#regression29) | callout |
| [Regression30](../spec/regressions.md#regression30) | changes only what blocks can't show |
| [Regression31](../spec/regressions.md#regression31) | tag free-form |
| **scenarios.md** | |
| [Scenario6](../spec/scenarios.md#scenario6) | tag free-form |
| [Scenario15](../spec/scenarios.md#scenario15) | tag markup-task |
| [Scenario18](../spec/scenarios.md#scenario18) | code block (expected) |
| [Scenario24](../spec/scenarios.md#scenario24) | tag free-form |
| [Scenario25](../spec/scenarios.md#scenario25) | tag free-form |
| **shift-enter.md** | |
| [ShiftEnter14](../spec/shift-enter.md#shiftenter14) | tag free-form |
| [ShiftEnter22](../spec/shift-enter.md#shiftenter22) | tag free-form |
| [ShiftEnter22b](../spec/shift-enter.md#shiftenter22b) | tag free-form |
| [ShiftEnter24](../spec/shift-enter.md#shiftenter24) | tag free-form |
| [ShiftEnter26](../spec/shift-enter.md#shiftenter26) | tag free-form |
| [ShiftEnter26b](../spec/shift-enter.md#shiftenter26b) | tag markup-task |
| [ShiftEnter27](../spec/shift-enter.md#shiftenter27) | selection across blocks |
| [ShiftEnter29](../spec/shift-enter.md#shiftenter29) | tag markup-heading |
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
| **z-open.md** | |
| [Open2](../spec/z-open.md#open2) | code block |
