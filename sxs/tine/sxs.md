---
type: "SxS"
app: "tine"
version: "guide of 2026-09-28"
url: "https://tine.page/guide/app/"
model: "block"
command: "node sxs/run.ts tine"
elapsed_s: 32
---

# Tine vs ourus

Spec test suite replayed in Tine and compared against ourus.

Regenerated from an earlier run (`--regenerate-report`): what Tine did then, judged against the spec as it is now. It played every example as it is now.

Model: [block](../lib/outline.ts) (free-form cases had to be adapted into outlines of blocks)

## Summary

|  | agree | caret | whitespace | disagree | error | skipped | total |
| --- | --- | --- | --- | --- | --- | --- | --- |
| original | 104 | 6 | 11 | 18 |  |  | **139** |
| adapted | 134 | 12 | 22 | 130 |  |  | **298** |
| **total** | **238 (36%)** | **18 (2.8%)** | **33 (5%)** | **148 (23%)** | **0 (0%)** | **217 (33%)** | **654** |

Per-file:

|  | agree | caret | whitespace | disagree | error | skipped | total | original | adapted |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [backspace.md](../../spec/backspace.md) | 21 |  |  | 22 |  | 9 | **52** | 13 | 30 |
| [cursor.md](../../spec/cursor.md) | 22 | 7 |  |  |  | 7 | **36** | 12 | 17 |
| [del.md](../../spec/del.md) | 14 |  |  | 14 |  | 16 | **44** | 13 | 15 |
| [delete-subtree.md](../../spec/delete-subtree.md) |  | 4 |  | 1 |  | 1 | **6** | 1 | 4 |
| [duplicate-subtree.md](../../spec/duplicate-subtree.md) |  |  |  |  |  | 3 | **3** |  |  |
| [enter.md](../../spec/enter.md) | 19 | 1 | 8 | 12 |  | 12 | **52** | 18 | 22 |
| [fences.md](../../spec/fences.md) | 8 |  | 1 | 6 |  | 29 | **44** |  | 15 |
| [gaps.md](../../spec/gaps.md) | 13 |  |  |  |  | 6 | **19** |  | 13 |
| [indent.md](../../spec/indent.md) | 20 |  |  | 4 |  | 5 | **29** | 9 | 15 |
| [move-subtree-down.md](../../spec/move-subtree-down.md) | 20 |  |  | 8 |  | 4 | **32** | 6 | 22 |
| [move-subtree-up.md](../../spec/move-subtree-up.md) | 21 |  |  | 9 |  | 5 | **35** | 7 | 23 |
| [obsidian-true-outliner.md](../../spec/obsidian-true-outliner.md) | 31 | 2 | 8 | 13 |  | 13 | **67** | 22 | 32 |
| [outdent.md](../../spec/outdent.md) | 11 |  |  | 4 |  | 9 | **24** | 5 | 10 |
| [paste.md](../../spec/paste.md) | 14 |  | 3 | 21 |  | 10 | **48** | 11 | 27 |
| [placeholders.md](../../spec/placeholders.md) | 6 | 1 | 2 | 2 |  | 5 | **16** | 2 | 9 |
| [quotes.md](../../spec/quotes.md) |  |  |  |  |  | 74 | **74** |  |  |
| [scenarios.md](../../spec/scenarios.md) | 12 | 1 |  | 10 |  | 1 | **24** | 11 | 12 |
| [shift-enter.md](../../spec/shift-enter.md) | 3 |  | 11 | 7 |  | 2 | **23** | 6 | 15 |
| [tasks.md](../../spec/tasks.md) |  | 2 |  | 12 |  | 3 | **17** |  | 14 |
| [typing.md](../../spec/typing.md) |  |  |  | 2 |  | 2 | **4** |  | 2 |
| [undo.md](../../spec/undo.md) | 3 |  |  | 1 |  | 1 | **5** | 3 | 1 |
| **total** | **238 (36%)** | **18 (2.8%)** | **33 (5%)** | **148 (23%)** | **0 (0%)** | **217 (33%)** | **654** | **139 (21%)** | **298 (46%)** |

## Original cases

### Disagree (18)

#### 1. [Backspace17b](../../spec/backspace.md#backspace17b)

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

<!--tine-->
```buffer
- ┃
  - a
    - b
```

</td><td>

<!--ourus-->
```buffer
- ┃a
  - b
```

</td></tr>
</table>

#### 2. [Backspace17c](../../spec/backspace.md#backspace17c)

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

<!--tine-->
```buffer
- a┃
  - e
  - b
    - c
  - d
- f
```

</td><td>

<!--ourus-->
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

#### 3. [Delete5](../../spec/del.md#delete5)

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

<!--tine-->
```buffer
- ┃a
  - c
  - b
- d
```

</td><td>

<!--ourus-->
```buffer
- ┃a
  - b
  - c
- d
```

</td></tr>
</table>

#### 4. [Delete5b](../../spec/del.md#delete5b)

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

<!--tine-->
```buffer
- a
  - ┃b
    - d
    - c
  - e
- f
```

</td><td>

<!--ourus-->
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

#### 5. [Delete5d](../../spec/del.md#delete5d)

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

<!--tine-->
```buffer
- ┃
  - a
    - b
```

</td><td>

<!--ourus-->
```buffer
- ┃a
  - b
```

</td></tr>
</table>

#### 6. [Enter3](../../spec/enter.md#enter3)

> enter

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃ b
  - c
```

</td><td>

<!--tine-->
```buffer
- a
  - ┃ b
  - c
```

</td><td>

<!--ourus-->
```buffer
- a
- ┃b
  - c
```

</td></tr>
</table>

#### 7. [Enter3d](../../spec/enter.md#enter3d)

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
<tr><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--tine-->
```buffer
- a
  - ┃b
  - c
```

</td><td>

<!--ourus-->
```buffer
- a
- ┃b
  - c
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a┃b
  - c
```

</td></tr>
</table>

#### 8. [Enter5](../../spec/enter.md#enter5)

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

<!--tine-->
```buffer
- a
  - b
  - 
  - ┃
```

</td><td>

<!--ourus-->
```buffer
- a
  - b
- ┃
```

</td></tr>
</table>

#### 9. [Enter44](../../spec/enter.md#enter44)

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
<tr><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--tine-->
```buffer
- one two
- ┃ three
```

</td><td>

<!--ourus-->
```buffer
- one two
- ┃three
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--tine-->
```buffer
- one two┃ three
```

</td><td>

<!--ourus-->
```buffer
- one two┃three
```

</td></tr>
</table>

#### 10. [Enter › E33](../../spec/obsidian-true-outliner.md#e33)

> enter

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- al«pha be»ta
```

</td><td>

<!--tine-->
```buffer
- al
- ┃pha beta
```

</td><td>

<!--ourus-->
```buffer
- al
- ┃ta
```

</td></tr>
</table>

#### 11. [Abandoning an empty place › Enter, Shift-Tab, then leave › Second Enter outdents to a kept item](../../spec/obsidian-true-outliner.md#second-enter-outdents-to-a-kept-item)

> enter enter cursorDocStart

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b┃
```

</td><td>

<!--tine-->
```buffer
- ┃a
  - b
  - 
  - 
```

</td><td>

<!--ourus-->
```buffer
- a
  - b
- 
```

</td></tr>
</table>

#### 12. [Paste36](../../spec/paste.md#paste36)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>tine</th><th>ourus</th></tr>
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

<!--tine-->
```buffer
- list
  - See here.
  - x
  - y┃
```

</td><td>

<!--ourus-->
```buffer
- list
  - See x
    - y
  - ┃here.
```

</td></tr>
</table>

#### 13. [Paste38](../../spec/paste.md#paste38)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>tine</th><th>ourus</th></tr>
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

<!--tine-->
```buffer
- list
  - See here.
  - x
  - y┃
```

</td><td>

<!--ourus-->
```buffer
- list
  - See here.
  - x
    - y┃
```

</td></tr>
</table>

#### 14. [Paste42](../../spec/paste.md#paste42)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>tine</th><th>ourus</th></tr>
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

<!--tine-->
```buffer
- ab
  - child
- x
- y┃
```

</td><td>

<!--ourus-->
```buffer
- ax
- y
- ┃b
  - child
```

</td></tr>
</table>

#### 15. [Paste43](../../spec/paste.md#paste43)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>tine</th><th>ourus</th></tr>
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

<!--tine-->
```buffer
- ab
  - child
- x
- y┃
```

</td><td>

<!--ourus-->
```buffer
- ax
  - y
  - ┃b
  - child
```

</td></tr>
</table>

#### 16. [Outliner flows › Scenario2](../../spec/scenarios.md#scenario2)

> enter indent enter

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
```

</td><td>

<!--tine-->
```buffer
- a
  - 
  - ┃
```

</td><td>

<!--ourus-->
```buffer
- a
- ┃
```

</td></tr>
</table>

#### 17. [Outliner flows › Scenario7](../../spec/scenarios.md#scenario7)

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
<tr><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--tine-->
```buffer
- buy milk
- ┃ and eggs
- call Ann
```

</td><td>

<!--ourus-->
```buffer
- buy milk
- ┃and eggs
- call Ann
```

</td></tr>
</table>

> deleteContentBackward " "

<table>
<tr><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--tine-->
```buffer
- buy milk ┃ and eggs
- call Ann
```

</td><td>

<!--ourus-->
```buffer
- buy milk ┃and eggs
- call Ann
```

</td></tr>
</table>

> cursorLineBoundaryBackward

<table>
<tr><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--tine-->
```buffer
- ┃buy milk  and eggs
- call Ann
```

</td><td>

<!--ourus-->
```buffer
- ┃buy milk and eggs
- call Ann
```

</td></tr>
</table>

> enter "today:"

<table>
<tr><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--tine-->
```buffer
- today:┃
- buy milk  and eggs
- call Ann
```

</td><td>

<!--ourus-->
```buffer
- today:┃
- buy milk and eggs
- call Ann
```

</td></tr>
</table>

> cursorLineDown cursorLineDown cursorLineBoundaryForward deleteContentBackward deleteContentBackward

<table>
<tr><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--tine-->
```buffer
- today:
- buy milk  and eggs
- call A┃
```

</td><td>

<!--ourus-->
```buffer
- today:
- buy milk and eggs
- call A┃
```

</td></tr>
</table>

> cursorLineUp cursorLineBoundaryForward deleteContentForward

<table>
<tr><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--tine-->
```buffer
- today:
- buy milk  and eggs┃call A
```

</td><td>

<!--ourus-->
```buffer
- today:
- buy milk and eggs┃call A
```

</td></tr>
</table>

#### 18. [ShiftEnter21](../../spec/shift-enter.md#shiftenter21)

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

<!--tine-->
```buffer
- one two
  ┃ three
```

</td><td>

<!--ourus-->
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

<!--tine-->
```buffer
- one two┃ three
```

</td><td>

<!--ourus-->
```buffer
- one two┃three
```

</td></tr>
</table>

### Whitespace (11)

#### 1. [Enter1](../../spec/enter.md#enter1)

> enter

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one two┃ three
- next
```

</td><td>

<!--tine-->
```buffer
- one two
- ┃ three
- next
```

</td><td>

<!--ourus-->
```buffer
- one two
- ┃three
- next
```

</td></tr>
</table>

#### 2. [Enter3b](../../spec/enter.md#enter3b)

> enter

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃ b
  - c
```

</td><td>

<!--tine-->
```buffer
- a
  - ┃ b
  - c
```

</td><td>

<!--ourus-->
```buffer
- a
  - ┃b
  - c
```

</td></tr>
</table>

#### 3. [Enter › E4](../../spec/obsidian-true-outliner.md#e4)

> enter

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- first
  second┃ line
```

</td><td>

<!--tine-->
```buffer
- first
  second
- ┃ line
```

</td><td>

<!--ourus-->
```buffer
- first
  second
- ┃line
```

</td></tr>
</table>

#### 4. [Enter › E7, E8 › Split item becomes first tab-indented child](../../spec/obsidian-true-outliner.md#split-item-becomes-first-tab-indented-child)

> enter

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- alpha┃ beta
  - child
```

</td><td>

<!--tine-->
```buffer
- alpha
  - ┃ beta
  - child
```

</td><td>

<!--ourus-->
```buffer
- alpha
  - ┃beta
  - child
```

</td></tr>
</table>

#### 5. [Shift-Enter › S13](../../spec/obsidian-true-outliner.md#s13)

> shiftEnter

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a«lpha» beta
```

</td><td>

<!--tine-->
```buffer
- a
  ┃ beta
```

</td><td>

<!--ourus-->
```buffer
- a
  ┃beta
```

</td></tr>
</table>

#### 6. [Abandoning an empty place › Shift-Enter, Tab, then leave › Carried place removed on leaving](../../spec/obsidian-true-outliner.md#carried-place-removed-on-leaving)

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
<tr><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--tine-->
```buffer
- ┃one
  - kid
  - foo
    
```

</td><td>

<!--ourus-->
```buffer
- one
  - kid
  - foo
```

</td></tr>
</table>

#### 7. [Abandoning an empty place › Shift-Enter, Tab, then leave › Doubly indented place removed on leaving](../../spec/obsidian-true-outliner.md#doubly-indented-place-removed-on-leaving)

