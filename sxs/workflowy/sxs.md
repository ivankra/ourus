---
type: "SxS"
app: "workflowy"
version: "4.3.2610140850"
url: "https://beta.workflowy.com/guide/embed/"
model: "block"
command: "node sxs/run.ts workflowy"
elapsed_s: 232
---

# WorkFlowy vs ourus

Spec test suite replayed in WorkFlowy and compared against ourus.

Model: [block](../lib/outline.ts) (free-form cases had to be adapted into outlines of blocks)

## Summary

|  | agree | caret | whitespace | disagree | error | skipped | total |
| --- | --- | --- | --- | --- | --- | --- | --- |
| original | 65 | 4 | 3 | 34 |  |  | **106** |
| adapted | 76 | 7 | 8 | 86 |  |  | **177** |
| **total** | **141 (31%)** | **11 (2.4%)** | **11 (2.4%)** | **120 (26%)** | **0 (0%)** | **175 (38%)** | **458** |

Per-file:

|  | agree | caret | whitespace | disagree | error | skipped | total | original | adapted |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [backspace.md](../../spec/backspace.md) | 9 | 1 |  | 13 |  | 5 | **28** | 11 | 12 |
| [block-down.md](../../spec/block-down.md) | 9 |  |  | 4 |  | 7 | **20** | 4 | 9 |
| [block-up.md](../../spec/block-up.md) | 11 |  |  | 5 |  | 8 | **24** | 4 | 12 |
| [cursor.md](../../spec/cursor.md) | 23 | 4 |  |  |  | 5 | **32** | 12 | 15 |
| [del.md](../../spec/del.md) | 5 |  |  | 13 |  | 6 | **24** | 11 | 7 |
| [delete-subtree.md](../../spec/delete-subtree.md) | 2 | 2 |  |  |  |  | **4** | 1 | 3 |
| [duplicate-block.md](../../spec/duplicate-block.md) |  | 2 |  |  |  |  | **2** | 1 | 1 |
| [enter.md](../../spec/enter.md) | 12 | 1 | 7 | 7 |  | 6 | **33** | 11 | 16 |
| [fences.md](../../spec/fences.md) |  |  |  |  |  | 25 | **25** |  |  |
| [gaps.md](../../spec/gaps.md) | 11 |  |  | 2 |  | 6 | **19** |  | 13 |
| [indent.md](../../spec/indent.md) | 12 |  |  | 3 |  | 7 | **22** | 8 | 7 |
| [obsidian-true-outliner.md](../../spec/obsidian-true-outliner.md) | 26 |  | 2 | 26 |  | 18 | **72** | 24 | 30 |
| [outdent.md](../../spec/outdent.md) | 4 |  |  | 8 |  | 4 | **16** | 4 | 8 |
| [paste.md](../../spec/paste.md) | 2 |  |  | 14 |  | 7 | **23** | 5 | 11 |
| [placeholders.md](../../spec/placeholders.md) | 6 |  | 1 | 3 |  | 5 | **15** | 2 | 8 |
| [quotes.md](../../spec/quotes.md) |  |  |  |  |  | 53 | **53** |  |  |
| [scenarios.md](../../spec/scenarios.md) | 4 |  |  |  |  |  | **4** | 3 | 1 |
| [shift-enter.md](../../spec/shift-enter.md) | 1 |  |  | 13 |  | 2 | **16** | 3 | 11 |
| [tasks.md](../../spec/tasks.md) | 1 |  | 1 | 2 |  | 4 | **8** |  | 4 |
| [undo.md](../../spec/undo.md) | 2 |  |  | 1 |  | 1 | **4** | 2 | 1 |
| [zzz-redesign.md](../../spec/zzz-redesign.md) | 1 | 1 |  | 6 |  | 6 | **14** |  | 8 |
| **total** | **141 (31%)** | **11 (2.4%)** | **11 (2.4%)** | **120 (26%)** | **0 (0%)** | **175 (38%)** | **458** | **106 (23%)** | **177 (39%)** |

## Original cases

### Disagree (34)

#### 1. [Backspace3](../../spec/backspace.md#backspace3)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃b
```

</td><td>

<!--workflowy-->
```buffer
- a
  - ┃b
```

</td><td>

<!--ourus-->
```buffer
- a┃b
```

</td></tr>
</table>

#### 2. [Backspace9](../../spec/backspace.md#backspace9)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  ┃two
```

</td><td>

<!--workflowy-->
```buffer
- one
  ┃two
  
```

</td><td>

<!--ourus-->
```buffer
- one┃two
```

</td></tr>
</table>

#### 3. [Backspace17b](../../spec/backspace.md#backspace17b)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
  - a
    - b
```

</td><td>

<!--workflowy-->
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

#### 4. [Backspace17c](../../spec/backspace.md#backspace17c)

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
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--workflowy-->
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

#### 5. [Delete1](../../spec/del.md#delete1)

> deleteContentForward

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc┃
  - def
```

</td><td>

<!--workflowy-->
```buffer
- abc┃
  - def
```

</td><td>

<!--ourus-->
```buffer
- abc┃def
```

</td></tr>
</table>

#### 6. [Delete3](../../spec/del.md#delete3)

> deleteContentForward

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one┃
  two
```

</td><td>

<!--workflowy-->
```buffer
- one┃
  two
```

</td><td>

<!--ourus-->
```buffer
- one┃two
```

</td></tr>
</table>

#### 7. [Delete5](../../spec/del.md#delete5)

> deleteContentForward

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
  - a
    - b
  - c
- d
```

</td><td>

<!--workflowy-->
```buffer
- ┃
  - a
    - b
  - c
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

#### 8. [Delete5b](../../spec/del.md#delete5b)

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
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--workflowy-->
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

#### 9. [Delete5c](../../spec/del.md#delete5c)

> deleteContentForward

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- x
- ┃
  - a
    - b
```

</td><td>

<!--workflowy-->
```buffer
- x
- ┃
  - a
    - b
```

</td><td>

<!--ourus-->
```buffer
- x
- ┃a
  - b
```

</td></tr>
</table>

#### 10. [Delete5d](../../spec/del.md#delete5d)

> deleteContentForward

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃ 
  - a
    - b
```

</td><td>

<!--workflowy-->
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

#### 11. [Enter3](../../spec/enter.md#enter3)

> enter

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃ b
  - c
```

</td><td>

<!--workflowy-->
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

#### 12. [Enter16](../../spec/enter.md#enter16)

> enter

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  lazy
```

</td><td>

<!--workflowy-->
```buffer
- a
  lazy
- ┃
```

</td><td>

<!--ourus-->
```buffer
- a
- ┃lazy
```

</td></tr>
</table>

#### 13. [Indent19](../../spec/indent.md#indent19)

> indent

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b  
  c┃
```

</td><td>

<!--workflowy-->
```buffer
- a
- b  
  c→┃
```

</td><td>

<!--ourus-->
```buffer
- a
  - b  
    c┃
```

</td></tr>
</table>

#### 14. [Enter › E4](../../spec/obsidian-true-outliner.md#e4)

> enter

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- first
  second┃ line
```

</td><td>

<!--workflowy-->
```buffer
- first
  second
  ┃ line
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

#### 15. [Enter › E7, E8 › Split item becomes first tab-indented child](../../spec/obsidian-true-outliner.md#split-item-becomes-first-tab-indented-child)

> enter

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- alpha┃ beta
  - child
```

</td><td>

<!--workflowy-->
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

#### 16. [Shift-Enter › S11 › Place inside a multi-line item](../../spec/obsidian-true-outliner.md#place-inside-a-multi-line-item)

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

<!--workflowy-->
```buffer
- foo
  ┃bar
```

</td><td>

<!--ourus-->
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

<!--workflowy-->
```buffer
- foo
  x┃bar
```

</td><td>

<!--ourus-->
```buffer
- foo
  x┃
  bar
```

</td></tr>
</table>

#### 17. [Shift-Enter › S13](../../spec/obsidian-true-outliner.md#s13)

> shiftEnter

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a«lpha» beta
```

</td><td>

<!--workflowy-->
```buffer
- alpha beta
  ┃
```

</td><td>

<!--ourus-->
```buffer
- a
  ┃beta
```

</td></tr>
</table>

#### 18. [Backspace › Joining an item with children › Children move to the joined node](../../spec/obsidian-true-outliner.md#children-move-to-the-joined-node)

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

<!--workflowy-->
```buffer
- a
  - ┃b
    - c
```

</td><td>

<!--ourus-->
```buffer
- a┃b
  - c
```

</td></tr>
</table>

#### 19. [Backspace › Joining an item with children › Delete forward absorbs child with grandchildren](../../spec/obsidian-true-outliner.md#delete-forward-absorbs-child-with-grandchildren)

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

<!--workflowy-->
```buffer
- a┃
  - b
    - c
```

</td><td>

<!--ourus-->
```buffer
- a┃b
  - c
```

</td></tr>
</table>

#### 20. [Abandoning an empty place › Shift-Enter, Tab, then leave › Carried place removed on leaving](../../spec/obsidian-true-outliner.md#carried-place-removed-on-leaving)

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
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--workflowy-->
```buffer
- one
  - kid
- foo
  →┃
```

</td><td>

