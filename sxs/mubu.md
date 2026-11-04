---
type: "SxS"
app: "mubu"
version: "web 20261103063201"
url: "https://mubu.com/explore/rHSdgLpbl"
model: "block"
command: "node sxs/run.ts mubu"
elapsed_s: 278
workers: 4
---

# Mubu vs ourus

Summary:

|  | agree | caret | whitespace | disagree | error | skipped | not run | total |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| original | 126 | [5](#caret-5) | [2](#whitespace-2) | [41](#disagree-41) |  |  |  | **174** |
| adapted | 242 | [9](#adapted-caret-9) | [9](#adapted-whitespace-9) | [110](#adapted-disagree-110) |  |  |  | **370** |
| **total** | **368 (23%)** | **14 (0.88%)** | **11 (0.69%)** | **151 (9.5%)** | **0 (0%)** | **[1042](#skipped-1042) (66%)** | **[2](#not-run-2) (0.13%)** | **1589** |

Per-file:

|  | agree | caret | whitespace | disagree | error | skipped | not run | total | original | adapted |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [auto.md](../spec/auto.md) | 3 |  |  | 3 |  | 33 |  | **39** |  | 6 |
| [backspace.md](../spec/backspace.md) | 34 | 3 |  | 15 |  | 36 |  | **88** | 17 | 35 |
| [backtick.md](../spec/backtick.md) | 1 |  |  |  |  | 32 |  | **33** |  | 1 |
| [block-ids.md](../spec/block-ids.md) |  |  |  |  |  | 21 |  | **21** |  |  |
| [copy.md](../spec/copy.md) | 3 |  |  |  |  | 10 |  | **13** | 1 | 2 |
| [cursor.md](../spec/cursor.md) | 25 | 3 |  |  |  | 8 |  | **36** | 12 | 16 |
| [delete-subtree.md](../spec/delete-subtree.md) | 3 | 2 |  | 1 |  | 8 |  | **14** | 1 | 5 |
| [delete.md](../spec/delete.md) | 18 |  | 2 | 12 |  | 24 |  | **56** | 12 | 20 |
| [drag.md](../spec/drag.md) |  |  |  |  |  | 8 |  | **8** |  |  |
| [duplicate-subtree.md](../spec/duplicate-subtree.md) | 5 |  |  |  |  | 8 |  | **13** | 3 | 2 |
| [enter.md](../spec/enter.md) | 40 | 2 |  | 18 |  | 38 |  | **98** | 24 | 36 |
| [fences.md](../spec/fences.md) |  |  |  |  |  | 70 |  | **70** |  |  |
| [fold.md](../spec/fold.md) |  |  |  |  |  | 22 |  | **22** |  |  |
| [gaps.md](../spec/gaps.md) | 9 |  |  | 3 |  | 7 |  | **19** |  | 12 |
| [indent.md](../spec/indent.md) | 22 |  |  | 1 |  | 32 |  | **55** | 12 | 11 |
| [lists.md](../spec/lists.md) | 1 | 1 |  | 1 |  | 13 |  | **16** |  | 3 |
| [move-subtree-down.md](../spec/move-subtree-down.md) | 21 |  |  | 6 |  | 18 |  | **45** | 9 | 18 |
| [move-subtree-up.md](../spec/move-subtree-up.md) | 14 |  |  | 9 |  | 24 |  | **47** | 12 | 11 |
| [move-subtree.md](../spec/move-subtree.md) |  |  |  |  |  | 24 |  | **24** |  |  |
| [obsidian-true-outliner.md](../spec/obsidian-true-outliner.md) | 26 |  |  | 8 |  | 33 |  | **67** | 9 | 25 |
| [outdent.md](../spec/outdent.md) | 14 |  |  |  |  | 28 |  | **42** | 2 | 12 |
| [paste-at.md](../spec/paste-at.md) |  |  |  |  |  | 5 |  | **5** |  |  |
| [paste-conv.md](../spec/paste-conv.md) | 4 | 1 |  |  |  | 1 |  | **6** | 5 |  |
| [paste-html.md](../spec/paste-html.md) | 5 |  |  | 9 |  | 5 |  | **19** |  | 14 |
| [paste-list-form.md](../spec/paste-list-form.md) | 3 |  |  | 2 |  | 1 |  | **6** | 2 | 3 |
| [paste-list.md](../spec/paste-list.md) | 9 |  |  | 4 |  | 16 |  | **29** | 9 | 4 |
| [paste-plain.md](../spec/paste-plain.md) | 12 |  | 3 | 10 |  | 11 |  | **36** | 1 | 24 |
| [paste.md](../spec/paste.md) | 20 |  |  | 1 |  | 15 |  | **36** | 6 | 15 |
| [placeholders.md](../spec/placeholders.md) | 14 |  | 1 | 2 |  | 10 |  | **27** | 5 | 12 |
| [quirks.md](../spec/quirks.md) |  |  |  |  |  | 7 |  | **7** |  |  |
| [quotes.md](../spec/quotes.md) |  |  |  |  |  | 143 |  | **143** |  |  |
| [regressions.md](../spec/regressions.md) | 37 |  | 5 | 27 |  | 212 | 2 | **283** | 12 | 57 |
| [scenarios.md](../spec/scenarios.md) | 12 | 1 |  | 7 |  | 14 |  | **34** | 10 | 10 |
| [select.md](../spec/select.md) |  |  |  |  |  | 23 |  | **23** |  |  |
| [shift-enter.md](../spec/shift-enter.md) |  |  |  |  |  | 38 |  | **38** |  |  |
| [subtree-selection.md](../spec/subtree-selection.md) | 2 |  |  | 7 |  | 10 |  | **19** | 7 | 2 |
| [tasks.md](../spec/tasks.md) | 8 |  |  | 5 |  | 17 |  | **30** |  | 13 |
| [typing.md](../spec/typing.md) |  |  |  |  |  | 3 |  | **3** |  |  |
| [undo.md](../spec/undo.md) | 3 | 1 |  |  |  | 1 |  | **5** | 3 | 1 |
| [zoom.md](../spec/zoom.md) |  |  |  |  |  | 14 |  | **14** |  |  |
| **total** | **368 (23%)** | **14 (0.88%)** | **11 (0.69%)** | **151 (9.5%)** | **0 (0%)** | **1043 (66%)** | **2 (0.13%)** | **1589** | **174 (11%)** | **370 (23%)** |

## Disagree (41)

### [Backspace3](../spec/backspace.md#backspace3)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
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

### [Backspace8](../spec/backspace.md#backspace8)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  ┃two
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

### [Backspace17d](../spec/backspace.md#backspace17d)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
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

### [Backspace17h](../spec/backspace.md#backspace17h)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- x
- ┃
  - a
```

</td><td>

```buffer
- x
- ┃
  - a
```

</td><td>

```buffer
- x┃
  - a
```

</td></tr>
</table>

### [Delete1](../spec/delete.md#delete1)

> deleteContentForward

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
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

### [Enter3d](../spec/enter.md#enter3d)

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
<tr><th>mubu</th><th>ourus</th></tr>
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

### [Enter16](../spec/enter.md#enter16)

> enter

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
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

### [Enter65e](../spec/enter.md#enter65e)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- one two┃ three
  - c
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
  - c
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one two
- ┃ three
  - c
```

</td><td>

```buffer
- one two┃ three
  - c
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
<tr><th>mubu</th><th>ourus</th></tr>
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

### [Enter48](../spec/enter.md#enter48)

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
<tr><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [a]: b┃c
```

</td><td>

```buffer
- [a]: b ┃c
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
<tr><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b  
  c┃
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
<tr><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b┃  
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

### [MoveDown9](../spec/move-subtree-down.md#movedown9)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
  - c┃
    - c1
- b
```

</td></tr>
</table>

> moveSubtreeDown

<table>
<tr><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b
- c┃
  - c1
```

</td><td>

```buffer
- a
- b
  - c┃
    - c1
```

</td></tr>
</table>

> moveSubtreeUp

<table>
<tr><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- c┃
  - c1
- b
```

</td><td>

```buffer
- a
  - c┃
    - c1
- b
```

</td></tr>
</table>

### [MoveDown10](../spec/move-subtree-down.md#movedown10)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b
  - c┃
    - c1
- d
  - d1
    - d11
```

</td></tr>
</table>

> moveSubtreeDown

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b
- d
  - c┃
    - c1
  - d1
    - d11
```

</td></tr>
</table>

> moveSubtreeDown

<table>
<tr><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b
- d
  - d1
    - c┃
      - c1
    - d11
```

</td><td>

```buffer
- a
  - b
- d
  - d1
    - d11
  - c┃
    - c1
```

</td></tr>
</table>

### [MoveUp5](../spec/move-subtree-up.md#moveup5)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
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

### [MoveUp6](../spec/move-subtree-up.md#moveup6)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b
- c
  - d┃
```

</td></tr>
</table>

> moveSubtreeUp

<table>
<tr><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b
- d┃
- c
```

</td><td>

```buffer
- a
  - b
  - d┃
- c
```

</td></tr>
</table>

> moveSubtreeUp

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
  - d┃
  - b
- c
```

</td></tr>
</table>

### [MoveUp8](../spec/move-subtree-up.md#moveup8)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
- b
  - c┃
    - c1
```

</td></tr>
</table>

> moveSubtreeUp

<table>
<tr><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- c┃
  - c1
- b
```

</td><td>

```buffer
- a
  - c┃
    - c1
- b
```

</td></tr>
</table>

> moveSubtreeDown

<table>
<tr><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b
- c┃
  - c1
```

</td><td>

```buffer
- a
- b
  - c┃
    - c1
```

</td></tr>
</table>

### [MoveUp9](../spec/move-subtree-up.md#moveup9)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - a1
    - a11
- b
  - c┃
    - c1
  - d
```

</td><td>

```buffer
- a
  - a1
    - a11
- c┃
  - c1
- b
  - d
```

</td><td>

```buffer
- a
  - a1
    - a11
  - c┃
    - c1
- b
  - d
```

</td></tr>
</table>

### [MoveUp46](../spec/move-subtree-up.md#moveup46)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b
  - «c»
```

</td><td>

```buffer
- a
- «c»
- b
```

</td><td>

```buffer
- a
  - «c»
- b
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
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- top
  - sib┃
```

</td><td>

```buffer
- top
  - sib
  - a
  - b
    - c┃
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
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- a
- 1. x
- 2. y┃
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
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

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

### [PasteList10](../spec/paste-list.md#pastelist10)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
Notes:
- x
- y
```

</td></tr>
</table>

> paste

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- a
- Notes:
  - x
  - y┃
- b
```

</td><td>

```buffer
- a
- Notes:
- x
- y┃
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
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a«bc»d
- e
```

</td><td>

```buffer
- ax┃d
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
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
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

</td><td>

```buffer
- a
  - b┃
  - c
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

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Inbox┃
```

</td><td>

```buffer
- Inbox
- o Draft announcement
- · Send update
- · Archive notes┃
```

</td><td>

```buffer
- Inbox
- Draft announcement
- Send update
- Archive notes┃
```

</td></tr>
</table>

### [Scenario8](../spec/scenarios.md#scenario8)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- Inbox
- Work┃
  - email
- Home
  - plants
```

</td></tr>
</table>

> moveSubtreeUp

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- Work┃
  - email
- Inbox
- Home
  - plants
```

</td></tr>
</table>

> moveSubtreeDown moveSubtreeDown

<table>
<tr><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Inbox
- Home
  - Work┃
    - email
  - plants
```

</td><td>

```buffer
- Inbox
- Home
  - plants
- Work┃
  - email
```

</td></tr>
</table>

> moveSubtreeUp indent

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- Inbox
  - Work┃
    - email
- Home
  - plants
```

</td></tr>
</table>

> outdent

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- Inbox
- Work┃
  - email
- Home
  - plants
```

</td></tr>
</table>

### [Scenario9](../spec/scenarios.md#scenario9)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- Inbox
  - call Ann
  - buy milk┃
- Errands
```

</td></tr>
</table>

> moveSubtreeDown

<table>
<tr><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Inbox
  - call Ann
- Errands
- buy milk┃
```

</td><td>

```buffer
- Inbox
  - call Ann
- Errands
  - buy milk┃
```

</td></tr>
</table>

> enter "post a letter" moveSubtreeUp

<table>
<tr><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Inbox
  - call Ann
- Errands
- post a letter┃
- buy milk
```

</td><td>

```buffer
- Inbox
  - call Ann
- Errands
  - post a letter┃
  - buy milk
```

</td></tr>
</table>

> cursorDocStart cursorLineBoundaryForward moveSubtreeDown

<table>
<tr><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Errands
- Inbox┃
  - call Ann
- post a letter
- buy milk
```

</td><td>

```buffer
- Errands
  - post a letter
  - buy milk
- Inbox┃
  - call Ann
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
<tr><th>mubu</th><th>ourus</th></tr>
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
<tr><th>mubu</th><th>ourus</th></tr>
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

### [Scenario14](../spec/scenarios.md#scenario14)

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

> moveSubtreeDown

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
- c
  - b┃
  - d
```

</td></tr>
</table>

> moveSubtreeUp

<table>
<tr><th>mubu</th><th>ourus</th></tr>
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

### [SubtreeEdit1](../spec/subtree-selection.md#subtreeedit1)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- «b»
- c
```

</td><td>

```buffer
- a
- ┃
- c
```

</td><td>

```buffer
- a┃
- c
```

</td></tr>
</table>

### [SubtreeEdit2](../spec/subtree-selection.md#subtreeedit2)

> deleteContentForward

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- «b»
  - b1
- c
```

</td><td>

```buffer
- a
- ┃
  - b1
- c
```

</td><td>

```buffer
- a┃
- c
```

</td></tr>
</table>

### [SubtreeEdit6](../spec/subtree-selection.md#subtreeedit6)

> cut

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- «b»
  - b1
- c
```

</td><td>

```buffer
- a
- ┃
  - b1
- c
```

</td><td>

```buffer
- a┃
- c
```

</td></tr>
</table>

### [SubtreeEdit7](../spec/subtree-selection.md#subtreeedit7)

> "xy"

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- «b»
- c
```

</td><td>

```buffer
- a
- xy┃
- c
```

</td><td>

```buffer
- a
- «b»
- c
```

</td></tr>
</table>

### [SubtreeEdit8](../spec/subtree-selection.md#subtreeedit8)

> "x"

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- «b»
  - b1
- c
```

</td><td>

```buffer
- a
- x┃
  - b1
- c
```

</td><td>

```buffer
- a
- «b»
  - b1
- c
```

</td></tr>
</table>

### [SubtreeEdit12](../spec/subtree-selection.md#subtreeedit12)

> enter

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- «b»
  - b1
- c
```

</td><td>

```buffer
- a
- b
  - ┃
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
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- «b»
  - b1
- c
```

</td><td>

```buffer
- a
- b
  - p
  - q┃
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

## Whitespace (2)

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
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
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

## Caret (5)

### [Backspace17](../spec/backspace.md#backspace17)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
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

### [CursorUp3](../spec/cursor.md#cursorup3)

> cursorLineUp

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b
- c┃
```

</td><td>

```buffer
- a
  - b
- ┃c
```

</td><td>

```buffer
- a
  - ┃b
- c
```

</td></tr>
</table>

### [CursorDown3](../spec/cursor.md#cursordown3)

> cursorLineDown

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃a
  - b
```

</td><td>

```buffer
- a┃
  - b
```

</td><td>

```buffer
- a
  - ┃b
```

</td></tr>
</table>

### [Enter65f](../spec/enter.md#enter65f)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- one two┃ three
  - c
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
  - c
```

</td></tr>
</table>

> cursorLineDown

<table>
<tr><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one two
-  three┃
  - c
```

</td><td>

```buffer
- one two
-  three
  - ┃c
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
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃b
```

</td><td>

```buffer
- ax **y**b┃
```

</td><td>

```buffer
- ax **y**┃b
```

</td></tr>
</table>

## Adapted: disagree (110)

### [Auto1](../spec/auto.md#auto1)

Adapted: as blocks, escape, paragraph

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- revise ┃2. draft
```

</td></tr>
</table>

> enter

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- revise 
- ┃2. draft
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- revise┃2. draft
```

</td><td>

```buffer
- revise ┃2. draft
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter</th><th>deleteContentBackward</th></tr>
<tr valign="top"><td>

```buffer
revise ┃2. draft
```

</td><td>

```buffer
- revise 
- ┃2\. draft
```

</td><td>

```buffer
- revise ┃2. draft
```

</td></tr>
</table>

### [Auto2](../spec/auto.md#auto2)

Adapted: as blocks, escape, paragraph

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- revise ┃2\. draft
```

</td></tr>
</table>

> enter

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- revise 
- ┃2\. draft
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- revise┃2\. draft
```

</td><td>

```buffer
- revise ┃2\. draft
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter</th><th>deleteContentBackward</th></tr>
<tr valign="top"><td>

```buffer
revise ┃2\. draft
```

</td><td>

```buffer
- revise 
- ┃2\. draft
```

</td><td>

```buffer
- revise ┃2\. draft
```

</td></tr>
</table>

### [Auto28](../spec/auto.md#auto28)

Adapted: as blocks, paragraph

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a┃
```

</td></tr>
</table>

> " $$"

<table>
<tr><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a $$┃
```

</td><td>

```buffer
- a $$┃$$
```

</td></tr>
</table>

> "x"

<table>
<tr><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a $$x┃
```

</td><td>

```buffer
- a $$x┃$$
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>" $$"</th><th>"x"</th></tr>
<tr valign="top"><td>

```buffer
a┃
```

</td><td>

```buffer
- a $$┃$$
```

</td><td>

```buffer
- a $$x┃$$
```

</td></tr>
</table>

### [Backspace12d](../spec/backspace.md#backspace12d)

> deleteContentBackward

Adapted: as blocks, blank lines, paragraph, under joinWithChildren: refuse

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃b
  - x
```

</td><td>

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
- a┃b
  - x
```

</td></tr>
</table>

### [Backspace15](../spec/backspace.md#backspace15)

> deleteContentBackward

Adapted: as blocks, blank lines, paragraph

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
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

### [Backspace18g](../spec/backspace.md#backspace18g)

> deleteContentBackward

Adapted: as blocks, heading, paragraph, under headingEditing: block

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
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
<tr><th>mubu</th><th>ourus</th></tr>
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
<tr><th>mubu</th><th>ourus</th></tr>
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

### [Backspace20](../spec/backspace.md#backspace20)

> deleteContentBackward

Adapted: as blocks, blank lines, paragraph

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
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

### [Backspace22](../spec/backspace.md#backspace22)

> deleteContentBackward

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
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

Adapted: as blocks, blank lines, numbered list, paragraph

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- p
  - ┃t
  - m
```

</td><td>

```buffer
- p
  - ┃t
  - m
```

</td><td>

```buffer
- p┃t
  - m
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
  - m
```

</td></tr>
</table>

### [Backspace41](../spec/backspace.md#backspace41)

> deleteContentBackward

Adapted: as blocks, list as an item's first block

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
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

### [DeleteSubtree6](../spec/delete-subtree.md#deletesubtree6)

> deleteSubtree "x"

Adapted: paragraph

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
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

### [Delete5](../spec/delete.md#delete5)

> deleteContentForward

Adapted: under emptyItemWithChildren: refuse, under joinWithChildren: refuse

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
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
- ┃d
  - a
    - b
  - c
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

Adapted: under emptyItemWithChildren: refuse, under joinWithChildren: refuse

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
<tr><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃e
    - b
      - c
    - d
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

### [Delete17](../spec/delete.md#delete17)

> deleteContentForward

Adapted: as blocks, blank lines, paragraph

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
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
<tr><th>mubu</th><th>ourus</th></tr>
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
<tr><th>mubu</th><th>ourus</th></tr>
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

### [Enter32](../spec/enter.md#enter32)

> enter

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- para
- # ┃Title
  - body
```

</td><td>

```buffer
- para
- # ┃
- # Title
  - body
```

</td><td>

```buffer
- para
- ┃
- # Title
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

# ┃Title

body
```

</td><td>

```buffer
para

┃◌

# Title

body
```

</td></tr>
</table>

### [Enter42](../spec/enter.md#enter42)

> enter

Adapted: escape, heading, paragraph, setext heading

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # title ┃- x
```

</td><td>

```buffer
- # title 
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
title␠
===
┃\- x
```

</td></tr>
</table>

### [Enter64](../spec/enter.md#enter64)

Adapted: under enterSplitSpace: start

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- one two ┃ three
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

> deleteContentBackward

<table>
<tr><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one two┃ three
```

</td><td>

```buffer
- one two ┃ three
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter</th><th>deleteContentBackward</th></tr>
<tr valign="top"><td>

```buffer
- one two ┃ three
```

</td><td>

```buffer
- one two 
- ┃ three
```

</td><td>

```buffer
- one two ┃ three
```

</td></tr>
</table>

### [Enter65g](../spec/enter.md#enter65g)

Adapted: as blocks, task

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
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- [ ] one two
- [ ] ┃ three
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] one two
- ┃ three
```

</td><td>

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

### [Enter65l](../spec/enter.md#enter65l)

Adapted: heading, paragraph

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
<tr><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # one two
- # ┃ three
```

</td><td>

```buffer
- # one two
  - ┃ three
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- # one two┃ three
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
# one two
┃ three
```

</td><td>

```buffer
# one two┃ three
```

</td></tr>
</table>

### [Enter65m](../spec/enter.md#enter65m)

Adapted: escape, heading, paragraph

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
<tr><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # one two
- # ┃ - x
```

</td><td>

```buffer
- # one two
  - ┃ - x
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- # one two┃ - x
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
# one two
┃ \- x
```

</td><td>

```buffer
# one two┃ - x
```

</td></tr>
</table>

### [Enter45](../spec/enter.md#enter45)

> enter

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- para
- # ┃Title
```

</td><td>

```buffer
- para
- # ┃
- # Title
```

</td><td>

```buffer
- para
- ┃
- # Title
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para
# ┃Title
```

</td><td>

```buffer
para

┃◌

# Title
```

</td></tr>
</table>

### [Enter47](../spec/enter.md#enter47)

Adapted: as blocks, paragraph

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
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- [Note]: this 
- ┃matters a lot
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [Note]: this┃matters a lot
```

</td><td>

```buffer
- [Note]: this ┃matters a lot
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter</th><th>deleteContentBackward</th></tr>
<tr valign="top"><td>

```buffer
[Note]: this ┃matters a lot
```

</td><td>

```buffer
- [Note]\: this 
- ┃matters a lot
```

</td><td>

```buffer
- [Note]: this ┃matters a lot
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
<tr><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ## one
  
  ┃​two
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

> deleteContentBackward

<table>
<tr><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ## one
  ┃​two
  three
```

</td><td>

```buffer
- ## one┃two
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
<tr><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ## one
  two
  ┃​
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
---
┃two
three
```

</td><td>

```buffer
one┃two
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
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ## one
  ┃two
- ## three
```

</td><td>

```buffer
- ## one
  
  ┃​two
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

### [Enter57](../spec/enter.md#enter57)

> enter

Adapted: as blocks, escape, paragraph

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- p
  #┃a
```

</td><td>

```buffer
- p
  \#
  ┃​a
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

Adapted: escape, heading, paragraph, setext heading, under enterSplitSpace: start

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
<tr><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # title
- # ┃ - x
```

</td><td>

```buffer
- # title
  - ┃ - x
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- # title┃ - x
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
===
┃ \- x
```

</td><td>

```buffer
title┃ - x
===
```

</td></tr>
</table>

### [Enter69](../spec/enter.md#enter69)

> enter

Adapted: as blocks, heading

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Hel┃lo
- next
```

</td><td>

```buffer
- # Hel
- # ┃lo
- next
```

</td><td>

```buffer
- # Hel
- ┃lo
- next
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Hel┃lo
- next
```

</td><td>

```buffer
- # Hel
- ┃lo
- next
```

</td></tr>
</table>

### [Gap3](../spec/gaps.md#gap3)

> moveSubtreeUp

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # A
  - text
- # B┃
  - more
- # C
```

</td><td>

```buffer
- # A
  - # B┃
    - more
  - text
- # C
```

</td><td>

```buffer
- # B┃
  - more
- # A
  - text
- # C
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# A
text

# B┃
more

# C
```

</td><td>

```buffer
# B┃
more

# A
text

# C
```

</td></tr>
</table>

### [Gap5](../spec/gaps.md#gap5)

> moveSubtreeUp

Adapted: as blocks, blank lines

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - a1
- b┃
- c
```

</td><td>

```buffer
- a
  - b┃
  - a1
- c
```

</td><td>

```buffer
- b┃
- a
  - a1
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
  - a1

- b┃
- c
```

</td><td>

```buffer
- b┃
- a
  - a1
- c
```

</td></tr>
</table>

### [Gap6](../spec/gaps.md#gap6)

> moveSubtreeDown

Adapted: heading, paragraph

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ## A┃
  - a
- ## B
  - b
- ## C
```

</td><td>

```buffer
- ## B
  - ## A┃
    - a
  - b
- ## C
```

</td><td>

```buffer
- ## B
  - b
- ## A┃
  - a
- ## C
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
## A┃
a
## B
b
## C
```

</td><td>

```buffer
## B
b
## A┃
a
## C
```

</td></tr>
</table>

### [Lists7](../spec/lists.md#lists7)

> moveSubtreeDown

Adapted: as blocks, blank lines, paragraph

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
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
  - b┃
  - c
```

</td><td>

```buffer
- a
- para
  - c
- b┃
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
- para
  - c
- b┃
```

</td></tr>
</table>

### [MoveDown4](../spec/move-subtree-down.md#movedown4)

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- # A┃
  - text a
- # B
  - text b
```

</td></tr>
</table>

> moveSubtreeDown

<table>
<tr><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # B
  - # A┃
    - text a
  - text b
```

</td><td>

```buffer
- # B
  - text b
- # A┃
  - text a
```

</td></tr>
</table>

> moveSubtreeUp

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- # A┃
  - text a
- # B
  - text b
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>moveSubtreeDown</th><th>moveSubtreeUp</th></tr>
<tr valign="top"><td>

```buffer
# A┃

text a

# B

text b
```

</td><td>

```buffer
# B

text b

# A┃

text a
```

</td><td>

```buffer
# A┃

text a

# B

text b
```

</td></tr>
</table>

### [MoveDown16](../spec/move-subtree-down.md#movedown16)

> moveSubtreeDown

Adapted: heading

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # A┃
  - x
- # B
  - y
```

</td><td>

```buffer
- # B
  - # A┃
    - x
  - y
```

</td><td>

```buffer
- # B
  - y
- # A┃
  - x
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# A┃
- x
# B
- y
```

</td><td>

```buffer
# B
- y
# A┃
- x
```

</td></tr>
</table>

### [MoveDown30](../spec/move-subtree-down.md#movedown30)

> moveSubtreeDown

Adapted: as blocks, numbered list

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
  - x
```

</td><td>

```buffer
- b
  - a┃
  - x
```

</td><td>

```buffer
- b
  - x
- a┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
9. a┃
10. b
    - x
```

</td><td>

```buffer
- b
  - x
- a┃
```

</td></tr>
</table>

### [MoveUp3](../spec/move-subtree-up.md#moveup3)

> moveSubtreeUp

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # A
  - text a
- # B┃
  - text b
```

</td><td>

```buffer
- # A
  - # B┃
    - text b
  - text a
```

</td><td>

```buffer
- # B┃
  - text b
- # A
  - text a
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# A

text a

# B┃

text b
```

</td><td>

```buffer
# B┃

text b

# A

text a
```

</td></tr>
</table>

### [MoveUp7](../spec/move-subtree-up.md#moveup7)

> moveSubtreeUp

Adapted: as blocks, blank lines, paragraph

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
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
- para
  - c
```

</td></tr>
</table>

### [MoveUp15](../spec/move-subtree-up.md#moveup15)

> moveSubtreeUp

Adapted: as blocks, numbered list

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - x
- b┃
```

</td><td>

```buffer
- a
  - b┃
  - x
```

</td><td>

```buffer
- b┃
- a
  - x
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
9. a
   - x
10. b┃
```

</td><td>

```buffer
- b┃
- a
  - x
```

</td></tr>
</table>

### [MoveUp16](../spec/move-subtree-up.md#moveup16)

> moveSubtreeUp

Adapted: heading

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # A
  - ## a1
- # B┃
  - ## b1
```

</td><td>

```buffer
- # A
  - # B┃
    - ## b1
  - ## a1
```

</td><td>

```buffer
- # B┃
  - ## b1
- # A
  - ## a1
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# A
## a1
# B┃
## b1
```

</td><td>

```buffer
# B┃
## b1
# A
## a1
```

</td></tr>
</table>

### [TO-E4](../spec/obsidian-true-outliner.md#to-e4)

> enter

Adapted: under enterSplitSpace: start

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- first
  second┃ line
```

</td><td>

```buffer
- first
  second
  ┃​ line
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

### [TO-E15](../spec/obsidian-true-outliner.md#to-e15)

> enter

Adapted: heading, paragraph

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Head┃line
  - item
```

</td><td>

```buffer
- # Head
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

### [TO-E17](../spec/obsidian-true-outliner.md#to-e17)

> enter

Adapted: heading, paragraph, setext heading, under enterSplitSpace: start

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Hello┃ world
```

</td><td>

```buffer
- # Hello
- # ┃ world
```

</td><td>

```buffer
- # Hello
  - ┃ world
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
┃ world
```

</td></tr>
</table>

### [TO-E13-E16b](../spec/obsidian-true-outliner.md#to-e13-e16b)

> enter

Adapted: heading, paragraph

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # He┃ad
  - ## Sub
```

</td><td>

```buffer
- # He
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

### [TO-E14-E20](../spec/obsidian-true-outliner.md#to-e14-e20)

> enter

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Head┃line
  - Body.
```

</td><td>

```buffer
- # Head
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

### [TO5](../spec/obsidian-true-outliner.md#to5)

> deleteContentBackward

Adapted: as blocks, numbered list

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- p
  - ┃a
  - b
```

</td><td>

```buffer
- p
  - ┃a
  - b
```

</td><td>

```buffer
- p┃a
  - b
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- p
  1. ┃a
  2. b
```

</td><td>

```buffer
- p┃a
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

Adapted: empty document

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
-  done
-  todo┃
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
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- ## Title
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
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
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
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- 1. not a list, *x* and [y]
- # not a heading┃
```

</td><td>

```buffer
- 1. not a list, \*x\* and \[y\]
- \# not a heading┃
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
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- **Bold startnested**┃
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
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
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

Adapted: numbered list

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
```

</td><td>

```buffer
- a
- x
  - 1. x1
- y┃
```

</td><td>

```buffer
- a
- x
  - x1
- y┃
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
- x
  1. x1
- y┃
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
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
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
- ab
- x
- - y┃
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
- ab
- x
- \- y┃
```

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

Adapted: escape, under pastePlainLines: items

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
```

</td><td>

```buffer
- a
- x
  - 2. y┃
```

</td><td>

```buffer
- a
- x
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
- x
- 2\. y┃
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

Adapted: escape, under pastePlainLines: items

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃b
```

</td><td>

```buffer
- ax^2b┃
```

</td><td>

```buffer
- ab
- $$
- x^2
- $$┃
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
- ab
- \$$
- x^2
- \$$┃
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

Adapted: escape, under pastePlainLines: items

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- 2┃. y
```

</td><td>

```buffer
- 2. y
- 1. a
- 2. b┃
```

</td><td>

```buffer
- 2. y
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
- 2┃\. y
```

</td><td>

```buffer
- 2\. y
- a
- b┃
```

</td></tr>
</table>

### [PastePlain11](../spec/paste-plain.md#pasteplain11)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
x
```

</td></tr>
</table>

> pastePlain

Adapted: as blocks, paragraph, under pastePlainLines: items

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [a]: ┃b c
```

</td><td>

```buffer
- [a]: x┃b c
```

</td><td>

```buffer
- [a]: b c
- x┃
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
- [a]: b c
- x┃
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

Adapted: as blocks, paragraph, under pastePlainLines: items

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- p┃ ---
```

</td><td>

```buffer
- px┃ ---
```

</td><td>

```buffer
- p ---
- x┃
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
- p ---
- x┃
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
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
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
  b
- x┃
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
  b
- x┃
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

Adapted: as blocks, paragraph, under pastePlainLines: items

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃abc
```

</td><td>

```buffer
- x┃abc
```

</td><td>

```buffer
- abc
- x┃
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
- abc
- x┃
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

Adapted: as blocks, blank lines, paragraph, under pastePlainLines: items

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- p
- ┃abc
```

</td><td>

```buffer
- p
- x┃abc
```

</td><td>

```buffer
- p
- abc
- x┃
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
- abc
- x┃
```

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

Adapted: escape

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
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
- ab
- x
- - y┃
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
- ab
- x
- \- y┃
```

</td></tr>
</table>

### [Placeholder4d](../spec/placeholders.md#placeholder4d)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
x
```

</td></tr>
</table>

Adapted: under pasteLines: items

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td></tr>
</table>

> paste

<table>
<tr><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

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

> cursorDocStart

<table>
<tr><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃ax
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
<tr><th>buffer</th><th>paste</th><th>cursorDocStart</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- a
- x┃
- b
```

</td><td>

```buffer
┃- a
- x
- b
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
<tr><th>mubu</th><th>ourus</th></tr>
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

### [Regression1](../spec/regressions.md#regression1)

> deleteContentBackward

Adapted: as blocks, bullet *, numbered list

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃b
  - x
```

</td><td>

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
  - x
```

</td></tr>
</table>

### [Regression2](../spec/regressions.md#regression2)

> deleteContentBackward

Adapted: escape

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  1\. 
- ┃b
```

</td><td>

```buffer
- a┃b
  1\. 
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
<tr><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- p0
  2\. m1
  3. ┃​
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
<tr><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- p0
  2\. m1
  3\.┃
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

Adapted: as blocks, paragraph, under pastePlainLines: items

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- «ab»c
```

</td><td>

```buffer
- x┃c
```

</td><td>

```buffer
- abc
- x┃
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
- abc
- x┃
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
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one ┃two
```

</td><td>

```buffer
- one x┃two
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

### [Regression22](../spec/regressions.md#regression22)

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
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one ┃two
```

</td><td>

```buffer
- one x┃two
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

### [Regression32](../spec/regressions.md#regression32)

> deleteContentForward

Adapted: escape

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
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
- para┃→\- a
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
- para┃→\- a
```

</td></tr>
</table>

### [Regression53](../spec/regressions.md#regression53)

> deleteSoftLineBackward

Adapted: setext heading, task

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
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

Adapted: as blocks, numbered list, under pastePlainLines: items

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- x
  - [x] 
      cont┃
```

</td><td>

```buffer
- x
  - [x] 
      contx
    y┃
```

</td><td>

```buffer
- x
  - [x] 
      cont
  - x
  - \# y┃
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
- x
  - [x] 
      cont
  - x
  - \# y┃
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

Adapted: as blocks, numbered list, under pasteOverSelection: ignore

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- «x»
- b
```

</td><td>

```buffer
- a
- «x»
- b
```

</td><td>

```buffer
- a
- x
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
- a
1. «x»
  1. b
```

</td><td>

```buffer
- a
- x
- x┃
- b
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

Adapted: under pasteOverSelection: ignore

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [x] 
   «    - b»
```

</td><td>

```buffer
- [x] 
   -
  x┃
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
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
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

### [Regression88](../spec/regressions.md#regression88)

<table>
<tr><th colspan=2>clipboard</tr>
<tr><td>text/plain<td>text/html</tr>
<tr valign="top"><td>

```clipboard
x y
```

</td><td>

```clipboard
<p><a href="/u">x</a> <a href="https://example.com/a&gt;b">y</a></p>
```

</td></tr>
</table>

> paste

Adapted: empty document, paragraph

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- [x](http://u/) [y](https://example.com/a%3Eb)┃
```

</td><td>

```buffer
- [x](/u) [y](https://example.com/a>b)┃
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
[x](/u) [y](https://example.com/a>b)┃
```

</td></tr>
</table>

### [Regression138](../spec/regressions.md#regression138)

> deleteContentBackward

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
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

Adapted: as blocks, numbered list

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- 
- c┃
     a
```

</td><td>

```buffer
- 
- c- ┃
     a
```

</td><td>

```buffer
- 
- c
     a
- ┃
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
- 
- c
     a
- ┃
```

</td></tr>
</table>

### [Regression174](../spec/regressions.md#regression174)

> moveSubtreeUp

Adapted: as blocks, bullet +, list as an item's first block

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- b
- 
  - ┃c
```

</td><td>

```buffer
- b
- ┃c
- 
```

</td><td>

```buffer
- b
  - ┃c
- 
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
+ b
- - ┃c
```

</td><td>

```buffer
- b
  - ┃c
- 
```

</td></tr>
</table>

### [Regression175](../spec/regressions.md#regression175)

> moveSubtreeUp

Adapted: as blocks, list as an item's first block, numbered list

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- 
  - ┃b
```

</td><td>

```buffer
- a
- ┃b
- 
```

</td><td>

```buffer
- a
  - ┃b
- 
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a
2. - ┃b
```

</td><td>

```buffer
- a
  - ┃b
- 
```

</td></tr>
</table>

### [Regression220](../spec/regressions.md#regression220)

> moveSubtreeUp

Adapted: heading, paragraph

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Old
  - ## B
    - x
  - ## C
- # New┃
  - ## B
    - x
  - ## C
```

</td><td>

```buffer
- # Old
  - ## B
    - x
  - # New┃
    - ## B
      - x
    - ## C
  - ## C
```

</td><td>

```buffer
- # New┃
  - ## B
    - x
  - ## C
- # Old
  - ## B
    - x
  - ## C
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Old①
## B
x
## C
# New┃②
## B
x
## C
```

</td><td>

```buffer
# New┃②
## B
x
## C
# Old①
## B
x
## C
```

</td></tr>
</table>

### [Scenario7](../spec/scenarios.md#scenario7)

Adapted: under enterSplitSpace: start

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
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- buy milk
- ┃ and eggs
- call Ann
```

</td></tr>
</table>

> deleteContentBackward " "

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- buy milk ┃ and eggs
- call Ann
```

</td></tr>
</table>

> cursorLineBoundaryBackward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- ┃buy milk  and eggs
- call Ann
```

</td></tr>
</table>

> enter "today:"

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- today:┃
- buy milk  and eggs
- call Ann
```

</td></tr>
</table>

> cursorLineDown cursorLineDown cursorLineBoundaryForward deleteContentBackward cursorCharLeft deleteContentForward

<table>
<tr><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- today:
- buy milk  and eg┃
- call Ann
```

</td><td>

```buffer
- today:
- buy milk  and eggs
- call A┃
```

</td></tr>
</table>

> cursorLineUp cursorLineBoundaryForward deleteContentForward

<table>
<tr><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- today:
- buy milk  and eg┃call Ann
```

</td><td>

```buffer
- today:
- buy milk  and eggs┃call A
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter</th><th>deleteContentBackward " "</th><th>cursorLineBoundaryBackward</th><th>enter "today:"</th><th>cursorLineDown cursorLineDown cursorLineBoundaryForward deleteContentBackward cursorCharLeft deleteContentForward</th><th>cursorLineUp cursorLineBoundaryForward deleteContentForward</th></tr>
<tr valign="top"><td>

```buffer
- buy milk┃ and eggs
- call Ann
```

</td><td>

```buffer
- buy milk
- ┃ and eggs
- call Ann
```

</td><td>

```buffer
- buy milk ┃ and eggs
- call Ann
```

</td><td>

```buffer
- ┃buy milk  and eggs
- call Ann
```

</td><td>

```buffer
- today:┃
- buy milk  and eggs
- call Ann
```

</td><td>

```buffer
- today:
- buy milk  and eggs
- call A┃
```

</td><td>

```buffer
- today:
- buy milk  and eggs┃call A
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
<tr><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b┃
    - b1
  - c
```

</td><td>

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
<tr><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - c
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

### [Scenario22](../spec/scenarios.md#scenario22)

Adapted: blank lines, heading

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- # Work┃
  - email
- # Home
  - plants
```

</td></tr>
</table>

> moveSubtreeDown

<table>
<tr><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Home
  - # Work┃
    - email
  - plants
```

</td><td>

```buffer
- # Home
  - plants
- # Work┃
  - email
```

</td></tr>
</table>

> moveSubtreeUp

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- # Work┃
  - email
- # Home
  - plants
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>moveSubtreeDown</th><th>moveSubtreeUp</th></tr>
<tr valign="top"><td>

```buffer
# Work┃

- email

# Home

- plants
```

</td><td>

```buffer
# Home

- plants

# Work┃

- email
```

</td><td>

```buffer
# Work┃

- email

# Home

- plants
```

</td></tr>
</table>

### [TaskEnter2](../spec/tasks.md#taskenter2)

> enter

Adapted: as blocks, task

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
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

### [TaskEnter5](../spec/tasks.md#taskenter5)

> enter

Adapted: as blocks, task

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
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

Adapted: as blocks, task

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
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

### [TaskEnter10](../spec/tasks.md#taskenter10)

Adapted: as blocks, task

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
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- [ ] a
- [ ] ┃ b
  - c
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] a
- ┃ b
  - c
```

</td><td>

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

### [TaskDelete2](../spec/tasks.md#taskdelete2)

> deleteContentForward

Adapted: as blocks, task

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
- [x] a
```

</td><td>

```buffer
- ┃a
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

## Adapted: whitespace (9)

### [Delete5d](../spec/delete.md#delete5d)

> deleteContentForward

Adapted: under emptyItemWithChildren: refuse, under joinWithChildren: refuse

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- p┃
```

</td><td>

```buffer
- p
- x
-  y┃
```

</td><td>

```buffer
- p
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
p┃
```

</td><td>

```buffer
- p
- x
- y┃
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
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃a
```

</td><td>

```buffer
- a
-     first
-     second┃
```

</td><td>

```buffer
- a
- first
- second┃
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
- a
- first
- second┃
```

</td></tr>
</table>

### [PastePlain20](../spec/paste-plain.md#pasteplain20)

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

Adapted: under pastePlainLines: items

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
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

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
- a
- b┃
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
<tr><th>mubu</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
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

### [Regression136](../spec/regressions.md#regression136)

> deleteSoftLineBackward

Adapted: heading, setext heading

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
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

### [Regression268](../spec/regressions.md#regression268)

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
-  a┃
  -   b
```

</td></tr>
</table>

> deleteSoftLineBackward

<table>
<tr><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
  -   b
```

</td><td>

```buffer
- ┃
  -    b
```

</td></tr>
</table>

> "c"

<table>
<tr><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- c┃
  -   b
```

</td><td>

```buffer
- c┃
  -    b
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>deleteSoftLineBackward</th><th>"c"</th></tr>
<tr valign="top"><td>

```buffer
-  a┃

     b
```

</td><td>

```buffer
- ┃◌

     b
```

</td><td>

```buffer
- c┃

     b
```

</td></tr>
</table>

## Adapted: caret (9)

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
<tr><th>mubu</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
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

### [CursorDown5](../spec/cursor.md#cursordown5)

> cursorLineDown

Adapted: as blocks, task

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
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

### [DeleteSubtree3](../spec/delete-subtree.md#deletesubtree3)

> deleteSubtree

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- para┃
  - x
- # H
```

</td><td>

```buffer
- # H┃
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

Adapted: as blocks, task

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - a1
- [ ] b
```

</td><td>

```buffer
- [ ] b┃
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

### [Enter59](../spec/enter.md#enter59)

> enter

Adapted: as blocks, paragraph

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
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

### [Lists9](../spec/lists.md#lists9)

> deleteSubtree

Adapted: as blocks, blank lines, paragraph

<table>
<tr><th>buffer</th><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Intro┃
  - a
  - b
- Next
```

</td><td>

```buffer
- Next┃
```

</td><td>

```buffer
- ┃Next
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Intro┃
- a
- b

Next
```

</td><td>

```buffer
- ┃Next
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
<tr><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Work
  - email
- # Home
  - [x] review
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

### [Undo3](../spec/undo.md#undo3)

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
<tr><th>mubu</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
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
<tr><th>buffer</th></tr>
<tr valign="top"><td>

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
- ┃
```

</td><td>

```buffer
- a┃
- 
```

</td></tr>
</table>

## Skipped (1043)

| example | why |
| --- | --- |
| **auto.md** | |
| [Auto3](../spec/auto.md#auto3) | code block (expected) |
| [Auto4](../spec/auto.md#auto4) | code block (expected) |
| [Auto5](../spec/auto.md#auto5) | code block (expected) |
| [Auto6](../spec/auto.md#auto6) | code block |
| [Auto7](../spec/auto.md#auto7) | code block (expected) |
| [Auto8](../spec/auto.md#auto8) | option autoClose: ``` ~~~ ` |
| [Auto9](../spec/auto.md#auto9) | option autoClose: ``` ~~~ ` |
| [Auto10](../spec/auto.md#auto10) | option autoClose: ``` ~~~ ` |
| [Auto12](../spec/auto.md#auto12) | option autoClose: ``` ~~~ ( [ { |
| [Auto13](../spec/auto.md#auto13) | option autoClose: ``` ~~~ ( [ { |
| [Auto14](../spec/auto.md#auto14) | option autoClose: ``` ~~~ ( [ { |
| [Auto15](../spec/auto.md#auto15) | option autoClose: ``` ~~~ ( [ { |
| [Auto16](../spec/auto.md#auto16) | option autoClose: ``` ~~~ ( [ { |
| [Auto17](../spec/auto.md#auto17) | option autoClose: ``` ~~~ ( [ { |
| [Auto18](../spec/auto.md#auto18) | option autoClose: ``` ~~~ ( [ { |
| [Auto19](../spec/auto.md#auto19) | option autoClose: ``` ~~~ ( [ { |
| [Auto20](../spec/auto.md#auto20) | option autoClose: ``` ~~~ ( [ { |
| [Auto20b](../spec/auto.md#auto20b) | option autoClose: ``` ~~~ ( [ { |
| [Auto21](../spec/auto.md#auto21) | option autoClose: ``` ~~~ [[ (( |
| [Auto23](../spec/auto.md#auto23) | action shiftEnter |
| [Auto24](../spec/auto.md#auto24) | action shiftEnter |
| [Auto25](../spec/auto.md#auto25) | action shiftEnter |
| [Auto26](../spec/auto.md#auto26) | option autoClose: ``` ~~~ ( [ { |
| [Auto27](../spec/auto.md#auto27) | math |
| [Auto29](../spec/auto.md#auto29) | math (expected) |
| [Auto30](../spec/auto.md#auto30) | caret past a node's trailing spaces, which Mubu doesn't draw |
| [Auto31](../spec/auto.md#auto31) | caret past a node's trailing spaces, which Mubu doesn't draw |
| [Auto32](../spec/auto.md#auto32) | comment (expected) |
| [Auto33](../spec/auto.md#auto33) | html (expected) |
| [Auto34](../spec/auto.md#auto34) | caret past a node's trailing spaces, which Mubu doesn't draw |
| [Auto36](../spec/auto.md#auto36) | option autoClose: ``` ~~~ $ |
| [Auto37](../spec/auto.md#auto37) | option autoClose: ``` ~~~ $ |
| [Auto38](../spec/auto.md#auto38) | option autoClose: ``` ~~~ $ |
| **backspace.md** | |
| [Backspace2](../spec/backspace.md#backspace2) | caret in a marker |
| [Backspace4](../spec/backspace.md#backspace4) | heading's closing #s |
| [Backspace12e](../spec/backspace.md#backspace12e) | tag free-form |
| [Backspace14](../spec/backspace.md#backspace14) | tag free-form |
| [Backspace16](../spec/backspace.md#backspace16) | code block |
| [Backspace17e](../spec/backspace.md#backspace17e) | tag free-form |
| [Backspace18](../spec/backspace.md#backspace18) | tag free-form |
| [Backspace18b](../spec/backspace.md#backspace18b) | tag free-form |
| [Backspace18c](../spec/backspace.md#backspace18c) | tag free-form |
| [Backspace18d](../spec/backspace.md#backspace18d) | tag free-form |
| [Backspace19b](../spec/backspace.md#backspace19b) | tag free-form |
| [Backspace23](../spec/backspace.md#backspace23) | tag free-form |
| [Backspace24](../spec/backspace.md#backspace24) | code block |
| [Backspace26](../spec/backspace.md#backspace26) | changes only what blocks can't show |
| [Backspace27](../spec/backspace.md#backspace27) | tag free-form |
| [Backspace28](../spec/backspace.md#backspace28) | code block |
| [Backspace31](../spec/backspace.md#backspace31) | selection across blocks |
| [Backspace33](../spec/backspace.md#backspace33) | tag free-form |
| [Backspace35](../spec/backspace.md#backspace35) | tag free-form |
| [Backspace40b](../spec/backspace.md#backspace40b) | changes only what blocks can't show |
| [SoftBackspace4](../spec/backspace.md#softbackspace4) | heading's closing #s |
| [SoftBackspace6](../spec/backspace.md#softbackspace6) | caret on a blank line |
| [SoftBackspace7](../spec/backspace.md#softbackspace7) | tag free-form |
| [SoftBackspace8](../spec/backspace.md#softbackspace8) | tag free-form |
| [SoftBackspace9](../spec/backspace.md#softbackspace9) | code block |
| [SoftBackspace10](../spec/backspace.md#softbackspace10) | option taskEditing: text |
| [SoftBackspace11](../spec/backspace.md#softbackspace11) | tag free-form |
| [SoftBackspace11b](../spec/backspace.md#softbackspace11b) | tag free-form |
| [Backspace42](../spec/backspace.md#backspace42) | tag free-form |
| [Backspace42b](../spec/backspace.md#backspace42b) | option markup: decorated |
| [Backspace43c](../spec/backspace.md#backspace43c) | tag free-form |
| [Backspace47](../spec/backspace.md#backspace47) | tag free-form |
| [Backspace47b](../spec/backspace.md#backspace47b) | tag free-form |
| [Backspace49](../spec/backspace.md#backspace49) | option joinWithChildren: the app's refuse, as blocks |
| [Backspace50](../spec/backspace.md#backspace50) | option backspaceAtItemStart: body |
| [Backspace50b](../spec/backspace.md#backspace50b) | option backspaceAtItemStart: unwrap |
| **backtick.md** | |
| [Backtick1](../spec/backtick.md#backtick1) | block's text ending in a line break: an empty note is none |
| [Backtick2](../spec/backtick.md#backtick2) | code block (expected) |
| [Backtick2b](../spec/backtick.md#backtick2b) | option autoClose: ``` ~~~ ` |
| [Backtick3](../spec/backtick.md#backtick3) | quote |
| [Backtick4](../spec/backtick.md#backtick4) | code block (expected) |
| [Backtick5](../spec/backtick.md#backtick5) | code block |
| [Backtick6](../spec/backtick.md#backtick6) | code block |
| [Backtick7](../spec/backtick.md#backtick7) | option markup: decorated |
| [Backtick8](../spec/backtick.md#backtick8) | tag free-form |
| [Backtick9](../spec/backtick.md#backtick9) | code block |
| [Backtick10](../spec/backtick.md#backtick10) | code block |
| [Backtick11](../spec/backtick.md#backtick11) | option autoClose: none |
| [Backtick12](../spec/backtick.md#backtick12) | code block (expected) |
| [Backtick13](../spec/backtick.md#backtick13) | option markup: decorated |
| [Backtick14](../spec/backtick.md#backtick14) | code block |
| [Backtick15](../spec/backtick.md#backtick15) | code block (expected) |
| [Backtick16](../spec/backtick.md#backtick16) | option markup: decorated |
| [Backtick17](../spec/backtick.md#backtick17) | tag free-form |
| [Backtick19](../spec/backtick.md#backtick19) | option autoClose: ``` ~~~ ` |
| [Backtick20](../spec/backtick.md#backtick20) | option autoClose: ``` ~~~ ` |
| [Backtick21](../spec/backtick.md#backtick21) | option autoClose: ``` ~~~ ` |
| [Backtick22](../spec/backtick.md#backtick22) | option autoClose: ``` ~~~ ` |
| [Backtick23](../spec/backtick.md#backtick23) | code block |
| [Backtick24](../spec/backtick.md#backtick24) | code block |
| [Backtick25](../spec/backtick.md#backtick25) | code block |
| [Backtick26](../spec/backtick.md#backtick26) | code block |
| [Backtick27](../spec/backtick.md#backtick27) | code block |
| [Backtick28](../spec/backtick.md#backtick28) | code block |
| [Backtick29](../spec/backtick.md#backtick29) | code block |
| [Backtick30](../spec/backtick.md#backtick30) | block's text ending in a line break: an empty note is none |
| [Backtick31](../spec/backtick.md#backtick31) | option markup: decorated |
| [Backtick32](../spec/backtick.md#backtick32) | option autoClose: ``` ~~~ ` |
| **block-ids.md** | |
| [BlockIds1](../spec/block-ids.md#blockids1) | table |
| [BlockIds2](../spec/block-ids.md#blockids2) | code block |
| [BlockIds3](../spec/block-ids.md#blockids3) | block id (`^x`), which the app has none of: its text |
| [BlockIds4](../spec/block-ids.md#blockids4) | block id (`^x`), which the app has none of: its text |
| [BlockIds5](../spec/block-ids.md#blockids5) | block id (`^x`), which the app has none of: its text |
| [BlockIds6](../spec/block-ids.md#blockids6) | block id (`^x`), which the app has none of: its text |
| [BlockIds7](../spec/block-ids.md#blockids7) | block id (`^x`), which the app has none of: its text |
| [BlockIds8](../spec/block-ids.md#blockids8) | block id (`^x`), which the app has none of: its text |
| [BlockIds9](../spec/block-ids.md#blockids9) | block id (`^x`), which the app has none of: its text |
| [BlockIds10](../spec/block-ids.md#blockids10) | block id (`^x`), which the app has none of: its text |
| [BlockIds11](../spec/block-ids.md#blockids11) | block id (`^x`), which the app has none of: its text |
| [BlockIds12](../spec/block-ids.md#blockids12) | block id (`^x`), which the app has none of: its text |
| [BlockIds13](../spec/block-ids.md#blockids13) | block id (`^x`), which the app has none of: its text |
| [BlockIds14](../spec/block-ids.md#blockids14) | block id (`^x`), which the app has none of: its text |
| [BlockIds15](../spec/block-ids.md#blockids15) | block id (`^x`), which the app has none of: its text |
| [BlockIds16](../spec/block-ids.md#blockids16) | block id (`^x`), which the app has none of: its text |
| [BlockIds17](../spec/block-ids.md#blockids17) | selection across blocks |
| [BlockIds18](../spec/block-ids.md#blockids18) | action shiftEnter |
| [BlockIds19](../spec/block-ids.md#blockids19) | caret on a blank line |
| [BlockIds20](../spec/block-ids.md#blockids20) | block id (`^x`), which the app has none of: its text |
| [BlockIds21](../spec/block-ids.md#blockids21) | block id (`^x`), which the app has none of: its text |
| **copy.md** | |
| [Copy2](../spec/copy.md#copy2) | selection across blocks |
| [Copy3](../spec/copy.md#copy3) | quote |
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
| [CursorHome11](../spec/cursor.md#cursorhome11) | quote |
| [CursorHome15](../spec/cursor.md#cursorhome15) | caret in a marker |
| [CursorHome16](../spec/cursor.md#cursorhome16) | quote |
| [CursorHome17](../spec/cursor.md#cursorhome17) | callout |
| [CursorDocEndLeft1](../spec/cursor.md#cursordocendleft1) | cursorCharLeft after cursorDocEnd |
| **delete-subtree.md** | |
| [DeleteSubtree5](../spec/delete-subtree.md#deletesubtree5) | selection across blocks |
| [DeleteSubtree7](../spec/delete-subtree.md#deletesubtree7) | quote |
| [DeleteSubtree8](../spec/delete-subtree.md#deletesubtree8) | code block |
| [DeleteSubtree9](../spec/delete-subtree.md#deletesubtree9) | thematic break |
| [DeleteSubtree10](../spec/delete-subtree.md#deletesubtree10) | thematic break |
| [DeleteSubtree11](../spec/delete-subtree.md#deletesubtree11) | quote |
| [DeleteSubtree12](../spec/delete-subtree.md#deletesubtree12) | option quotes: container |
| [DeleteSubtree14](../spec/delete-subtree.md#deletesubtree14) | code block |
| **delete.md** | |
| [Delete4](../spec/delete.md#delete4) | heading's closing #s |
| [Delete4b](../spec/delete.md#delete4b) | heading's closing #s |
| [Delete9](../spec/delete.md#delete9) | tag free-form |
| [Delete10](../spec/delete.md#delete10) | option quotes: container |
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
| [Drag7](../spec/drag.md#drag7) | no folds |
| [Drag8](../spec/drag.md#drag8) | no zoom |
| **duplicate-subtree.md** | |
| [DuplicateSubtree3](../spec/duplicate-subtree.md#duplicatesubtree3) | selection across blocks |
| [DuplicateSubtree4](../spec/duplicate-subtree.md#duplicatesubtree4) | tag free-form |
| [DuplicateSubtree5](../spec/duplicate-subtree.md#duplicatesubtree5) | option quotes: container |
| [DuplicateSubtree6](../spec/duplicate-subtree.md#duplicatesubtree6) | tag free-form |
| [DuplicateSubtree7](../spec/duplicate-subtree.md#duplicatesubtree7) | caret in a marker |
| [DuplicateSubtree8](../spec/duplicate-subtree.md#duplicatesubtree8) | code block |
| [DuplicateSubtree9](../spec/duplicate-subtree.md#duplicatesubtree9) | option autoClose: none |
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
| [Enter37](../spec/enter.md#enter37) | block's text ending in a line break: an empty note is none |
| [Enter40](../spec/enter.md#enter40) | tag free-form |
| [Enter41](../spec/enter.md#enter41) | tag free-form |
| [Enter65k](../spec/enter.md#enter65k) | action shiftEnter |
| [Enter46](../spec/enter.md#enter46) | option quotes: container |
| [Enter49](../spec/enter.md#enter49) | table |
| [Enter50](../spec/enter.md#enter50) | tag free-form |
| [Enter54](../spec/enter.md#enter54) | caret in a task's checkbox or a heading's #s |
| [Enter54b](../spec/enter.md#enter54b) | caret in a task's checkbox or a heading's #s |
| [Enter55](../spec/enter.md#enter55) | caret in a task's checkbox or a heading's #s |
| [Enter55b](../spec/enter.md#enter55b) | caret in a task's checkbox or a heading's #s |
| [Enter55c](../spec/enter.md#enter55c) | tag free-form |
| [Enter56](../spec/enter.md#enter56) | selection across blocks |
| [Enter56b](../spec/enter.md#enter56b) | selection across a node's text and its note |
| [Enter58](../spec/enter.md#enter58) | caret past a node's trailing spaces, which Mubu doesn't draw |
| [Enter61](../spec/enter.md#enter61) | heading's closing #s |
| [Enter63](../spec/enter.md#enter63) | tag free-form |
| [Enter63b](../spec/enter.md#enter63b) | option enterOnEmptyItem: exit |
| [Enter66](../spec/enter.md#enter66) | footnote |
| [Enter67](../spec/enter.md#enter67) | thematic break |
| [Enter68](../spec/enter.md#enter68) | callout |
| [Enter70](../spec/enter.md#enter70) | table |
| **fences.md** | |
| [Fence1](../spec/fences.md#fence1) | code block |
| [Fence2](../spec/fences.md#fence2) | code block |
| [Fence3](../spec/fences.md#fence3) | code block |
| [Fence4](../spec/fences.md#fence4) | quote |
| [Fence5](../spec/fences.md#fence5) | code block |
| [Fence6](../spec/fences.md#fence6) | code block |
| [Fence7](../spec/fences.md#fence7) | code block |
| [Fence7b](../spec/fences.md#fence7b) | action shiftEnter |
| [Fence7c](../spec/fences.md#fence7c) | code block |
| [Fence7d](../spec/fences.md#fence7d) | code block |
| [Fence8](../spec/fences.md#fence8) | action shiftEnter |
| [Fence9](../spec/fences.md#fence9) | code block |
| [Fence10](../spec/fences.md#fence10) | option handleFenceContents: false |
| [Fence11](../spec/fences.md#fence11) | option handleFenceContents: false |
| [Fence12](../spec/fences.md#fence12) | code block |
| [Fence13](../spec/fences.md#fence13) | code block |
| [Fence14](../spec/fences.md#fence14) | code block |
| [Fence15](../spec/fences.md#fence15) | code block |
| [Fence16](../spec/fences.md#fence16) | code block |
| [Fence17](../spec/fences.md#fence17) | code block |
| [Fence18](../spec/fences.md#fence18) | code block |
| [Fence19](../spec/fences.md#fence19) | code block |
| [Fence20](../spec/fences.md#fence20) | quote |
| [Fence21](../spec/fences.md#fence21) | code block |
| [Fence22](../spec/fences.md#fence22) | action shiftEnter |
| [Fence23](../spec/fences.md#fence23) | code block |
| [Fence24](../spec/fences.md#fence24) | code block |
| [Fence25](../spec/fences.md#fence25) | code block |
| [Fence26](../spec/fences.md#fence26) | code block |
| [Fence27](../spec/fences.md#fence27) | code block |
| [Fence28](../spec/fences.md#fence28) | code block |
| [Fence29](../spec/fences.md#fence29) | code block |
| [Fence30](../spec/fences.md#fence30) | code block |
| [Fence31](../spec/fences.md#fence31) | code block |
| [Fence31b](../spec/fences.md#fence31b) | code block |
| [Fence32](../spec/fences.md#fence32) | action shiftEnter |
| [Fence32b](../spec/fences.md#fence32b) | option markup: decorated |
| [Fence33](../spec/fences.md#fence33) | code block |
| [Fence34](../spec/fences.md#fence34) | code block |
| [Fence35](../spec/fences.md#fence35) | code block |
| [Fence36](../spec/fences.md#fence36) | code block |
| [Fence37](../spec/fences.md#fence37) | code block |
| [Fence38](../spec/fences.md#fence38) | action shiftEnter |
| [Fence39](../spec/fences.md#fence39) | code block |
| [Fence40](../spec/fences.md#fence40) | quote |
| [Fence41](../spec/fences.md#fence41) | action shiftEnter |
| [Fence48](../spec/fences.md#fence48) | code block |
| [Fence49](../spec/fences.md#fence49) | code block |
| [Fence50](../spec/fences.md#fence50) | code block |
| [Fence51](../spec/fences.md#fence51) | code block |
| [Fence58](../spec/fences.md#fence58) | code block |
| [Fence59](../spec/fences.md#fence59) | code block |
| [Fence59b](../spec/fences.md#fence59b) | code block |
| [Fence60](../spec/fences.md#fence60) | code block |
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
| [Fence62](../spec/fences.md#fence62) | code block |
| [Fence63](../spec/fences.md#fence63) | code block |
| [Fence64](../spec/fences.md#fence64) | action shiftEnter |
| **fold.md** | |
| [Fold1](../spec/fold.md#fold1) | no folds |
| [Fold2](../spec/fold.md#fold2) | no folds |
| [Fold2b](../spec/fold.md#fold2b) | no folds |
| [Fold3](../spec/fold.md#fold3) | no folds |
| [Fold4](../spec/fold.md#fold4) | no folds |
| [Fold5](../spec/fold.md#fold5) | no folds |
| [Fold6](../spec/fold.md#fold6) | no folds |
| [Fold7](../spec/fold.md#fold7) | no folds |
| [Fold8](../spec/fold.md#fold8) | no folds |
| [Fold9](../spec/fold.md#fold9) | no folds |
| [Fold10](../spec/fold.md#fold10) | no folds |
| [Fold11](../spec/fold.md#fold11) | no folds |
| [Fold12](../spec/fold.md#fold12) | no folds |
| [Fold13](../spec/fold.md#fold13) | no folds |
| [Fold14](../spec/fold.md#fold14) | no folds |
| [Fold15](../spec/fold.md#fold15) | no folds |
| [Fold15b](../spec/fold.md#fold15b) | no folds |
| [Fold16](../spec/fold.md#fold16) | no folds |
| [Fold17](../spec/fold.md#fold17) | no folds |
| [Fold18](../spec/fold.md#fold18) | no folds |
| [Fold19](../spec/fold.md#fold19) | no folds |
| [Fold20](../spec/fold.md#fold20) | no folds |
| **gaps.md** | |
| [Gap7](../spec/gaps.md#gap7) | code block |
| [Gap14](../spec/gaps.md#gap14) | block's text ending in a line break: an empty note is none |
| [Gap15](../spec/gaps.md#gap15) | caret on a blank line |
| [Gap16](../spec/gaps.md#gap16) | caret on a blank line |
| [Gap17](../spec/gaps.md#gap17) | caret on a blank line |
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
| [Indent30](../spec/indent.md#indent30) | caret in a marker |
| [Indent31](../spec/indent.md#indent31) | code block |
| [Indent31b](../spec/indent.md#indent31b) | option markup: decorated |
| [Indent32](../spec/indent.md#indent32) | changes only what blocks can't show |
| [Indent34](../spec/indent.md#indent34) | code block |
| [Indent35](../spec/indent.md#indent35) | math |
| [Indent36](../spec/indent.md#indent36) | table |
| [Indent37](../spec/indent.md#indent37) | thematic break |
| [Indent37b](../spec/indent.md#indent37b) | thematic break |
| [Indent38](../spec/indent.md#indent38) | indented code |
| [Indent39](../spec/indent.md#indent39) | option indentUnit: tab |
| [Indent40](../spec/indent.md#indent40) | option indentUnit: 2 |
| [Indent41](../spec/indent.md#indent41) | option indentUnit: tab |
| [Indent42](../spec/indent.md#indent42) | option indentUnit: tab |
| [Indent44](../spec/indent.md#indent44) | code block |
| [Indent45b](../spec/indent.md#indent45b) | indented code |
| [Indent47](../spec/indent.md#indent47) | option mixedDepths: each |
| [Indent48](../spec/indent.md#indent48) | option mixedDepths: each |
| [Indent49](../spec/indent.md#indent49) | selection across blocks |
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
| [Lists11](../spec/lists.md#lists11) | quote |
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
| [MoveDown21](../spec/move-subtree-down.md#movedown21) | code block |
| [MoveDown25](../spec/move-subtree-down.md#movedown25) | tag free-form |
| [MoveDown28](../spec/move-subtree-down.md#movedown28) | tag free-form |
| [MoveDown31](../spec/move-subtree-down.md#movedown31) | thematic break |
| [MoveDown32](../spec/move-subtree-down.md#movedown32) | caret in a marker |
| [MoveDown34](../spec/move-subtree-down.md#movedown34) | code block |
| [MoveDown37](../spec/move-subtree-down.md#movedown37) | code block |
| [MoveDown38](../spec/move-subtree-down.md#movedown38) | tag free-form |
| [MoveDown40](../spec/move-subtree-down.md#movedown40) | selection across blocks |
| [MoveDown43](../spec/move-subtree-down.md#movedown43) | caret in a marker |
| [MoveDown44](../spec/move-subtree-down.md#movedown44) | caret in a marker |
| **move-subtree-up.md** | |
| [MoveUp10](../spec/move-subtree-up.md#moveup10) | selection across blocks |
| [MoveUp11](../spec/move-subtree-up.md#moveup11) | selection across blocks |
| [MoveUp12](../spec/move-subtree-up.md#moveup12) | tag free-form |
| [MoveUp13](../spec/move-subtree-up.md#moveup13) | code block |
| [MoveUp18](../spec/move-subtree-up.md#moveup18) | indented code |
| [MoveUp19](../spec/move-subtree-up.md#moveup19) | thematic break |
| [MoveUp20](../spec/move-subtree-up.md#moveup20) | link reference definition |
| [MoveUp21](../spec/move-subtree-up.md#moveup21) | the app changing what ourus's blocks show no change in, at moveSubtreeUp |
| [MoveUp24](../spec/move-subtree-up.md#moveup24) | tag free-form |
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
| [MoveUp41](../spec/move-subtree-up.md#moveup41) | option autoClose: none |
| [MoveUp42](../spec/move-subtree-up.md#moveup42) | quote |
| [MoveUp43](../spec/move-subtree-up.md#moveup43) | option indentUnit: tab |
| **move-subtree.md** | |
| [MoveSubtree1](../spec/move-subtree.md#movesubtree1) | action moveSubtree ③ |
| [MoveSubtree2](../spec/move-subtree.md#movesubtree2) | action moveSubtree ③ |
| [MoveSubtree3](../spec/move-subtree.md#movesubtree3) | action moveSubtree ① |
| [MoveSubtree4](../spec/move-subtree.md#movesubtree4) | action moveSubtree ② |
| [MoveSubtree5](../spec/move-subtree.md#movesubtree5) | action moveSubtree ③ |
| [MoveSubtree6](../spec/move-subtree.md#movesubtree6) | action moveSubtree ③ |
| [MoveSubtree7](../spec/move-subtree.md#movesubtree7) | action moveSubtree ② |
| [MoveSubtree8](../spec/move-subtree.md#movesubtree8) | action moveSubtree ② |
| [MoveSubtree9](../spec/move-subtree.md#movesubtree9) | action moveSubtree ② |
| [MoveSubtree10](../spec/move-subtree.md#movesubtree10) | action moveSubtree ② |
| [MoveSubtree11](../spec/move-subtree.md#movesubtree11) | action moveSubtree ② |
| [MoveSubtree12](../spec/move-subtree.md#movesubtree12) | action moveSubtree ② |
| [MoveSubtree13](../spec/move-subtree.md#movesubtree13) | action moveSubtree ② |
| [MoveSubtree14](../spec/move-subtree.md#movesubtree14) | action moveSubtree ② |
| [MoveSubtree15](../spec/move-subtree.md#movesubtree15) | action moveSubtree ② |
| [MoveSubtree16](../spec/move-subtree.md#movesubtree16) | action moveSubtree ② |
| [MoveSubtree17](../spec/move-subtree.md#movesubtree17) | action moveSubtree ③ |
| [MoveSubtree18](../spec/move-subtree.md#movesubtree18) | action moveSubtree ② |
| [MoveSubtree19](../spec/move-subtree.md#movesubtree19) | action moveSubtree |
| [MoveSubtree20](../spec/move-subtree.md#movesubtree20) | action moveSubtree ② |
| [MoveSubtree21](../spec/move-subtree.md#movesubtree21) | action moveSubtree ① |
| [MoveSubtree22](../spec/move-subtree.md#movesubtree22) | action moveSubtree ② |
| [MoveSubtree23](../spec/move-subtree.md#movesubtree23) | action moveSubtree ② |
| [MoveSubtree24](../spec/move-subtree.md#movesubtree24) | action moveSubtree ① |
| **obsidian-true-outliner.md** | |
| [TO-E7-E8](../spec/obsidian-true-outliner.md#to-e7-e8) | option enterMidItem: child |
| [TO-E11](../spec/obsidian-true-outliner.md#to-e11) | option enterMidItem: child |
| [TO-E18](../spec/obsidian-true-outliner.md#to-e18) | caret on a blank line |
| [TO-E19-E21b](../spec/obsidian-true-outliner.md#to-e19-e21b) | tag free-form |
| [TO-Bug267-E5](../spec/obsidian-true-outliner.md#to-bug267-e5) | quote |
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
| [TO-Bug255](../spec/obsidian-true-outliner.md#to-bug255) | quote |
| [TO-Seams](../spec/obsidian-true-outliner.md#to-seams) | quote |
| [TO-Seamsb](../spec/obsidian-true-outliner.md#to-seamsb) | quote |
| [TO-Seamsc](../spec/obsidian-true-outliner.md#to-seamsc) | thematic break |
| [TO-Seamsd](../spec/obsidian-true-outliner.md#to-seamsd) | indented code |
| [TO-Lazy](../spec/obsidian-true-outliner.md#to-lazy) | quote |
| [TO-Lazyb](../spec/obsidian-true-outliner.md#to-lazyb) | code block |
| [TO-Lazyc](../spec/obsidian-true-outliner.md#to-lazyc) | code block |
| [TO8](../spec/obsidian-true-outliner.md#to8) | action shiftEnter |
| [TO9](../spec/obsidian-true-outliner.md#to9) | action shiftEnter |
| [TO10](../spec/obsidian-true-outliner.md#to10) | action shiftEnter |
| [TO11](../spec/obsidian-true-outliner.md#to11) | action shiftEnter |
| [TO12](../spec/obsidian-true-outliner.md#to12) | action shiftEnter |
| [TO13](../spec/obsidian-true-outliner.md#to13) | action shiftEnter |
| [TO18](../spec/obsidian-true-outliner.md#to18) | tag free-form |
| [TO19](../spec/obsidian-true-outliner.md#to19) | option enterOnEmptyItem: outdent |
| [TO-Bug264](../spec/obsidian-true-outliner.md#to-bug264) | quote (expected) |
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
| [Outdent22b](../spec/outdent.md#outdent22b) | indented code |
| [Outdent23](../spec/outdent.md#outdent23) | option mixedDepths: each |
| [Outdent24](../spec/outdent.md#outdent24) | option mixedDepths: each |
| [Outdent25](../spec/outdent.md#outdent25) | selection across blocks |
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
| [PasteHtml12](../spec/paste-html.md#pastehtml12) | quote |
| [PasteHtml13](../spec/paste-html.md#pastehtml13) | table (expected) |
| [PasteHtml16](../spec/paste-html.md#pastehtml16) | code block (expected) |
| [PasteHtml19](../spec/paste-html.md#pastehtml19) | code block (expected) |
| **paste-list-form.md** | |
| [PasteListForm6](../spec/paste-list-form.md#pastelistform6) | option pasteListForm: own |
| **paste-list.md** | |
| [PasteList7b](../spec/paste-list.md#pastelist7b) | option enterTask: plain |
| [PasteList12](../spec/paste-list.md#pastelist12) | code block (expected) |
| [PasteList13](../spec/paste-list.md#pastelist13) | code block (expected) |
| [PasteList14](../spec/paste-list.md#pastelist14) | code block (expected) |
| [PasteList15](../spec/paste-list.md#pastelist15) | code block (expected) |
| [PasteList17](../spec/paste-list.md#pastelist17) | quote (expected) |
| [PasteList17b](../spec/paste-list.md#pastelist17b) | quote (expected) |
| [PasteList18](../spec/paste-list.md#pastelist18) | option pasteOnParent: after |
| [PasteList19](../spec/paste-list.md#pastelist19) | option pasteOnParent: after |
| [PasteList20](../spec/paste-list.md#pastelist20) | option pasteAtTextStart: before |
| [PasteList21](../spec/paste-list.md#pastelist21) | option pasteParagraphList: children |
| [PasteList22](../spec/paste-list.md#pastelist22) | option pasteSeams: open |
| [PasteList23](../spec/paste-list.md#pastelist23) | option pasteSeams: open |
| [PasteList24](../spec/paste-list.md#pastelist24) | option pasteSeams: open |
| [PasteList26](../spec/paste-list.md#pastelist26) | code block (expected) |
| [PasteList27](../spec/paste-list.md#pastelist27) | code block (expected) |
| **paste-plain.md** | |
| [PastePlain4](../spec/paste-plain.md#pasteplain4) | tag free-form |
| [PastePlain17](../spec/paste-plain.md#pasteplain17) | selection across a node's text and its note |
| [PastePlain18](../spec/paste-plain.md#pasteplain18) | quote |
| [PastePlain21](../spec/paste-plain.md#pasteplain21) | tag free-form |
| [PastePlain22](../spec/paste-plain.md#pasteplain22) | tag free-form |
| [PastePlain27](../spec/paste-plain.md#pasteplain27) | changes only what blocks can't show |
| [PastePlain28](../spec/paste-plain.md#pasteplain28) | code block |
| [PastePlain29](../spec/paste-plain.md#pasteplain29) | code block |
| [PastePlain30](../spec/paste-plain.md#pasteplain30) | code block |
| [PastePlain31](../spec/paste-plain.md#pasteplain31) | option pastePlainLines: enter |
| [PastePlain34](../spec/paste-plain.md#pasteplain34) | option pastePlainLines: host |
| **paste.md** | |
| [Paste4b](../spec/paste.md#paste4b) | option pasteSeams: open |
| [Paste7](../spec/paste.md#paste7) | code block (expected) |
| [Paste9](../spec/paste.md#paste9) | option quotes: container |
| [Paste13](../spec/paste.md#paste13) | block's text ending in a line break: an empty note is none |
| [Paste14](../spec/paste.md#paste14) | code block |
| [Paste15](../spec/paste.md#paste15) | code block |
| [Paste16](../spec/paste.md#paste16) | caret in a marker |
| [Paste20](../spec/paste.md#paste20) | option pasteAtTextStart: before |
| [Paste21](../spec/paste.md#paste21) | option pasteSeams: open |
| [Paste23](../spec/paste.md#paste23) | callout |
| [Paste24b](../spec/paste.md#paste24b) | option pasteSeams: open |
| [Paste25](../spec/paste.md#paste25) | callout |
| [Paste26](../spec/paste.md#paste26) | action shiftEnter |
| [Paste26b](../spec/paste.md#paste26b) | option pasteSeams: open |
| [Paste27](../spec/paste.md#paste27) | quote |
| **placeholders.md** | |
| [Placeholder2](../spec/placeholders.md#placeholder2) | tag free-form |
| [Placeholder4](../spec/placeholders.md#placeholder4) | action shiftEnter |
| [Placeholder4b](../spec/placeholders.md#placeholder4b) | action shiftEnter |
| [Placeholder4c](../spec/placeholders.md#placeholder4c) | action shiftEnter |
| [Placeholder4e](../spec/placeholders.md#placeholder4e) | no zoom |
| [Placeholder9b](../spec/placeholders.md#placeholder9b) | option heldSpace: trim |
| [Placeholder17b](../spec/placeholders.md#placeholder17b) | option heldSpace: trim |
| [Placeholder10](../spec/placeholders.md#placeholder10) | caret on a blank line |
| [Placeholder12](../spec/placeholders.md#placeholder12) | caret on a blank line |
| [Placeholder18b](../spec/placeholders.md#placeholder18b) | option heldSpace: trim |
| **quirks.md** | |
| [Quirk1](../spec/quirks.md#quirk1) | option quirkEnterMidHeading: workflowy |
| [Quirk1b](../spec/quirks.md#quirk1b) | option quirkEnterMidHeading: workflowy |
| [Quirk1c](../spec/quirks.md#quirk1c) | option quirkEnterMidHeading: workflowy |
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
| [Quote53](../spec/quotes.md#quote53) | quote |
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
| [Quote76](../spec/quotes.md#quote76) | quote |
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
| [Quote94](../spec/quotes.md#quote94) | quote |
| [Quote95](../spec/quotes.md#quote95) | quote |
| [Quote96](../spec/quotes.md#quote96) | quote |
| [Quote97](../spec/quotes.md#quote97) | tag free-form |
| [QuoteText1](../spec/quotes.md#quotetext1) | quote |
| [QuoteText2](../spec/quotes.md#quotetext2) | quote |
| [QuoteText3](../spec/quotes.md#quotetext3) | quote |
| [QuoteText4](../spec/quotes.md#quotetext4) | quote |
| [QuoteText5](../spec/quotes.md#quotetext5) | quote |
| [QuoteText6](../spec/quotes.md#quotetext6) | quote |
| [QuoteText7](../spec/quotes.md#quotetext7) | quote |
| [QuoteText8](../spec/quotes.md#quotetext8) | quote |
| [QuoteText9](../spec/quotes.md#quotetext9) | quote |
| [QuoteText10](../spec/quotes.md#quotetext10) | quote |
| [QuoteText11](../spec/quotes.md#quotetext11) | action shiftEnter |
| [QuoteText12](../spec/quotes.md#quotetext12) | quote |
| [QuoteText13](../spec/quotes.md#quotetext13) | quote |
| [QuoteText14](../spec/quotes.md#quotetext14) | quote (expected) |
| [QuoteText15](../spec/quotes.md#quotetext15) | quote |
| [QuoteText16](../spec/quotes.md#quotetext16) | quote |
| [QuoteText17](../spec/quotes.md#quotetext17) | quote |
| [QuoteText18](../spec/quotes.md#quotetext18) | quote |
| [QuoteText19](../spec/quotes.md#quotetext19) | quote |
| [QuoteText20](../spec/quotes.md#quotetext20) | quote |
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
| [Regression3](../spec/regressions.md#regression3) | quote |
| [Regression5](../spec/regressions.md#regression5) | link reference definition (expected) |
| [Regression6](../spec/regressions.md#regression6) | code block |
| [Regression7](../spec/regressions.md#regression7) | code block |
| [Regression9](../spec/regressions.md#regression9) | changes only what blocks can't show |
| [Regression10](../spec/regressions.md#regression10) | action shiftEnter |
| [Regression11](../spec/regressions.md#regression11) | action shiftEnter |
| [Regression12](../spec/regressions.md#regression12) | action shiftEnter |
| [Regression16](../spec/regressions.md#regression16) | option enterMidItem: child |
| [Regression23](../spec/regressions.md#regression23) | code block |
| [Regression24c](../spec/regressions.md#regression24c) | action shiftEnter |
| [Regression26](../spec/regressions.md#regression26) | action shiftEnter |
| [Regression28](../spec/regressions.md#regression28) | callout |
| [Regression29](../spec/regressions.md#regression29) | option quotes: container |
| [Regression30](../spec/regressions.md#regression30) | changes only what blocks can't show |
| [Regression31](../spec/regressions.md#regression31) | tag free-form |
| [Regression33](../spec/regressions.md#regression33) | quote |
| [Regression34](../spec/regressions.md#regression34) | thematic break |
| [Regression35](../spec/regressions.md#regression35) | link reference definition (expected) |
| [Regression36](../spec/regressions.md#regression36) | quote |
| [Regression37](../spec/regressions.md#regression37) | quote |
| [Regression38](../spec/regressions.md#regression38) | option quotes: container |
| [Regression40](../spec/regressions.md#regression40) | caret in a marker |
| [Regression41](../spec/regressions.md#regression41) | option quotes: container |
| [Regression42](../spec/regressions.md#regression42) | selection across blocks |
| [Regression43](../spec/regressions.md#regression43) | caret in a marker |
| [Regression45](../spec/regressions.md#regression45) | selection across blocks |
| [Regression46](../spec/regressions.md#regression46) | caret in a task's checkbox or a heading's #s |
| [Regression47](../spec/regressions.md#regression47) | action shiftEnter |
| [Regression48](../spec/regressions.md#regression48) | indented code |
| [Regression49](../spec/regressions.md#regression49) | changes only what blocks can't show |
| [Regression50](../spec/regressions.md#regression50) | option quotes: container |
| [Regression51](../spec/regressions.md#regression51) | selection across blocks |
| [Regression52](../spec/regressions.md#regression52) | indented code |
| [Regression54](../spec/regressions.md#regression54) | indented code |
| [Regression56](../spec/regressions.md#regression56) | quote |
| [Regression57](../spec/regressions.md#regression57) | quote |
| [Regression58](../spec/regressions.md#regression58) | caret in a marker |
| [Regression59](../spec/regressions.md#regression59) | caret in a marker |
| [Regression60](../spec/regressions.md#regression60) | option quotes: atom |
| [Regression61](../spec/regressions.md#regression61) | option quotes: atom |
| [Regression62](../spec/regressions.md#regression62) | option quotes: atom |
| [Regression64](../spec/regressions.md#regression64) | option quotes: atom |
| [Regression66](../spec/regressions.md#regression66) | caret on a blank line |
| [Regression67](../spec/regressions.md#regression67) | no folds |
| [Regression68](../spec/regressions.md#regression68) | no folds |
| [Regression69](../spec/regressions.md#regression69) | no folds |
| [Regression70](../spec/regressions.md#regression70) | caret on a blank line |
| [Regression71](../spec/regressions.md#regression71) | selection across blocks |
| [Regression72](../spec/regressions.md#regression72) | selection across blocks |
| [Regression78](../spec/regressions.md#regression78) | option quotes: atom |
| [Regression79](../spec/regressions.md#regression79) | selection across blocks |
| [Regression80](../spec/regressions.md#regression80) | action pasteAt |
| [Regression81](../spec/regressions.md#regression81) | action shiftEnter |
| [Regression84](../spec/regressions.md#regression84) | quote |
| [Regression90](../spec/regressions.md#regression90) | option autoClose: ``` ~~~ ` |
| [Regression91](../spec/regressions.md#regression91) | option pastePlainLines: enter |
| [Regression92](../spec/regressions.md#regression92) | caret in a marker |
| [Regression94](../spec/regressions.md#regression94) | no zoom |
| [Regression96](../spec/regressions.md#regression96) | option pasteLines: the app's items, as blocks |
| [Regression97](../spec/regressions.md#regression97) | no zoom |
| [Regression100](../spec/regressions.md#regression100) | caret on a blank line |
| [Regression101](../spec/regressions.md#regression101) | quote |
| [Regression102](../spec/regressions.md#regression102) | action shiftEnter |
| [Regression103](../spec/regressions.md#regression103) | code block |
| [Regression104](../spec/regressions.md#regression104) | code block |
| [Regression105](../spec/regressions.md#regression105) | option pasteSeams: open |
| [Regression106](../spec/regressions.md#regression106) | caret on a blank line |
| [Regression107](../spec/regressions.md#regression107) | code block |
| [Regression108](../spec/regressions.md#regression108) | quote |
| [Regression109](../spec/regressions.md#regression109) | quote |
| [Regression110](../spec/regressions.md#regression110) | link reference definition |
| [Regression111](../spec/regressions.md#regression111) | quote |
| [Regression112](../spec/regressions.md#regression112) | quote |
| [Regression113](../spec/regressions.md#regression113) | selection across blocks |
| [Regression114](../spec/regressions.md#regression114) | option pastePlainLines: enter |
| [Regression115](../spec/regressions.md#regression115) | code block |
| [Regression116](../spec/regressions.md#regression116) | code block |
| [Regression117](../spec/regressions.md#regression117) | quote |
| [Regression118](../spec/regressions.md#regression118) | code block |
| [Regression119](../spec/regressions.md#regression119) | quote |
| [Regression120](../spec/regressions.md#regression120) | code block |
| [Regression121](../spec/regressions.md#regression121) | code block |
| [Regression122](../spec/regressions.md#regression122) | code block |
| [Regression123](../spec/regressions.md#regression123) | option markup: decorated |
| [Regression124](../spec/regressions.md#regression124) | no folds |
| [Regression126](../spec/regressions.md#regression126) | code block |
| [Regression127](../spec/regressions.md#regression127) | quote |
| [Regression128](../spec/regressions.md#regression128) | action pasteAt |
| [Regression129](../spec/regressions.md#regression129) | quote |
| [Regression130](../spec/regressions.md#regression130) | selection across blocks |
| [Regression131](../spec/regressions.md#regression131) | action selectNodeDown |
| [Regression132](../spec/regressions.md#regression132) | action deleteByDrag |
| [Regression133](../spec/regressions.md#regression133) | option autoClose: ``` ~~~ ` |
| [Regression134](../spec/regressions.md#regression134) | option autoClose: ``` ~~~ ` |
| [Regression137](../spec/regressions.md#regression137) | heading's closing #s |
| [Regression142](../spec/regressions.md#regression142) | nothing to compare |
| [Regression147](../spec/regressions.md#regression147) | code block |
| [Regression149](../spec/regressions.md#regression149) | changes only what blocks can't show |
| [Regression150](../spec/regressions.md#regression150) | math |
| [Regression151](../spec/regressions.md#regression151) | code block |
| [Regression152](../spec/regressions.md#regression152) | option markup: decorated |
| [Regression153](../spec/regressions.md#regression153) | changes only what blocks can't show |
| [Regression154](../spec/regressions.md#regression154) | indented code |
| [Regression156](../spec/regressions.md#regression156) | action shiftEnter |
| [Regression158](../spec/regressions.md#regression158) | quote |
| [Regression159](../spec/regressions.md#regression159) | caret in a marker |
| [Regression160](../spec/regressions.md#regression160) | option pastePlainLines: enter |
| [Regression161](../spec/regressions.md#regression161) | callout |
| [Regression162](../spec/regressions.md#regression162) | quote |
| [Regression163](../spec/regressions.md#regression163) | selection across blocks |
| [Regression164](../spec/regressions.md#regression164) | code block |
| [Regression165](../spec/regressions.md#regression165) | caret in a marker |
| [Regression166](../spec/regressions.md#regression166) | option quotes: container |
| [Regression167](../spec/regressions.md#regression167) | quote |
| [Regression168](../spec/regressions.md#regression168) | heading with no text (# alone), which Mubu holds as the text # |
| [Regression169](../spec/regressions.md#regression169) | link reference definition |
| [Regression171](../spec/regressions.md#regression171) | quote |
| [Regression172](../spec/regressions.md#regression172) | action shiftEnter |
| [Regression173](../spec/regressions.md#regression173) | action shiftEnter |
| [Regression176](../spec/regressions.md#regression176) | action shiftEnter |
| [Regression178](../spec/regressions.md#regression178) | option autoClose: ``` ~~~ ` |
| [Regression179](../spec/regressions.md#regression179) | action moveSubtree ① |
| [Regression180](../spec/regressions.md#regression180) | changes only what blocks can't show |
| [Regression181](../spec/regressions.md#regression181) | changes only what blocks can't show |
| [Regression182](../spec/regressions.md#regression182) | link reference definition |
| [Regression183](../spec/regressions.md#regression183) | quote |
| [Regression184](../spec/regressions.md#regression184) | action shiftEnter |
| [Regression185](../spec/regressions.md#regression185) | action shiftEnter |
| [Regression186](../spec/regressions.md#regression186) | quote |
| [Regression187](../spec/regressions.md#regression187) | quote |
| [Regression188](../spec/regressions.md#regression188) | quote |
| [Regression190](../spec/regressions.md#regression190) | quote |
| [Regression191](../spec/regressions.md#regression191) | quote |
| [Regression192](../spec/regressions.md#regression192) | code block |
| [Regression193](../spec/regressions.md#regression193) | caret on a blank line |
| [Regression194](../spec/regressions.md#regression194) | no folds |
| [Regression195](../spec/regressions.md#regression195) | quote |
| [Regression196](../spec/regressions.md#regression196) | quote |
| [Regression198](../spec/regressions.md#regression198) | quote |
| [Regression199](../spec/regressions.md#regression199) | quote |
| [Regression200](../spec/regressions.md#regression200) | no folds |
| [Regression201](../spec/regressions.md#regression201) | no folds |
| [Regression202](../spec/regressions.md#regression202) | no folds |
| [Regression203](../spec/regressions.md#regression203) | no folds |
| [Regression204](../spec/regressions.md#regression204) | no folds |
| [Regression205](../spec/regressions.md#regression205) | no folds |
| [Regression206](../spec/regressions.md#regression206) | no folds |
| [Regression207](../spec/regressions.md#regression207) | no folds |
| [Regression208](../spec/regressions.md#regression208) | no zoom |
| [Regression209](../spec/regressions.md#regression209) | no zoom |
| [Regression210](../spec/regressions.md#regression210) | no folds |
| [Regression211](../spec/regressions.md#regression211) | selection across blocks |
| [Regression212](../spec/regressions.md#regression212) | quote |
| [Regression213](../spec/regressions.md#regression213) | option quotes: atom |
| [Regression214](../spec/regressions.md#regression214) | block id (`^x`), which the app has none of: its text |
| [Regression215](../spec/regressions.md#regression215) | block id (`^x`), which the app has none of: its text |
| [Regression216](../spec/regressions.md#regression216) | option quotes: container |
| [Regression217](../spec/regressions.md#regression217) | quote |
| [Regression218](../spec/regressions.md#regression218) | option quotes: container |
| [Regression219](../spec/regressions.md#regression219) | option markup: decorated |
| [Regression221](../spec/regressions.md#regression221) | table |
| [Regression222](../spec/regressions.md#regression222) | option listParent: block |
| [Regression223](../spec/regressions.md#regression223) | table |
| [Regression224](../spec/regressions.md#regression224) | option quotes: container |
| [Regression225](../spec/regressions.md#regression225) | option markup: decorated |
| [Regression226](../spec/regressions.md#regression226) | option quotes: atom |
| [Regression227](../spec/regressions.md#regression227) | option quotes: atom |
| [Regression228](../spec/regressions.md#regression228) | option quotes: atom |
| [Regression229](../spec/regressions.md#regression229) | option quotes: atom |
| [Regression230](../spec/regressions.md#regression230) | option quotes: atom |
| [Regression231](../spec/regressions.md#regression231) | option pasteAtTextStart: before |
| [Regression232](../spec/regressions.md#regression232) | option quotes: atom |
| [Regression234](../spec/regressions.md#regression234) | option quotes: atom |
| [Regression235](../spec/regressions.md#regression235) | option quotes: atom |
| [Regression236](../spec/regressions.md#regression236) | option quirkPasteCaret: roam |
| [Regression239](../spec/regressions.md#regression239) | quote |
| [Regression240](../spec/regressions.md#regression240) | html (expected) |
| [Regression241](../spec/regressions.md#regression241) | action expandSelection |
| [Regression242](../spec/regressions.md#regression242) | changes only what blocks can't show |
| [Regression243](../spec/regressions.md#regression243) | option quotes: atom |
| [Regression244](../spec/regressions.md#regression244) | quote |
| [Regression245](../spec/regressions.md#regression245) | quote |
| [Regression246](../spec/regressions.md#regression246) | option quotes: atom |
| [Regression247](../spec/regressions.md#regression247) | option quotes: atom |
| [Regression248](../spec/regressions.md#regression248) | option quotes: atom |
| [Regression249](../spec/regressions.md#regression249) | option quirkEnterMidHeading: workflowy |
| [Regression250](../spec/regressions.md#regression250) | option taskEditing: unwrap |
| [Regression252](../spec/regressions.md#regression252) | thematic break |
| [Regression253](../spec/regressions.md#regression253) | code block |
| [Regression254](../spec/regressions.md#regression254) | option listParent: block |
| [Regression255](../spec/regressions.md#regression255) | option quotes: atom |
| [Regression256](../spec/regressions.md#regression256) | option quotes: container |
| [Regression258](../spec/regressions.md#regression258) | option quotes: container |
| [Regression259](../spec/regressions.md#regression259) | action selectNode |
| [Regression260](../spec/regressions.md#regression260) | heading's closing #s |
| [Regression261](../spec/regressions.md#regression261) | block id (`^x`), which the app has none of: its text (expected) |
| [Regression262](../spec/regressions.md#regression262) | selection across blocks |
| [Regression264](../spec/regressions.md#regression264) | code block |
| [Regression265](../spec/regressions.md#regression265) | option quotes: container |
| [Regression266](../spec/regressions.md#regression266) | link reference definition |
| [Regression267](../spec/regressions.md#regression267) | action shiftEnter |
| [Regression269](../spec/regressions.md#regression269) | no zoom |
| [Regression270](../spec/regressions.md#regression270) | no folds |
| [Regression271](../spec/regressions.md#regression271) | no folds |
| [Regression272](../spec/regressions.md#regression272) | block id (`^x`), which the app has none of: its text |
| [Regression273](../spec/regressions.md#regression273) | option autoClose: ( |
| [Regression274](../spec/regressions.md#regression274) | option autoClose: $ |
| [Regression275](../spec/regressions.md#regression275) | caret in a marker |
| [Regression276](../spec/regressions.md#regression276) | caret in a marker |
| [Regression277](../spec/regressions.md#regression277) | table |
| [Regression277b](../spec/regressions.md#regression277b) | action shiftEnter |
| **scenarios.md** | |
| [Scenario6](../spec/scenarios.md#scenario6) | tag free-form |
| [Scenario8b](../spec/scenarios.md#scenario8b) | action moveSubtree ③ |
| [Scenario8c](../spec/scenarios.md#scenario8c) | action moveSubtree ② |
| [Scenario8d](../spec/scenarios.md#scenario8d) | action drag ② |
| [Scenario11](../spec/scenarios.md#scenario11) | action shiftEnter |
| [Scenario18](../spec/scenarios.md#scenario18) | code block (expected) |
| [Scenario26](../spec/scenarios.md#scenario26) | no folds |
| [Scenario27](../spec/scenarios.md#scenario27) | no zoom |
| [Scenario28](../spec/scenarios.md#scenario28) | action selectNodeDown |
| [Scenario29](../spec/scenarios.md#scenario29) | action selectNodeDown |
| [Scenario20](../spec/scenarios.md#scenario20) | action shiftEnter |
| [Scenario23](../spec/scenarios.md#scenario23) | action shiftEnter |
| [Scenario24](../spec/scenarios.md#scenario24) | tag free-form |
| [Scenario25](../spec/scenarios.md#scenario25) | tag free-form |
| **select.md** | |
| [Select1](../spec/select.md#select1) | action selectNode |
| [Select2](../spec/select.md#select2) | action expandSelection |
| [Select3](../spec/select.md#select3) | action expandSelection |
| [Select4](../spec/select.md#select4) | action expandSelection |
| [Select5](../spec/select.md#select5) | option selectionLadder: parents |
| [Select6](../spec/select.md#select6) | action expandSelection |
| [Select7](../spec/select.md#select7) | action expandSelection |
| [Select8](../spec/select.md#select8) | action expandSelection |
| [Select9](../spec/select.md#select9) | action expandSelection |
| [Select10](../spec/select.md#select10) | no zoom |
| [Select11](../spec/select.md#select11) | action selectNodeDown |
| [Select12](../spec/select.md#select12) | action selectNodeUp |
| [Select13](../spec/select.md#select13) | action selectNodeUp |
| [Select14](../spec/select.md#select14) | action selectNodeUp |
| [Select15](../spec/select.md#select15) | action selectNodeDown |
| [Select16](../spec/select.md#select16) | action selectNodeUp |
| [Select17](../spec/select.md#select17) | action selectNodeDown |
| [Select18](../spec/select.md#select18) | action selectNodeDown |
| [Select19](../spec/select.md#select19) | no folds |
| [Select20](../spec/select.md#select20) | action expandSelection |
| [Select21](../spec/select.md#select21) | action expandSelection |
| [Select22](../spec/select.md#select22) | option selectionLadder: top |
| [Select23](../spec/select.md#select23) | option selectNodeUp: sibling |
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
| [ShiftEnter30b](../spec/shift-enter.md#shiftenter30b) | option heldSpace: trim |
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
| [ShiftEnter32b](../spec/shift-enter.md#shiftenter32b) | option heldSpace: trim |
| [ShiftEnter33](../spec/shift-enter.md#shiftenter33) | action shiftEnter |
| **subtree-selection.md** | |
| [SubtreeEdit3](../spec/subtree-selection.md#subtreeedit3) | selection across blocks |
| [SubtreeEdit5](../spec/subtree-selection.md#subtreeedit5) | selection across blocks |
| [SubtreeEdit10](../spec/subtree-selection.md#subtreeedit10) | thematic break |
| [SubtreeEdit11](../spec/subtree-selection.md#subtreeedit11) | selection across blocks |
| [SubtreeEdit13](../spec/subtree-selection.md#subtreeedit13) | action shiftEnter |
| [SubtreeEdit15](../spec/subtree-selection.md#subtreeedit15) | caret in a marker |
| [SubtreeEdit16](../spec/subtree-selection.md#subtreeedit16) | selection across blocks |
| [SubtreeEdit17](../spec/subtree-selection.md#subtreeedit17) | option pasteOverNodes: after |
| [SubtreeEdit18](../spec/subtree-selection.md#subtreeedit18) | option pasteOverNodes: nothing |
| [SubtreeEdit19](../spec/subtree-selection.md#subtreeedit19) | option pasteOverNodes: nothing |
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
| **zoom.md** | |
| [Zoom1](../spec/zoom.md#zoom1) | no zoom |
| [Zoom2](../spec/zoom.md#zoom2) | no zoom |
| [Zoom3](../spec/zoom.md#zoom3) | no zoom |
| [Zoom4](../spec/zoom.md#zoom4) | no zoom |
| [Zoom5](../spec/zoom.md#zoom5) | no folds |
| [Zoom6](../spec/zoom.md#zoom6) | no zoom |
| [Zoom7](../spec/zoom.md#zoom7) | no zoom |
| [Zoom8](../spec/zoom.md#zoom8) | no zoom |
| [Zoom9](../spec/zoom.md#zoom9) | no zoom |
| [Zoom10](../spec/zoom.md#zoom10) | no zoom |
| [Zoom11](../spec/zoom.md#zoom11) | no zoom |
| [Zoom12](../spec/zoom.md#zoom12) | no zoom |
| [Zoom13](../spec/zoom.md#zoom13) | no zoom |
| [Zoom14](../spec/zoom.md#zoom14) | no zoom |

## Not run (2)

| example | why |
| --- | --- |
| **regressions.md** | |
| [Regression277c](../spec/regressions.md#regression277c) | new, or its start changed since |
| [Regression278](../spec/regressions.md#regression278) | new, or its start changed since |