> shiftEnter indent indent cursorDocStart

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - kid
  - sib
- foo┃
```

</td><td>

<!--tine-->
```buffer
- ┃one
  - kid
  - sib
    - foo
      
```

</td><td>

<!--ourus-->
```buffer
- one
  - kid
  - sib
    - foo
```

</td></tr>
</table>

#### 8. [Placeholder8](../../spec/placeholders.md#placeholder8)

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
<tr><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--tine-->
```buffer
- ┃ b
  - c
```

</td><td>

<!--ourus-->
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

#### 9. [ShiftEnter1](../../spec/shift-enter.md#shiftenter1)

> shiftEnter

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one two┃ three
```

</td><td>

<!--tine-->
```buffer
- one two
  ┃ three
```

</td><td>

<!--ourus-->
```buffer
- one two
  ┃three
```

</td></tr>
</table>

#### 10. [ShiftEnter3](../../spec/shift-enter.md#shiftenter3)

> shiftEnter

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- x
  - a┃ b
```

</td><td>

<!--tine-->
```buffer
- x
  - a
    ┃ b
```

</td><td>

<!--ourus-->
```buffer
- x
  - a
    ┃b
```

</td></tr>
</table>

#### 11. [ShiftEnter13](../../spec/shift-enter.md#shiftenter13)

> shiftEnter

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃one
```

</td><td>

<!--tine-->
```buffer
- 
  ┃one
```

</td><td>

<!--ourus-->
```buffer
- ┃one
```

</td></tr>
</table>

### Caret (6)

#### 1. [CursorUp3](../../spec/cursor.md#cursorup3)

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

<!--tine-->
```buffer
- a
  - b┃
- c
```

</td><td>

<!--ourus-->
```buffer
- a
  - ┃b
- c
```

</td></tr>
</table>

#### 2. [DeleteSubtree1](../../spec/delete-subtree.md#deletesubtree1)

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

<!--tine-->
```buffer
- a
- d
```

</td><td>

<!--ourus-->
```buffer
- a┃
- d
```

</td></tr>
</table>

#### 3. [Enter28](../../spec/enter.md#enter28)

> enter

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃
  - c
```

</td><td>

<!--tine-->
```buffer
- a
  - 
  - ┃
  - c
```

</td><td>

<!--ourus-->
```buffer
- a
  - ┃
  - 
  - c
```

</td></tr>
</table>

#### 4. [Paste › #216 › Pasted list takes space indent unit](../../spec/obsidian-true-outliner.md#pasted-list-takes-space-indent-unit)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>tine</th><th>ourus</th></tr>
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

<!--tine-->
```buffer
- top
  - sib
  - a┃
    - b
      - c
```

</td><td>

<!--ourus-->
```buffer
- top
  - sib
  - a
    - b
      - c┃
```

</td></tr>
</table>

#### 5. [Paste › #216 › Pasted list takes tab indent unit](../../spec/obsidian-true-outliner.md#pasted-list-takes-tab-indent-unit)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>tine</th><th>ourus</th></tr>
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

<!--tine-->
```buffer
- top
  - sib
  - a┃
    - b
      - c
```

</td><td>

<!--ourus-->
```buffer
- top
  - sib
  - a
    - b
      - c┃
```

</td></tr>
</table>

#### 6. [Outliner flows › Scenario10](../../spec/scenarios.md#scenario10)

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

<!--tine-->
```buffer
- a
```

</td><td>

<!--ourus-->
```buffer
- ┃a
```

</td></tr>
</table>

### Agree (104)

1. [Backspace1](../../spec/backspace.md#backspace1)
2. [Backspace3](../../spec/backspace.md#backspace3)
3. [Backspace5](../../spec/backspace.md#backspace5)
4. [Backspace7](../../spec/backspace.md#backspace7)
5. [Backspace8](../../spec/backspace.md#backspace8)
6. [Backspace9](../../spec/backspace.md#backspace9)
7. [Backspace13](../../spec/backspace.md#backspace13)
8. [Backspace17](../../spec/backspace.md#backspace17)
9. [Backspace17d](../../spec/backspace.md#backspace17d)
10. [Backspace30](../../spec/backspace.md#backspace30)
11. [Backspace32](../../spec/backspace.md#backspace32)
12. [CursorDown3](../../spec/cursor.md#cursordown3)
13. [CursorDown4](../../spec/cursor.md#cursordown4)
14. [CursorHome1](../../spec/cursor.md#cursorhome1)
15. [CursorHome2](../../spec/cursor.md#cursorhome2)
16. [CursorHome5](../../spec/cursor.md#cursorhome5)
17. [CursorHome6](../../spec/cursor.md#cursorhome6)
18. [CursorHome12](../../spec/cursor.md#cursorhome12)
19. [CursorHome13](../../spec/cursor.md#cursorhome13)
20. [CursorEnd1](../../spec/cursor.md#cursorend1)
21. [CursorDocStart1](../../spec/cursor.md#cursordocstart1)
22. [SelectHome1](../../spec/cursor.md#selecthome1)
23. [Delete1](../../spec/del.md#delete1)
24. [Delete2](../../spec/del.md#delete2)
25. [Delete3](../../spec/del.md#delete3)
26. [Delete5c](../../spec/del.md#delete5c)
27. [Delete6](../../spec/del.md#delete6)
28. [Delete7](../../spec/del.md#delete7)
29. [Delete8](../../spec/del.md#delete8)
30. [Delete12](../../spec/del.md#delete12)
31. [Delete20](../../spec/del.md#delete20)
32. [Delete22](../../spec/del.md#delete22)
33. [Enter4](../../spec/enter.md#enter4)
34. [Enter7](../../spec/enter.md#enter7)
35. [Enter15](../../spec/enter.md#enter15)
36. [Enter16](../../spec/enter.md#enter16)
37. [Enter21](../../spec/enter.md#enter21)
38. [Enter26](../../spec/enter.md#enter26)
39. [Enter27](../../spec/enter.md#enter27)
40. [Enter29](../../spec/enter.md#enter29)
41. [Enter31](../../spec/enter.md#enter31)
42. [Enter38](../../spec/enter.md#enter38)
43. [Enter39](../../spec/enter.md#enter39)
44. [Indent1](../../spec/indent.md#indent1)
45. [Indent14](../../spec/indent.md#indent14)
46. [Indent2](../../spec/indent.md#indent2)
47. [Indent6](../../spec/indent.md#indent6)
48. [Indent7](../../spec/indent.md#indent7)
49. [Indent8](../../spec/indent.md#indent8)
50. [Indent10](../../spec/indent.md#indent10)
51. [Indent19](../../spec/indent.md#indent19)
52. [Indent26](../../spec/indent.md#indent26)
53. [MoveDown3](../../spec/move-subtree-down.md#movedown3)
54. [MoveDown6](../../spec/move-subtree-down.md#movedown6)
55. [MoveDown7](../../spec/move-subtree-down.md#movedown7)
56. [MoveDown9](../../spec/move-subtree-down.md#movedown9)
57. [MoveDown10](../../spec/move-subtree-down.md#movedown10)
58. [MoveDown15](../../spec/move-subtree-down.md#movedown15)
59. [MoveUp1](../../spec/move-subtree-up.md#moveup1)
60. [MoveUp2](../../spec/move-subtree-up.md#moveup2)
61. [MoveUp5](../../spec/move-subtree-up.md#moveup5)
62. [MoveUp6](../../spec/move-subtree-up.md#moveup6)
63. [MoveUp8](../../spec/move-subtree-up.md#moveup8)
64. [MoveUp9](../../spec/move-subtree-up.md#moveup9)
65. [MoveUp32](../../spec/move-subtree-up.md#moveup32)
66. [Enter › E7, E8 › End of parent opens empty first child](../../spec/obsidian-true-outliner.md#end-of-parent-opens-empty-first-child)
67. [Shift-Enter › S11 › Place inside a multi-line item](../../spec/obsidian-true-outliner.md#place-inside-a-multi-line-item)
68. [Backspace › #153 › Undoing a fresh line break](../../spec/obsidian-true-outliner.md#undoing-a-fresh-line-break)
69. [Backspace › delete-to-content-start](../../spec/obsidian-true-outliner.md#delete-to-content-start)
70. [Backspace › Joining an item with children › Children move to the joined node](../../spec/obsidian-true-outliner.md#children-move-to-the-joined-node)
71. [Backspace › Joining an item with children › Delete forward absorbs child with grandchildren](../../spec/obsidian-true-outliner.md#delete-forward-absorbs-child-with-grandchildren)
72. [Indentation › list-marker-content-column](../../spec/obsidian-true-outliner.md#list-marker-content-column)
73. [Indentation › indent-unit-on-every-line](../../spec/obsidian-true-outliner.md#indent-unit-on-every-line)
74. [Moving › lone-block-id › Block id moves with its item](../../spec/obsidian-true-outliner.md#block-id-moves-with-its-item)
75. [Abandoning an empty place › Shift-Enter, Tab, then leave › Backspace returns to the start](../../spec/obsidian-true-outliner.md#backspace-returns-to-the-start)
76. [Abandoning an empty place › Shift-Enter, Tab, then leave › Shift-Tab then Backspace returns to start](../../spec/obsidian-true-outliner.md#shift-tab-then-backspace-returns-to-start)
77. [Abandoning an empty place › Shift-Enter, Tab, then Enter](../../spec/obsidian-true-outliner.md#shift-enter-tab-then-enter)
78. [Abandoning an empty place › Enter, then Shift-Enter and Backspace](../../spec/obsidian-true-outliner.md#enter-then-shift-enter-and-backspace)
79. [Outdent1](../../spec/outdent.md#outdent1)
80. [Outdent3](../../spec/outdent.md#outdent3)
81. [Outdent2](../../spec/outdent.md#outdent2)
82. [Outdent13](../../spec/outdent.md#outdent13)
83. [Direct outdent › DirectOutdent1](../../spec/outdent.md#directoutdent1)
84. [Paste3](../../spec/paste.md#paste3)
85. [Paste5](../../spec/paste.md#paste5)
86. [Paste7](../../spec/paste.md#paste7)
87. [Paste10](../../spec/paste.md#paste10)
88. [Paste24](../../spec/paste.md#paste24)
89. [Paste26](../../spec/paste.md#paste26)
90. [Paste31](../../spec/paste.md#paste31)
91. [Placeholder6](../../spec/placeholders.md#placeholder6)
92. [Outliner flows › Scenario1](../../spec/scenarios.md#scenario1)
93. [Outliner flows › Scenario3](../../spec/scenarios.md#scenario3)
94. [Outliner flows › Scenario5](../../spec/scenarios.md#scenario5)
95. [Outliner flows › Scenario8](../../spec/scenarios.md#scenario8)
96. [Outliner flows › Scenario9](../../spec/scenarios.md#scenario9)
97. [Outliner flows › Scenario11](../../spec/scenarios.md#scenario11)
98. [Outliner flows › Scenario12](../../spec/scenarios.md#scenario12)
99. [Outliner flows › Scenario14](../../spec/scenarios.md#scenario14)
100. [ShiftEnter4](../../spec/shift-enter.md#shiftenter4)
101. [ShiftEnter17](../../spec/shift-enter.md#shiftenter17)
102. [Undo1](../../spec/undo.md#undo1)
103. [Undo4](../../spec/undo.md#undo4)
104. [Undo5](../../spec/undo.md#undo5)

## Adapted cases

### Disagree (130)

#### 1. [Backspace4](../../spec/backspace.md#backspace4)

> deleteContentBackward

Adapted: heading

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Title #
  - ┃more
```

</td><td>

<!--tine-->
```buffer
- # Title #┃more
```

</td><td>

<!--ourus-->
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

#### 2. [Backspace12](../../spec/backspace.md#backspace12)

> deleteContentBackward

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃b
```

</td><td>

<!--tine-->
```buffer
- a┃b
```

</td><td>

<!--ourus-->
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

#### 3. [Backspace12b](../../spec/backspace.md#backspace12b)

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
<tr><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--tine-->
```buffer
- ┃b
```

</td><td>

<!--ourus-->
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

#### 4. [Backspace12c](../../spec/backspace.md#backspace12c)

> deleteContentBackward

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃b
  - x
```

</td><td>

<!--tine-->
```buffer
- a┃b
  - x
```

</td><td>

<!--ourus-->
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

#### 5. [Backspace14](../../spec/backspace.md#backspace14)

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
<tr><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--tine-->
```buffer
- ┃# H1
  - 
  - ## H2
```

</td><td>

<!--ourus-->
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

#### 6. [Backspace16](../../spec/backspace.md#backspace16)

> deleteContentBackward

Adapted: code block

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- ```
  x
  ```
- ┃a
````

</td><td>

<!--tine-->
````buffer
- ```
  x
  ```a┃
````

</td><td>

<!--ourus-->
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

#### 7. [Backspace18](../../spec/backspace.md#backspace18)

> deleteContentBackward

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- para
- # ┃Hello
  - body
```

</td><td>

<!--tine-->
```buffer
- para
- #┃Hello
  - body
```

</td><td>

<!--ourus-->
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

#### 8. [Backspace18c](../../spec/backspace.md#backspace18c)

> deleteContentBackward

Adapted: blank lines, heading, paragraph, setext heading

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # ┃Title
  - text
```

</td><td>