<!--ourus-->
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
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--workflowy-->
```buffer
- ┃one
  - kid
- foo
  →
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

#### 21. [Abandoning an empty place › Shift-Enter, Tab, then leave › Doubly indented place removed on leaving](../../spec/obsidian-true-outliner.md#doubly-indented-place-removed-on-leaving)

> shiftEnter indent indent cursorDocStart

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - kid
  - sib
- foo┃
```

</td><td>

<!--workflowy-->
```buffer
- ┃one
  - kid
  - sib
- foo
  →→
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

#### 22. [Abandoning an empty place › Shift-Enter, Tab, then leave › Backspace returns to the start](../../spec/obsidian-true-outliner.md#backspace-returns-to-the-start)

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

<!--workflowy-->
```buffer
- one
  - kid
- foo┃
```

</td><td>

<!--ourus-->
```buffer
- one
  - kid
  - foo┃
```

</td></tr>
</table>

#### 23. [Abandoning an empty place › Shift-Enter, Tab, then leave › Shift-Tab then Backspace returns to start](../../spec/obsidian-true-outliner.md#shift-tab-then-backspace-returns-to-start)

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

<!--workflowy-->
```buffer
- a
  - b┃
- c
```

</td><td>

<!--ourus-->
```buffer
- a
- b┃
- c
```

</td></tr>
</table>

#### 24. [Abandoning an empty place › Shift-Enter, Tab, then Enter](../../spec/obsidian-true-outliner.md#shift-enter-tab-then-enter)

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

<!--workflowy-->
```buffer
- one
  - kid
- foo
  →
  ┃
  
- bar
```

</td><td>

<!--ourus-->
```buffer
- one
  - kid
  - foo
  - ┃
- bar
```

</td></tr>
</table>

#### 25. [Abandoning an empty place › Enter twice, then leave › Empty paragraph and blank lines removed](../../spec/obsidian-true-outliner.md#empty-paragraph-and-blank-lines-removed)

> enter enter cursorDocStart

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

<!--workflowy-->
```buffer
- ┃a
- 
- 
- b
```

</td><td>

<!--ourus-->
```buffer
- a
- b
```

</td></tr>
</table>

#### 26. [Paste › #216 › Pasted list takes space indent unit](../../spec/obsidian-true-outliner.md#pasted-list-takes-space-indent-unit)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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

<!--workflowy-->
```buffer
- top
  - siba
    - b┃
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

#### 27. [Paste › #216 › Pasted list takes tab indent unit](../../spec/obsidian-true-outliner.md#pasted-list-takes-tab-indent-unit)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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

<!--workflowy-->
```buffer
- top
  - siba
    - b┃
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

#### 28. [Direct outdent › DirectOutdent1](../../spec/outdent.md#directoutdent1)

> outdent

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b┃
    - b1
  - c
- d
```

</td><td>

<!--workflowy-->
```buffer
- a
  - c
- b┃
  - b1
- d
```

</td><td>

<!--ourus-->
```buffer
- a
- b┃
  - b1
  - c
- d
```

</td></tr>
</table>

#### 29. [Paste3](../../spec/paste.md#paste3)

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

<!--workflowy-->
```buffer
- ax
- y
- ┃b
```

</td><td>

<!--ourus-->
```buffer
- ax
  y
  ┃b
```

</td></tr>
</table>

#### 30. [Paste5](../../spec/paste.md#paste5)

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

<!--workflowy-->
```buffer
- ax
- y┃
```

</td><td>

<!--ourus-->
```buffer
- ax
  y
  ┃
```

</td></tr>
</table>

#### 31. [Paste7](../../spec/paste.md#paste7)

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

<!--workflowy-->
```buffer
- ax
- y
- ┃b
```

</td><td>

<!--ourus-->
```buffer
- ab
- x
- y┃
```

</td></tr>
</table>

#### 32. [Paste19](../../spec/paste.md#paste19)

> pasteStructured

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

<!--workflowy-->
```buffer
- # ah
- text┃
```

</td><td>

<!--ourus-->
```buffer
- a# h
  text
  ┃
```

</td></tr>
</table>

#### 33. [ShiftEnter1](../../spec/shift-enter.md#shiftenter1)

> shiftEnter

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one two┃ three
```

</td><td>

<!--workflowy-->
```buffer
- one two three
  ┃
```

</td><td>

<!--ourus-->
```buffer
- one two
  ┃three
```

</td></tr>
</table>

#### 34. [ShiftEnter3](../../spec/shift-enter.md#shiftenter3)

> shiftEnter

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- x
  - a┃ b
```

</td><td>

<!--workflowy-->
```buffer
- x
  - a b
    ┃
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

### Whitespace (3)

#### 1. [Enter1](../../spec/enter.md#enter1)

> enter

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one two┃ three
- next
```

</td><td>

<!--workflowy-->
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

#### 2. [Enter › E1](../../spec/obsidian-true-outliner.md#e1)

> enter

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- alpha┃ beta
```

</td><td>

<!--workflowy-->
```buffer
- alpha
- ┃ beta
```

</td><td>

<!--ourus-->
```buffer
- alpha
- ┃beta
```

</td></tr>
</table>

#### 3. [Placeholder8](../../spec/placeholders.md#placeholder8)

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

<!--workflowy-->
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

### Caret (4)

#### 1. [Backspace17](../../spec/backspace.md#backspace17)

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

<!--workflowy-->
```buffer
- b
- c
```

</td><td>

<!--ourus-->
```buffer
- ┃b
- c
```

</td></tr>
</table>

#### 2. [CursorDown4](../../spec/cursor.md#cursordown4)

> cursorLineDown

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc┃
  - bcd
```

</td><td>

<!--workflowy-->
```buffer
- abc
  - ┃bcd
```

</td><td>

<!--ourus-->
```buffer
- abc
  - b┃cd
```

</td></tr>
</table>

#### 3. [BlockDuplicate1](../../spec/duplicate-block.md#blockduplicate1)

> duplicateNode

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - b
- c
```

</td><td>

<!--workflowy-->
```buffer
- a┃
  - b
- a
  - b
- c
```

</td><td>

<!--ourus-->
```buffer
- a
  - b
- a┃
  - b
- c
```

</td></tr>
</table>

#### 4. [Enter28](../../spec/enter.md#enter28)

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

<!--workflowy-->
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

### Agree (65)

1. [Backspace1](../../spec/backspace.md#backspace1)
2. [Backspace5](../../spec/backspace.md#backspace5)
3. [Backspace7](../../spec/backspace.md#backspace7)
4. [Backspace8](../../spec/backspace.md#backspace8)
5. [Backspace13](../../spec/backspace.md#backspace13)
6. [Backspace17d](../../spec/backspace.md#backspace17d)
7. [BlockDown7](../../spec/block-down.md#blockdown7)
8. [BlockDown9](../../spec/block-down.md#blockdown9)
9. [BlockDown10](../../spec/block-down.md#blockdown10)
10. [BlockDown15](../../spec/block-down.md#blockdown15)
11. [BlockUp1](../../spec/block-up.md#blockup1)
12. [BlockUp6](../../spec/block-up.md#blockup6)
13. [BlockUp8](../../spec/block-up.md#blockup8)
14. [BlockUp9](../../spec/block-up.md#blockup9)
15. [CursorUp3](../../spec/cursor.md#cursorup3)
16. [CursorDown3](../../spec/cursor.md#cursordown3)
17. [CursorHome1](../../spec/cursor.md#cursorhome1)
18. [CursorHome2](../../spec/cursor.md#cursorhome2)
19. [CursorHome5](../../spec/cursor.md#cursorhome5)
20. [CursorHome6](../../spec/cursor.md#cursorhome6)
21. [CursorHome12](../../spec/cursor.md#cursorhome12)
22. [CursorHome13](../../spec/cursor.md#cursorhome13)
23. [CursorEnd1](../../spec/cursor.md#cursorend1)
24. [CursorDocStart1](../../spec/cursor.md#cursordocstart1)
25. [SelectHome1](../../spec/cursor.md#selecthome1)
26. [Delete2](../../spec/del.md#delete2)
27. [Delete6](../../spec/del.md#delete6)
28. [Delete7](../../spec/del.md#delete7)
29. [Delete8](../../spec/del.md#delete8)
30. [Delete12](../../spec/del.md#delete12)
31. [BlockDelete1](../../spec/delete-subtree.md#blockdelete1)
32. [Enter4](../../spec/enter.md#enter4)
33. [Enter5](../../spec/enter.md#enter5)
34. [Enter21](../../spec/enter.md#enter21)
35. [Enter26](../../spec/enter.md#enter26)
36. [Enter27](../../spec/enter.md#enter27)
37. [Enter29](../../spec/enter.md#enter29)
38. [Enter31](../../spec/enter.md#enter31)
39. [Indent1](../../spec/indent.md#indent1)
40. [Indent14](../../spec/indent.md#indent14)
41. [Indent17](../../spec/indent.md#indent17)
42. [Indent2](../../spec/indent.md#indent2)
43. [Indent6](../../spec/indent.md#indent6)
44. [Indent7](../../spec/indent.md#indent7)
45. [Indent8](../../spec/indent.md#indent8)
46. [Enter › E7, E8 › End of parent opens empty first child](../../spec/obsidian-true-outliner.md#end-of-parent-opens-empty-first-child)
47. [Enter › E33](../../spec/obsidian-true-outliner.md#e33)
48. [Backspace › #153 › Undoing a fresh line break](../../spec/obsidian-true-outliner.md#undoing-a-fresh-line-break)
49. [Backspace › delete-to-content-start](../../spec/obsidian-true-outliner.md#delete-to-content-start)
50. [Indentation › list-marker-content-column](../../spec/obsidian-true-outliner.md#list-marker-content-column)
51. [Indentation › indent-unit-on-every-line](../../spec/obsidian-true-outliner.md#indent-unit-on-every-line)
52. [Moving › lone-block-id › Block id moves with its item](../../spec/obsidian-true-outliner.md#block-id-moves-with-its-item)
53. [Abandoning an empty place › Enter, then Shift-Enter and Backspace](../../spec/obsidian-true-outliner.md#enter-then-shift-enter-and-backspace)
54. [Abandoning an empty place › Enter, Shift-Tab, then leave › Second Enter outdents to a kept item](../../spec/obsidian-true-outliner.md#second-enter-outdents-to-a-kept-item)
55. [Outdent1](../../spec/outdent.md#outdent1)
56. [Outdent3](../../spec/outdent.md#outdent3)
57. [Logical outdent › LogicalOutdent1](../../spec/outdent.md#logicaloutdent1)
58. [Paste10](../../spec/paste.md#paste10)
59. [Placeholder6](../../spec/placeholders.md#placeholder6)
60. [Outliner flows › Typing a new child](../../spec/scenarios.md#typing-a-new-child)
61. [Outliner flows › Enter outdents the empty child](../../spec/scenarios.md#enter-outdents-the-empty-child)
62. [Outliner flows › Backspace removes the empty child](../../spec/scenarios.md#backspace-removes-the-empty-child)
63. [ShiftEnter4](../../spec/shift-enter.md#shiftenter4)
64. [Undo1](../../spec/undo.md#undo1)
65. [Undo4](../../spec/undo.md#undo4)

## Adapted cases

### Disagree (86)

#### 1. [Backspace4](../../spec/backspace.md#backspace4)

> deleteContentBackward

Adapted: heading

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Title #
  - ┃more
```

