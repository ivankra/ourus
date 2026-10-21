---
type: "SxS"
app: "tana"
version: "f6ae813f25"
url: "https://app.tana.inc/tests"
model: "block"
command: "node sxs/run.ts tana"
elapsed_s: 302
workers: 3
---

# Tana vs ourus

Summary:

|  | agree | caret | whitespace | disagree | error | skipped | total |
| --- | --- | --- | --- | --- | --- | --- | --- |
| original | 118 | [4](#caret-4) |  | [39](#disagree-39) |  |  | **161** |
| adapted | 179 | [9](#adapted-caret-9) | [3](#adapted-whitespace-3) | [85](#adapted-disagree-85) |  |  | **276** |
| **total** | **297 (31%)** | **13 (1.3%)** | **3 (0.31%)** | **124 (13%)** | **0 (0%)** | **[533](#skipped-533) (55%)** | **970** |

Per-file:

|  | agree | caret | whitespace | disagree | error | skipped | total | original | adapted |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [backspace.md](../spec/backspace.md) | 29 |  |  | 11 |  | 42 | **82** | 14 | 26 |
| [backtick.md](../spec/backtick.md) | 5 |  |  | 2 |  | 25 | **32** |  | 7 |
| [copy.md](../spec/copy.md) | 2 |  |  | 3 |  | 8 | **13** | 4 | 1 |
| [cursor.md](../spec/cursor.md) | 21 | 4 |  |  |  | 11 | **36** | 12 | 13 |
| [delete-subtree.md](../spec/delete-subtree.md) | 4 | 1 |  |  |  | 5 | **10** | 2 | 3 |
| [delete.md](../spec/delete.md) | 19 |  |  | 7 |  | 29 | **55** | 10 | 16 |
| [duplicate-subtree.md](../spec/duplicate-subtree.md) | 2 |  |  |  |  | 7 | **9** | 2 |  |
| [enter.md](../spec/enter.md) | 45 |  |  | 7 |  | 40 | **92** | 21 | 31 |
| [fences.md](../spec/fences.md) | 8 |  | 1 | 5 |  | 54 | **68** |  | 14 |
| [gaps.md](../spec/gaps.md) | 11 |  |  |  |  | 8 | **19** |  | 11 |
| [indent.md](../spec/indent.md) | 18 |  |  | 2 |  | 16 | **36** | 13 | 7 |
| [move-subtree-down.md](../spec/move-subtree-down.md) | 17 |  |  |  |  | 22 | **39** | 8 | 9 |
| [move-subtree-up.md](../spec/move-subtree-up.md) | 15 |  |  |  |  | 26 | **41** | 9 | 6 |
| [obsidian-true-outliner.md](../spec/obsidian-true-outliner.md) | 29 |  |  | 14 |  | 24 | **67** | 20 | 23 |
| [outdent.md](../spec/outdent.md) | 11 |  |  |  |  | 24 | **35** | 3 | 8 |
| [paste-conv.md](../spec/paste-conv.md) | 3 |  |  | 3 |  |  | **6** | 5 | 1 |
| [paste-html.md](../spec/paste-html.md) | 4 | 1 |  | 12 |  | 2 | **19** |  | 17 |
| [paste-list-form.md](../spec/paste-list-form.md) | 4 |  |  | 1 |  | 1 | **6** | 4 | 1 |
| [paste-list.md](../spec/paste-list.md) | 10 |  |  | 11 |  | 7 | **28** | 9 | 12 |
| [paste-plain.md](../spec/paste-plain.md) | 14 |  | 2 | 5 |  | 13 | **34** | 1 | 20 |
| [paste.md](../spec/paste.md) | 3 |  |  | 8 |  | 16 | **27** | 2 | 9 |
| [placeholders.md](../spec/placeholders.md) | 7 | 1 |  |  |  | 12 | **20** | 3 | 5 |
| [quotes.md](../spec/quotes.md) |  |  |  |  |  | 97 | **97** |  |  |
| [scenarios.md](../spec/scenarios.md) | 11 | 2 |  | 7 |  | 6 | **26** | 10 | 10 |
| [shift-enter.md](../spec/shift-enter.md) |  |  |  | 19 |  | 17 | **36** | 6 | 13 |
| [tasks.md](../spec/tasks.md) | 5 | 1 |  | 7 |  | 15 | **28** |  | 13 |
| [typing.md](../spec/typing.md) |  |  |  |  |  | 3 | **3** |  |  |
| [undo.md](../spec/undo.md) |  | 3 |  |  |  | 2 | **5** | 3 |  |
| [z-open.md](../spec/z-open.md) |  |  |  |  |  | 1 | **1** |  |  |
| **total** | **297 (31%)** | **13 (1.3%)** | **3 (0.31%)** | **124 (13%)** | **0 (0%)** | **533 (55%)** | **970** | **161 (17%)** | **276 (28%)** |

## Disagree (39)

### [Backspace8](../spec/backspace.md#backspace8)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
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

### [Backspace9](../spec/backspace.md#backspace9)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
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

### [Backspace17b](../spec/backspace.md#backspace17b)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
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
<tr><th>tana</th><th>ourus</th></tr>
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

### [Backspace17d](../spec/backspace.md#backspace17d)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
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
- x┃
  - a
    - b
```

</td></tr>
</table>

### [Copy4](../spec/copy.md#copy4)

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

> copy

### [Copy9](../spec/copy.md#copy9)

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

> copy

### [Cut4](../spec/copy.md#cut4)

> cut

<table>
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
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

### [Delete3](../spec/delete.md#delete3)

> deleteContentForward

<table>
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
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

### [Delete7](../spec/delete.md#delete7)

> deleteContentForward

<table>
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
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

### [Delete12](../spec/delete.md#delete12)

> deleteContentForward

<table>
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
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

### [Enter5](../spec/enter.md#enter5)

> enter

<table>
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
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

### [Enter16](../spec/enter.md#enter16)

> enter

<table>
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
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
<tr><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one two
-  three
- ┃
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
<tr><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one two
-  three┃
```

</td><td>

```buffer
- one two
- ┃ three
```

</td></tr>
</table>

### [Indent4](../spec/indent.md#indent4)

> indent

<table>
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
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
<tr><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b  
  c
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
<tr><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b  
  c
```

</td><td>

```buffer
- a
- b  
  c┃
```

</td></tr>
</table>

### [TO-S11](../spec/obsidian-true-outliner.md#to-s11)

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
<tr><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- foo
  bar
- ┃
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
<tr><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- foo
  bar
- x┃
```

</td><td>

```buffer
- foo
  x┃
  bar
```

</td></tr>
</table>

### [TO-S13](../spec/obsidian-true-outliner.md#to-s13)

> shiftEnter

<table>
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a«lpha» beta
```

</td><td>

```buffer
- alpha beta
- ┃
```

</td><td>

```buffer
- a
  ┃beta
```

</td></tr>
</table>

### [TO-Bug153](../spec/obsidian-true-outliner.md#to-bug153)

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

> shiftEnter

<table>
<tr><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - kid
- foo
- ┃
```

</td><td>

```buffer
- one
  - kid
- foo
  ┃
```

</td></tr>
</table>

> deleteContentBackward

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

### [TO10](../spec/obsidian-true-outliner.md#to10)

> shiftEnter indent deleteContentBackward

<table>
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
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

### [TO11](../spec/obsidian-true-outliner.md#to11)

> shiftEnter outdent deleteContentBackward

<table>
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
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

### [TO12](../spec/obsidian-true-outliner.md#to12)

> shiftEnter indent enter

<table>
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
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
  - 
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

### [TO17](../spec/obsidian-true-outliner.md#to17)

> enter enter cursorDocStart

<table>
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
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

### [PasteConvHTML](../spec/paste-conv.md#pasteconvhtml)

<table>
<tr><th colspan=2>clipboard</tr>
<tr><td>text/plain<td>text/html</tr>
<tr valign="top"><td>

```clipboard
x
y
```

</td><td>

```clipboard
<ul><li>x</li><li>y</li></ul>
```

</td></tr>
</table>

> paste

<table>
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- a
- b
- x
- y┃
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
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- a- x- y┃
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

### [PasteConvUS](../spec/paste-conv.md#pasteconvus)

<table>
<tr><th colspan=2>clipboard</tr>
<tr><td>text/plain<td>text/html</tr>
<tr valign="top"><td>

```clipboard
- x _b_
- y
```

</td><td>

```clipboard
<!-- ourus --><ul>
<li>x <em>b</em></li>
<li>y</li>
</ul>
```

</td></tr>
</table>

> paste

<table>
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- a
- b
- x *b*
- y┃
```

</td><td>

```buffer
- a
- x _b_
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
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- a
- - x┃
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
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
```

</td><td>

```buffer
- a
- one
- two
- - x┃
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

<table>
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃b
```

</td><td>

```buffer
- ab
- x
- y┃
```

</td><td>

```buffer
- ax
  y
  ┃b
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
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
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
<tr><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃
- b
```

</td><td>

```buffer
- a
  ┃
- b
```

</td></tr>
</table>

> "more"

<table>
<tr><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- more┃
- b
```

</td><td>

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
<tr><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- amoreb┃
```

</td><td>

```buffer
- amore┃b
```

</td></tr>
</table>

### [ShiftEnter1](../spec/shift-enter.md#shiftenter1)

> shiftEnter

<table>
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one two┃ three
```

</td><td>

```buffer
- one two three
- ┃
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
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a
   - b┃ c
```

</td><td>

```buffer
1. a
   - b c
   - ┃
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
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- x
  - a┃ b
```

</td><td>

```buffer
- x
  - a b
  - ┃
```

</td><td>

```buffer
- x
  - a
    ┃b
```

</td></tr>
</table>

### [ShiftEnter4](../spec/shift-enter.md#shiftenter4)

> shiftEnter

<table>
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one┃
- two
```

</td><td>

```buffer
- one
- ┃
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
<tr><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- onetwo
- ┃
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
<tr><th>tana</th><th>ourus</th></tr>
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
<tr><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one two three
- ┃
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
<tr><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one two three┃
```

</td><td>

```buffer
- one two ┃three
```

</td></tr>
</table>

## Caret (4)

### [CursorDown4](../spec/cursor.md#cursordown4)

> cursorLineDown

<table>
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
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
<tr><th>tana</th><th>ourus</th></tr>
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
<tr><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃b
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
<tr><th>tana</th><th>ourus</th></tr>
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
<tr><th>buffer</th></tr>
<tr valign="top"><td>

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
<tr><th>tana</th><th>ourus</th></tr>
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
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃
```

</td></tr>
</table>

## Adapted: disagree (85)

### [Backspace16](../spec/backspace.md#backspace16)

> deleteContentBackward

Adapted: code block

<table>
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- ```
  x
  ```
- ┃a
````

</td><td>

````buffer
- ```
  x┃a
  ```
````

</td><td>

````buffer
- ```
  x
  ```
- ┃a
````

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
```
x
```
- ┃a
````

</td><td>

````buffer
```
x
```
- ┃a
````

</td></tr>
</table>

### [Backspace18g](../spec/backspace.md#backspace18g)

> deleteContentBackward

Adapted: blank lines, heading, paragraph, under headingEditing: block

<table>
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
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
- a┃H
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
- a┃H

  text
```

</td></tr>
</table>

### [Backspace24](../spec/backspace.md#backspace24)

> deleteContentBackward

Adapted: blank lines, code block, paragraph

<table>
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- ```
  x
  ```
- ┃para
````

</td><td>

````buffer
- ```
  x┃para
  ```
````

</td><td>

````buffer
- ```
  x
  ```
- ┃para
````

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
```
x
```

┃para
````

</td><td>

````buffer
```
x
```

┃para
````

</td></tr>
</table>

### [Backspace26](../spec/backspace.md#backspace26)

> deleteContentBackward

Adapted: paragraph

<table>
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
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

### [Backspace37](../spec/backspace.md#backspace37)

> deleteContentBackward

Adapted: heading, paragraph, setext heading

<table>
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
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

### [Backspace41](../spec/backspace.md#backspace41)

> deleteContentBackward

Adapted: list as an item's first block

<table>
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
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

### [Backtick9](../spec/backtick.md#backtick9)

> "```"

Adapted: code block

<table>
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
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
```
code
```┃
````

</td></tr>
</table>

### [Backtick12](../spec/backtick.md#backtick12)

Adapted: code block, paragraph, under closeBackticks: none

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
<tr><th>buffer</th></tr>
<tr valign="top"><td>

````buffer
- ```┃print(1)
````

</td></tr>
</table>

> enter

<table>
<tr><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- ```
- ┃print(1)
````

</td><td>

````buffer
- ```
  ┃print(1)
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
```┃print(1)
````

</td><td>

````buffer
```
┃print(1)
````

</td></tr>
</table>

### [Delete5](../spec/delete.md#delete5)

> deleteContentForward

Adapted: under joinWithChildren: refuse

<table>
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
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

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
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

</td></tr>
</table>

### [Delete5b](../spec/delete.md#delete5b)

Adapted: under joinWithChildren: refuse

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
<tr><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃b
    - c
  - d
  - e
- f
```

</td><td>

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

Original:
<table>
<tr><th>buffer</th><th>deleteContentForward</th><th>deleteContentForward</th></tr>
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

</td><td>

```buffer
- a
  - ┃◌
    - b
      - c
    - d
  - e
- f
```

</td><td>

```buffer
- a
  - ┃◌
    - b
      - c
    - d
  - e
- f
```

</td></tr>
</table>

### [Delete5c](../spec/delete.md#delete5c)

> deleteContentForward

Adapted: under joinWithChildren: refuse

<table>
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
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
- ┃a
  - b
```

</td><td>

```buffer
- x
- ┃
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

</td></tr>
</table>

### [Delete33](../spec/delete.md#delete33)

Adapted: list as an item's first block

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
<tr><th>tana</th><th>ourus</th></tr>
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

</td></tr>
</table>

> deleteContentForward

<table>
<tr><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- 
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

### [Enter22](../spec/enter.md#enter22)

> enter

Adapted: blank lines, escape, paragraph, under enterSplitSpace: start

<table>
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
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

### [Enter65g](../spec/enter.md#enter65g)

Adapted: task

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- [ ] one two┃ three
```

</td></tr>
</table>

> enter

<table>
<tr><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] one two
- ┃ three
```

</td><td>

```buffer
- [ ] one two
- [ ] ┃ three
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- [ ] one two┃ three
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter</th><th>deleteContentBackward</th></tr>
<tr valign="top"><td>

```buffer
- [ ] one two┃ three
```

</td><td>

```buffer
- [ ] one two
- [ ] ┃ three
```

</td><td>

```buffer
- [ ] one two┃ three
```

</td></tr>
</table>

### [Enter57](../spec/enter.md#enter57)

> enter

Adapted: blank lines, escape, paragraph

<table>
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- p
  #┃a
```

</td><td>

```buffer
- p
  #a
- ┃
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
p
\#

┃a
```

</td></tr>
</table>

### [Enter59](../spec/enter.md#enter59)

> enter

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
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
<tr><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  - ```
    code
    ```
  - ┃
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
<tr><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  - ```
    code
    ```
  - x┃
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
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
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
    ```
  - ┃
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
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
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
  ```
- ┃
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
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
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
  - ┃
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

### [Fence34](../spec/fences.md#fence34)

> deleteContentForward

Adapted: code block

<table>
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
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

### [TO-E4](../spec/obsidian-true-outliner.md#to-e4)

> enter

Adapted: under enterSplitSpace: start

<table>
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- first
  second┃ line
```

</td><td>

```buffer
- first
  second line
- ┃
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

### [TO-E9](../spec/obsidian-true-outliner.md#to-e9)

> enter

Adapted: blank lines, paragraph, under enterSplitSpace: start

<table>
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
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

### [TO-E32](../spec/obsidian-true-outliner.md#to-e32)

> enter

Adapted: task, under enterSplitSpace: start

<table>
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
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
- [ ] ┃ beta
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
- [ ] ┃ beta
```

</td></tr>
</table>

### [TO-S4](../spec/obsidian-true-outliner.md#to-s4)

> shiftEnter

Adapted: paragraph

<table>
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one┃ two
```

</td><td>

```buffer
- one two
- ┃
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

### [TO-S7-S8](../spec/obsidian-true-outliner.md#to-s7-s8)

> shiftEnter

Adapted: heading, setext heading

<table>
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Hello┃ world
```

</td><td>

```buffer
- # Hello world
- ┃
```

</td><td>

```buffer
- # Hello
  ┃world
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

### [TO-S9](../spec/obsidian-true-outliner.md#to-s9)

> shiftEnter

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- item
  - para┃ text
```

</td><td>

```buffer
- item
  - para text
  - ┃
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
<tr><th>tana</th><th>ourus</th></tr>
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
<tr><th>tana</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- x b
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
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- ┃
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
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- a **b** *i* c s l
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
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

````buffer
- Setup
- ```
  ┃npm install
  ```
````

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
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- Bold start┃
  - nested
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
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- · one
- o nested┃
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
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

````buffer
- ```
  ┃javascriptCopy codelet a = 1;
  ```
````

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

Adapted: task

<table>
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

````buffer
- a
- ```
- c
- ```┃
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
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

````buffer
- a
- - x
- ```
- c
- ```┃
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
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - kid
```

</td><td>

````buffer
- a
  - kid
- ```
- c
- ```┃
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
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
- b
```

</td><td>

````buffer
- ```
- c
- ```┃
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
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

````buffer
- a
- - ```
- code
- ```┃
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
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

````buffer
- a
- - ```
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

Adapted: blank lines, paragraph, under pastePlainLines: items

<table>
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃words
```

</td><td>

```buffer
- words
- a
- b┃
```

</td><td>

```buffer
- words
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
┃words
```

</td><td>

```buffer
words

- a

- b┃
```

</td></tr>
</table>

### [PastePlain15](../spec/paste-plain.md#pasteplain15)

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

Adapted: blank lines, paragraph, under pastePlainLines: items

<table>
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- p┃
```

</td><td>

```buffer
- p
- x
- y┃
```

</td><td>

```buffer
- p
- x
-  
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
p

x

⍽

y┃
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

Adapted: code block

<table>
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- code
  - ```
    ┃
    ```
````

</td><td>

```buffer
- code
  - a = 1
  - b = 2┃
```

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
  ```
  a = 1
    b = 2┃
  ```
````

</td></tr>
</table>

### [PastePlain29](../spec/paste-plain.md#pasteplain29)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

````clipboard
x
```
y
````

</td></tr>
</table>

> pastePlain

Adapted: code block

<table>
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- ```
  co┃de
  ```
````

</td><td>

````buffer
- ```
  code
  ```
- x
- ```
- y┃
````

</td><td>

`````buffer
- ````
  cox
  ```
  y┃de
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
co┃de
```
````

</td><td>

`````buffer
````
cox
```
y┃de
````
`````

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
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
-   ```
    ┃
    ```
````

</td><td>

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

Adapted: blank lines, heading, paragraph, under pasteOnParent: after

<table>
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # T┃
  - para
```

</td><td>

```buffer
- # T
  - para
- x
- y┃
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
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- p┃
- q
```

</td><td>

````buffer
- p
- ```
- c
- ```┃
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

Adapted: code block

<table>
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
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
- x
- y┃
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
```
a- x
- y
┃
```
````

</td></tr>
</table>

### [Scenario4](../spec/scenarios.md#scenario4)

Adapted: blank lines

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a┃
```

</td></tr>
</table>

> enter indent

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

> cursorLineDown cursorLineDown "b"

<table>
<tr><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - 
- b┃
```

</td><td>

```buffer
- a
  - b┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter indent</th><th>cursorDocStart cursorLineBoundaryForward</th><th>cursorLineDown cursorLineDown "b"</th></tr>
<tr valign="top"><td>

```buffer
- a┃
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

  - b┃
```

</td></tr>
</table>

### [Scenario15](../spec/scenarios.md#scenario15)

Adapted: task

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
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- [ ] milk
- [ ] bread
  - two loaves┃
```

</td></tr>
</table>

> enter

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

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
<tr><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] milk
- [ ] bread
  - two loaves
  - 
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
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- example┃
- next
```

</td><td>

````buffer
- example
- ```
- code
- ```!┃
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

### [Scenario20](../spec/scenarios.md#scenario20)

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
<tr><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Trip
  - Pack light.
  - Book the train.
  - Seat 42.┃
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
<tr><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Trip
  - Pack light.
  - Seat 42.┃
  - Book the train.
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
<tr><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Trip
  - Pack light.
  - Book the train.
  - Seat 42.┃
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
<tr><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Plan
  - revise 2. draft
  - ┃
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
<tr><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Plan
  - revis2. draft
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
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc ┃- def
```

</td><td>

```buffer
- abc - def
- ┃
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
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc ┃1. def
```

</td><td>

```buffer
- abc 1. def
- ┃
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
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Title ┃===
```

</td><td>

```buffer
- Title ===
- ┃
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
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Title ┃--
```

</td><td>

```buffer
- Title --
- ┃
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
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one ┃<div>
```

</td><td>

```buffer
- one <div>
- ┃
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
<tr><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
-  ``` x
- ┃
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
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. abc ┃2. x
```

</td><td>

```buffer
1. abc 2. x
2. ┃
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
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a | b ┃|---|---|
```

</td><td>

```buffer
- a | b |---|---|
- ┃
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
<tr><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc- def
- ┃
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
<tr><th>tana</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [Note]: this ┃matters a lot
```

</td><td>

```buffer
- [Note]: this matters a lot
- ┃
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

### [ShiftEnter28](../spec/shift-enter.md#shiftenter28)

Adapted: escape

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- p
  -┃a
```

</td></tr>
</table>

> shiftEnter

<table>
<tr><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- p
  -a
- ┃
```

</td><td>

```buffer
- p
  \-
  ┃a
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- p┃
  -a
```

</td><td>

```buffer
- p
  -┃a
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>shiftEnter</th><th>deleteContentBackward</th></tr>
<tr valign="top"><td>

```buffer
- p
  -┃a
```

</td><td>

```buffer
- p
  \-
  ┃a
```

</td><td>

```buffer
- p
  -┃a
```

</td></tr>
</table>

### [ShiftEnter31](../spec/shift-enter.md#shiftenter31)

Adapted: blank lines, escape, paragraph

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- [a]:┃
- b
```

</td></tr>
</table>

> shiftEnter

<table>
<tr><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [a]:
- ┃
- b
```

</td><td>

```buffer
- [a]:
  ┃
- b
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- [a]:┃
- b
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>shiftEnter</th><th>deleteContentBackward</th></tr>
<tr valign="top"><td>

```buffer
[a]:┃

b
```

</td><td>

```buffer
\[a]:
┃◌

b
```

</td><td>

```buffer
[a]:┃

b
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
<tr><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
-  # b
- ┃
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

### [TaskEnter2](../spec/tasks.md#taskenter2)

> enter

Adapted: task

<table>
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
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

### [TaskEnter3](../spec/tasks.md#taskenter3)

> enter

Adapted: task, under enterSplitSpace: start

<table>
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
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

### [TaskEnter4](../spec/tasks.md#taskenter4)

> enter

Adapted: task

<table>
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] ┃abc
```

</td><td>

```buffer
- ┃
- [ ] abc
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

### [TaskEnter5](../spec/tasks.md#taskenter5)

> enter

Adapted: task

<table>
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
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

### [TaskEnter6](../spec/tasks.md#taskenter6)

> enter

Adapted: task

<table>
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
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

### [TaskEnter7](../spec/tasks.md#taskenter7)

> enter

Adapted: task, under enterMidItem: child, under enterSplitSpace: start

<table>
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
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

### [TaskEnter10](../spec/tasks.md#taskenter10)

Adapted: task, under enterMidItem: child

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- [ ] a┃ b
  - c
```

</td></tr>
</table>

> enter

<table>
<tr><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] a
  - ┃ b
  - c
```

</td><td>

```buffer
- [ ] a
  - [ ] ┃ b
  - c
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- [ ] a┃ b
  - c
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter</th><th>deleteContentBackward</th></tr>
<tr valign="top"><td>

```buffer
- [ ] a┃ b
  - c
```

</td><td>

```buffer
- [ ] a
  - [ ] ┃ b
  - c
```

</td><td>

```buffer
- [ ] a┃ b
  - c
```

</td></tr>
</table>

## Adapted: whitespace (3)

### [Fence30](../spec/fences.md#fence30)

> deleteContentForward

Adapted: code block

<table>
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
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
  ```
  code┃
  ```
````

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

Adapted: blank lines, paragraph, under pastePlainLines: items

<table>
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- p┃
```

</td><td>

```buffer
- p
- x
- y┃
```

</td><td>

```buffer
- p
- x
-  y┃
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
p

x

⍽y┃
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

Adapted: under pastePlainLines: items

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
<tr><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
-  b
  - c
- x
- y┃
```

</td><td>

```buffer
- b
  - c
- x
- y┃
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
- b
  - c
- x
- y┃
```

</td></tr>
</table>

## Adapted: caret (9)

### [CursorUp1](../spec/cursor.md#cursorup1)

> cursorLineUp

Adapted: paragraph

<table>
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc┃
- abcdef
```

</td><td>

```buffer
- abc
- abcdef
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

### [CursorDown5](../spec/cursor.md#cursordown5)

> cursorLineDown

Adapted: task

<table>
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- [ ] task
```

</td><td>

```buffer
- a
- ┃[ ] task
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

### [DeleteSubtree4](../spec/delete-subtree.md#deletesubtree4)

> deleteSubtree

Adapted: task

<table>
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

````buffer
- ```js
  let a = 1;
  let b = 2;
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

### [Placeholder16](../spec/placeholders.md#placeholder16)

Adapted: blank lines

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a┃
```

</td></tr>
</table>

> enter indent selectCharLeft

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃
```

</td></tr>
</table>

> cursorCharRight

<table>
<tr><th>tana</th><th>ourus</th></tr>
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

> selectDocStart

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
  - 
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter indent selectCharLeft</th><th>cursorCharRight</th><th>selectDocStart</th></tr>
<tr valign="top"><td>

```buffer
- a┃
```

</td><td>

```buffer
- a
  -┃« »◌
```

</td><td>

```buffer
- a
  - ┃◌
```

</td><td>

```buffer
┃«- a

  - »
```

</td></tr>
</table>

### [Scenario10](../spec/scenarios.md#scenario10)

Adapted: under outdent: logical

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
  - c
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
- a
  - c
```

</td></tr>
</table>

> deleteSubtree

<table>
<tr><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃c
```

</td><td>

```buffer
- ┃a
  - c
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>outdent</th><th>moveSubtreeUp</th><th>deleteSubtree</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b┃
    - b1
  - c
```

</td><td>

```buffer
- a
  - c
- b┃
  - b1
```

</td><td>

```buffer
- b┃
  - b1
- a
  - c
```

</td><td>

```buffer
- ┃a
  - c
```

</td></tr>
</table>

### [Scenario16](../spec/scenarios.md#scenario16)

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

> undo

<table>
<tr><th>tana</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Work
  - email
- # Home
  - ┃[x] review
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
<tr><th>buffer</th><th>moveSubtreeUp</th><th>undo</th></tr>
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

# Home
- [x] ┃review
- water
```

</td></tr>
</table>

### [TaskDelete2](../spec/tasks.md#taskdelete2)

> deleteContentForward

Adapted: task

<table>
<tr><th>buffer</th><th>tana</th><th>ourus</th></tr>
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

## Skipped (533)

| example | why |
| --- | --- |
| **backspace.md** | |
| [Backspace2](../spec/backspace.md#backspace2) | caret in a marker |
| [Backspace4](../spec/backspace.md#backspace4) | heading's closing #s |
| [Backspace12](../spec/backspace.md#backspace12) | tag free-form |
| [Backspace12b](../spec/backspace.md#backspace12b) | tag free-form |
| [Backspace12c](../spec/backspace.md#backspace12c) | tag free-form |
| [Backspace12d](../spec/backspace.md#backspace12d) | tag free-form |
| [Backspace12e](../spec/backspace.md#backspace12e) | tag free-form |
| [Backspace14](../spec/backspace.md#backspace14) | tag free-form |
| [Backspace17e](../spec/backspace.md#backspace17e) | tag free-form |
| [Backspace17f](../spec/backspace.md#backspace17f) | option emptyItemWithChildren: refuse |
| [Backspace17g](../spec/backspace.md#backspace17g) | option emptyItemWithChildren: refuse |
| [Backspace17h](../spec/backspace.md#backspace17h) | option emptyItemWithChildren: refuse |
| [Backspace18](../spec/backspace.md#backspace18) | tag free-form |
| [Backspace18b](../spec/backspace.md#backspace18b) | tag free-form |
| [Backspace18c](../spec/backspace.md#backspace18c) | tag free-form |
| [Backspace18d](../spec/backspace.md#backspace18d) | tag free-form |
| [Backspace19](../spec/backspace.md#backspace19) | tag free-form |
| [Backspace19b](../spec/backspace.md#backspace19b) | tag free-form |
| [Backspace20](../spec/backspace.md#backspace20) | tag free-form |
| [Backspace23](../spec/backspace.md#backspace23) | tag free-form |
| [Backspace27](../spec/backspace.md#backspace27) | tag free-form |
| [Backspace31](../spec/backspace.md#backspace31) | selection across blocks |
| [Backspace33](../spec/backspace.md#backspace33) | tag free-form |
| [Backspace34](../spec/backspace.md#backspace34) | option backspaceAtTopItem: refuse |
| [Backspace35](../spec/backspace.md#backspace35) | tag free-form |
| [Backspace38](../spec/backspace.md#backspace38) | tag free-form |
| [Backspace40](../spec/backspace.md#backspace40) | list numbered in part, or not from 1 |
| [SoftBackspace4](../spec/backspace.md#softbackspace4) | heading's closing #s |
| [SoftBackspace6](../spec/backspace.md#softbackspace6) | caret on a blank line |
| [SoftBackspace7](../spec/backspace.md#softbackspace7) | tag free-form |
| [SoftBackspace8](../spec/backspace.md#softbackspace8) | tag free-form |
| [SoftBackspace9](../spec/backspace.md#softbackspace9) | caret in a number, a task's checkbox, a heading's # or a code block's fences |
| [SoftBackspace10](../spec/backspace.md#softbackspace10) | option taskEditing: text |
| [SoftBackspace11](../spec/backspace.md#softbackspace11) | tag free-form |
| [Backspace42](../spec/backspace.md#backspace42) | tag free-form |
| [Backspace42b](../spec/backspace.md#backspace42b) | option markup: decorated |
| [Backspace43](../spec/backspace.md#backspace43) | tag free-form |
| [Backspace43b](../spec/backspace.md#backspace43b) | tag free-form |
| [Backspace43c](../spec/backspace.md#backspace43c) | tag free-form |
| [Backspace46](../spec/backspace.md#backspace46) | character outside the Basic Multilingual Plane, where the caret lands elsewhere |
| [Backspace47](../spec/backspace.md#backspace47) | tag free-form |
| [Backspace49](../spec/backspace.md#backspace49) | tag free-form |
| **backtick.md** | |
| [Backtick1](../spec/backtick.md#backtick1) | caret on a blank line |
| [Backtick3](../spec/backtick.md#backtick3) | quote |
| [Backtick5](../spec/backtick.md#backtick5) | caret in a number, a task's checkbox, a heading's # or a code block's fences |
| [Backtick6](../spec/backtick.md#backtick6) | caret in a number, a task's checkbox, a heading's # or a code block's fences |
| [Backtick7](../spec/backtick.md#backtick7) | option markup: decorated |
| [Backtick8](../spec/backtick.md#backtick8) | tag free-form |
| [Backtick11](../spec/backtick.md#backtick11) | code block's fences that don't match |
| [Backtick13](../spec/backtick.md#backtick13) | option markup: decorated |
| [Backtick14](../spec/backtick.md#backtick14) | code block's fences other than the shortest backticks that hold its code, which Tana's code block reads back with (it keeps no fences), or spaces around its language |
| [Backtick16](../spec/backtick.md#backtick16) | option markup: decorated |
| [Backtick17](../spec/backtick.md#backtick17) | tag free-form |
| [Backtick19](../spec/backtick.md#backtick19) | option closeBackticks: all |
| [Backtick20](../spec/backtick.md#backtick20) | option closeBackticks: all |
| [Backtick21](../spec/backtick.md#backtick21) | option closeBackticks: all |
| [Backtick22](../spec/backtick.md#backtick22) | option closeBackticks: all |
| [Backtick23](../spec/backtick.md#backtick23) | code block's fences other than the shortest backticks that hold its code, which Tana's code block reads back with (it keeps no fences), or spaces around its language |
| [Backtick24](../spec/backtick.md#backtick24) | code block's fences that don't match |
| [Backtick25](../spec/backtick.md#backtick25) | caret in a number, a task's checkbox, a heading's # or a code block's fences |
| [Backtick26](../spec/backtick.md#backtick26) | code block's fences that don't match |
| [Backtick27](../spec/backtick.md#backtick27) | code block's fences that don't match |
| [Backtick28](../spec/backtick.md#backtick28) | caret in a number, a task's checkbox, a heading's # or a code block's fences |
| [Backtick29](../spec/backtick.md#backtick29) | code block's fences other than the shortest backticks that hold its code, which Tana's code block reads back with (it keeps no fences), or spaces around its language |
| [Backtick30](../spec/backtick.md#backtick30) | caret on a blank line |
| [Backtick31](../spec/backtick.md#backtick31) | option markup: decorated |
| [Backtick32](../spec/backtick.md#backtick32) | option closeBackticks: all |
| **copy.md** | |
| [Copy2](../spec/copy.md#copy2) | selection across blocks |
| [Copy3](../spec/copy.md#copy3) | quote |
| [Copy5](../spec/copy.md#copy5) | selection across blocks |
| [Copy6](../spec/copy.md#copy6) | option copyAtCaret: host |
| [Copy7](../spec/copy.md#copy7) | selection across blocks |
| [Copy8](../spec/copy.md#copy8) | callout |
| [Cut2](../spec/copy.md#cut2) | selection across blocks |
| [Cut3](../spec/copy.md#cut3) | selection across blocks |
| **cursor.md** | |
| [CursorUp2](../spec/cursor.md#cursorup2) | heading other than H1: Tana's (a section) has one level |
| [CursorDown2](../spec/cursor.md#cursordown2) | indented code |
| [CursorHome3](../spec/cursor.md#cursorhome3) | caret in a marker |
| [CursorHome4](../spec/cursor.md#cursorhome4) | caret in a marker |
| [CursorHome7](../spec/cursor.md#cursorhome7) | list numbered in part, or not from 1 |
| [CursorHome10](../spec/cursor.md#cursorhome10) | heading other than H1: Tana's (a section) has one level |
| [CursorHome11](../spec/cursor.md#cursorhome11) | quote |
| [CursorHome15](../spec/cursor.md#cursorhome15) | caret in a marker |
| [CursorHome16](../spec/cursor.md#cursorhome16) | quote |
| [CursorHome17](../spec/cursor.md#cursorhome17) | callout |
| [CursorDocEndLeft1](../spec/cursor.md#cursordocendleft1) | cursorCharLeft after cursorDocEnd |
| **delete-subtree.md** | |
| [DeleteSubtree5](../spec/delete-subtree.md#deletesubtree5) | selection across blocks |
| [DeleteSubtree7](../spec/delete-subtree.md#deletesubtree7) | quote |
| [DeleteSubtree8](../spec/delete-subtree.md#deletesubtree8) | caret in a number, a task's checkbox, a heading's # or a code block's fences |
| [DeleteSubtree9](../spec/delete-subtree.md#deletesubtree9) | thematic break |
| [DeleteSubtree10](../spec/delete-subtree.md#deletesubtree10) | thematic break |
| **delete.md** | |
| [Delete4](../spec/delete.md#delete4) | heading's closing #s |
| [Delete4b](../spec/delete.md#delete4b) | heading's closing #s |
| [Delete5e](../spec/delete.md#delete5e) | option emptyItemWithChildren: refuse |
| [Delete9](../spec/delete.md#delete9) | tag free-form |
| [Delete10](../spec/delete.md#delete10) | quote |
| [Delete11](../spec/delete.md#delete11) | indented code |
| [Delete13c](../spec/delete.md#delete13c) | tag free-form |
| [Delete13d](../spec/delete.md#delete13d) | tag free-form |
| [Delete13e](../spec/delete.md#delete13e) | tag free-form |
| [Delete14](../spec/delete.md#delete14) | tag free-form |
| [Delete15](../spec/delete.md#delete15) | heading's closing #s |
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
| [Delete19](../spec/delete.md#delete19) | option markup: decorated |
| [Delete21](../spec/delete.md#delete21) | selection across blocks |
| [Delete23](../spec/delete.md#delete23) | tag free-form |
| [Delete24](../spec/delete.md#delete24) | tag free-form |
| [Delete25](../spec/delete.md#delete25) | tag free-form |
| [Delete29](../spec/delete.md#delete29) | tag free-form |
| [Delete34](../spec/delete.md#delete34) | quote |
| **duplicate-subtree.md** | |
| [DuplicateSubtree3](../spec/duplicate-subtree.md#duplicatesubtree3) | selection across blocks |
| [DuplicateSubtree4](../spec/duplicate-subtree.md#duplicatesubtree4) | tag free-form |
| [DuplicateSubtree5](../spec/duplicate-subtree.md#duplicatesubtree5) | quote |
| [DuplicateSubtree6](../spec/duplicate-subtree.md#duplicatesubtree6) | tag free-form |
| [DuplicateSubtree7](../spec/duplicate-subtree.md#duplicatesubtree7) | caret in a marker |
| [DuplicateSubtree8](../spec/duplicate-subtree.md#duplicatesubtree8) | caret in a number, a task's checkbox, a heading's # or a code block's fences |
| [DuplicateSubtree9](../spec/duplicate-subtree.md#duplicatesubtree9) | code block's fences that don't match |
| **enter.md** | |
| [Enter3c](../spec/enter.md#enter3c) | list numbered in part, or not from 1 |
| [Enter6](../spec/enter.md#enter6) | tag free-form |
| [Enter7b](../spec/enter.md#enter7b) | tag free-form |
| [Enter14](../spec/enter.md#enter14) | tag free-form |
| [Enter15b](../spec/enter.md#enter15b) | tag free-form |
| [Enter23](../spec/enter.md#enter23) | indented code |
| [Enter25](../spec/enter.md#enter25) | list numbered in part, or not from 1 |
| [Enter26b](../spec/enter.md#enter26b) | option enterAtTextStart: stay |
| [Enter29b](../spec/enter.md#enter29b) | option enterAtTextStart: stay |
| [Enter30](../spec/enter.md#enter30) | option enterOnEmptyItem: outdent |
| [Enter32b](../spec/enter.md#enter32b) | option enterAtTextStart: stay |
| [Enter33b](../spec/enter.md#enter33b) | option enterAtTextStart: stay |
| [Enter34](../spec/enter.md#enter34) | caret in a marker |
| [Enter36b](../spec/enter.md#enter36b) | quote |
| [Enter37](../spec/enter.md#enter37) | caret on a blank line |
| [Enter40](../spec/enter.md#enter40) | tag free-form |
| [Enter41](../spec/enter.md#enter41) | tag free-form |
| [Enter64](../spec/enter.md#enter64) | option enterSplitSpace: drop |
| [Enter65i](../spec/enter.md#enter65i) | tag free-form |
| [Enter46](../spec/enter.md#enter46) | quote |
| [Enter47](../spec/enter.md#enter47) | tag free-form |
| [Enter49](../spec/enter.md#enter49) | table |
| [Enter50](../spec/enter.md#enter50) | tag free-form |
| [Enter51](../spec/enter.md#enter51) | heading other than H1: Tana's (a section) has one level |
| [Enter52](../spec/enter.md#enter52) | heading other than H1: Tana's (a section) has one level |
| [Enter53](../spec/enter.md#enter53) | tag free-form |
| [Enter54](../spec/enter.md#enter54) | caret in a number, a task's checkbox, a heading's # or a code block's fences |
| [Enter54b](../spec/enter.md#enter54b) | caret in a number, a task's checkbox, a heading's # or a code block's fences |
| [Enter55](../spec/enter.md#enter55) | caret in a number, a task's checkbox, a heading's # or a code block's fences |
| [Enter55b](../spec/enter.md#enter55b) | caret in a number, a task's checkbox, a heading's # or a code block's fences |
| [Enter55c](../spec/enter.md#enter55c) | tag free-form |
| [Enter56](../spec/enter.md#enter56) | selection across blocks |
| [Enter56b](../spec/enter.md#enter56b) | selection across a node's name and its description, each an editor of its own |
| [Enter58](../spec/enter.md#enter58) | no-break space, which Tana holds as a space |
| [Enter61](../spec/enter.md#enter61) | heading's closing #s |
| [Enter63](../spec/enter.md#enter63) | tag free-form |
| [Enter63b](../spec/enter.md#enter63b) | option enterOnEmptyItem: exit |
| [Enter66](../spec/enter.md#enter66) | footnote |
| [Enter67](../spec/enter.md#enter67) | thematic break |
| [Enter68](../spec/enter.md#enter68) | callout |
| **fences.md** | |
| [Fence4](../spec/fences.md#fence4) | quote |
| [Fence6](../spec/fences.md#fence6) | caret in a number, a task's checkbox, a heading's # or a code block's fences |
| [Fence7](../spec/fences.md#fence7) | caret in a number, a task's checkbox, a heading's # or a code block's fences |
| [Fence7b](../spec/fences.md#fence7b) | caret in a number, a task's checkbox, a heading's # or a code block's fences |
| [Fence7c](../spec/fences.md#fence7c) | caret in a number, a task's checkbox, a heading's # or a code block's fences |
| [Fence7d](../spec/fences.md#fence7d) | caret in a number, a task's checkbox, a heading's # or a code block's fences |
| [Fence9](../spec/fences.md#fence9) | caret in a number, a task's checkbox, a heading's # or a code block's fences |
| [Fence10](../spec/fences.md#fence10) | option handleFenceContents: false |
| [Fence11](../spec/fences.md#fence11) | option handleFenceContents: false |
| [Fence12](../spec/fences.md#fence12) | caret in a number, a task's checkbox, a heading's # or a code block's fences |
| [Fence13](../spec/fences.md#fence13) | caret in a number, a task's checkbox, a heading's # or a code block's fences |
| [Fence14](../spec/fences.md#fence14) | caret in a number, a task's checkbox, a heading's # or a code block's fences |
| [Fence15](../spec/fences.md#fence15) | caret in a number, a task's checkbox, a heading's # or a code block's fences |
| [Fence20](../spec/fences.md#fence20) | quote |
| [Fence21](../spec/fences.md#fence21) | nothing to compare |
| [Fence22](../spec/fences.md#fence22) | caret in a number, a task's checkbox, a heading's # or a code block's fences |
| [Fence23](../spec/fences.md#fence23) | caret in a number, a task's checkbox, a heading's # or a code block's fences |
| [Fence24](../spec/fences.md#fence24) | caret in a number, a task's checkbox, a heading's # or a code block's fences |
| [Fence25](../spec/fences.md#fence25) | caret in a number, a task's checkbox, a heading's # or a code block's fences |
| [Fence26](../spec/fences.md#fence26) | caret in a number, a task's checkbox, a heading's # or a code block's fences |
| [Fence27](../spec/fences.md#fence27) | caret in a number, a task's checkbox, a heading's # or a code block's fences |
| [Fence28](../spec/fences.md#fence28) | caret in a number, a task's checkbox, a heading's # or a code block's fences |
| [Fence29](../spec/fences.md#fence29) | caret in a number, a task's checkbox, a heading's # or a code block's fences |
| [Fence31](../spec/fences.md#fence31) | caret in a number, a task's checkbox, a heading's # or a code block's fences |
| [Fence31b](../spec/fences.md#fence31b) | caret in a number, a task's checkbox, a heading's # or a code block's fences |
| [Fence32](../spec/fences.md#fence32) | caret in a number, a task's checkbox, a heading's # or a code block's fences |
| [Fence32b](../spec/fences.md#fence32b) | option markup: decorated |
| [Fence33](../spec/fences.md#fence33) | caret in a number, a task's checkbox, a heading's # or a code block's fences |
| [Fence35](../spec/fences.md#fence35) | caret in a number, a task's checkbox, a heading's # or a code block's fences |
| [Fence38](../spec/fences.md#fence38) | code block's fences other than the shortest backticks that hold its code, which Tana's code block reads back with (it keeps no fences), or spaces around its language |
| [Fence39](../spec/fences.md#fence39) | code block's fences other than the shortest backticks that hold its code, which Tana's code block reads back with (it keeps no fences), or spaces around its language |
| [Fence40](../spec/fences.md#fence40) | quote |
| [Fence41](../spec/fences.md#fence41) | caret in a number, a task's checkbox, a heading's # or a code block's fences |
| [Fence49](../spec/fences.md#fence49) | caret in a number, a task's checkbox, a heading's # or a code block's fences |
| [Fence50](../spec/fences.md#fence50) | caret in a number, a task's checkbox, a heading's # or a code block's fences |
| [Fence51](../spec/fences.md#fence51) | caret in a number, a task's checkbox, a heading's # or a code block's fences |
| [Fence58](../spec/fences.md#fence58) | no-break space, which Tana holds as a space |
| [Fence59](../spec/fences.md#fence59) | caret in a number, a task's checkbox, a heading's # or a code block's fences |
| [Fence59b](../spec/fences.md#fence59b) | caret in a number, a task's checkbox, a heading's # or a code block's fences |
| [Fence60](../spec/fences.md#fence60) | caret in a number, a task's checkbox, a heading's # or a code block's fences |
| [Fence42](../spec/fences.md#fence42) | math |
| [Fence43](../spec/fences.md#fence43) | quote |
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
| [Fence62](../spec/fences.md#fence62) | code block's fences other than the shortest backticks that hold its code, which Tana's code block reads back with (it keeps no fences), or spaces around its language |
| **gaps.md** | |
| [Gap6](../spec/gaps.md#gap6) | heading other than H1: Tana's (a section) has one level |
| [Gap12](../spec/gaps.md#gap12) | heading other than H1: Tana's (a section) has one level |
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
| [Indent29b](../spec/indent.md#indent29b) | list numbered in part, or not from 1 |
| [Indent29c](../spec/indent.md#indent29c) | changes only what blocks can't show |
| [Indent30](../spec/indent.md#indent30) | caret in a marker |
| [Indent31](../spec/indent.md#indent31) | caret in a number, a task's checkbox, a heading's # or a code block's fences |
| [Indent31b](../spec/indent.md#indent31b) | option markup: decorated |
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
| [MoveDown23](../spec/move-subtree-down.md#movedown23) | list numbered in part, or not from 1 |
| [MoveDown25](../spec/move-subtree-down.md#movedown25) | tag free-form |
| [MoveDown27](../spec/move-subtree-down.md#movedown27) | heading other than H1: Tana's (a section) has one level |
| [MoveDown28](../spec/move-subtree-down.md#movedown28) | tag free-form |
| [MoveDown29](../spec/move-subtree-down.md#movedown29) | list numbered in part, or not from 1 |
| [MoveDown30](../spec/move-subtree-down.md#movedown30) | list numbered in part, or not from 1 |
| [MoveDown31](../spec/move-subtree-down.md#movedown31) | thematic break |
| [MoveDown32](../spec/move-subtree-down.md#movedown32) | caret in a marker |
| [MoveDown34](../spec/move-subtree-down.md#movedown34) | caret in a number, a task's checkbox, a heading's # or a code block's fences |
| [MoveDown36](../spec/move-subtree-down.md#movedown36) | tag free-form |
| [MoveDown37](../spec/move-subtree-down.md#movedown37) | caret in a number, a task's checkbox, a heading's # or a code block's fences |
| [MoveDown38](../spec/move-subtree-down.md#movedown38) | tag free-form |
| [MoveDown39](../spec/move-subtree-down.md#movedown39) | tag free-form |
| **move-subtree-up.md** | |
| [MoveUp7](../spec/move-subtree-up.md#moveup7) | tag free-form |
| [MoveUp10](../spec/move-subtree-up.md#moveup10) | selection across blocks |
| [MoveUp11](../spec/move-subtree-up.md#moveup11) | selection across blocks |
| [MoveUp12](../spec/move-subtree-up.md#moveup12) | tag free-form |
| [MoveUp15](../spec/move-subtree-up.md#moveup15) | list numbered in part, or not from 1 |
| [MoveUp16](../spec/move-subtree-up.md#moveup16) | heading other than H1: Tana's (a section) has one level |
| [MoveUp18](../spec/move-subtree-up.md#moveup18) | indented code |
| [MoveUp19](../spec/move-subtree-up.md#moveup19) | thematic break |
| [MoveUp20](../spec/move-subtree-up.md#moveup20) | link reference definition |
| [MoveUp21](../spec/move-subtree-up.md#moveup21) | tag free-form |
| [MoveUp23](../spec/move-subtree-up.md#moveup23) | tag free-form |
| [MoveUp24](../spec/move-subtree-up.md#moveup24) | tag free-form |
| [MoveUp26](../spec/move-subtree-up.md#moveup26) | heading other than H1: Tana's (a section) has one level |
| [MoveUp27](../spec/move-subtree-up.md#moveup27) | tag free-form |
| [MoveUp28](../spec/move-subtree-up.md#moveup28) | tag free-form |
| [MoveUp29](../spec/move-subtree-up.md#moveup29) | tag free-form |
| [MoveUp30](../spec/move-subtree-up.md#moveup30) | link reference definition |
| [MoveUp31](../spec/move-subtree-up.md#moveup31) | selection across blocks |
| [MoveUp33](../spec/move-subtree-up.md#moveup33) | tag free-form |
| [MoveUp34](../spec/move-subtree-up.md#moveup34) | caret in a marker |
| [MoveUp35](../spec/move-subtree-up.md#moveup35) | tag free-form |
| [MoveUp36](../spec/move-subtree-up.md#moveup36) | tag free-form |
| [MoveUp37](../spec/move-subtree-up.md#moveup37) | math |
| [MoveUp38](../spec/move-subtree-up.md#moveup38) | math |
| [MoveUp39](../spec/move-subtree-up.md#moveup39) | caret on a blank line |
| [MoveUp41](../spec/move-subtree-up.md#moveup41) | code block's fences that don't match |
| **obsidian-true-outliner.md** | |
| [TO-Bug228](../spec/obsidian-true-outliner.md#to-bug228) | list numbered in part, or not from 1 |
| [TO-E15](../spec/obsidian-true-outliner.md#to-e15) | tag free-form |
| [TO-E18](../spec/obsidian-true-outliner.md#to-e18) | caret on a blank line |
| [TO-E19-E21b](../spec/obsidian-true-outliner.md#to-e19-e21b) | tag free-form |
| [TO-Bug267-E5](../spec/obsidian-true-outliner.md#to-bug267-e5) | quote |
| [TO-E13-E16b](../spec/obsidian-true-outliner.md#to-e13-e16b) | heading other than H1: Tana's (a section) has one level |
| [TO-S5](../spec/obsidian-true-outliner.md#to-s5) | tag free-form |
| [TO-S7-S8b](../spec/obsidian-true-outliner.md#to-s7-s8b) | caret on a blank line |
| [TO-S11b](../spec/obsidian-true-outliner.md#to-s11b) | tag free-form |
| [TO1](../spec/obsidian-true-outliner.md#to1) | option markup: decorated |
| [TO4](../spec/obsidian-true-outliner.md#to4) | list numbered in part, or not from 1 |
| [TO6](../spec/obsidian-true-outliner.md#to6) | list numbered in part, or not from 1 |
| [TO-Bug255](../spec/obsidian-true-outliner.md#to-bug255) | quote |
| [TO-Seams](../spec/obsidian-true-outliner.md#to-seams) | quote |
| [TO-Seamsb](../spec/obsidian-true-outliner.md#to-seamsb) | quote |
| [TO-Seamsc](../spec/obsidian-true-outliner.md#to-seamsc) | thematic break |
| [TO-Seamsd](../spec/obsidian-true-outliner.md#to-seamsd) | indented code |
| [TO-Lazy](../spec/obsidian-true-outliner.md#to-lazy) | quote |
| [TO8](../spec/obsidian-true-outliner.md#to8) | tag free-form |
| [TO9](../spec/obsidian-true-outliner.md#to9) | tag free-form |
| [TO18](../spec/obsidian-true-outliner.md#to18) | tag free-form |
| [TO19](../spec/obsidian-true-outliner.md#to19) | tag free-form |
| [TO-Bug264](../spec/obsidian-true-outliner.md#to-bug264) | heading other than H1: Tana's (a section) has one level |
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
| [LogicalOutdent2](../spec/outdent.md#logicaloutdent2) | tag free-form |
| [LogicalOutdent3](../spec/outdent.md#logicaloutdent3) | tag free-form |
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
| [PasteHtml13](../spec/paste-html.md#pastehtml13) | table (expected) |
| **paste-list-form.md** | |
| [PasteListForm6](../spec/paste-list-form.md#pastelistform6) | option pasteListForm: own |
| **paste-list.md** | |
| [PasteList7b](../spec/paste-list.md#pastelist7b) | option enterTask: plain |
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
| [PastePlain17](../spec/paste-plain.md#pasteplain17) | selection across a node's name and its description, each an editor of its own |
| [PastePlain18](../spec/paste-plain.md#pasteplain18) | quote |
| [PastePlain21](../spec/paste-plain.md#pasteplain21) | tag free-form |
| [PastePlain22](../spec/paste-plain.md#pasteplain22) | tag free-form |
| [PastePlain23](../spec/paste-plain.md#pasteplain23) | heading other than H1: Tana's (a section) has one level |
| [PastePlain24](../spec/paste-plain.md#pasteplain24) | tag free-form |
| [PastePlain26](../spec/paste-plain.md#pasteplain26) | tag free-form |
| [PastePlain27](../spec/paste-plain.md#pasteplain27) | changes only what blocks can't show |
| [PastePlain31](../spec/paste-plain.md#pasteplain31) | option pastePlainLines: enter |
| [PastePlain34](../spec/paste-plain.md#pasteplain34) | option pastePlainLines: host |
| **paste.md** | |
| [Paste9](../spec/paste.md#paste9) | quote |
| [Paste10](../spec/paste.md#paste10) | heading other than H1: Tana's (a section) has one level |
| [Paste11](../spec/paste.md#paste11) | heading other than H1: Tana's (a section) has one level |
| [Paste12](../spec/paste.md#paste12) | heading other than H1: Tana's (a section) has one level |
| [Paste13](../spec/paste.md#paste13) | caret on a blank line |
| [Paste15](../spec/paste.md#paste15) | caret in a number, a task's checkbox, a heading's # or a code block's fences |
| [Paste16](../spec/paste.md#paste16) | caret in a marker |
| [Paste18](../spec/paste.md#paste18) | option pasteLines: items |
| [Paste19](../spec/paste.md#paste19) | option pasteLines: items |
| [Paste20](../spec/paste.md#paste20) | option pasteAtTextStart: before |
| [Paste21](../spec/paste.md#paste21) | option pasteSeams: open |
| [Paste22](../spec/paste.md#paste22) | heading other than H1: Tana's (a section) has one level |
| [Paste23](../spec/paste.md#paste23) | callout |
| [Paste25](../spec/paste.md#paste25) | callout |
| [Paste26](../spec/paste.md#paste26) | block's text ending in a line break: an empty description is none |
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
| [Placeholder13](../spec/placeholders.md#placeholder13) | heading other than H1: Tana's (a section) has one level |
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
| [Quote55](../spec/quotes.md#quote55) | option backspaceAtTopItem: refuse |
| [Quote56](../spec/quotes.md#quote56) | quote |
| [Quote57](../spec/quotes.md#quote57) | callout |
| [Quote58](../spec/quotes.md#quote58) | callout |
| [Quote59](../spec/quotes.md#quote59) | tag free-form |
| [Quote89](../spec/quotes.md#quote89) | quote |
| [Quote90](../spec/quotes.md#quote90) | quote |
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
| [Quote86](../spec/quotes.md#quote86) | quote |
| [Quote87](../spec/quotes.md#quote87) | quote |
| [Quote91](../spec/quotes.md#quote91) | quote |
| [Quote91b](../spec/quotes.md#quote91b) | quote |
| [Quote92](../spec/quotes.md#quote92) | quote |
| [Quote93](../spec/quotes.md#quote93) | quote |
| [Quote69](../spec/quotes.md#quote69) | quote |
| [Quote70](../spec/quotes.md#quote70) | quote |
| [Quote94](../spec/quotes.md#quote94) | quote |
| **scenarios.md** | |
| [Scenario6](../spec/scenarios.md#scenario6) | tag free-form |
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
| [ShiftEnter26b](../spec/shift-enter.md#shiftenter26b) | option markup: decorated |
| [ShiftEnter27](../spec/shift-enter.md#shiftenter27) | selection across blocks |
| [ShiftEnter29](../spec/shift-enter.md#shiftenter29) | heading other than H1: Tana's (a section) has one level |
| [ShiftEnter33](../spec/shift-enter.md#shiftenter33) | caret in a marker |
| **tasks.md** | |
| [TaskEnter1](../spec/tasks.md#taskenter1) | tag free-form |
| [TaskEnter9](../spec/tasks.md#taskenter9) | option enterTask: plain |
| [TaskEnter9b](../spec/tasks.md#taskenter9b) | option enterTask: plain |
| [TaskEnter9c](../spec/tasks.md#taskenter9c) | option enterTask: plain |
| [TaskBackspace1](../spec/tasks.md#taskbackspace1) | option markup: decorated |
| [TaskBackspace4](../spec/tasks.md#taskbackspace4) | option taskEditing: block |
| [TaskBackspace5](../spec/tasks.md#taskbackspace5) | option taskEditing: text |
| [TaskBackspace6](../spec/tasks.md#taskbackspace6) | option markup: decorated |
| [TaskBackspace7](../spec/tasks.md#taskbackspace7) | option taskEditing: block |
| [TaskBackspace8](../spec/tasks.md#taskbackspace8) | caret in a number, a task's checkbox, a heading's # or a code block's fences |
| [TaskBackspace8b](../spec/tasks.md#taskbackspace8b) | caret in a number, a task's checkbox, a heading's # or a code block's fences |
| [TaskBackspace9](../spec/tasks.md#taskbackspace9) | caret in a number, a task's checkbox, a heading's # or a code block's fences |
| [TaskBackspace10](../spec/tasks.md#taskbackspace10) | caret in a number, a task's checkbox, a heading's # or a code block's fences |
| [TaskBackspace11](../spec/tasks.md#taskbackspace11) | option taskEditing: block |
| [TaskDelete4](../spec/tasks.md#taskdelete4) | caret in a number, a task's checkbox, a heading's # or a code block's fences |
| **typing.md** | |
| [Typing1](../spec/typing.md#typing1) | tag free-form |
| [Typing2](../spec/typing.md#typing2) | tag free-form |
| [Typing3](../spec/typing.md#typing3) | tag free-form |
| **undo.md** | |
| [Undo2](../spec/undo.md#undo2) | tag free-form |
| [Undo3](../spec/undo.md#undo3) | tag free-form |
| **z-open.md** | |
| [Open2](../spec/z-open.md#open2) | caret in a number, a task's checkbox, a heading's # or a code block's fences |