<!--tine-->
```buffer
- #┃Title
  - text
```

</td><td>

<!--ourus-->
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

#### 9. [Backspace18d](../../spec/backspace.md#backspace18d)

> deleteContentBackward

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- # ┃H1
  - text
```

</td><td>

<!--tine-->
```buffer
- a
- #┃H1
  - text
```

</td><td>

<!--ourus-->
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

#### 10. [Backspace18e](../../spec/backspace.md#backspace18e)

> deleteContentBackward

Adapted: heading

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- # ┃H
```

</td><td>

<!--tine-->
```buffer
- a
- #┃H
```

</td><td>

<!--ourus-->
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

#### 11. [Backspace19](../../spec/backspace.md#backspace19)

> deleteContentBackward

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃bc
```

</td><td>

<!--tine-->
```buffer
- a┃bc
```

</td><td>

<!--ourus-->
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

#### 12. [Backspace20](../../spec/backspace.md#backspace20)

> deleteContentBackward

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃
  - b
```

</td><td>

<!--tine-->
```buffer
- a┃
  - b
```

</td><td>

<!--ourus-->
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

#### 13. [Backspace23](../../spec/backspace.md#backspace23)

> deleteContentBackward

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Title
  - ┃more
    lines
```

</td><td>

<!--tine-->
```buffer
- # Title┃more
  lines
```

</td><td>

<!--ourus-->
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

#### 14. [Backspace24](../../spec/backspace.md#backspace24)

> deleteContentBackward

Adapted: blank lines, code block, paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- ```
  x
  ```
- ┃para
````

</td><td>

<!--tine-->
````buffer
- ```
  x
  ```para┃
````

</td><td>

<!--ourus-->
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

#### 15. [Backspace33](../../spec/backspace.md#backspace33)

> deleteContentBackward

Adapted: paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃a
- b
```

</td><td>

<!--tine-->
```buffer
- ┃a
- b
```

</td><td>

<!--ourus-->
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

#### 16. [Backspace35](../../spec/backspace.md#backspace35)

> deleteContentBackward

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
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

<!--tine-->
```buffer
- # A
  - intro
  - ##┃B
    - para
      - item
  - ## C
```

</td><td>

<!--ourus-->
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

#### 17. [Cmd-Backspace › SoftBackspace1](../../spec/backspace.md#softbackspace1)

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
<tr><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--tine-->
```buffer
- ┃def
```

</td><td>

<!--ourus-->
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

#### 18. [Cmd-Backspace › SoftBackspace3](../../spec/backspace.md#softbackspace3)

> deleteSoftLineBackward

Adapted: heading, setext heading

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # abc ┃- x tail
```

</td><td>

<!--tine-->
```buffer
- ┃- x tail
```

</td><td>

<!--ourus-->
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

#### 19. [Cmd-Backspace › SoftBackspace4](../../spec/backspace.md#softbackspace4)

> deleteSoftLineBackward

Adapted: heading

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # abc ┃title #
```

</td><td>

<!--tine-->
```buffer
- ┃title #
```

</td><td>

<!--ourus-->
```buffer
- # ┃title #
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# abc ┃title #
```

</td><td>

```buffer
# ┃title #
```

</td></tr>
</table>

#### 20. [Cmd-Backspace › SoftBackspace5](../../spec/backspace.md#softbackspace5)

> deleteSoftLineBackward

Adapted: heading, setext heading

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # first
  abc ┃- x
```

</td><td>

<!--tine-->
```buffer
- # first
  ┃\- x
```

</td><td>

<!--ourus-->
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

#### 21. [Delete4](../../spec/del.md#delete4)

> deleteContentForward

Adapted: heading

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Title┃ #
  - more
```

</td><td>

<!--tine-->
```buffer
- # Title┃#
  - more
```

</td><td>

<!--ourus-->
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

#### 22. [Delete4b](../../spec/del.md#delete4b)

> deleteContentForward

Adapted: heading

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Title #┃
  - more
```

</td><td>

<!--tine-->
```buffer
- # Title #┃more
```

</td><td>

<!--ourus-->
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

#### 23. [Delete9](../../spec/del.md#delete9)

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
<tr><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--tine-->
```buffer
- ┃# H1
  - 
  - ## H2
```

</td><td>

<!--ourus-->
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

#### 24. [Delete11](../../spec/del.md#delete11)

> deleteContentForward

Adapted: code block, heading

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # H┃
  -     code
```

</td><td>

<!--tine-->
```buffer
- # H┃    code
```

</td><td>

<!--ourus-->
```buffer
- # H┃
  -     code
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# H┃
    code
```

</td><td>

```buffer
# H┃
    code
```

</td></tr>
</table>

#### 25. [Delete13c](../../spec/del.md#delete13c)

> deleteContentForward

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- # H1
  - text
```

</td><td>

<!--tine-->
```buffer
- a┃# H1
  - text
```

</td><td>

<!--ourus-->
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

#### 26. [Delete13e](../../spec/del.md#delete13e)

> deleteContentForward

Adapted: blank lines, heading, paragraph, setext heading

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- # Title
```

</td><td>

<!--tine-->
```buffer
- a┃# Title
```

</td><td>

<!--ourus-->
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

#### 27. [Delete14](../../spec/del.md#delete14)

> deleteContentForward

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- # H1
  - body
```

</td><td>

<!--tine-->
```buffer
- a┃# H1
  - body
```

</td><td>

<!--ourus-->
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

#### 28. [Delete18](../../spec/del.md#delete18)

> deleteContentForward

Adapted: blank lines, paragraph; Also: [del.md › Delete18c](../../spec/del.md#delete18c)

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

<!--tine-->
```buffer
- a┃b
```

</td><td>

<!--ourus-->
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

#### 29. [Delete18b](../../spec/del.md#delete18b)

> deleteContentForward

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - bc
```

</td><td>

<!--tine-->
```buffer
- a┃bc
```

</td><td>

<!--ourus-->
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

#### 30. [Delete19](../../spec/del.md#delete19)

> deleteContentForward

Adapted: task

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃[ ] task
```

</td><td>

<!--tine-->
```buffer
- ┃ODO task
```

</td><td>

<!--ourus-->
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

#### 31. [DeleteSubtree6](../../spec/delete-subtree.md#deletesubtree6)

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

<!--tine-->
```buffer
- 
```

</td><td>

<!--ourus-->
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

#### 32. [Enter3c](../../spec/enter.md#enter3c)

> enter

Adapted: numbered list

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃ b
  - c
- d
```

</td><td>

<!--tine-->
```buffer
- a
  - ┃ b
  - c
- d
```

</td><td>

<!--ourus-->
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

#### 33. [Enter14](../../spec/enter.md#enter14)

> enter enter enter "p"

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b┃
```

</td><td>

<!--tine-->
```buffer
- a
  - b
  - 
  - 
  - p┃
```

</td><td>

<!--ourus-->
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

#### 34. [Enter22](../../spec/enter.md#enter22)

> enter

Adapted: blank lines, escape, paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- para ┃- x
  - a
```

</td><td>

<!--tine-->
```buffer
- para 
  - ┃- x
  - a
```

</td><td>

<!--ourus-->
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

#### 35. [Enter32](../../spec/enter.md#enter32)

> enter

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- para
- # ┃Title
  - body
```

</td><td>

<!--tine-->
```buffer
- para
- # 
  - ┃Title
  - body
```

</td><td>

<!--ourus-->
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

#### 36. [Enter40](../../spec/enter.md#enter40)

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
<tr><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--tine-->
```buffer
- a
- 
- ┃
```

</td><td>

<!--ourus-->
```buffer
- a
- ┃
```

</td></tr>
</table>

> enter

<table>
<tr><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--tine-->
```buffer
- a
- 
- 
- ┃
```

</td><td>

<!--ourus-->
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

#### 37. [Enter41](../../spec/enter.md#enter41)

> enter

Adapted: escape, heading, paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Title ┃- x
  - y
```

</td><td>

<!--tine-->
```buffer
- # Title 
  - ┃- x
  - y
```

</td><td>

<!--ourus-->
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

#### 38. [Enter42](../../spec/enter.md#enter42)

> enter

Adapted: escape, heading, paragraph, setext heading

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # title ┃- x
```

</td><td>

<!--tine-->
```buffer
- # title 
- ┃- x
```

</td><td>

<!--ourus-->
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

#### 39. [Enter45](../../spec/enter.md#enter45)

> enter

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- para
- # ┃Title
```

</td><td>

<!--tine-->
```buffer
- para
- # 
- ┃Title
```

</td><td>

<!--ourus-->
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

#### 40. [Fence30](../../spec/fences.md#fence30)

> deleteContentForward

Adapted: code block

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  - ```
    code
    ┃
    ```
````

</td><td>

<!--tine-->
````buffer
- a
  - ```
    code
    ┃
    ```
````

</td><td>

<!--ourus-->
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

#### 41. [Fence34](../../spec/fences.md#fence34)

> deleteContentForward

Adapted: code block

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a┃
- ```
  one
  ```
````

</td><td>

<!--tine-->
````buffer
- a┃```
  one
  ```
````

</td><td>

<!--ourus-->
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

#### 42. [Fence36](../../spec/fences.md#fence36)

> deleteContentBackward

Adapted: code block

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- ```
  ``
  ┃`
  body
  ```
````

</td><td>

<!--tine-->
````buffer
- ```
  ```
  body
  ```┃
````

</td><td>

<!--ourus-->
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

#### 43. [Fence37](../../spec/fences.md#fence37)

> deleteContentForward

Adapted: code block

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- ```
  ``┃
  `
  body
  ```
````

</td><td>

<!--tine-->
````buffer
- ```
  ```
  body
  ```┃
````

</td><td>

<!--ourus-->
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

#### 44. [Fence38](../../spec/fences.md#fence38)

> shiftEnter

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

<!--tine-->
````buffer
- ``┃`
  x
  ```
  body
  ```
````

</td><td>

<!--ourus-->
````buffer
- ```
  x┃```
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
x┃```
body
```
````

</td><td>

````buffer
```
x┃```
body
```
````

</td></tr>
</table>

#### 45. [Fence39](../../spec/fences.md#fence39)

> enter

Adapted: code block

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- ```
  ```┃x
  body
  ```
````

</td><td>

<!--tine-->
````buffer
- ```
  ┃```
  x
  body
  ```
````

</td><td>

<!--ourus-->
````buffer
- ```
  ```┃x
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
```┃x
body
```
````

</td><td>

````buffer
```
```┃x
body
```
````

</td></tr>
</table>

#### 46. [Indent12](../../spec/indent.md#indent12)

> indent

Adapted: heading

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # A
  - ## B┃
    - ### C
```

</td><td>

<!--tine-->
```buffer
- # A
  - ## B┃
    - ### C
```

</td><td>

<!--ourus-->
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

#### 47. [Indent16](../../spec/indent.md#indent16)

> indent

Adapted: blank lines, heading, setext heading

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Title┃
  - ## Sub
```

</td><td>

<!--tine-->
```buffer
- # Title┃
  - ## Sub
```

</td><td>

<!--ourus-->
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

#### 48. [Indent23](../../spec/indent.md#indent23)

> indent

Adapted: heading

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # A
  - ## B
  - ## C┃
    - ### D
```

</td><td>

<!--tine-->
```buffer
- # A
  - ## B
    - ## C┃
      - ### D
```

</td><td>

<!--ourus-->
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

#### 49. [Indent25](../../spec/indent.md#indent25)

> indent

Adapted: blank lines, heading, setext heading

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ## Title┃
  - ### Sub
```

</td><td>

<!--tine-->
```buffer
- ## Title┃
  - ### Sub
```

</td><td>

<!--ourus-->
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

#### 50. [MoveDown2](../../spec/move-subtree-down.md#movedown2)

> moveSubtreeDown

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # H
  - a┃
  - para
```

</td><td>

<!--tine-->
```buffer
- # H
  - para
  - a┃
```

</td><td>

<!--ourus-->
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

#### 51. [MoveDown8](../../spec/move-subtree-down.md#movedown8)

> moveSubtreeDown

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b┃
- para
  - c
```

</td><td>

<!--tine-->
```buffer
- a
- para
  - c
- b┃
```

</td><td>

<!--ourus-->
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

#### 52. [MoveDown13](../../spec/move-subtree-down.md#movedown13)

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
<tr><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--tine-->
```buffer
- intro
- b┃
  - b1
```

</td><td>

<!--ourus-->
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

#### 53. [MoveDown17](../../spec/move-subtree-down.md#movedown17)

> moveSubtreeDown

Adapted: heading

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ## ┃H
- # H
  - a
```

</td><td>

<!--tine-->
```buffer
- # H
  - a
- ## ┃H
```

</td><td>

<!--ourus-->
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

#### 54. [MoveDown19](../../spec/move-subtree-down.md#movedown19)

> moveSubtreeDown

Adapted: blank lines, heading

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # A
  - ## s┃
- # B
  - x
```

</td><td>

<!--tine-->
```buffer
- # A
- # B
  - ## s┃
  - x
```

</td><td>

<!--ourus-->
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

#### 55. [MoveDown20](../../spec/move-subtree-down.md#movedown20)

> moveSubtreeDown

Adapted: blank lines, heading

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Todo
  - one
  - two┃
  - ## Later
    - three
```