</td><td>

<!--workflowy-->
```buffer
- # Title #
  - ┃more
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
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃b
```

</td><td>

<!--workflowy-->
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

#### 3. [Backspace14](../../spec/backspace.md#backspace14)

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
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--workflowy-->
```buffer
- # ┃H1
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

#### 4. [Backspace15](../../spec/backspace.md#backspace15)

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

<!--workflowy-->
```buffer
- para
  - ┃a
```

</td><td>

<!--ourus-->
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

#### 5. [Backspace18](../../spec/backspace.md#backspace18)

> deleteContentBackward

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- para
- # ┃Hello
  - body
```

</td><td>

<!--workflowy-->
```buffer
- para
- # ┃Hello
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

#### 6. [Backspace18c](../../spec/backspace.md#backspace18c)

> deleteContentBackward

Adapted: blank lines, heading, paragraph, setext heading

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # ┃Title
  - text
```

</td><td>

<!--workflowy-->
```buffer
- # ┃Title
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

#### 7. [Backspace18d](../../spec/backspace.md#backspace18d)

> deleteContentBackward

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- # ┃H1
  - text
```

</td><td>

<!--workflowy-->
```buffer
- a
- # ┃H1
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

#### 8. [Backspace19](../../spec/backspace.md#backspace19)

> deleteContentBackward

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃bc
```

</td><td>

<!--workflowy-->
```buffer
- a
  - ┃bc
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

#### 9. [Backspace20](../../spec/backspace.md#backspace20)

> deleteContentBackward

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃
  - b
```

</td><td>

<!--workflowy-->
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

#### 10. [BlockDown2](../../spec/block-down.md#blockdown2)

> moveBlockDown

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # H
  - a┃
  - para
```

</td><td>

<!--workflowy-->
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

#### 11. [BlockDown8](../../spec/block-down.md#blockdown8)

> moveBlockDown

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b┃
- para
  - c
```

</td><td>

<!--workflowy-->
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

#### 12. [BlockDown13](../../spec/block-down.md#blockdown13)

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

> moveBlockDown

<table>
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--workflowy-->
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

> moveBlockUp

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
<tr><th>buffer</th><th>moveBlockDown</th><th>moveBlockUp</th></tr>
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

#### 13. [BlockDown20](../../spec/block-down.md#blockdown20)

> moveBlockDown

Adapted: blank lines, heading

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Todo
  - one
  - two┃
  - ## Later
    - three
```

</td><td>

<!--workflowy-->
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

#### 14. [BlockUp7](../../spec/block-up.md#blockup7)

> moveBlockUp

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- para
  - b┃
  - c
```

</td><td>

<!--workflowy-->
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

#### 15. [BlockUp12](../../spec/block-up.md#blockup12)

> moveBlockUp

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- intro
  - b┃
    - b1
```

</td><td>

<!--workflowy-->
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

#### 16. [BlockUp21](../../spec/block-up.md#blockup21)

> moveBlockUp

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- para
  - a┃
  - b
```

</td><td>

<!--workflowy-->
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

#### 17. [BlockUp23](../../spec/block-up.md#blockup23)

> moveBlockUp

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # A
  - ## sub
    - s1
- # B
  - ┃para
```

</td><td>

<!--workflowy-->
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

#### 18. [BlockUp24](../../spec/block-up.md#blockup24)

> moveBlockUp

Adapted: blank lines, heading

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Todo
  - one
  - ## Later
    - ┃two
    - three
```

</td><td>

<!--workflowy-->
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

#### 19. [Delete4](../../spec/del.md#delete4)

> deleteContentForward

Adapted: heading

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Title┃ #
  - more
```

</td><td>

<!--workflowy-->
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

#### 20. [Delete9](../../spec/del.md#delete9)

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
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--workflowy-->
```buffer
- # ┃H1
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

#### 21. [Delete13](../../spec/del.md#delete13)

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

<!--workflowy-->
```buffer
- a┃
- # H1
```

</td><td>

<!--ourus-->
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

#### 22. [Delete13c](../../spec/del.md#delete13c)

> deleteContentForward

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- # H1
  - text
```

</td><td>

<!--workflowy-->
```buffer
- a┃
- # H1
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

#### 23. [Delete14](../../spec/del.md#delete14)

> deleteContentForward

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- # H1
  - body
```

</td><td>

<!--workflowy-->
```buffer
- a┃
- # H1
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

#### 24. [Delete15](../../spec/del.md#delete15)

> deleteContentForward

Adapted: heading

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ## A┃
- # H1 ##
```

</td><td>

<!--workflowy-->
```buffer
- ## A┃
- # H1 ##
```

</td><td>

<!--ourus-->
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

#### 25. [Delete17](../../spec/del.md#delete17)

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

<!--workflowy-->
```buffer
- Shopping:┃
  - milk
  - eggs
```

</td><td>

<!--ourus-->
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

#### 26. [Enter7](../../spec/enter.md#enter7)

> enter

Adapted: blank lines, paragraph; Also: [enter.md › Enter15](../../spec/enter.md#enter15)

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃
- b
```

</td><td>

<!--workflowy-->
```buffer
- a
- 
- ┃
- b
```

</td><td>

<!--ourus-->
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

#### 27. [Enter14](../../spec/enter.md#enter14)

> enter enter enter "p"

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b┃
```

</td><td>

<!--workflowy-->
```buffer
- a
  - b
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

#### 28. [Enter22](../../spec/enter.md#enter22)

> enter

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- para ┃- x
  - a
```

</td><td>

<!--workflowy-->
```buffer
- para 
- ┃- x
  - a
```

</td><td>

<!--ourus-->
```buffer
- para
  - ┃x
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

- ┃x
- a
```

</td></tr>
</table>

#### 29. [Enter32](../../spec/enter.md#enter32)

> enter

Adapted: heading, paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # ┃H1
```

</td><td>

<!--workflowy-->
```buffer
- ┃
- # H1
```

</td><td>

<!--ourus-->
```buffer
- # 
  - ┃H1
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# ┃H1
```

</td><td>

```buffer
# 
┃H1
```

</td></tr>
</table>

#### 30. [New text and gaps › Items pasted at the end of a tight list keep it tight](../../spec/gaps.md#items-pasted-at-the-end-of-a-tight-list-keep-it-tight)

> pasteStructured

Adapted: blank lines, paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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

<!--workflowy-->
```buffer
- ta
- b┃
- para
```

</td><td>

<!--ourus-->
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

#### 31. [New text and gaps › Items pasted as first children land at the existing children's column](../../spec/gaps.md#items-pasted-as-first-children-land-at-the-existing-childrens-column)

> pasteStructured

Adapted: task

<table>
<tr><th>clipboard</th><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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

<!--workflowy-->
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

#### 32. [Indent12](../../spec/indent.md#indent12)

> indent

Adapted: heading

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # A
  - ## B┃
    - ### C
```

</td><td>

<!--workflowy-->
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

#### 33. [Indent16](../../spec/indent.md#indent16)

> indent

Adapted: blank lines, heading, setext heading

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Title┃
  - ## Sub
```

</td><td>

<!--workflowy-->
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

#### 34. [Enter › E15](../../spec/obsidian-true-outliner.md#e15)

> enter

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Head┃line
  - item
```

</td><td>

<!--workflowy-->
```buffer
- Head
- # ┃line
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

#### 35. [Enter › E17](../../spec/obsidian-true-outliner.md#e17)

> enter