</td><td>

<!--tine-->
```buffer
- # Todo
  - one
  - ## Later
    - three
  - two┃
```

</td><td>

<!--ourus-->
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

#### 56. [MoveDown25](../../spec/move-subtree-down.md#movedown25)

> moveSubtreeDown

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # A
  - para┃
- # B
  - x
```

</td><td>

<!--tine-->
```buffer
- # A
- # B
  - para┃
  - x
```

</td><td>

<!--ourus-->
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

#### 57. [MoveDown28](../../spec/move-subtree-down.md#movedown28)

> moveSubtreeDown

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # A
  - ## sub
    - s1
    - ┃para
- # B
```

</td><td>

<!--tine-->
```buffer
- # A
  - ## sub
    - s1
    - ┃para
- # B
```

</td><td>

<!--ourus-->
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

#### 58. [MoveUp7](../../spec/move-subtree-up.md#moveup7)

> moveSubtreeUp

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- para
  - b┃
  - c
```

</td><td>

<!--tine-->
```buffer
- a
  - b┃
- para
  - c
```

</td><td>

<!--ourus-->
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

#### 59. [MoveUp12](../../spec/move-subtree-up.md#moveup12)

> moveSubtreeUp

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- intro
  - b┃
    - b1
```

</td><td>

<!--tine-->
```buffer
- intro
  - b┃
    - b1
```

</td><td>

<!--ourus-->
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

#### 60. [MoveUp21](../../spec/move-subtree-up.md#moveup21)

> moveSubtreeUp

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- para
  - a┃
  - b
```

</td><td>

<!--tine-->
```buffer
- para
  - a┃
  - b
```

</td><td>

<!--ourus-->
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

#### 61. [MoveUp23](../../spec/move-subtree-up.md#moveup23)

> moveSubtreeUp

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # A
  - ## sub
    - s1
- # B
  - ┃para
```

</td><td>

<!--tine-->
```buffer
- # A
  - ## sub
    - s1
  - ┃para
- # B
```

</td><td>

<!--ourus-->
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

#### 62. [MoveUp24](../../spec/move-subtree-up.md#moveup24)

> moveSubtreeUp

Adapted: blank lines, heading

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Todo
  - one
  - ## Later
    - ┃two
    - three
```

</td><td>

<!--tine-->
```buffer
- # Todo
  - one
    - ┃two
  - ## Later
    - three
```

</td><td>

<!--ourus-->
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

#### 63. [MoveUp27](../../spec/move-subtree-up.md#moveup27)

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
<tr><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--tine-->
```buffer
- # Work
  - para
  - ┃review
- # Home
```

</td><td>

<!--ourus-->
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

#### 64. [MoveUp28](../../spec/move-subtree-up.md#moveup28)

> moveSubtreeUp

Adapted: heading

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ## X
- # A┃
  - a
```

</td><td>

<!--tine-->
```buffer
- # A┃
  - a
- ## X
```

</td><td>

<!--ourus-->
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

#### 65. [MoveUp29](../../spec/move-subtree-up.md#moveup29)

> moveSubtreeUp

Adapted: heading

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # H
  - ┃a
  - b
```

</td><td>

<!--tine-->
```buffer
- # H
  - ┃a
  - b
```

</td><td>

<!--ourus-->
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

#### 66. [MoveUp33](../../spec/move-subtree-up.md#moveup33)

> moveSubtreeUp

Adapted: heading

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # H
  - a
  - ## ┃H
```

</td><td>

<!--tine-->
```buffer
- # H
  - ## ┃H
  - a
```

</td><td>

<!--ourus-->
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

#### 67. [Enter › E9](../../spec/obsidian-true-outliner.md#e9)

> enter

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one┃ two
  - child
```

</td><td>

<!--tine-->
```buffer
- one
  - ┃ two
  - child
```

</td><td>

<!--ourus-->
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

#### 68. [Enter › E15](../../spec/obsidian-true-outliner.md#e15)

> enter

Adapted: heading, paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Head┃line
  - item
```

</td><td>

<!--tine-->
```buffer
- # Head
  - ┃line
  - item
```

</td><td>

<!--ourus-->
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

#### 69. [Enter › E17](../../spec/obsidian-true-outliner.md#e17)

> enter

Adapted: heading, paragraph, setext heading; Also: [obsidian-true-outliner.md › Enter › E13, E16 › Rest of title becomes first paragraph](../../spec/obsidian-true-outliner.md#rest-of-title-becomes-first-paragraph)

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Hello┃ world
```

</td><td>

<!--tine-->
```buffer
- # Hello
- ┃ world
```

</td><td>

<!--ourus-->
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

#### 70. [Enter › E19, E21 › End of lone heading starts a paragraph](../../spec/obsidian-true-outliner.md#end-of-lone-heading-starts-a-paragraph)

> enter "x"

Adapted: heading, paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Head┃
```

</td><td>

<!--tine-->
```buffer
- # Head
- x┃
```

</td><td>

<!--ourus-->
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

#### 71. [Enter › E19, E21 › Empty paragraph before a section list](../../spec/obsidian-true-outliner.md#empty-paragraph-before-a-section-list)

> enter

Adapted: heading, paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Head┃
  - item
```

</td><td>

<!--tine-->
```buffer
- # Head
  - ┃
  - item
```

</td><td>

<!--ourus-->
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

#### 72. [Enter › E32 › Task checkbox carries over unchecked](../../spec/obsidian-true-outliner.md#task-checkbox-carries-over-unchecked)

> enter

Adapted: task

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] alpha┃ beta
```

</td><td>

<!--tine-->
```buffer
- [ ] alpha
- ┃ beta
```

</td><td>

<!--ourus-->
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

#### 73. [Enter › E32 › Checked task gives unchecked new item](../../spec/obsidian-true-outliner.md#checked-task-gives-unchecked-new-item)

> enter

Adapted: task

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [x] done┃
```

</td><td>

<!--tine-->
```buffer
- [x] done
- ┃
```

</td><td>

<!--ourus-->
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

#### 74. [Shift-Enter › S7, S8 › Line break in setext title refused](../../spec/obsidian-true-outliner.md#line-break-in-setext-title-refused)

> shiftEnter

Adapted: heading, setext heading

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Hello┃ world
```

</td><td>

<!--tine-->
```buffer
- # Hello
  ┃ world
```

</td><td>

<!--ourus-->
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

#### 75. [Shift-Enter › S11 › Leaving the place removes it](../../spec/obsidian-true-outliner.md#leaving-the-place-removes-it)

> shiftEnter cursorDocStart

Adapted: paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- foo┃
  bar
```

</td><td>

<!--tine-->
```buffer
- ┃foo
  
  bar
```

</td><td>

<!--ourus-->
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

#### 76. [Backspace › Joining a task › Backspace before the checkbox](../../spec/obsidian-true-outliner.md#backspace-before-the-checkbox)

> deleteContentBackward

Adapted: task

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃[ ] b
```

</td><td>

<!--tine-->
```buffer
- a┃TODO b
```

</td><td>

<!--ourus-->
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

#### 77. [Outdent4](../../spec/outdent.md#outdent4)

> outdent

Adapted: heading

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ## A┃
  - ### B
```

</td><td>

<!--tine-->
```buffer
- ## A┃
  - ### B
```

</td><td>

<!--ourus-->
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

#### 78. [Outdent11](../../spec/outdent.md#outdent11)

> outdent

Adapted: heading

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # T
  - ## A┃
  - ## B
```

</td><td>

<!--tine-->
```buffer
- # T
- ## A┃
  - ## B
```

</td><td>

<!--ourus-->
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

#### 79. [Direct outdent › DirectOutdent2](../../spec/outdent.md#directoutdent2)

> outdent

Adapted: paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

<!--tine-->
```buffer
- a┃
- b
```

</td><td>

<!--ourus-->
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

#### 80. [Direct outdent › DirectOutdent3](../../spec/outdent.md#directoutdent3)

> outdent

Adapted: paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - a1
- b
```

</td><td>

<!--tine-->
```buffer
- a┃
  - a1
- b
```

</td><td>

<!--ourus-->
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

#### 81. [Paste1](../../spec/paste.md#paste1)

> pasteStructured

Adapted: code block, paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>tine</th><th>ourus</th></tr>
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

<!--tine-->
````buffer
- para
  - a```
    c
    ```
    ┃
  - b
````

</td><td>

<!--ourus-->
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

#### 82. [Paste6](../../spec/paste.md#paste6)

> pastePlain

Adapted: heading

<table>
<tr><th>clipboard</th><th>buffer</th><th>tine</th><th>ourus</th></tr>
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

<!--tine-->
```buffer
- # Hx
  y
  ┃
```

</td><td>

<!--ourus-->
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

#### 83. [Paste13](../../spec/paste.md#paste13)

> pasteStructured

Adapted: escape

<table>
<tr><th>clipboard</th><th>buffer</th><th>tine</th><th>ourus</th></tr>
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

<!--tine-->
```buffer
- a1. x
  2\. y
  ┃
- b
```

</td><td>

<!--ourus-->
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

#### 84. [Paste14](../../spec/paste.md#paste14)

> pasteStructured

Adapted: escape

<table>
<tr><th>clipboard</th><th>buffer</th><th>tine</th><th>ourus</th></tr>
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

<!--tine-->
```buffer
- a1. x
  2\. y
  ┃
  - kid
```

</td><td>

<!--ourus-->
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

#### 85. [Paste15](../../spec/paste.md#paste15)

> pasteStructured

Adapted: numbered list

<table>
<tr><th>clipboard</th><th>buffer</th><th>tine</th><th>ourus</th></tr>
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

<!--tine-->
```buffer
- 1. x
  2\. y
  ┃
- b
```

</td><td>

<!--ourus-->
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

#### 86. [Paste17](../../spec/paste.md#paste17)

> pasteStructured

Adapted: escape, numbered list

<table>
<tr><th>clipboard</th><th>buffer</th><th>tine</th><th>ourus</th></tr>
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

<!--tine-->
```buffer
- a1. x
     1. x1
  2\. y
  ┃
```

</td><td>

<!--ourus-->
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

#### 87. [Paste18](../../spec/paste.md#paste18)

> pasteStructured

Adapted: numbered list

<table>
<tr><th>clipboard</th><th>buffer</th><th>tine</th><th>ourus</th></tr>
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

<!--tine-->
```buffer
- a1. x
  2\. y
  ┃
- b
```

</td><td>

<!--ourus-->
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

#### 88. [Paste19](../../spec/paste.md#paste19)

> pasteStructured

Adapted: heading, paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>tine</th><th>ourus</th></tr>
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

<!--tine-->
```buffer
- a
- # h
- text┃
```

</td><td>

<!--ourus-->
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

#### 89. [Paste20](../../spec/paste.md#paste20)

> pasteStructured

Adapted: blank lines, paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>tine</th><th>ourus</th></tr>
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

<!--tine-->
```buffer
- Notes
  - x
  - z
- p
- q┃
```

</td><td>

<!--ourus-->
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

#### 90. [Paste21](../../spec/paste.md#paste21)

> pasteStructured

Adapted: paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>tine</th><th>ourus</th></tr>
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

<!--tine-->
```buffer
- Notes
  - x
- p
- q┃
```

</td><td>

<!--ourus-->
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

#### 91. [Paste25](../../spec/paste.md#paste25)

> pasteStructured

Adapted: code block

<table>
<tr><th>clipboard</th><th>buffer</th><th>tine</th><th>ourus</th></tr>
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

<!--tine-->
````buffer
- a```
  c
  ```
  ┃
  - kid
- b
````

</td><td>

<!--ourus-->
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

#### 92. [Paste27](../../spec/paste.md#paste27)

> pasteStructured

Adapted: task

<table>
<tr><th>clipboard</th><th>buffer</th><th>tine</th><th>ourus</th></tr>
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

<!--tine-->
```buffer
- [ ] t
  - g
- a
- b┃
```

</td><td>

<!--ourus-->
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

#### 93. [Paste33](../../spec/paste.md#paste33)

> pasteStructured

Adapted: blank lines, heading, paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>tine</th><th>ourus</th></tr>
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

<!--tine-->
```buffer
- ## A
  - para
  - ## h┃
```

</td><td>

<!--ourus-->
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

#### 94. [Paste34](../../spec/paste.md#paste34)

> pasteStructured

Adapted: blank lines, heading, paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>tine</th><th>ourus</th></tr>
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

<!--tine-->
```buffer
- para
- # h┃
- next
```

</td><td>

<!--ourus-->
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

#### 95. [Paste35](../../spec/paste.md#paste35)

> pasteStructured

Adapted: blank lines, heading, paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>tine</th><th>ourus</th></tr>
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

<!--tine-->
```buffer
- ## A
  - para
  - ## h┃
  - more
  - ### C
- ## B
```

</td><td>

<!--ourus-->
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

#### 96. [Paste37](../../spec/paste.md#paste37)

> pasteStructured

Adapted: blank lines, paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>tine</th><th>ourus</th></tr>
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

<!--tine-->
```buffer
- See here.
- x
- y┃
```

</td><td>

<!--ourus-->
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

#### 97. [Paste40](../../spec/paste.md#paste40)

> pastePlain

Adapted: blank lines, paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>tine</th><th>ourus</th></tr>
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

<!--tine-->
```buffer
- ax
  
  y
  ┃b
- c
```

</td><td>

<!--ourus-->
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

#### 98. [Placeholder2](../../spec/placeholders.md#placeholder2)

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
<tr><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--tine-->
```buffer
- a
- 
- ┃
```

</td><td>

<!--ourus-->
```buffer
- a
- ┃
```

</td></tr>
</table>

> cursorDocStart

<table>
<tr><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--tine-->
```buffer
- ┃a
- 
- 
```

</td><td>

<!--ourus-->
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

#### 99. [Placeholder3](../../spec/placeholders.md#placeholder3)

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
<tr><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--tine-->
```buffer
- ┃para
- 
```

</td><td>

<!--ourus-->
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

#### 100. [Outliner flows › Scenario6](../../spec/scenarios.md#scenario6)

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
<tr><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--tine-->
```buffer
- Groceries
- - milk┃
```

</td><td>

<!--ourus-->
```buffer
- Groceries
  - milk┃
```

</td></tr>
</table>

> enter "eggs"

> enter indent "brown"

<table>
<tr><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--tine-->
```buffer
- Groceries
- - milk
- eggs
  - brown┃
```

</td><td>

<!--ourus-->
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
<tr><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--tine-->
```buffer
- Groceries
- - milk
- eggs
  - brown
  - 
  - ┃
```

</td><td>

<!--ourus-->
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
<tr><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--tine-->
```buffer
- Groceries
- - milk
- eggs
  - brown
  - 
  - 
  - Done.┃
```

</td><td>

<!--ourus-->
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

#### 101. [Outliner flows › Scenario15](../../spec/scenarios.md#scenario15)

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
<tr><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--tine-->
```buffer
- [ ] milk
- bread
- ┃
```

</td><td>

<!--ourus-->
```buffer
- [ ] milk
- [ ] bread
- [ ] ┃
```

</td></tr>
</table>

> deleteContentBackward "two loaves" indent

<table>
<tr><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--tine-->
```buffer
- [ ] milk
  - breadtwo loaves┃
```

</td><td>

<!--ourus-->
```buffer
- [ ] milk
- [ ] bread
  - two loaves┃
```

</td></tr>
</table>

> enter

<table>
<tr><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--tine-->
```buffer
- [ ] milk
  - breadtwo loaves
  - ┃
```

</td><td>

<!--ourus-->
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
<tr><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--tine-->
```buffer
- [ ] milk
  - breadtwo loaves
  - 
  - ┃
```

</td><td>

<!--ourus-->
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
<tr><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--tine-->
```buffer
- [ ] milk
  - breadtwo loaves
  - 
  - 
  - Shop closes at six.┃
```

</td><td>

<!--ourus-->
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

#### 102. [Outliner flows › Scenario18](../../spec/scenarios.md#scenario18)

> pasteStructured "!"

Adapted: code block, paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>tine</th><th>ourus</th></tr>
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

<!--tine-->
````buffer
- Notes
  - example```
    code
    ```
    !┃
  - next
````

</td><td>

<!--ourus-->
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

#### 103. [Notes and sections › Scenario19](../../spec/scenarios.md#scenario19)

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
<tr><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--tine-->
```buffer
- # Notes
- first idea┃
```

</td><td>

<!--ourus-->
```buffer
- # Notes
  - first idea┃
```

</td></tr>
</table>

> enter "second"

<table>
<tr><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--tine-->
```buffer
- # Notes
- first idea
- second┃
```

</td><td>

<!--ourus-->
```buffer
- # Notes
  - first idea
  - second┃
```

</td></tr>
</table>

> moveSubtreeUp

<table>
<tr><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--tine-->
```buffer
- # Notes
- second┃
- first idea
```

</td><td>

<!--ourus-->
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

#### 104. [Notes and sections › Scenario20](../../spec/scenarios.md#scenario20)

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
<tr><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--tine-->
```buffer
- # Trip
- Pack light.
- Book the train.┃
```

</td><td>

<!--ourus-->
```buffer
- # Trip
  - Pack light.
  - Book the train.┃
```

</td></tr>
</table>

> shiftEnter "Seat 42."

<table>
<tr><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--tine-->
```buffer
- # Trip
- Pack light.
- Book the train.
  Seat 42.┃
```

</td><td>

<!--ourus-->
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
<tr><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--tine-->
```buffer
- # Trip
- Book the train.
  Seat 42.┃
- Pack light.
```

</td><td>

<!--ourus-->
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
<tr><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--tine-->
```buffer
- # Trip
- Pack light.
- Book the train.
  Seat 42.┃
```

</td><td>

<!--ourus-->
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

#### 105. [Notes and sections › Scenario21](../../spec/scenarios.md#scenario21)

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
<tr><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--tine-->
```buffer
- one┃two
```

</td><td>

<!--ourus-->
```buffer
- one
  ┃two
```

</td></tr>
</table>

> cursorLineUp cursorLineBoundaryForward

<table>
<tr><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--tine-->
```buffer
- onetwo┃
```

</td><td>

<!--ourus-->
```buffer
- one┃
  two
```

</td></tr>
</table>

> deleteContentForward

<table>
<tr><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--tine-->
```buffer
- onetwo┃
```

</td><td>

<!--ourus-->
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

#### 106. [Notes and sections › Scenario23](../../spec/scenarios.md#scenario23)

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
<tr><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--tine-->
```buffer
- # Plan
- revise ┃2. draft
```

</td><td>

<!--ourus-->
```buffer
- # Plan
  - revise ┃2\. draft
```

</td></tr>
</table>

> shiftEnter

<table>
<tr><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--tine-->
```buffer
- # Plan
- revise 
  ┃2\. draft
```

</td><td>

<!--ourus-->
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

#### 107. [Notes and sections › Scenario24](../../spec/scenarios.md#scenario24)

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
<tr><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--tine-->
```buffer
- Shopping:
  \- ┃milk
  bread
```

</td><td>

<!--ourus-->
```buffer
- Shopping:
  - ┃milk
    bread
```

</td></tr>
</table>

> cursorLineDown cursorLineBoundaryBackward "- "

<table>
<tr><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--tine-->
```buffer
- Shopping:
  \- milk
  \- ┃bread
```

</td><td>

<!--ourus-->
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

#### 108. [ShiftEnter10](../../spec/shift-enter.md#shiftenter10)

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
<tr><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--tine-->
```buffer
- a
  
  ┃bc
```

</td><td>

<!--ourus-->
```buffer
- a
  - ┃bc
```

</td></tr>
</table>

> "x"

<table>
<tr><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--tine-->
```buffer
- a
  
  x┃bc
```

</td><td>

<!--ourus-->
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

#### 109. [ShiftEnter11](../../spec/shift-enter.md#shiftenter11)

> shiftEnter

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  ┃
- two
```

</td><td>

<!--tine-->
```buffer
- one
  
  ┃
- two
```

</td><td>

<!--ourus-->
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

#### 110. [ShiftEnter12](../../spec/shift-enter.md#shiftenter12)

> shiftEnter

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- para
  ┃
```

</td><td>

<!--tine-->
```buffer
- para
  
  ┃
```

</td><td>

<!--ourus-->
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

#### 111. [ShiftEnter14](../../spec/shift-enter.md#shiftenter14)

> shiftEnter

Adapted: heading

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Title┃ more
```

</td><td>

<!--tine-->
```buffer
- # Title
  ┃ more
```

</td><td>

<!--ourus-->
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

#### 112. [ShiftEnter15](../../spec/shift-enter.md#shiftenter15)

> shiftEnter shiftEnter "p"

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one┃
```

</td><td>

<!--tine-->
```buffer
- one
  
  p┃
```

</td><td>

<!--ourus-->
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

#### 113. [ShiftEnter16](../../spec/shift-enter.md#shiftenter16)

> shiftEnter shiftEnter "p"

Adapted: CR line endings, blank lines, paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
```

</td><td>

<!--tine-->
```buffer
- a
  
  p┃
```

</td><td>

<!--ourus-->
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

#### 114. [TaskEnter1](../../spec/tasks.md#taskenter1)

> enter

Adapted: blank lines, paragraph, task

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- [ ] ┃
```

</td><td>

<!--tine-->
```buffer
- a
- [ ] 
- ┃
```

</td><td>

<!--ourus-->
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

#### 115. [TaskEnter2](../../spec/tasks.md#taskenter2)

> enter

Adapted: task

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - [ ] ┃
```

</td><td>

<!--tine-->
```buffer
- a
  - [ ] 
  - ┃
```

</td><td>

<!--ourus-->
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

#### 116. [TaskEnter3](../../spec/tasks.md#taskenter3)

> enter

Adapted: task

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] abc ┃# x
```

</td><td>

<!--tine-->
```buffer
- [ ] abc 
- ┃# x
```

</td><td>

<!--ourus-->
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

#### 117. [TaskEnter4](../../spec/tasks.md#taskenter4)

> enter

Adapted: task

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] ┃abc
```

</td><td>

<!--tine-->
```buffer
- [ ] 
- ┃abc
```

</td><td>

<!--ourus-->
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

#### 118. [TaskEnter5](../../spec/tasks.md#taskenter5)

> enter

Adapted: task

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b
  - [ ] ┃
  - c
```

</td><td>

<!--tine-->
```buffer
- a
  - b
  - [ ] 
  - ┃
  - c
```

</td><td>

<!--ourus-->
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

#### 119. [TaskEnter6](../../spec/tasks.md#taskenter6)

> enter

Adapted: task

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - [ ] ┃
  - b
```

</td><td>

<!--tine-->
```buffer
- a
  - [ ] 
  - ┃
  - b
```

</td><td>

<!--ourus-->
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

#### 120. [TaskEnter7](../../spec/tasks.md#taskenter7)

> enter

Adapted: task

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [x] a┃ b
  - c
```

</td><td>

<!--tine-->
```buffer
- [x] a
  - ┃ b
  - c
```

</td><td>

<!--ourus-->
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

#### 121. [TaskBackspace2](../../spec/tasks.md#taskbackspace2)

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
<tr><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--tine-->
```buffer
- a
- [ ]┃
```

</td><td>

<!--ourus-->
```buffer
- a
- ┃
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--tine-->
```buffer
- a
- TOD┃
```

</td><td>

<!--ourus-->
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

#### 122. [TaskBackspace3](../../spec/tasks.md#taskbackspace3)

> deleteContentBackward

Adapted: task

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- [x] ┃b
```

</td><td>

<!--tine-->
```buffer
- a
- DONE┃b
```

</td><td>

<!--ourus-->
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

#### 123. [TaskBackspace6](../../spec/tasks.md#taskbackspace6)

> deleteContentBackward

Adapted: task

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] 
- ┃[x] a
```

</td><td>

<!--tine-->
```buffer
- [ ] ┃DONE a
```

</td><td>

<!--ourus-->
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

#### 124. [TaskDelete1](../../spec/tasks.md#taskdelete1)

> deleteContentForward

Adapted: task

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- [ ] b
```

</td><td>

<!--tine-->
```buffer
- a┃TODO b
```

</td><td>

<!--ourus-->
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

#### 125. [TaskDelete3](../../spec/tasks.md#taskdelete3)

> deleteContentForward

Adapted: task

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- [ ] 
```

</td><td>

<!--tine-->
```buffer
- a┃TODO 
```

</td><td>

<!--ourus-->
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

#### 126. [Typing2](../../spec/typing.md#typing2)

> deleteContentBackward

Adapted: heading, paragraph, setext heading

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- para
  ---x┃
```

</td><td>

<!--tine-->
```buffer
- para
  ---┃
```

</td><td>

<!--ourus-->
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

#### 127. [Typing3](../../spec/typing.md#typing3)

> "- "

Adapted: paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- para
  ┃more
```

</td><td>

<!--tine-->
```buffer
- para
  \- ┃more
```

</td><td>

<!--ourus-->
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

#### 128. [Undo3](../../spec/undo.md#undo3)

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
<tr><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--tine-->
```buffer
- a
- ┃
```

</td><td>

<!--ourus-->
```buffer
- a
  - ┃
```

</td></tr>
</table>

> cursorDocStart cursorLineBoundaryForward

<table>
<tr><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--tine-->
```buffer
- a┃
- 
```

</td><td>

<!--ourus-->
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

### Whitespace (22)

#### 1. [Enter8](../../spec/enter.md#enter8)

> enter

Adapted: escape

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc ┃- def
```

</td><td>

<!--tine-->
```buffer
- abc 
- ┃- def
```

</td><td>

<!--ourus-->
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

#### 2. [Enter9](../../spec/enter.md#enter9)

> enter

Adapted: escape

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc ┃# def
```

</td><td>

<!--tine-->
```buffer
- abc 
- ┃# def
```

</td><td>

<!--ourus-->
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

#### 3. [Enter10](../../spec/enter.md#enter10)

> enter

Adapted: escape

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc ┃<div>
```

</td><td>

<!--tine-->
```buffer
- abc 
- ┃<div>
```

</td><td>

<!--ourus-->
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

#### 4. [Enter11](../../spec/enter.md#enter11)

> enter

Adapted: blank lines, escape, paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- see ┃[a]: /url
```

</td><td>

<!--tine-->
```buffer
- see 
- ┃[a]: /url
```

</td><td>