Adapted: heading, paragraph, setext heading; Also: [obsidian-true-outliner.md › Enter › E13, E16 › Rest of title becomes first paragraph](../../spec/obsidian-true-outliner.md#rest-of-title-becomes-first-paragraph)

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Hello┃ world
```

</td><td>

<!--workflowy-->
```buffer
- Hello
- # ┃ world
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

#### 36. [Enter › E19, E21 › End of lone heading starts a paragraph](../../spec/obsidian-true-outliner.md#end-of-lone-heading-starts-a-paragraph)

> enter "x"

Adapted: heading, paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Head┃
```

</td><td>

<!--workflowy-->
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

#### 37. [Enter › E19, E21 › Empty paragraph before a section list](../../spec/obsidian-true-outliner.md#empty-paragraph-before-a-section-list)

> enter

Adapted: blank lines, heading, paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # Head┃
  - item
```

</td><td>

<!--workflowy-->
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

#### 38. [Enter › E32 › Task checkbox carries over unchecked](../../spec/obsidian-true-outliner.md#task-checkbox-carries-over-unchecked)

> enter

Adapted: task

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] alpha┃ beta
```

</td><td>

<!--workflowy-->
```buffer
- [ ] alpha
- [ ] ┃ beta
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

#### 39. [Enter › E13, E16 › Split title above a subheading](../../spec/obsidian-true-outliner.md#split-title-above-a-subheading)

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

<!--workflowy-->
```buffer
- He
- # ┃ad
  - ## Sub
```

</td><td>

<!--ourus-->
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

#### 40. [Enter › E14, E20 › Split title above an existing paragraph](../../spec/obsidian-true-outliner.md#split-title-above-an-existing-paragraph)

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

<!--workflowy-->
```buffer
- Head
- # ┃line
  - Body.
```

</td><td>

<!--ourus-->
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

#### 41. [Shift-Enter › S4](../../spec/obsidian-true-outliner.md#s4)

> shiftEnter

Adapted: paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one┃ two
```

</td><td>

<!--workflowy-->
```buffer
- one two
  ┃
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

#### 42. [Shift-Enter › S9](../../spec/obsidian-true-outliner.md#s9)

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

<!--workflowy-->
```buffer
- item
  - para text
    ┃
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

#### 43. [Backspace › Joining away the head of a list › Next item becomes the new 1.](../../spec/obsidian-true-outliner.md#next-item-becomes-the-new-1)

> deleteContentBackward

Adapted: numbered list

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- p
  - ┃a
  - b
```

</td><td>

<!--workflowy-->
```buffer
- p
  - ┃a
  - b
```

</td><td>

<!--ourus-->
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
  1. b
```

</td></tr>
</table>

#### 44. [Abandoning an empty place › Enter twice, then leave › Indented list under paragraph restored](../../spec/obsidian-true-outliner.md#indented-list-under-paragraph-restored)

> enter enter cursorDocStart

Adapted: paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- para
  - a┃
  - b
```

</td><td>

<!--workflowy-->
```buffer
- ┃para
  - a
  - 
  - 
  - b
```

</td><td>

<!--ourus-->
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

#### 45. [Outdent4](../../spec/outdent.md#outdent4)

> outdent

Adapted: heading

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ## A┃
  - ### B
```

</td><td>

<!--workflowy-->
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

#### 46. [Outdent6](../../spec/outdent.md#outdent6)

> outdent

Adapted: blank lines

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b┃
  - c
- d
```

</td><td>

<!--workflowy-->
```buffer
- a
  - c
- b┃
- d
```

</td><td>

<!--ourus-->
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

#### 47. [Direct outdent › DirectOutdent2](../../spec/outdent.md#directoutdent2)

> outdent

Adapted: paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

<!--workflowy-->
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

#### 48. [Direct outdent › DirectOutdent3](../../spec/outdent.md#directoutdent3)

> outdent

Adapted: paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - a1
- b
```

</td><td>

<!--workflowy-->
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

#### 49. [Direct outdent › DirectOutdent4](../../spec/outdent.md#directoutdent4)

> outdent

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- para
  - a┃
  - b
```

</td><td>

<!--workflowy-->
```buffer
- para
  - b
- a┃
```

</td><td>

<!--ourus-->
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

#### 50. [Logical outdent › LogicalOutdent2](../../spec/outdent.md#logicaloutdent2)

> outdent

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

<!--workflowy-->
```buffer
- a┃
- b
```

</td><td>

<!--ourus-->
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

#### 51. [Logical outdent › LogicalOutdent3](../../spec/outdent.md#logicaloutdent3)

> outdent

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - a1
- b
```

</td><td>

<!--workflowy-->
```buffer
- a┃
  - a1
- b
```

</td><td>

<!--ourus-->
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

#### 52. [Paste2](../../spec/paste.md#paste2)

> pasteStructured

Adapted: numbered list

<table>
<tr><th>clipboard</th><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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

<!--workflowy-->
```buffer
- ax
- y┃
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
2. b
```

</td></tr>
</table>

#### 53. [Paste4](../../spec/paste.md#paste4)

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

<!--workflowy-->
```buffer
- ax
- y
- ┃b
```

</td><td>

<!--ourus-->
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

#### 54. [Paste12](../../spec/paste.md#paste12)

> pasteStructured

Adapted: escape

<table>
<tr><th>clipboard</th><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
> q
> r
```

</td><td>

```buffer
- a
- ┃
```

</td><td>

<!--workflowy-->
```buffer
- a
- q
- r┃
```

</td><td>

<!--ourus-->
```buffer
- a
- > q
  > r
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
- ┃
```

</td><td>

```buffer
- a
- \> q
  \> r
  ┃◌
```

</td></tr>
</table>

#### 55. [Paste13](../../spec/paste.md#paste13)

> pasteStructured

Adapted: escape

<table>
<tr><th>clipboard</th><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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

<!--workflowy-->
```buffer
- a1. x
- 2. y┃
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

#### 56. [Paste14](../../spec/paste.md#paste14)

> pasteStructured

Adapted: escape

<table>
<tr><th>clipboard</th><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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

<!--workflowy-->
```buffer
- a
  - kid
- 1. x
- 2. y┃
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

#### 57. [Paste15](../../spec/paste.md#paste15)

> pasteStructured

Adapted: numbered list

<table>
<tr><th>clipboard</th><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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

<!--workflowy-->
```buffer
- 1. x
- 2. y┃
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

#### 58. [Paste17](../../spec/paste.md#paste17)

> pasteStructured

Adapted: escape, numbered list

<table>
<tr><th>clipboard</th><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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

<!--workflowy-->
```buffer
- a1. x
  - 1. x1
- 2. y┃
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

#### 59. [Paste18](../../spec/paste.md#paste18)

> pasteStructured

Adapted: numbered list

<table>
<tr><th>clipboard</th><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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

<!--workflowy-->
```buffer
- a1. x
- 2. y┃
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
1. x
2. y┃
2. b
```

</td></tr>
</table>

#### 60. [Paste20](../../spec/paste.md#paste20)

> pasteStructured

Adapted: blank lines, paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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

<!--workflowy-->
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

#### 61. [Paste21](../../spec/paste.md#paste21)

> pasteStructured

Adapted: paragraph

<table>
<tr><th>clipboard</th><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
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

<!--workflowy-->
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

#### 62. [Placeholder2](../../spec/placeholders.md#placeholder2)

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
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--workflowy-->
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
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--workflowy-->
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

#### 63. [Placeholder3](../../spec/placeholders.md#placeholder3)

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
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--workflowy-->
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

#### 64. [Placeholder13](../../spec/placeholders.md#placeholder13)

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

<!--workflowy-->
```buffer
- # H1
  - ┃
  - ## H2
```

</td><td>

<!--ourus-->
```buffer
- # H1
  - ┃## H2
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

┃## H2
```

</td></tr>
</table>

#### 65. [ShiftEnter2](../../spec/shift-enter.md#shiftenter2)

> shiftEnter

Adapted: numbered list

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b┃ c
```

</td><td>

<!--workflowy-->
```buffer
- a
  - b c
    ┃
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

#### 66. [ShiftEnter5](../../spec/shift-enter.md#shiftenter5)

> shiftEnter

Adapted: escape

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc ┃- def
```

</td><td>

<!--workflowy-->
```buffer
- abc - def
  ┃
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

#### 67. [ShiftEnter6](../../spec/shift-enter.md#shiftenter6)

> shiftEnter

Adapted: escape

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc ┃1. def
```

</td><td>

<!--workflowy-->
```buffer
- abc 1. def
  ┃
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

#### 68. [ShiftEnter7](../../spec/shift-enter.md#shiftenter7)

> shiftEnter

Adapted: escape, paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Title ┃===
```

</td><td>

<!--workflowy-->
```buffer
- Title ===
  ┃
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

#### 69. [ShiftEnter8](../../spec/shift-enter.md#shiftenter8)

> shiftEnter

Adapted: escape, paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Title ┃--
```

</td><td>

<!--workflowy-->
```buffer
- Title --
  ┃
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

#### 70. [ShiftEnter9](../../spec/shift-enter.md#shiftenter9)

> shiftEnter

Adapted: escape

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one ┃<div>
```

</td><td>

<!--workflowy-->
```buffer
- one <div>
  ┃
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

#### 71. [ShiftEnter10](../../spec/shift-enter.md#shiftenter10)

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
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--workflowy-->
```buffer
- a┃
  bc
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
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--workflowy-->
```buffer
- ax┃
  bc
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