<!--ourus-->
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

#### 5. [Enter12](../../spec/enter.md#enter12)

> enter

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- some┃ text
```

</td><td>

<!--tine-->
```buffer
- some
- ┃ text
```

</td><td>

<!--ourus-->
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

#### 6. [Enter35](../../spec/enter.md#enter35)

> enter

Adapted: escape, numbered list

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc ┃2. def
```

</td><td>

<!--tine-->
```buffer
- abc 
- ┃2. def
```

</td><td>

<!--ourus-->
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

#### 7. [Fence3](../../spec/fences.md#fence3)

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

<!--tine-->
````buffer
- a
  - ```
      nested
    ┃
    ```
````

</td><td>

<!--ourus-->
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

#### 8. [Enter › E11](../../spec/obsidian-true-outliner.md#e11)

> enter

Adapted: code block

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- item┃ text
  - →```
    →code
    →```
````

</td><td>

<!--tine-->
````buffer
- item
  - ┃ text
  - →```
    →code
    →```
````

</td><td>

<!--ourus-->
````buffer
- item
  - ┃text
  - →```
    →code
    →```
````

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- item┃ text
→```
→code
→```
````

</td><td>

````buffer
- item
→- ┃text
→```
→code
→```
````

</td></tr>
</table>

#### 9. [Shift-Enter › S4](../../spec/obsidian-true-outliner.md#s4)

> shiftEnter

Adapted: paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one┃ two
```

</td><td>

<!--tine-->
```buffer
- one
  ┃ two
```

</td><td>

<!--ourus-->
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

#### 10. [Shift-Enter › S9](../../spec/obsidian-true-outliner.md#s9)

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

<!--tine-->
```buffer
- item
  - para
    ┃ text
```

</td><td>

<!--ourus-->
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

#### 11. [Paste9](../../spec/paste.md#paste9)

> pasteStructured

Adapted: code block

<table>
<tr><th>clipboard</th><th>buffer</th><th>tine</th><th>ourus</th></tr>
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

<!--tine-->
````buffer
- a
- ```
  code
  ```
  ┃
````

</td><td>

<!--ourus-->
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

#### 12. [Paste11](../../spec/paste.md#paste11)

> pasteStructured

Adapted: code block

<table>
<tr><th>clipboard</th><th>buffer</th><th>tine</th><th>ourus</th></tr>
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

<!--tine-->
````buffer
- a
  - ```
    code
    ```
    ┃
````

</td><td>

<!--ourus-->
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

#### 13. [Paste44](../../spec/paste.md#paste44)

> pasteStructured

Adapted: math

<table>
<tr><th>clipboard</th><th>buffer</th><th>tine</th><th>ourus</th></tr>
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

<!--tine-->
```buffer
- a
- $$
  x^2
  $$
  ┃
```

</td><td>

<!--ourus-->
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

#### 14. [Placeholder4](../../spec/placeholders.md#placeholder4)

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
<tr><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--tine-->
```buffer
- ┃para
  
```

</td><td>

<!--ourus-->
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

#### 15. [ShiftEnter2](../../spec/shift-enter.md#shiftenter2)

> shiftEnter

Adapted: numbered list

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b┃ c
```

</td><td>

<!--tine-->
```buffer
- a
  - b
    ┃ c
```

</td><td>

<!--ourus-->
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

#### 16. [ShiftEnter5](../../spec/shift-enter.md#shiftenter5)

> shiftEnter

Adapted: escape

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc ┃- def
```

</td><td>

<!--tine-->
```buffer
- abc 
  ┃\- def
```

</td><td>

<!--ourus-->
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

#### 17. [ShiftEnter6](../../spec/shift-enter.md#shiftenter6)

> shiftEnter

Adapted: escape

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc ┃1. def
```

</td><td>

<!--tine-->
```buffer
- abc 
  ┃1\. def
```

</td><td>

<!--ourus-->
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

#### 18. [ShiftEnter7](../../spec/shift-enter.md#shiftenter7)

> shiftEnter

Adapted: escape, paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Title ┃===
```

</td><td>

<!--tine-->
```buffer
- Title 
  ┃===
```

</td><td>

<!--ourus-->
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

#### 19. [ShiftEnter8](../../spec/shift-enter.md#shiftenter8)

> shiftEnter

Adapted: escape, paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Title ┃--
```

</td><td>

<!--tine-->
```buffer
- Title 
  ┃--
```

</td><td>

<!--ourus-->
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

#### 20. [ShiftEnter9](../../spec/shift-enter.md#shiftenter9)

> shiftEnter

Adapted: escape

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one ┃<div>
```

</td><td>

<!--tine-->
```buffer
- one 
  ┃<div>
```

</td><td>

<!--ourus-->
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

#### 21. [ShiftEnter18](../../spec/shift-enter.md#shiftenter18)

> shiftEnter

Adapted: escape, numbered list

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc ┃2. x
```

</td><td>

<!--tine-->
```buffer
- abc 
  ┃2\. x
```

</td><td>

<!--ourus-->
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

#### 22. [ShiftEnter19](../../spec/shift-enter.md#shiftenter19)

> shiftEnter

Adapted: escape, paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a | b ┃|---|---|
```

</td><td>

<!--tine-->
```buffer
- a | b 
  ┃|---|---|
```

</td><td>

<!--ourus-->
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

### Caret (12)

#### 1. [CursorUp2](../../spec/cursor.md#cursorup2)

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

<!--tine-->
```buffer
- ┃## Title
  - a
```

</td><td>

<!--ourus-->
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

#### 2. [CursorDown2](../../spec/cursor.md#cursordown2)

> cursorLineDown

Adapted: code block, paragraph

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- →x┃
- abcdefg
```

</td><td>

<!--tine-->
```buffer
- →x
- ab┃cdefg
```

</td><td>

<!--ourus-->
```buffer
- →x
- abcde┃fg
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
→x┃
abcdefg
```

</td><td>

```buffer
→x
abcde┃fg
```

</td></tr>
</table>

#### 3. [CursorDown5](../../spec/cursor.md#cursordown5)

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

<!--tine-->
```buffer
- a
- [┃ ] task
```

</td><td>

<!--ourus-->
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

#### 4. [CursorHome8](../../spec/cursor.md#cursorhome8)

> cursorLineBoundaryBackward

Adapted: task

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] task┃
```

</td><td>

<!--tine-->
```buffer
- ┃[ ] task
```

</td><td>

<!--ourus-->
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

#### 5. [CursorHome9](../../spec/cursor.md#cursorhome9)

> cursorLineBoundaryBackward

Adapted: task

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [x] done┃
```

</td><td>

<!--tine-->
```buffer
- ┃[x] done
```

</td><td>

<!--ourus-->
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

#### 6. [CursorHome10](../../spec/cursor.md#cursorhome10)

> cursorLineBoundaryBackward

Adapted: heading

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ## Title┃
```

</td><td>

<!--tine-->
```buffer
- ┃## Title
```

</td><td>

<!--ourus-->
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

#### 7. [DeleteSubtree2](../../spec/delete-subtree.md#deletesubtree2)

> deleteSubtree

Adapted: numbered list

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b┃
- c
```

</td><td>

<!--tine-->
```buffer
- a
- ▮ c
```

</td><td>

<!--ourus-->
```buffer
- a┃
- c
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a
2. b┃
3. c
```

</td><td>

```buffer
1. a┃
2. c
```

</td></tr>
</table>

#### 8. [DeleteSubtree3](../../spec/delete-subtree.md#deletesubtree3)

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

<!--tine-->
```buffer
- # H
```

</td><td>

<!--ourus-->
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

#### 9. [DeleteSubtree4](../../spec/delete-subtree.md#deletesubtree4)

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

<!--tine-->
```buffer
- [ ] b
```

</td><td>

<!--ourus-->
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

#### 10. [Placeholder13](../../spec/placeholders.md#placeholder13)

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
<tr><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--tine-->
```buffer
- # H1
  - ┃## H2
```

</td><td>

<!--ourus-->
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

#### 11. [TaskBackspace1](../../spec/tasks.md#taskbackspace1)

> deleteContentBackward

Adapted: task

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- 
  - ┃[ ] task
    - child
```

</td><td>

<!--tine-->
```buffer
- a
- ┃[ ] task
  - child
```

</td><td>

<!--ourus-->
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

#### 12. [TaskDelete2](../../spec/tasks.md#taskdelete2)

> deleteContentForward

Adapted: task

<table>
<tr><th>buffer</th><th>tine</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
- [x] a
```

</td><td>

<!--tine-->
```buffer
- ┃[x] a
```

</td><td>

<!--ourus-->
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

### Agree (134)

1. [Backspace10](../../spec/backspace.md#backspace10) (blank lines, paragraph)
2. [Backspace11](../../spec/backspace.md#backspace11) (blank lines, paragraph)
3. [Backspace21](../../spec/backspace.md#backspace21) (blank lines, paragraph)
4. [Backspace15](../../spec/backspace.md#backspace15) (blank lines, paragraph)
5. [Backspace22](../../spec/backspace.md#backspace22) (blank lines, heading, paragraph)
6. [Backspace25](../../spec/backspace.md#backspace25) (blank lines, paragraph)
7. [Backspace26](../../spec/backspace.md#backspace26) (paragraph)
8. [Backspace28](../../spec/backspace.md#backspace28) (code block)
9. [Backspace29](../../spec/backspace.md#backspace29) (numbered list)
10. [Cmd-Backspace › SoftBackspace2](../../spec/backspace.md#softbackspace2) (escape, paragraph)
11. [CursorLeft1](../../spec/cursor.md#cursorleft1) (paragraph)
12. [CursorLeft2](../../spec/cursor.md#cursorleft2) (paragraph)
13. [CursorLeft3](../../spec/cursor.md#cursorleft3) (paragraph)
14. [CursorRight1](../../spec/cursor.md#cursorright1) (paragraph)
15. [CursorRight2](../../spec/cursor.md#cursorright2) (paragraph)
16. [CursorUp1](../../spec/cursor.md#cursorup1) (paragraph)
17. [CursorDown1](../../spec/cursor.md#cursordown1) (blank lines, paragraph)
18. [CursorHome7](../../spec/cursor.md#cursorhome7) (numbered list)
19. [CursorHome14](../../spec/cursor.md#cursorhome14) (paragraph)
20. [SelectLeft1](../../spec/cursor.md#selectleft1) (paragraph)
21. [SelectRightEnd1](../../spec/cursor.md#selectrightend1) (paragraph)
22. [Delete13](../../spec/del.md#delete13) (blank lines, heading, paragraph)
23. [Delete13g](../../spec/del.md#delete13g) (heading)
24. [Delete15](../../spec/del.md#delete15) (heading)
25. [Delete17](../../spec/del.md#delete17) (blank lines, paragraph)
26. [Enter2](../../spec/enter.md#enter2) (numbered list)
27. [Enter17](../../spec/enter.md#enter17) (CR line endings)
28. [Enter18](../../spec/enter.md#enter18) (CR line endings)
29. [Enter23](../../spec/enter.md#enter23) (blank lines, code block, heading, paragraph)
30. [Enter25](../../spec/enter.md#enter25) (numbered list)
31. [Enter33](../../spec/enter.md#enter33) (blank lines, paragraph)
32. [Enter36](../../spec/enter.md#enter36) (blank lines)
33. [Enter43](../../spec/enter.md#enter43) (escape)
34. [Fence1](../../spec/fences.md#fence1) (code block)
35. [Fence2](../../spec/fences.md#fence2) (code block)
36. [Fence5](../../spec/fences.md#fence5) (code block)
37. [Fence8](../../spec/fences.md#fence8) (code block)
38. [Fence16](../../spec/fences.md#fence16) (code block)
39. [Fence17](../../spec/fences.md#fence17) (code block)
40. [Fence18](../../spec/fences.md#fence18) (code block)
41. [Fence19](../../spec/fences.md#fence19) (code block)
42. [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap1](../../spec/gaps.md#gap1) (blank lines, paragraph)
43. [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap4](../../spec/gaps.md#gap4) (blank lines, paragraph)
44. [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap2](../../spec/gaps.md#gap2) (blank lines, paragraph)
45. [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap11](../../spec/gaps.md#gap11) (blank lines, paragraph)
46. [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap3](../../spec/gaps.md#gap3) (blank lines, heading, paragraph)
47. [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap5](../../spec/gaps.md#gap5) (blank lines)
48. [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap6](../../spec/gaps.md#gap6) (heading, paragraph)
49. [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap7](../../spec/gaps.md#gap7) (blank lines, code block, paragraph)
50. [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap8](../../spec/gaps.md#gap8) (blank lines, paragraph)
51. [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap9](../../spec/gaps.md#gap9) (blank lines)
52. [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap10](../../spec/gaps.md#gap10) (blank lines, paragraph)
53. [MoveUp14](../../spec/move-subtree-up.md#moveup14) (blank lines, paragraph)
54. [New text and gaps › Gap12](../../spec/gaps.md#gap12) (blank lines, heading, paragraph)
55. [New text and gaps › Gap13](../../spec/gaps.md#gap13) (blank lines, paragraph)
56. [Indent3](../../spec/indent.md#indent3) (bullet *)
57. [Indent5](../../spec/indent.md#indent5) (bullet *)
58. [Indentation › destination-list-style](../../spec/obsidian-true-outliner.md#destination-list-style) (bullet *)
59. [Indent4](../../spec/indent.md#indent4) (numbered list)
60. [Indent11](../../spec/indent.md#indent11) (blank lines, paragraph)
61. [Indent13](../../spec/indent.md#indent13) (code block)
62. [Indent15](../../spec/indent.md#indent15) (numbered list)
63. [Indent17](../../spec/indent.md#indent17) (CR line endings)
64. [Indent20](../../spec/indent.md#indent20) (code block)
65. [Indent21](../../spec/indent.md#indent21) (blank lines, paragraph)
66. [Indent24](../../spec/indent.md#indent24) (heading)
67. [Indent29](../../spec/indent.md#indent29) (blank lines, paragraph)
68. [MoveDown1](../../spec/move-subtree-down.md#movedown1) (blank lines)
69. [MoveDown4](../../spec/move-subtree-down.md#movedown4) (blank lines, heading, paragraph)
70. [MoveDown5](../../spec/move-subtree-down.md#movedown5) (blank lines, paragraph)
71. [MoveDown16](../../spec/move-subtree-down.md#movedown16) (heading)
72. [MoveDown18](../../spec/move-subtree-down.md#movedown18) (blank lines, heading)
73. [MoveDown21](../../spec/move-subtree-down.md#movedown21) (code block)
74. [MoveDown22](../../spec/move-subtree-down.md#movedown22) (numbered list)
75. [MoveDown23](../../spec/move-subtree-down.md#movedown23) (numbered list)
76. [MoveDown24](../../spec/move-subtree-down.md#movedown24) (blank lines, paragraph)
77. [MoveDown26](../../spec/move-subtree-down.md#movedown26) (blank lines, heading, paragraph)
78. [MoveDown27](../../spec/move-subtree-down.md#movedown27) (blank lines, heading)
79. [MoveDown29](../../spec/move-subtree-down.md#movedown29) (blank lines, numbered list, paragraph)
80. [MoveDown30](../../spec/move-subtree-down.md#movedown30) (numbered list)
81. [MoveDown31](../../spec/move-subtree-down.md#movedown31) (blank lines, paragraph, thematic break)
82. [MoveUp3](../../spec/move-subtree-up.md#moveup3) (blank lines, heading, paragraph)
83. [MoveUp4](../../spec/move-subtree-up.md#moveup4) (blank lines, paragraph)
84. [MoveUp13](../../spec/move-subtree-up.md#moveup13) (code block)
85. [MoveUp15](../../spec/move-subtree-up.md#moveup15) (numbered list)
86. [MoveUp16](../../spec/move-subtree-up.md#moveup16) (heading)
87. [MoveUp17](../../spec/move-subtree-up.md#moveup17) (blank lines, paragraph)
88. [MoveUp18](../../spec/move-subtree-up.md#moveup18) (blank lines, code block, paragraph)
89. [MoveUp19](../../spec/move-subtree-up.md#moveup19) (blank lines, paragraph, thematic break)
90. [MoveUp20](../../spec/move-subtree-up.md#moveup20) (blank lines, link reference definition, paragraph)
91. [MoveUp22](../../spec/move-subtree-up.md#moveup22) (blank lines, heading)
92. [MoveUp25](../../spec/move-subtree-up.md#moveup25) (blank lines)
93. [MoveUp26](../../spec/move-subtree-up.md#moveup26) (blank lines, heading)
94. [MoveUp30](../../spec/move-subtree-up.md#moveup30) (blank lines, link reference definition, paragraph)
95. [Enter › #228 › Renumbering stops at a delimiter change](../../spec/obsidian-true-outliner.md#renumbering-stops-at-a-delimiter-change) (numbered list)
96. [Enter › E10](../../spec/obsidian-true-outliner.md#e10) (blank lines, paragraph)
97. [Enter › E13, E16 › Split title above a subheading](../../spec/obsidian-true-outliner.md#split-title-above-a-subheading) (heading, paragraph)
98. [Enter › E14, E20 › Split title above an existing paragraph](../../spec/obsidian-true-outliner.md#split-title-above-an-existing-paragraph) (blank lines, heading, paragraph)
99. [Enter › E14, E20 › End of heading above a paragraph](../../spec/obsidian-true-outliner.md#end-of-heading-above-a-paragraph) (blank lines, heading, paragraph)
100. [Backspace › #269 › Emptied middle item removed and renumbered](../../spec/obsidian-true-outliner.md#emptied-middle-item-removed-and-renumbered) (numbered list)
101. [Backspace › Joining across ordered runs](../../spec/obsidian-true-outliner.md#joining-across-ordered-runs) (numbered list)
102. [Backspace › Joining away the head of a list › Next item becomes the new 1.](../../spec/obsidian-true-outliner.md#next-item-becomes-the-new-1) (numbered list)
103. [Backspace › Joining away the head of a list › List starting at 3 keeps its start](../../spec/obsidian-true-outliner.md#list-starting-at-3-keeps-its-start) (numbered list)
104. [Indentation › seams-across-a-re-indent › Indented item keeps its thematic break](../../spec/obsidian-true-outliner.md#indented-item-keeps-its-thematic-break) (blank lines, thematic break)
105. [Indentation › seams-across-a-re-indent › Outdented item keeps its code block](../../spec/obsidian-true-outliner.md#outdented-item-keeps-its-code-block) (blank lines, code block)
106. [Moving › lone-block-id › Block id moves with its paragraph](../../spec/obsidian-true-outliner.md#block-id-moves-with-its-paragraph) (blank lines, paragraph)
107. [Moving › lazy-continuation-at-seams › No blank line needed after a fence](../../spec/obsidian-true-outliner.md#no-blank-line-needed-after-a-fence) (code block, paragraph)
108. [Moving › lazy-continuation-at-seams › No blank line needed before a fence](../../spec/obsidian-true-outliner.md#no-blank-line-needed-before-a-fence) (code block, paragraph)
109. [Abandoning an empty place › Enter, Tab, then leave › An empty ordered child kept with a blank line](../../spec/obsidian-true-outliner.md#an-empty-ordered-child-kept-with-a-blank-line) (blank lines, numbered list)
110. [Abandoning an empty place › Enter, Tab, then leave › Blank line after the list stays](../../spec/obsidian-true-outliner.md#blank-line-after-the-list-stays) (blank lines, paragraph)
111. [Abandoning an empty place › Enter, Shift-Tab, then leave › Outdented empty ordered item stays](../../spec/obsidian-true-outliner.md#outdented-empty-ordered-item-stays) (numbered list)
112. [Outdent5](../../spec/outdent.md#outdent5) (heading)
113. [Outdent6](../../spec/outdent.md#outdent6) (blank lines)
114. [Outdent7](../../spec/outdent.md#outdent7) (blank lines)
115. [Outdent9](../../spec/outdent.md#outdent9) (numbered list)
116. [Outdent15](../../spec/outdent.md#outdent15) (blank lines, paragraph)
117. [Direct outdent › DirectOutdent4](../../spec/outdent.md#directoutdent4) (blank lines, paragraph)
118. [Paste2](../../spec/paste.md#paste2) (numbered list)
119. [Paste4](../../spec/paste.md#paste4) (escape)
120. [Paste16](../../spec/paste.md#paste16) (numbered list)
121. [Paste22](../../spec/paste.md#paste22) (code block)
122. [Paste30](../../spec/paste.md#paste30) (escape)
123. [Paste32](../../spec/paste.md#paste32) (blank lines, heading, paragraph)
124. [Paste45](../../spec/paste.md#paste45) (escape)
125. [Placeholder1](../../spec/placeholders.md#placeholder1) (blank lines)
126. [Placeholder5](../../spec/placeholders.md#placeholder5) (blank lines)
127. [Placeholder7](../../spec/placeholders.md#placeholder7) (blank lines)
128. [Placeholder14](../../spec/placeholders.md#placeholder14) (blank lines, paragraph)
129. [Placeholder16](../../spec/placeholders.md#placeholder16) (blank lines)
130. [Outliner flows › Scenario4](../../spec/scenarios.md#scenario4) (blank lines)
131. [Outliner flows › Scenario13](../../spec/scenarios.md#scenario13) (numbered list)
132. [Outliner flows › Scenario16](../../spec/scenarios.md#scenario16) (blank lines, heading, task)
133. [Notes and sections › Scenario22](../../spec/scenarios.md#scenario22) (blank lines, heading)
134. [ShiftEnter20](../../spec/shift-enter.md#shiftenter20) (escape)

## Skipped

### a quote (77)

1. [backspace.md › Backspace27](../../spec/backspace.md#backspace27)
2. [cursor.md › CursorHome11](../../spec/cursor.md#cursorhome11)
3. [cursor.md › CursorHome16](../../spec/cursor.md#cursorhome16)
4. [del.md › Delete10](../../spec/del.md#delete10)
5. [enter.md › Enter36b](../../spec/enter.md#enter36b)
6. [enter.md › Enter46](../../spec/enter.md#enter46)
7. [fences.md › Fence4](../../spec/fences.md#fence4)
8. [fences.md › Fence20](../../spec/fences.md#fence20)
9. [fences.md › Fence40](../../spec/fences.md#fence40)
10. [move-subtree-up.md › MoveUp35](../../spec/move-subtree-up.md#moveup35)
11. [obsidian-true-outliner.md › Enter › #267, E5](../../spec/obsidian-true-outliner.md#267-e5)
12. [obsidian-true-outliner.md › Indentation › #255 › Outdented child leaves quote above alone](../../spec/obsidian-true-outliner.md#outdented-child-leaves-quote-above-alone)
13. [obsidian-true-outliner.md › Indentation › seams-across-a-re-indent › Indented item keeps its quote](../../spec/obsidian-true-outliner.md#indented-item-keeps-its-quote)
14. [obsidian-true-outliner.md › Indentation › seams-across-a-re-indent › Outdented item keeps its quote](../../spec/obsidian-true-outliner.md#outdented-item-keeps-its-quote)
15. [obsidian-true-outliner.md › Moving › lazy-continuation-at-seams › Blank line added below a quote](../../spec/obsidian-true-outliner.md#blank-line-added-below-a-quote)
16. [obsidian-true-outliner.md › Paste › #264 › Pasted quote set off from paragraph](../../spec/obsidian-true-outliner.md#pasted-quote-set-off-from-paragraph)
17. [obsidian-true-outliner.md › Paste › #197 › Pasted list and block become children](../../spec/obsidian-true-outliner.md#pasted-list-and-block-become-children)
18. [paste.md › Paste12](../../spec/paste.md#paste12)
19. [paste.md › Paste23](../../spec/paste.md#paste23)
20. [paste.md › Paste29](../../spec/paste.md#paste29)
21. [paste.md › Paste41](../../spec/paste.md#paste41)
22. [quotes.md › Quote1](../../spec/quotes.md#quote1)
23. [quotes.md › Indent inside a quote › Quote2](../../spec/quotes.md#quote2)
24. [quotes.md › Indent inside a quote › Quote3](../../spec/quotes.md#quote3)
25. [quotes.md › Indent inside a quote › Quote4](../../spec/quotes.md#quote4)
26. [quotes.md › Indent inside a quote › Quote5](../../spec/quotes.md#quote5)
27. [quotes.md › Indent inside a quote › Quote6](../../spec/quotes.md#quote6)
28. [quotes.md › Indent inside a quote › Quote8](../../spec/quotes.md#quote8)
29. [quotes.md › Indent inside a quote › Quote9](../../spec/quotes.md#quote9)
30. [quotes.md › Quote10](../../spec/quotes.md#quote10)
31. [quotes.md › Outdent out of a quote › Quote11](../../spec/quotes.md#quote11)
32. [quotes.md › Outdent out of a quote › Quote12](../../spec/quotes.md#quote12)
33. [quotes.md › Outdent out of a quote › Quote14](../../spec/quotes.md#quote14)
34. [quotes.md › Outdent out of a quote › Quote15](../../spec/quotes.md#quote15)
35. [quotes.md › Outdent out of a quote › Quote16](../../spec/quotes.md#quote16)
36. [quotes.md › Indent into a quote › Quote17](../../spec/quotes.md#quote17)
37. [quotes.md › Indent into a quote › Quote18](../../spec/quotes.md#quote18)
38. [quotes.md › Indent into a quote › Quote19](../../spec/quotes.md#quote19)
39. [quotes.md › Moving between quotes › Quote21](../../spec/quotes.md#quote21)
40. [quotes.md › Moving between quotes › Quote22](../../spec/quotes.md#quote22)
41. [quotes.md › Moving between quotes › Quote23](../../spec/quotes.md#quote23)
42. [quotes.md › Moving inside a quote › Quote24](../../spec/quotes.md#quote24)
43. [quotes.md › Moving inside a quote › Quote25](../../spec/quotes.md#quote25)
44. [quotes.md › Moving inside a quote › Quote26](../../spec/quotes.md#quote26)
45. [quotes.md › A quote and a heading don't swap › Quote27](../../spec/quotes.md#quote27)
46. [quotes.md › A quote and a heading don't swap › Quote28](../../spec/quotes.md#quote28)
47. [quotes.md › Enter in a quote › Quote29](../../spec/quotes.md#quote29)
48. [quotes.md › Enter in a quote › Quote30](../../spec/quotes.md#quote30)
49. [quotes.md › Enter in a quote › Quote31](../../spec/quotes.md#quote31)
50. [quotes.md › Enter in a quote › Quote32](../../spec/quotes.md#quote32)
51. [quotes.md › Enter in a quote › Quote33](../../spec/quotes.md#quote33)
52. [quotes.md › Enter in a quote › Quote34](../../spec/quotes.md#quote34)
53. [quotes.md › Enter in a quote › Quote35](../../spec/quotes.md#quote35)
54. [quotes.md › Enter in a quote › Quote36](../../spec/quotes.md#quote36)
55. [quotes.md › Enter in a quote › Quote37](../../spec/quotes.md#quote37)
56. [quotes.md › Enter in a quote › Quote42](../../spec/quotes.md#quote42)
57. [quotes.md › Shift-Enter in a quote › Quote44](../../spec/quotes.md#quote44)
58. [quotes.md › Shift-Enter in a quote › Quote45](../../spec/quotes.md#quote45)
59. [quotes.md › Shift-Enter in a quote › Quote46](../../spec/quotes.md#quote46)
60. [quotes.md › Joining in a quote › Quote48](../../spec/quotes.md#quote48)
61. [quotes.md › Joining in a quote › Quote49](../../spec/quotes.md#quote49)
62. [quotes.md › Joining in a quote › Quote50](../../spec/quotes.md#quote50)
63. [quotes.md › Joining in a quote › Quote51](../../spec/quotes.md#quote51)
64. [quotes.md › Joining across a quote's edge › Quote52](../../spec/quotes.md#quote52)
65. [quotes.md › Backspace at a quote's start › Quote53](../../spec/quotes.md#quote53)
66. [quotes.md › Backspace at a quote's start › Quote54](../../spec/quotes.md#quote54)
67. [quotes.md › Backspace at a quote's start › Quote56](../../spec/quotes.md#quote56)
68. [quotes.md › Backspace at a quote's start › Quote59](../../spec/quotes.md#quote59)
69. [quotes.md › Quote63](../../spec/quotes.md#quote63)
70. [quotes.md › Quote64](../../spec/quotes.md#quote64)
71. [quotes.md › Indenting a paragraph into a quote › Quote65](../../spec/quotes.md#quote65)
72. [quotes.md › Indenting a paragraph into a quote › Quote66](../../spec/quotes.md#quote66)
73. [quotes.md › Quote67](../../spec/quotes.md#quote67)
74. [quotes.md › Quote68](../../spec/quotes.md#quote68)
75. [quotes.md › Quote72](../../spec/quotes.md#quote72)
76. [quotes.md › A paragraph outdented out of a nested quote › Quote69](../../spec/quotes.md#quote69)
77. [quotes.md › A paragraph outdented out of a nested quote › Quote70](../../spec/quotes.md#quote70)

### a caret on a code block's fence (25)

1. [fences.md › Fence6](../../spec/fences.md#fence6)
2. [fences.md › Fence7](../../spec/fences.md#fence7)
3. [fences.md › Fence7b](../../spec/fences.md#fence7b)
4. [fences.md › Fence7c](../../spec/fences.md#fence7c)
5. [fences.md › Fence7d](../../spec/fences.md#fence7d)
6. [fences.md › Fence9](../../spec/fences.md#fence9)
7. [fences.md › Fence12](../../spec/fences.md#fence12)
8. [fences.md › Fence13](../../spec/fences.md#fence13)
9. [fences.md › Fence14](../../spec/fences.md#fence14)
10. [fences.md › Fence15](../../spec/fences.md#fence15)
11. [fences.md › Fence22](../../spec/fences.md#fence22)
12. [fences.md › Fence23](../../spec/fences.md#fence23)
13. [fences.md › Fence24](../../spec/fences.md#fence24)
14. [fences.md › Fence25](../../spec/fences.md#fence25)
15. [fences.md › Fence26](../../spec/fences.md#fence26)
16. [fences.md › Fence27](../../spec/fences.md#fence27)
17. [fences.md › Fence28](../../spec/fences.md#fence28)
18. [fences.md › Fence29](../../spec/fences.md#fence29)
19. [fences.md › Fence31](../../spec/fences.md#fence31)
20. [fences.md › Fence32](../../spec/fences.md#fence32)
21. [fences.md › Fence33](../../spec/fences.md#fence33)
22. [fences.md › Fence35](../../spec/fences.md#fence35)
23. [fences.md › Fence41](../../spec/fences.md#fence41)
24. [paste.md › Paste46](../../spec/paste.md#paste46)
25. [paste.md › Paste47](../../spec/paste.md#paste47)

### a caret in a marker (19)

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
15. [move-subtree-down.md › MoveDown32](../../spec/move-subtree-down.md#movedown32)
16. [move-subtree-up.md › MoveUp34](../../spec/move-subtree-up.md#moveup34)
17. [obsidian-true-outliner.md › Shift-Enter › S5](../../spec/obsidian-true-outliner.md#s5)
18. [outdent.md › Outdent14](../../spec/outdent.md#outdent14)
19. [shift-enter.md › ShiftEnter22](../../spec/shift-enter.md#shiftenter22)

### a callout (16)

1. [cursor.md › CursorHome17](../../spec/cursor.md#cursorhome17)
2. [paste.md › Paste28](../../spec/paste.md#paste28)
3. [quotes.md › Indent inside a quote › Quote7](../../spec/quotes.md#quote7)
4. [quotes.md › Outdent out of a quote › Quote13](../../spec/quotes.md#quote13)
5. [quotes.md › Enter in a quote › Quote38](../../spec/quotes.md#quote38)
6. [quotes.md › Enter in a quote › Quote39](../../spec/quotes.md#quote39)
7. [quotes.md › Enter in a quote › Quote40](../../spec/quotes.md#quote40)
8. [quotes.md › Enter in a quote › Quote41](../../spec/quotes.md#quote41)
9. [quotes.md › Enter in a quote › Quote43](../../spec/quotes.md#quote43)
10. [quotes.md › Shift-Enter in a quote › Quote47](../../spec/quotes.md#quote47)
11. [quotes.md › Backspace at a quote's start › Quote57](../../spec/quotes.md#quote57)
12. [quotes.md › Backspace at a quote's start › Quote58](../../spec/quotes.md#quote58)
13. [quotes.md › Joining into a callout's title › Quote60](../../spec/quotes.md#quote60)
14. [quotes.md › Joining into a callout's title › Quote61](../../spec/quotes.md#quote61)
15. [quotes.md › Joining into a callout's title › Quote62](../../spec/quotes.md#quote62)
16. [quotes.md › Quote71](../../spec/quotes.md#quote71)

### a selection across blocks (14)

1. [backspace.md › Backspace31](../../spec/backspace.md#backspace31)
2. [del.md › Delete21](../../spec/del.md#delete21)
3. [delete-subtree.md › DeleteSubtree5](../../spec/delete-subtree.md#deletesubtree5)
4. [indent.md › Indent9](../../spec/indent.md#indent9)
5. [indent.md › Indent27](../../spec/indent.md#indent27)
6. [move-subtree-down.md › MoveDown11](../../spec/move-subtree-down.md#movedown11)
7. [move-subtree-down.md › MoveDown12](../../spec/move-subtree-down.md#movedown12)
8. [move-subtree-down.md › MoveDown14](../../spec/move-subtree-down.md#movedown14)
9. [move-subtree-up.md › MoveUp10](../../spec/move-subtree-up.md#moveup10)
10. [move-subtree-up.md › MoveUp11](../../spec/move-subtree-up.md#moveup11)
11. [move-subtree-up.md › MoveUp31](../../spec/move-subtree-up.md#moveup31)
12. [outdent.md › Outdent8](../../spec/outdent.md#outdent8)
13. [outdent.md › Outdent10](../../spec/outdent.md#outdent10)
14. [outdent.md › Outdent12](../../spec/outdent.md#outdent12)

### a caret on a blank line (12)

1. [backspace.md › Cmd-Backspace › SoftBackspace6](../../spec/backspace.md#softbackspace6)
2. [enter.md › Enter37](../../spec/enter.md#enter37)
3. [gaps.md › Keys on a blank line › Gap14](../../spec/gaps.md#gap14)
4. [gaps.md › Keys on a blank line › Gap15](../../spec/gaps.md#gap15)
5. [gaps.md › Keys on a blank line › Gap16](../../spec/gaps.md#gap16)
6. [gaps.md › Keys on a blank line › Gap17](../../spec/gaps.md#gap17)
7. [gaps.md › Keys on a blank line › Gap18](../../spec/gaps.md#gap18)
8. [obsidian-true-outliner.md › Enter › E18](../../spec/obsidian-true-outliner.md#e18)
9. [obsidian-true-outliner.md › Shift-Enter › S7, S8 › Line break in setext underline refused](../../spec/obsidian-true-outliner.md#line-break-in-setext-underline-refused)
10. [placeholders.md › Placeholder10](../../spec/placeholders.md#placeholder10)
11. [placeholders.md › Placeholder12](../../spec/placeholders.md#placeholder12)
12. [typing.md › Typing1](../../spec/typing.md#typing1)

### option outdent: logical (8)

1. [obsidian-true-outliner.md › Ordered lists › Outdenting the head of a nested list](../../spec/obsidian-true-outliner.md#outdenting-the-head-of-a-nested-list)
2. [outdent.md › Logical outdent › LogicalOutdent1](../../spec/outdent.md#logicaloutdent1)
3. [outdent.md › Logical outdent › LogicalOutdent2](../../spec/outdent.md#logicaloutdent2)
4. [outdent.md › Logical outdent › LogicalOutdent3](../../spec/outdent.md#logicaloutdent3)
5. [outdent.md › Logical outdent › LogicalOutdent4](../../spec/outdent.md#logicaloutdent4)
6. [outdent.md › Logical outdent › LogicalOutdent5](../../spec/outdent.md#logicaloutdent5)
7. [quotes.md › Outdent out of a quote › Quote12b](../../spec/quotes.md#quote12b)
8. [quotes.md › Moving between quotes › Quote20](../../spec/quotes.md#quote20)

### cursorCharLeft after cursorDocEnd (5)

1. [cursor.md › CursorDocEndLeft1](../../spec/cursor.md#cursordocendleft1)
2. [placeholders.md › Placeholder9](../../spec/placeholders.md#placeholder9)
3. [placeholders.md › Placeholder11](../../spec/placeholders.md#placeholder11)
4. [placeholders.md › Placeholder15](../../spec/placeholders.md#placeholder15)
5. [undo.md › Undo2](../../spec/undo.md#undo2)

### option editInMarkup: refuse (5)

1. [del.md › Delete16b](../../spec/del.md#delete16b)
2. [del.md › Delete16c](../../spec/del.md#delete16c)
3. [quotes.md › Enter in a quote › Quote43b](../../spec/quotes.md#quote43b)
4. [shift-enter.md › ShiftEnter22b](../../spec/shift-enter.md#shiftenter22b)
5. [typing.md › Typing4](../../spec/typing.md#typing4)

### option enterOnEmptyItem: outdent (5)

1. [enter.md › Enter7b](../../spec/enter.md#enter7b)
2. [enter.md › Enter15b](../../spec/enter.md#enter15b)
3. [enter.md › Enter30](../../spec/enter.md#enter30)
4. [obsidian-true-outliner.md › Abandoning an empty place › Enter twice, then leave › Empty paragraph and blank lines removed](../../spec/obsidian-true-outliner.md#empty-paragraph-and-blank-lines-removed)
5. [obsidian-true-outliner.md › Abandoning an empty place › Enter twice, then leave › Indented list under paragraph restored](../../spec/obsidian-true-outliner.md#indented-list-under-paragraph-restored)

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

### option pasteStructuredLines: items (4)

1. [paste.md › Paste8](../../spec/paste.md#paste8)
2. [paste.md › Paste8b](../../spec/paste.md#paste8b)
3. [paste.md › Paste39](../../spec/paste.md#paste39)
4. [scenarios.md › Outliner flows › Scenario17](../../spec/scenarios.md#scenario17)

### action duplicateSubtree (3)

1. [duplicate-subtree.md › DuplicateSubtree1](../../spec/duplicate-subtree.md#duplicatesubtree1)
2. [duplicate-subtree.md › DuplicateSubtree2](../../spec/duplicate-subtree.md#duplicatesubtree2)
3. [duplicate-subtree.md › DuplicateSubtree3](../../spec/duplicate-subtree.md#duplicatesubtree3)

### changes only what blocks can't show (2)

1. [enter.md › Enter6](../../spec/enter.md#enter6)
2. [indent.md › Indent22](../../spec/indent.md#indent22)

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

### frontmatter (1)

1. [gaps.md › Keys on a blank line › Gap19](../../spec/gaps.md#gap19)

### no nodes (1)

1. [backspace.md › Backspace17e](../../spec/backspace.md#backspace17e)

### nothing to compare (1)

1. [fences.md › Fence21](../../spec/fences.md#fence21)

### option bullet: + (1)

1. [indent.md › Indent18](../../spec/indent.md#indent18)

### option taskEditing: text (1)

1. [tasks.md › TaskBackspace5](../../spec/tasks.md#taskbackspace5)