#### 72. [ShiftEnter11](../../spec/shift-enter.md#shiftenter11)

> shiftEnter

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  ┃
- two
```

</td><td>

<!--workflowy-->
```buffer
- one┃
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

#### 73. [ShiftEnter12](../../spec/shift-enter.md#shiftenter12)

> shiftEnter

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- para
  ┃
```

</td><td>

<!--workflowy-->
```buffer
- para┃
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

#### 74. [ShiftEnter15](../../spec/shift-enter.md#shiftenter15)

> shiftEnter shiftEnter "p"

Adapted: blank lines, paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one┃
```

</td><td>

<!--workflowy-->
```buffer
- onep┃
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

#### 75. [ShiftEnter16](../../spec/shift-enter.md#shiftenter16)

> shiftEnter shiftEnter "p"

Adapted: CR line endings, blank lines, paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
```

</td><td>

<!--workflowy-->
```buffer
- ap┃
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

#### 76. [TaskEnter1](../../spec/tasks.md#taskenter1)

> enter

Adapted: blank lines, paragraph, task

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- [ ] ┃
```

</td><td>

<!--workflowy-->
```buffer
- a
- [ ] 
- [ ] ┃
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

#### 77. [TaskBackspace5](../../spec/tasks.md#taskbackspace5)

Adapted: task

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- [ ] ┃
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--workflowy-->
```buffer

```

</td><td>

<!--ourus-->
```buffer
- [ ]┃
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--workflowy-->
```buffer

```

</td><td>

<!--ourus-->
```buffer
- [ ┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>deleteContentBackward</th><th>deleteContentBackward</th></tr>
<tr valign="top"><td>

```buffer
- [ ] ┃
```

</td><td>

```buffer
- [ ]┃
```

</td><td>

```buffer
- [ ┃
```

</td></tr>
</table>

#### 78. [Undo3](../../spec/undo.md#undo3)

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
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--workflowy-->
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
<tr><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--workflowy-->
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

#### 79. [Decisions of the redesign › The guard › Setext authoring › Deleting to finish the underline](../../spec/zzz-redesign.md#deleting-to-finish-the-underline)

> deleteContentBackward

Adapted: heading, paragraph, setext heading

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- para
  ---x┃
```

</td><td>

<!--workflowy-->
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

#### 80. [Decisions of the redesign › The guard › A list marker typed on a continuation line](../../spec/zzz-redesign.md#a-list-marker-typed-on-a-continuation-line)

> "- "

Adapted: paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- para
  ┃more
```

</td><td>

<!--workflowy-->
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

#### 81. [Decisions of the redesign › Paragraphs own the list that follows them › A paragraph owns consecutive lists](../../spec/zzz-redesign.md#a-paragraph-owns-consecutive-lists)

> shiftEnter

Adapted: numbered list, paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- pa┃ra
  - a
  - b
```

</td><td>

<!--workflowy-->
```buffer
- para
  ┃
  - a
  - b
```

</td><td>

<!--ourus-->
```buffer
- pa
  ┃ra
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
pa┃ra
1. a
- b
```

</td><td>

```buffer
pa
┃ra
1. a
- b
```

</td></tr>
</table>

#### 82. [Findings of the design experiments › Escapes › Cmd-Backspace in a setext title](../../spec/zzz-redesign.md#cmd-backspace-in-a-setext-title)

> deleteSoftLineBackward

Adapted: heading, setext heading

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- # abc ┃- x tail
```

</td><td>

<!--workflowy-->
```buffer
- # ┃- x tail
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

#### 83. [Findings of the design experiments › Escapes › Text other readers would read differently › Ordered marker split onto a new line](../../spec/zzz-redesign.md#ordered-marker-split-onto-a-new-line)

> shiftEnter

Adapted: escape, numbered list

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc ┃2. x
```

</td><td>

<!--workflowy-->
```buffer
- abc 2. x
  ┃
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

#### 84. [Findings of the design experiments › Escapes › Text other readers would read differently › Table delimiter row split onto a new line](../../spec/zzz-redesign.md#table-delimiter-row-split-onto-a-new-line)

> shiftEnter

Adapted: escape, paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a | b ┃|---|---|
```

</td><td>

<!--workflowy-->
```buffer
- a | b |---|---|
  ┃
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

### Whitespace (8)

#### 1. [Enter8](../../spec/enter.md#enter8)

> enter

Adapted: escape

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc ┃- def
```

</td><td>

<!--workflowy-->
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
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc ┃# def
```

</td><td>

<!--workflowy-->
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
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc ┃<div>
```

</td><td>

<!--workflowy-->
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
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- see ┃[a]: /url
```

</td><td>

<!--workflowy-->
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
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- some┃ text
```

</td><td>

<!--workflowy-->
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
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc ┃2. def
```

</td><td>

<!--workflowy-->
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

#### 7. [Enter › E9](../../spec/obsidian-true-outliner.md#e9)

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

<!--workflowy-->
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

#### 8. [TaskEnter3](../../spec/tasks.md#taskenter3)

> enter

Adapted: task

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] abc ┃# x
```

</td><td>

<!--workflowy-->
```buffer
- [ ] abc 
- [ ] ┃# x
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

### Caret (7)

#### 1. [CursorRight1](../../spec/cursor.md#cursorright1)

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

<!--workflowy-->
```buffer
- a┃
  b
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

#### 2. [CursorUp1](../../spec/cursor.md#cursorup1)

> cursorLineUp

Adapted: paragraph

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ab┃
```

</td><td>

<!--workflowy-->
```buffer
- ab
```

</td><td>

<!--ourus-->
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

#### 3. [CursorDown1](../../spec/cursor.md#cursordown1)

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

<!--workflowy-->
```buffer
- abc
- abcdef┃
```

</td><td>

<!--ourus-->
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

#### 4. [BlockDelete3](../../spec/delete-subtree.md#blockdelete3)

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

<!--workflowy-->
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

#### 5. [BlockDelete4](../../spec/delete-subtree.md#blockdelete4)

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

<!--workflowy-->
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

#### 6. [BlockDuplicate2](../../spec/duplicate-block.md#blockduplicate2)

> duplicateNode

Adapted: numbered list

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

<!--workflowy-->
```buffer
- a┃
- a
- b
```

</td><td>

<!--ourus-->
```buffer
- a
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
1. a┃
2. b
```

</td><td>

```buffer
1. a
2. a┃
3. b
```

</td></tr>
</table>

#### 7. [Findings of the design experiments › Empty tasks and empty items › B8: joining into an empty task](../../spec/zzz-redesign.md#b8-joining-into-an-empty-task)

> deleteContentBackward

Adapted: task

<table>
<tr><th>buffer</th><th>workflowy</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] 
- [x] ┃a
```

</td><td>

<!--workflowy-->
```buffer
- [x] ┃a
```

</td><td>

<!--ourus-->
```buffer
- ┃[x] a
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] 
- [x] ┃a
```

</td><td>

```buffer
- ┃[x] a
```

</td></tr>
</table>

### Agree (76)

1. [Backspace10](../../spec/backspace.md#backspace10) (blank lines, paragraph)
2. [Backspace11](../../spec/backspace.md#backspace11) (blank lines, paragraph)
3. [Backspace21](../../spec/backspace.md#backspace21) (blank lines, paragraph)
4. [BlockDown1](../../spec/block-down.md#blockdown1) (blank lines)
5. [BlockDown4](../../spec/block-down.md#blockdown4) (blank lines, heading, paragraph)
6. [BlockDown5](../../spec/block-down.md#blockdown5) (blank lines, paragraph)
7. [BlockDown16](../../spec/block-down.md#blockdown16) (heading)
8. [BlockDown18](../../spec/block-down.md#blockdown18) (blank lines, heading)
9. [BlockUp3](../../spec/block-up.md#blockup3) (blank lines, heading, paragraph)
10. [BlockUp4](../../spec/block-up.md#blockup4) (blank lines, paragraph)
11. [BlockUp14](../../spec/block-up.md#blockup14) (numbered list)
12. [moveBlockUp, moveBlockDown (Alt-Shift-Up, Alt-Shift-Down) › The document's trailing blank lines stay at its end](../../spec/gaps.md#the-documents-trailing-blank-lines-stay-at-its-end) (numbered list)
13. [BlockUp15](../../spec/block-up.md#blockup15) (numbered list)
14. [BlockUp16](../../spec/block-up.md#blockup16) (heading)
15. [BlockUp17](../../spec/block-up.md#blockup17) (blank lines, paragraph)
16. [BlockUp22](../../spec/block-up.md#blockup22) (blank lines, heading)
17. [CursorLeft1](../../spec/cursor.md#cursorleft1) (paragraph)
18. [CursorLeft2](../../spec/cursor.md#cursorleft2) (paragraph)
19. [CursorLeft3](../../spec/cursor.md#cursorleft3) (paragraph)
20. [CursorRight2](../../spec/cursor.md#cursorright2) (paragraph)
21. [CursorUp2](../../spec/cursor.md#cursorup2) (heading)
22. [CursorHome7](../../spec/cursor.md#cursorhome7) (numbered list)
23. [CursorHome8](../../spec/cursor.md#cursorhome8) (task)
24. [CursorHome9](../../spec/cursor.md#cursorhome9) (task)
25. [CursorHome10](../../spec/cursor.md#cursorhome10) (heading)
26. [CursorHome14](../../spec/cursor.md#cursorhome14) (paragraph)
27. [SelectLeft1](../../spec/cursor.md#selectleft1) (paragraph)
28. [SelectRightEnd1](../../spec/cursor.md#selectrightend1) (paragraph)
29. [BlockDelete2](../../spec/delete-subtree.md#blockdelete2) (numbered list)
30. [Enter2](../../spec/enter.md#enter2) (numbered list)
31. [Enter17](../../spec/enter.md#enter17) (CR line endings)
32. [Enter18](../../spec/enter.md#enter18) (CR line endings)
33. [Enter25](../../spec/enter.md#enter25) (numbered list)
34. [Enter36](../../spec/enter.md#enter36) (blank lines)
35. [moveBlockUp, moveBlockDown (Alt-Shift-Up, Alt-Shift-Down) › Gaps travel with their nodes](../../spec/gaps.md#gaps-travel-with-their-nodes) (blank lines, paragraph)
36. [moveBlockUp, moveBlockDown (Alt-Shift-Up, Alt-Shift-Down) › An item carries its gap inside a loose list](../../spec/gaps.md#an-item-carries-its-gap-inside-a-loose-list) (blank lines, paragraph)
37. [moveBlockUp, moveBlockDown (Alt-Shift-Up, Alt-Shift-Down) › Moving down carries the gap too](../../spec/gaps.md#moving-down-carries-the-gap-too) (blank lines, paragraph)
38. [moveBlockUp, moveBlockDown (Alt-Shift-Up, Alt-Shift-Down) › The preamble stays at the top](../../spec/gaps.md#the-preamble-stays-at-the-top) (blank lines, paragraph)
39. [moveBlockUp, moveBlockDown (Alt-Shift-Up, Alt-Shift-Down) › A section carries its last line's gap](../../spec/gaps.md#a-section-carries-its-last-lines-gap) (blank lines, heading, paragraph)
40. [moveBlockUp, moveBlockDown (Alt-Shift-Up, Alt-Shift-Down) › A subtree's gap is its last descendant's](../../spec/gaps.md#a-subtrees-gap-is-its-last-descendants) (blank lines)
41. [moveBlockUp, moveBlockDown (Alt-Shift-Up, Alt-Shift-Down) › Sections written without blank lines stay without](../../spec/gaps.md#sections-written-without-blank-lines-stay-without) (heading, paragraph)
42. [moveBlockUp, moveBlockDown (Alt-Shift-Up, Alt-Shift-Down) › The gap ending a list stays at the list's end](../../spec/gaps.md#the-gap-ending-a-list-stays-at-the-lists-end) (blank lines, paragraph)
43. [moveBlockUp, moveBlockDown (Alt-Shift-Up, Alt-Shift-Down) › The gap ending a parent's children stays at their end](../../spec/gaps.md#the-gap-ending-a-parents-children-stays-at-their-end) (blank lines)
44. [New text and gaps › Enter at the end of a heading keeps its gap below the new paragraph](../../spec/gaps.md#enter-at-the-end-of-a-heading-keeps-its-gap-below-the-new-paragraph) (blank lines, heading, paragraph)
45. [Indent3](../../spec/indent.md#indent3) (bullet *)
46. [Indent5](../../spec/indent.md#indent5) (bullet *)
47. [Indentation › destination-list-style](../../spec/obsidian-true-outliner.md#destination-list-style) (bullet *)
48. [Indent4](../../spec/indent.md#indent4) (numbered list)
49. [Indent15](../../spec/indent.md#indent15) (numbered list)
50. [Indent21](../../spec/indent.md#indent21) (blank lines, paragraph)
51. [Enter › E3](../../spec/obsidian-true-outliner.md#e3) (numbered list)
52. [Enter › #228 › Renumbering stops at a delimiter change](../../spec/obsidian-true-outliner.md#renumbering-stops-at-a-delimiter-change) (numbered list)
53. [Enter › E10](../../spec/obsidian-true-outliner.md#e10) (blank lines, paragraph)
54. [Enter › E32 › Checked task gives unchecked new item](../../spec/obsidian-true-outliner.md#checked-task-gives-unchecked-new-item) (task)
55. [Enter › E14, E20 › End of heading above a paragraph](../../spec/obsidian-true-outliner.md#end-of-heading-above-a-paragraph) (blank lines, heading, paragraph)
56. [Shift-Enter › S11 › Leaving the place removes it](../../spec/obsidian-true-outliner.md#leaving-the-place-removes-it) (paragraph)
57. [Backspace › #269 › Emptied middle item removed and renumbered](../../spec/obsidian-true-outliner.md#emptied-middle-item-removed-and-renumbered) (numbered list)
58. [Backspace › Joining across ordered runs](../../spec/obsidian-true-outliner.md#joining-across-ordered-runs) (numbered list)
59. [Backspace › Joining away the head of a list › List starting at 3 keeps its start](../../spec/obsidian-true-outliner.md#list-starting-at-3-keeps-its-start) (numbered list)
60. [Moving › lone-block-id › Block id moves with its paragraph](../../spec/obsidian-true-outliner.md#block-id-moves-with-its-paragraph) (blank lines, paragraph)
61. [Ordered lists › #159 (ordered-run-split-numbering) › Renumbering only the touched part](../../spec/obsidian-true-outliner.md#renumbering-only-the-touched-part) (numbered list)
62. [Ordered lists › Outdenting the head of a nested list](../../spec/obsidian-true-outliner.md#outdenting-the-head-of-a-nested-list) (numbered list)
63. [Abandoning an empty place › Enter, Tab, then leave › Empty child under parent text kept with a blank line](../../spec/obsidian-true-outliner.md#empty-child-under-parent-text-kept-with-a-blank-line) (blank lines)
64. [Abandoning an empty place › Enter, Tab, then leave › An empty ordered child kept with a blank line](../../spec/obsidian-true-outliner.md#an-empty-ordered-child-kept-with-a-blank-line) (blank lines, numbered list)
65. [Abandoning an empty place › Enter, Tab, then leave › Blank line after the list stays](../../spec/obsidian-true-outliner.md#blank-line-after-the-list-stays) (blank lines, paragraph)
66. [Abandoning an empty place › Enter, Shift-Tab, then leave › Outdented empty ordered item stays](../../spec/obsidian-true-outliner.md#outdented-empty-ordered-item-stays) (numbered list)
67. [Logical outdent › LogicalOutdent4](../../spec/outdent.md#logicaloutdent4) (blank lines, paragraph)
68. [Paste16](../../spec/paste.md#paste16) (numbered list)
69. [Placeholder1](../../spec/placeholders.md#placeholder1) (blank lines)
70. [Outliner flows › Walking away keeps the empty child, set off by a blank line](../../spec/scenarios.md#walking-away-keeps-the-empty-child-set-off-by-a-blank-line) (blank lines)
71. [Placeholder4](../../spec/placeholders.md#placeholder4) (paragraph)
72. [Placeholder5](../../spec/placeholders.md#placeholder5) (blank lines)
73. [Placeholder7](../../spec/placeholders.md#placeholder7) (blank lines)
74. [Placeholder14](../../spec/placeholders.md#placeholder14) (blank lines, paragraph)
75. [TaskEnter2](../../spec/tasks.md#taskenter2) (task)
76. [Findings of the design experiments › Escapes › Cmd-Backspace leaving a link reference definition](../../spec/zzz-redesign.md#cmd-backspace-leaving-a-link-reference-definition) (escape, paragraph)

## Skipped

### a quote (59)

1. [cursor.md › CursorHome11](../../spec/cursor.md#cursorhome11)
2. [del.md › Delete10](../../spec/del.md#delete10)
3. [fences.md › Fence4](../../spec/fences.md#fence4)
4. [fences.md › Fence20](../../spec/fences.md#fence20)
5. [obsidian-true-outliner.md › Enter › #267, E5](../../spec/obsidian-true-outliner.md#267-e5)
6. [obsidian-true-outliner.md › Indentation › #255 › Outdented child leaves quote above alone](../../spec/obsidian-true-outliner.md#outdented-child-leaves-quote-above-alone)
7. [obsidian-true-outliner.md › Indentation › seams-across-a-re-indent › Indented item keeps its quote](../../spec/obsidian-true-outliner.md#indented-item-keeps-its-quote)
8. [obsidian-true-outliner.md › Indentation › seams-across-a-re-indent › Outdented item keeps its quote](../../spec/obsidian-true-outliner.md#outdented-item-keeps-its-quote)
9. [obsidian-true-outliner.md › Moving › lazy-continuation-at-seams › Blank line added below a quote](../../spec/obsidian-true-outliner.md#blank-line-added-below-a-quote)
10. [obsidian-true-outliner.md › Paste › #264 › Pasted quote set off from paragraph](../../spec/obsidian-true-outliner.md#pasted-quote-set-off-from-paragraph)
11. [obsidian-true-outliner.md › Paste › #197 › Pasted list and block become children](../../spec/obsidian-true-outliner.md#pasted-list-and-block-become-children)
12. [paste.md › Paste23](../../spec/paste.md#paste23)
13. [quotes.md › A quote as an item's first block](../../spec/quotes.md#a-quote-as-an-items-first-block)
14. [quotes.md › Indent inside a quote › Item nests after the quote marker](../../spec/quotes.md#item-nests-after-the-quote-marker)
15. [quotes.md › Indent inside a quote › No space after the quote marker](../../spec/quotes.md#no-space-after-the-quote-marker)
16. [quotes.md › Indent inside a quote › Tab-indented items in a quote](../../spec/quotes.md#tab-indented-items-in-a-quote)
17. [quotes.md › Indent inside a quote › Quote inside an item](../../spec/quotes.md#quote-inside-an-item)
18. [quotes.md › Indent inside a quote › Item in nested quotes](../../spec/quotes.md#item-in-nested-quotes)
19. [quotes.md › Indent inside a quote › Lazy continuation line stays put](../../spec/quotes.md#lazy-continuation-line-stays-put)
20. [quotes.md › Outdent inside a quote](../../spec/quotes.md#outdent-inside-a-quote)
21. [quotes.md › Outdent out of a quote › Item becomes the quote's next sibling](../../spec/quotes.md#item-becomes-the-quotes-next-sibling)
22. [quotes.md › Outdent out of a quote › Item with a child leaves below its siblings](../../spec/quotes.md#item-with-a-child-leaves-below-its-siblings)
23. [quotes.md › Outdent out of a quote › Lazy continuation line goes along](../../spec/quotes.md#lazy-continuation-line-goes-along)
24. [quotes.md › Outdent out of a quote › From a quote inside an item](../../spec/quotes.md#from-a-quote-inside-an-item)
25. [quotes.md › Outdent out of a quote › Quoted blank lines lose their marker](../../spec/quotes.md#quoted-blank-lines-lose-their-marker)
26. [quotes.md › Indent into a quote › Item joins the quote above](../../spec/quotes.md#item-joins-the-quote-above)
27. [quotes.md › Indent into a quote › Children and blank lines enter the quote](../../spec/quotes.md#children-and-blank-lines-enter-the-quote)
28. [quotes.md › Indent into a quote › Outdent undoes indent into a quote](../../spec/quotes.md#outdent-undoes-indent-into-a-quote)
29. [quotes.md › Moving between quotes › Out of one quote and into the next](../../spec/quotes.md#out-of-one-quote-and-into-the-next)
30. [quotes.md › Moving between quotes › Adjacent quotes kept apart by a blank line](../../spec/quotes.md#adjacent-quotes-kept-apart-by-a-blank-line)
31. [quotes.md › Moving inside a quote › Swapping two quoted items](../../spec/quotes.md#swapping-two-quoted-items)
32. [quotes.md › Moving inside a quote › Loose list keeps its quoted blank line](../../spec/quotes.md#loose-list-keeps-its-quoted-blank-line)
33. [quotes.md › Moving inside a quote › Quote moves past an item](../../spec/quotes.md#quote-moves-past-an-item)
34. [quotes.md › A quote and a heading don't swap › A heading doesn't move above a quote](../../spec/quotes.md#a-heading-doesnt-move-above-a-quote)
35. [quotes.md › A quote and a heading don't swap › A quote moved down past a heading joins its section](../../spec/quotes.md#a-quote-moved-down-past-a-heading-joins-its-section)
36. [quotes.md › Enter in a quote › New item gets the quote marker](../../spec/quotes.md#new-item-gets-the-quote-marker)
37. [quotes.md › Enter in a quote › New item in a quote inside an item](../../spec/quotes.md#new-item-in-a-quote-inside-an-item)
38. [quotes.md › Enter in a quote › At the end of a lazy line](../../spec/quotes.md#at-the-end-of-a-lazy-line)
39. [quotes.md › Enter in a quote › Empty item leaves the list, then the quote](../../spec/quotes.md#empty-item-leaves-the-list-then-the-quote)
40. [quotes.md › Enter in a quote › Empty item leaves a quote inside an item](../../spec/quotes.md#empty-item-leaves-a-quote-inside-an-item)
41. [quotes.md › Enter in a quote › Empty paragraph that is all of its quote](../../spec/quotes.md#empty-paragraph-that-is-all-of-its-quote)
42. [quotes.md › Enter in a quote › Splitting a quoted paragraph](../../spec/quotes.md#splitting-a-quoted-paragraph)
43. [quotes.md › Shift-Enter in a quote › Line break in a quoted paragraph](../../spec/quotes.md#line-break-in-a-quoted-paragraph)
44. [quotes.md › Shift-Enter in a quote › Held-open empty line at the end](../../spec/quotes.md#held-open-empty-line-at-the-end)
45. [quotes.md › Shift-Enter in a quote › Line break in a quoted item](../../spec/quotes.md#line-break-in-a-quoted-item)
46. [quotes.md › Joining in a quote › Backspace joins two quoted items](../../spec/quotes.md#backspace-joins-two-quoted-items)
47. [quotes.md › Joining in a quote › Item joins a quoted paragraph above](../../spec/quotes.md#item-joins-a-quoted-paragraph-above)
48. [quotes.md › Joining in a quote › Delete joins the item below](../../spec/quotes.md#delete-joins-the-item-below)
49. [quotes.md › Joining across a quote's edge › Item below joins the quoted node](../../spec/quotes.md#item-below-joins-the-quoted-node)
50. [quotes.md › Joining across a quote's edge › Quote's first paragraph left to the host](../../spec/quotes.md#quotes-first-paragraph-left-to-the-host)
51. [quotes.md › Joining across a quote's edge › Quote's first item cannot leave](../../spec/quotes.md#quotes-first-item-cannot-leave)
52. [quotes.md › Pasting in a quote](../../spec/quotes.md#pasting-in-a-quote)
53. [quotes.md › Headings in a quote](../../spec/quotes.md#headings-in-a-quote)
54. [quotes.md › Indenting a paragraph into a quote › Paragraph becomes the quote's last child](../../spec/quotes.md#paragraph-becomes-the-quotes-last-child)
55. [quotes.md › Indenting a paragraph into a quote › Paragraph back out with a blank line](../../spec/quotes.md#paragraph-back-out-with-a-blank-line)
56. [quotes.md › A paragraph moves inside a quote without becoming its text](../../spec/quotes.md#a-paragraph-moves-inside-a-quote-without-becoming-its-text)
57. [quotes.md › A whole quote moves](../../spec/quotes.md#a-whole-quote-moves)
58. [quotes.md › A paragraph outdented out of a nested quote › Inner quote emptied and removed](../../spec/quotes.md#inner-quote-emptied-and-removed)
59. [quotes.md › A paragraph outdented out of a nested quote › Paragraph above a quoted item](../../spec/quotes.md#paragraph-above-a-quoted-item)

### code block (35)

1. [backspace.md › Backspace16](../../spec/backspace.md#backspace16)
2. [block-up.md › BlockUp13](../../spec/block-up.md#blockup13)
3. [block-up.md › BlockUp18](../../spec/block-up.md#blockup18)
4. [cursor.md › CursorDown2](../../spec/cursor.md#cursordown2)
5. [del.md › Delete11](../../spec/del.md#delete11)
6. [enter.md › Enter23](../../spec/enter.md#enter23)
7. [fences.md › Fence1](../../spec/fences.md#fence1)
8. [fences.md › Fence2](../../spec/fences.md#fence2)
9. [fences.md › Fence3](../../spec/fences.md#fence3)
10. [fences.md › Fence5](../../spec/fences.md#fence5)
11. [fences.md › Fence6](../../spec/fences.md#fence6)
12. [fences.md › Fence7](../../spec/fences.md#fence7)
13. [fences.md › Fence7b](../../spec/fences.md#fence7b)
14. [fences.md › Fence7c](../../spec/fences.md#fence7c)
15. [fences.md › Fence7d](../../spec/fences.md#fence7d)
16. [fences.md › Fence8](../../spec/fences.md#fence8)
17. [fences.md › Fence9](../../spec/fences.md#fence9)
18. [fences.md › Fence12](../../spec/fences.md#fence12)
19. [fences.md › Fence13](../../spec/fences.md#fence13)
20. [fences.md › Fence14](../../spec/fences.md#fence14)
21. [fences.md › Fence15](../../spec/fences.md#fence15)
22. [fences.md › Fence16](../../spec/fences.md#fence16)
23. [fences.md › Fence17](../../spec/fences.md#fence17)
24. [fences.md › Fence18](../../spec/fences.md#fence18)
25. [fences.md › Fence19](../../spec/fences.md#fence19)
26. [fences.md › Fence21](../../spec/fences.md#fence21)
27. [fences.md › Fence22](../../spec/fences.md#fence22)
28. [gaps.md › moveBlockUp, moveBlockDown (Alt-Shift-Up, Alt-Shift-Down) › A paragraph landing above another one is set off by a blank line](../../spec/gaps.md#a-paragraph-landing-above-another-one-is-set-off-by-a-blank-line)
29. [indent.md › Indent13](../../spec/indent.md#indent13)
30. [indent.md › Indent20](../../spec/indent.md#indent20)
31. [obsidian-true-outliner.md › Enter › E11](../../spec/obsidian-true-outliner.md#e11)
32. [obsidian-true-outliner.md › Indentation › seams-across-a-re-indent › Outdented item keeps its code block](../../spec/obsidian-true-outliner.md#outdented-item-keeps-its-code-block)
33. [obsidian-true-outliner.md › Moving › lazy-continuation-at-seams › No blank line needed after a fence](../../spec/obsidian-true-outliner.md#no-blank-line-needed-after-a-fence)
34. [obsidian-true-outliner.md › Moving › lazy-continuation-at-seams › No blank line needed before a fence](../../spec/obsidian-true-outliner.md#no-blank-line-needed-before-a-fence)
35. [paste.md › Paste22](../../spec/paste.md#paste22)

### nothing to compare (15)

1. [block-down.md › BlockDown3](../../spec/block-down.md#blockdown3)
2. [block-down.md › BlockDown6](../../spec/block-down.md#blockdown6)
3. [block-down.md › BlockDown17](../../spec/block-down.md#blockdown17)
4. [block-down.md › BlockDown19](../../spec/block-down.md#blockdown19)
5. [block-up.md › BlockUp2](../../spec/block-up.md#blockup2)
6. [block-up.md › BlockUp5](../../spec/block-up.md#blockup5)
7. [indent.md › Indent10](../../spec/indent.md#indent10)
8. [indent.md › Indent11](../../spec/indent.md#indent11)
9. [obsidian-true-outliner.md › Shift-Enter › S7, S8 › Line break in setext title refused](../../spec/obsidian-true-outliner.md#line-break-in-setext-title-refused)
10. [outdent.md › Outdent2](../../spec/outdent.md#outdent2)
11. [outdent.md › Outdent5](../../spec/outdent.md#outdent5)
12. [outdent.md › Outdent7](../../spec/outdent.md#outdent7)
13. [paste.md › Paste6](../../spec/paste.md#paste6)
14. [shift-enter.md › ShiftEnter13](../../spec/shift-enter.md#shiftenter13)
15. [shift-enter.md › ShiftEnter14](../../spec/shift-enter.md#shiftenter14)

### a caret on a blank line (11)

1. [enter.md › Enter37](../../spec/enter.md#enter37)
2. [gaps.md › Keys on a blank line › Moving from a blank line moves the node above](../../spec/gaps.md#moving-from-a-blank-line-moves-the-node-above)
3. [gaps.md › Keys on a blank line › Tab on a blank line indents the node above](../../spec/gaps.md#tab-on-a-blank-line-indents-the-node-above)
4. [gaps.md › Keys on a blank line › Shift-Tab on a blank line outdents the node above](../../spec/gaps.md#shift-tab-on-a-blank-line-outdents-the-node-above)
5. [gaps.md › Keys on a blank line › A blank line between a node's text and its first child is the node's](../../spec/gaps.md#a-blank-line-between-a-nodes-text-and-its-first-child-is-the-nodes)
6. [gaps.md › Keys on a blank line › Keys in the preamble do nothing](../../spec/gaps.md#keys-in-the-preamble-do-nothing)
7. [obsidian-true-outliner.md › Enter › E18](../../spec/obsidian-true-outliner.md#e18)
8. [obsidian-true-outliner.md › Shift-Enter › S7, S8 › Line break in setext underline refused](../../spec/obsidian-true-outliner.md#line-break-in-setext-underline-refused)
9. [placeholders.md › Placeholder10](../../spec/placeholders.md#placeholder10)
10. [placeholders.md › Placeholder12](../../spec/placeholders.md#placeholder12)
11. [zzz-redesign.md › Decisions of the redesign › The guard › Setext authoring › Typing an underline makes a heading](../../spec/zzz-redesign.md#typing-an-underline-makes-a-heading)

### a caret in a marker (9)

1. [backspace.md › Backspace2](../../spec/backspace.md#backspace2)
2. [cursor.md › CursorHome3](../../spec/cursor.md#cursorhome3)
3. [cursor.md › CursorHome4](../../spec/cursor.md#cursorhome4)
4. [del.md › Delete16](../../spec/del.md#delete16)
5. [enter.md › Enter34](../../spec/enter.md#enter34)
6. [obsidian-true-outliner.md › Shift-Enter › S5](../../spec/obsidian-true-outliner.md#s5)
7. [zzz-redesign.md › Decisions of the redesign › The guard › Deleting the space after a marker › Childless item becomes text](../../spec/zzz-redesign.md#childless-item-becomes-text)
8. [zzz-redesign.md › Decisions of the redesign › The guard › Deleting the space after a marker › Nested item with children is refused](../../spec/zzz-redesign.md#nested-item-with-children-is-refused)
9. [zzz-redesign.md › Decisions of the redesign › The guard › Typing in a list marker](../../spec/zzz-redesign.md#typing-in-a-list-marker)

### a selection across blocks (7)

1. [block-down.md › BlockDown11](../../spec/block-down.md#blockdown11)
2. [block-down.md › BlockDown12](../../spec/block-down.md#blockdown12)
3. [block-down.md › BlockDown14](../../spec/block-down.md#blockdown14)
4. [block-up.md › BlockUp10](../../spec/block-up.md#blockup10)
5. [block-up.md › BlockUp11](../../spec/block-up.md#blockup11)
6. [indent.md › Indent9](../../spec/indent.md#indent9)
7. [outdent.md › Outdent8](../../spec/outdent.md#outdent8)

### a callout (6)

1. [quotes.md › Indent inside a quote › Item in a callout](../../spec/quotes.md#item-in-a-callout)
2. [quotes.md › Enter in a quote › Splitting a callout title](../../spec/quotes.md#splitting-a-callout-title)
3. [quotes.md › Enter in a quote › Empty body line after a lone title](../../spec/quotes.md#empty-body-line-after-a-lone-title)
4. [quotes.md › Enter in a quote › Splitting a callout title before a list marker](../../spec/quotes.md#splitting-a-callout-title-before-a-list-marker)
5. [quotes.md › Enter in a quote › Enter in a callout's type](../../spec/quotes.md#enter-in-a-callouts-type)
6. [quotes.md › Shift-Enter in a quote › No line break in an Obsidian callout title](../../spec/quotes.md#no-line-break-in-an-obsidian-callout-title)

### cursorCharLeft after cursorDocEnd (5)

1. [cursor.md › CursorDocEndLeft1](../../spec/cursor.md#cursordocendleft1)
2. [placeholders.md › Placeholder9](../../spec/placeholders.md#placeholder9)
3. [placeholders.md › Placeholder11](../../spec/placeholders.md#placeholder11)
4. [placeholders.md › Placeholder15](../../spec/placeholders.md#placeholder15)
5. [undo.md › Undo2](../../spec/undo.md#undo2)

### changes only what blocks can't show (4)

1. [enter.md › Enter6](../../spec/enter.md#enter6)
2. [enter.md › Enter33](../../spec/enter.md#enter33)
3. [indent.md › Indent22](../../spec/indent.md#indent22)
4. [obsidian-true-outliner.md › Enter › E29 › Start of paragraph opens line above](../../spec/obsidian-true-outliner.md#start-of-paragraph-opens-line-above)

### code block (expected) (3)

1. [paste.md › Paste1](../../spec/paste.md#paste1)
2. [paste.md › Paste9](../../spec/paste.md#paste9)
3. [paste.md › Paste11](../../spec/paste.md#paste11)

### option headingEditing: block (3)

1. [backspace.md › Backspace18b](../../spec/backspace.md#backspace18b)
2. [del.md › Delete13b](../../spec/del.md#delete13b)
3. [del.md › Delete13d](../../spec/del.md#delete13d)

### a caret in a task's checkbox or a heading's #s (2)

1. [obsidian-true-outliner.md › Backspace › Joining a task › Backspace before the checkbox](../../spec/obsidian-true-outliner.md#backspace-before-the-checkbox)
2. [tasks.md › TaskBackspace1](../../spec/tasks.md#taskbackspace1)

### link reference definition (2)

1. [block-up.md › BlockUp20](../../spec/block-up.md#blockup20)
2. [zzz-redesign.md › Findings of the design experiments › Separators › Moves that would need a block re-encoded, not a separator › Leftover paragraph loses its four spaces](../../spec/zzz-redesign.md#leftover-paragraph-loses-its-four-spaces)

### option deleteAtGap: gap (2)

1. [backspace.md › Backspace21b](../../spec/backspace.md#backspace21b)
2. [del.md › Delete17b](../../spec/del.md#delete17b)

### option handleFenceContents: false (2)

1. [fences.md › Fence10](../../spec/fences.md#fence10)
2. [fences.md › Fence11](../../spec/fences.md#fence11)

### option taskEditing: checkbox (2)

1. [tasks.md › TaskBackspace2](../../spec/tasks.md#taskbackspace2)
2. [tasks.md › TaskBackspace3](../../spec/tasks.md#taskbackspace3)

### thematic break (2)

1. [block-up.md › BlockUp19](../../spec/block-up.md#blockup19)
2. [obsidian-true-outliner.md › Indentation › seams-across-a-re-indent › Indented item keeps its thematic break](../../spec/obsidian-true-outliner.md#indented-item-keeps-its-thematic-break)

### frontmatter (1)

1. [zzz-redesign.md › Decisions of the redesign › Obsidian: frontmatter is a preamble](../../spec/zzz-redesign.md#obsidian-frontmatter-is-a-preamble)

### no nodes (1)

1. [backspace.md › Backspace17e](../../spec/backspace.md#backspace17e)

### option bullet: + (1)

1. [indent.md › Indent18](../../spec/indent.md#indent18)

### option enterOnEmptyItem: outdent (1)

1. [enter.md › Enter30](../../spec/enter.md#enter30)

### option pasteMidText: split (1)

1. [paste.md › Paste8](../../spec/paste.md#paste8)

### option taskEditing: block (1)

1. [tasks.md › TaskBackspace4](../../spec/tasks.md#taskbackspace4)
