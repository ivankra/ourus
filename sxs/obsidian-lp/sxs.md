---
type: "SxS"
app: "obsidian-lp"
version: "1.14.4 (installer 1.14.4)"
url: "app://obsidian.md/"
model: "text"
command: "node sxs/run.ts obsidian-lp"
elapsed_s: 354
---

# Obsidian (Live Preview) vs ourus

Spec test suite replayed in Obsidian (Live Preview) and compared against ourus.

Model: [text](../lib/text.ts) (buffers loaded and compared as written, caret included)

## Summary

|  | agree | caret | whitespace | disagree | error | skipped | total |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **total** | **107 (23%)** | **11 (2.4%)** | **6 (1.3%)** | **273 (60%)** | **0 (0%)** | **61 (13%)** | **458** |

Per-file:

|  | agree | caret | whitespace | disagree | error | skipped | total |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [backspace.md](../../spec/backspace.md) | 2 |  |  | 23 |  | 3 | **28** |
| [block-down.md](../../spec/block-down.md) | 4 |  |  | 12 |  | 4 | **20** |
| [block-up.md](../../spec/block-up.md) | 4 |  |  | 18 |  | 2 | **24** |
| [cursor.md](../../spec/cursor.md) | 23 | 8 |  |  |  | 1 | **32** |
| [del.md](../../spec/del.md) | 3 |  |  | 18 |  | 3 | **24** |
| [delete-subtree.md](../../spec/delete-subtree.md) |  |  |  |  |  | 4 | **4** |
| [duplicate-block.md](../../spec/duplicate-block.md) |  |  |  |  |  | 2 | **2** |
| [enter.md](../../spec/enter.md) | 6 | 3 |  | 21 |  | 3 | **33** |
| [fences.md](../../spec/fences.md) | 9 |  | 2 | 7 |  | 7 | **25** |
| [gaps.md](../../spec/gaps.md) | 2 |  |  | 16 |  | 1 | **19** |
| [indent.md](../../spec/indent.md) | 6 |  |  | 12 |  | 4 | **22** |
| [obsidian-true-outliner.md](../../spec/obsidian-true-outliner.md) | 13 |  |  | 54 |  | 5 | **72** |
| [outdent.md](../../spec/outdent.md) | 3 |  |  | 6 |  | 7 | **16** |
| [paste.md](../../spec/paste.md) |  |  |  | 21 |  | 2 | **23** |
| [placeholders.md](../../spec/placeholders.md) | 5 |  |  | 10 |  |  | **15** |
| [quotes.md](../../spec/quotes.md) | 14 |  |  | 34 |  | 5 | **53** |
| [scenarios.md](../../spec/scenarios.md) | 2 |  |  | 2 |  |  | **4** |
| [shift-enter.md](../../spec/shift-enter.md) | 2 |  | 3 | 8 |  | 3 | **16** |
| [tasks.md](../../spec/tasks.md) | 2 |  | 1 | 1 |  | 4 | **8** |
| [undo.md](../../spec/undo.md) | 2 |  |  | 2 |  |  | **4** |
| [zzz-redesign.md](../../spec/zzz-redesign.md) | 5 |  |  | 8 |  | 1 | **14** |
| **total** | **107 (23%)** | **11 (2.4%)** | **6 (1.3%)** | **273 (60%)** | **0 (0%)** | **61 (13%)** | **458** |

## Examples

### Disagree (273)

#### 1. [Backspace1](../../spec/backspace.md#backspace1)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
- ┃two
```

</td><td>

<!--obsidian-lp-->
```buffer
- one
-┃two
```

</td><td>

<!--ourus-->
```buffer
- one┃two
```

</td></tr>
</table>

#### 2. [Backspace2](../../spec/backspace.md#backspace2)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
┃- two
```

</td><td>

<!--obsidian-lp-->
```buffer
- one┃- two
```

</td><td>

<!--ourus-->
```buffer
- one┃two
```

</td></tr>
</table>

#### 3. [Backspace3](../../spec/backspace.md#backspace3)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃b
```

</td><td>

<!--obsidian-lp-->
```buffer
- a
  -┃b
```

</td><td>

<!--ourus-->
```buffer
- a┃b
```

</td></tr>
</table>

#### 4. [Backspace4](../../spec/backspace.md#backspace4)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Title #
- ┃more
```

</td><td>

<!--obsidian-lp-->
```buffer
# Title #
-┃more
```

</td><td>

<!--ourus-->
```buffer
# Title┃more #
```

</td></tr>
</table>

#### 5. [Backspace5](../../spec/backspace.md#backspace5)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- 
- ┃b
```

</td><td>

<!--obsidian-lp-->
```buffer
- 
-┃b
```

</td><td>

<!--ourus-->
```buffer
- ┃b
```

</td></tr>
</table>

#### 6. [Backspace7](../../spec/backspace.md#backspace7)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b
- ┃
```

</td><td>

<!--obsidian-lp-->
```buffer
- a
  - b
-┃
```

</td><td>

<!--ourus-->
```buffer
- a
  - b┃
```

</td></tr>
</table>

#### 7. [Backspace8](../../spec/backspace.md#backspace8)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃b
  - c
```

</td><td>

<!--obsidian-lp-->
```buffer
- a
-┃b
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

#### 8. [Backspace9](../../spec/backspace.md#backspace9)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  ┃two
```

</td><td>

<!--obsidian-lp-->
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

#### 9. [Backspace10](../../spec/backspace.md#backspace10)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

┃
```

</td><td>

<!--obsidian-lp-->
```buffer
- a
┃
```

</td><td>

<!--ourus-->
```buffer
- a┃
```

</td></tr>
</table>

#### 10. [Backspace11](../../spec/backspace.md#backspace11)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

┃b
```

</td><td>

<!--obsidian-lp-->
```buffer
- a
┃b
```

</td><td>

<!--ourus-->
```buffer
- a┃b
```

</td></tr>
</table>

#### 11. [Backspace14](../../spec/backspace.md#backspace14)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
# H1

a┃

## H2
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
# H1

┃

## H2
```

</td></tr>
</table>

> cursorDocStart

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-lp-->
```buffer
┃# H1



## H2
```

</td><td>

<!--ourus-->
```buffer
┃# H1

## H2
```

</td></tr>
</table>

#### 12. [Backspace15](../../spec/backspace.md#backspace15)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para

- ┃a
```

</td><td>

<!--obsidian-lp-->
```buffer
para

-┃a
```

</td><td>

<!--ourus-->
```buffer
para┃a
```

</td></tr>
</table>

#### 13. [Backspace17](../../spec/backspace.md#backspace17)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
- b
- c
```

</td><td>

<!--obsidian-lp-->
```buffer
-┃
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

#### 14. [Backspace17b](../../spec/backspace.md#backspace17b)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
  - a
    - b
```

</td><td>

<!--obsidian-lp-->
```buffer
-┃
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

#### 15. [Backspace17c](../../spec/backspace.md#backspace17c)

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-lp-->
```buffer
- a
  -┃
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

#### 16. [Backspace17d](../../spec/backspace.md#backspace17d)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- x
- ┃
  - a
    - b
```

</td><td>

<!--obsidian-lp-->
```buffer
- x
-┃
  - a
    - b
```

</td><td>

<!--ourus-->
```buffer
- x┃
  - a
    - b
```

</td></tr>
</table>

#### 17. [Backspace17e](../../spec/backspace.md#backspace17e)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

<!--obsidian-lp-->
```buffer
-┃
```

</td><td>

<!--ourus-->
```buffer
┃
```

</td></tr>
</table>

#### 18. [Backspace18](../../spec/backspace.md#backspace18)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para

# ┃Hello

body
```

</td><td>

<!--obsidian-lp-->
```buffer
para

#┃Hello

body
```

</td><td>

<!--ourus-->
```buffer
para

┃Hello

body
```

</td></tr>
</table>

#### 19. [Backspace18c](../../spec/backspace.md#backspace18c)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
┃Title
===

text
```

</td><td>

<!--obsidian-lp-->
```buffer
┃Title
===

text
```

</td><td>

<!--ourus-->
```buffer
┃Title

text
```

</td></tr>
</table>

#### 20. [Backspace18d](../../spec/backspace.md#backspace18d)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
a
# ┃H1
text
```

</td><td>

<!--obsidian-lp-->
```buffer
a
#┃H1
text
```

</td><td>

<!--ourus-->
```buffer
a

┃H1

text
```

</td></tr>
</table>

#### 21. [Backspace19](../../spec/backspace.md#backspace19)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

  ┃bc
```

</td><td>

<!--obsidian-lp-->
```buffer
- a

┃bc
```

</td><td>

<!--ourus-->
```buffer
- a
  ┃bc
```

</td></tr>
</table>

#### 22. [Backspace20](../../spec/backspace.md#backspace20)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

┃

- b
```

</td><td>

<!--obsidian-lp-->
```buffer
- a
┃

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

#### 23. [Backspace21](../../spec/backspace.md#backspace21)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

- ┃b
```

</td><td>

<!--obsidian-lp-->
```buffer
- a

-┃b
```

</td><td>

<!--ourus-->
```buffer
- a┃b
```

</td></tr>
</table>

#### 24. [BlockDown1](../../spec/block-down.md#blockdown1)

> moveBlockDown

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - a1

- b
```

</td><td>

<!--obsidian-lp-->
```buffer
  - a1
- a┃

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

#### 25. [BlockDown2](../../spec/block-down.md#blockdown2)

> moveBlockDown

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# H
- a┃

para
```

</td><td>

<!--obsidian-lp-->
```buffer
# H

- a┃
para
```

</td><td>

<!--ourus-->
```buffer
# H
para

- a┃
```

</td></tr>
</table>

#### 26. [BlockDown4](../../spec/block-down.md#blockdown4)

> moveBlockDown

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# A┃

text a

# B

text b
```

</td><td>

<!--obsidian-lp-->
```buffer

# A┃
text a

# B

text b
```

</td><td>

<!--ourus-->
```buffer
# B

text b

# A┃

text a
```

</td></tr>
</table>

#### 27. [BlockDown5](../../spec/block-down.md#blockdown5)

> moveBlockDown

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
one┃

two
```

</td><td>

<!--obsidian-lp-->
```buffer

one┃
two
```

</td><td>

<!--ourus-->
```buffer
two

one┃
```

</td></tr>
</table>

#### 28. [BlockDown7](../../spec/block-down.md#blockdown7)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
→- b┃
→→- b1
- c
→- d
```

</td></tr>
</table>

> moveBlockDown

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-lp-->
```buffer
- a
→→- b1
→- b┃
- c
→- d
```

</td><td>

<!--ourus-->
```buffer
- a
- c
→- b┃
→→- b1
→- d
```

</td></tr>
</table>

> moveBlockDown

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-lp-->
```buffer
- a
→→- b1
- c
→- b┃
→- d
```

</td><td>

<!--ourus-->
```buffer
- a
- c
→- d
→- b┃
→→- b1
```

</td></tr>
</table>

#### 29. [BlockDown8](../../spec/block-down.md#blockdown8)

> moveBlockDown

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b┃

para

- c
```

</td><td>

<!--obsidian-lp-->
```buffer
- a

- b┃
para

- c
```

</td><td>

<!--ourus-->
```buffer
- a

para

- b┃
- c
```

</td></tr>
</table>

#### 30. [BlockDown9](../../spec/block-down.md#blockdown9)

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

> moveBlockDown

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-lp-->
```buffer
- a
    - c1
  - c┃
- b
```

</td><td>

<!--ourus-->
```buffer
- a
- b
  - c┃
    - c1
```

</td></tr>
</table>

> moveBlockUp

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

#### 31. [BlockDown10](../../spec/block-down.md#blockdown10)

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

> moveBlockDown

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-lp-->
```buffer
- a
  - b
    - c1
  - c┃
- d
  - d1
    - d11
```

</td><td>

<!--ourus-->
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

> moveBlockDown

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-lp-->
```buffer
- a
  - b
    - c1
- d
  - c┃
  - d1
    - d11
```

</td><td>

<!--ourus-->
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

#### 32. [BlockDown13](../../spec/block-down.md#blockdown13)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- b┃
  - b1

intro
```

</td></tr>
</table>

> moveBlockDown

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-lp-->
```buffer
  - b1
- b┃

intro
```

</td><td>

<!--ourus-->
```buffer
intro

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

intro
```

</td></tr>
</table>

#### 33. [BlockDown16](../../spec/block-down.md#blockdown16)

> moveBlockDown

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# A┃
- x
# B
- y
```

</td><td>

<!--obsidian-lp-->
```buffer
- x
# A┃
# B
- y
```

</td><td>

<!--ourus-->
```buffer
# B
- y
# A┃
- x
```

</td></tr>
</table>

#### 34. [BlockDown18](../../spec/block-down.md#blockdown18)

> moveBlockDown

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Work
- email
- ┃review

# Home
- water
```

</td><td>

<!--obsidian-lp-->
```buffer
# Work
- email

- ┃review
# Home
- water
```

</td><td>

<!--ourus-->
```buffer
# Work
- email

# Home
- ┃review
- water
```

</td></tr>
</table>

#### 35. [BlockDown20](../../spec/block-down.md#blockdown20)

> moveBlockDown

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Todo
- one
- two┃

## Later
- three
```

</td><td>

<!--obsidian-lp-->
```buffer
# Todo
- one

- two┃
## Later
- three
```

</td><td>

<!--ourus-->
```buffer
# Todo
- one

## Later
- two┃
- three
```

</td></tr>
</table>

#### 36. [BlockUp1](../../spec/block-up.md#blockup1)

> moveBlockUp

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b┃
  - b1
- c
```

</td><td>

<!--obsidian-lp-->
```buffer
- b┃
- a
  - b1
- c
```

</td><td>

<!--ourus-->
```buffer
- b┃
  - b1
- a
- c
```

</td></tr>
</table>

#### 37. [BlockUp3](../../spec/block-up.md#blockup3)

> moveBlockUp

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# A

text a

# B┃

text b
```

</td><td>

<!--obsidian-lp-->
```buffer
# A

text a
# B┃


text b
```

</td><td>

<!--ourus-->
```buffer
# B┃

text b

# A

text a
```

</td></tr>
</table>

#### 38. [BlockUp4](../../spec/block-up.md#blockup4)

> moveBlockUp

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
one

two┃
```

</td><td>

<!--obsidian-lp-->
```buffer
one
two┃

```

</td><td>

<!--ourus-->
```buffer
two┃

one
```

</td></tr>
</table>

#### 39. [BlockUp7](../../spec/block-up.md#blockup7)

> moveBlockUp

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

para

- b┃
- c
```

</td><td>

<!--obsidian-lp-->
```buffer
- a

para
- b┃

- c
```

</td><td>

<!--ourus-->
```buffer
- a
- b┃

para

- c
```

</td></tr>
</table>

#### 40. [BlockUp8](../../spec/block-up.md#blockup8)

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

> moveBlockUp

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-lp-->
```buffer
- a
  - c┃
- b
    - c1
```

</td><td>

<!--ourus-->
```buffer
- a
  - c┃
    - c1
- b
```

</td></tr>
</table>

> moveBlockDown

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

#### 41. [BlockUp9](../../spec/block-up.md#blockup9)

> moveBlockUp

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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

<!--obsidian-lp-->
```buffer
- a
  - a1
    - a11
  - c┃
- b
    - c1
  - d
```

</td><td>

<!--ourus-->
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

#### 42. [BlockUp12](../../spec/block-up.md#blockup12)

> moveBlockUp

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
intro

- b┃
  - b1
```

</td><td>

<!--obsidian-lp-->
```buffer
intro
- b┃

  - b1
```

</td><td>

<!--ourus-->
```buffer
- b┃
  - b1

intro
```

</td></tr>
</table>

#### 43. [BlockUp13](../../spec/block-up.md#blockup13)

> moveBlockUp

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
- b┃
  ```
  x

  y
  ```
````

</td><td>

<!--obsidian-lp-->
````buffer
- b┃
- a
  ```
  x

  y
  ```
````

</td><td>

<!--ourus-->
````buffer
- b┃
  ```
  x

  y
  ```
- a
````

</td></tr>
</table>

#### 44. [BlockUp15](../../spec/block-up.md#blockup15)

> moveBlockUp

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
9. a
   - x
10. b┃
```

</td><td>

<!--obsidian-lp-->
```buffer
9. a
10. b┃
   - x
```

</td><td>

<!--ourus-->
```buffer
9. b┃
10. a
    - x
```

</td></tr>
</table>

#### 45. [BlockUp16](../../spec/block-up.md#blockup16)

> moveBlockUp

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# A
## a1
# B┃
## b1
```

</td><td>

<!--obsidian-lp-->
```buffer
# A
# B┃
## a1
## b1
```

</td><td>

<!--ourus-->
```buffer
# B┃
## b1
# A
## a1
```

</td></tr>
</table>

#### 46. [BlockUp17](../../spec/block-up.md#blockup17)

> moveBlockUp

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
first

para┃
- a
```

</td><td>

<!--obsidian-lp-->
```buffer
first
para┃

- a
```

</td><td>

<!--ourus-->
```buffer
para┃
- a

first
```

</td></tr>
</table>

#### 47. [BlockUp18](../../spec/block-up.md#blockup18)

> moveBlockUp

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
→- a
┃para
```

</td><td>

<!--obsidian-lp-->
```buffer
┃para
→- a
```

</td><td>

<!--ourus-->
```buffer
┃para

→- a
```

</td></tr>
</table>

#### 48. [BlockUp19](../../spec/block-up.md#blockup19)

> moveBlockUp

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
---
para┃
```

</td><td>

<!--obsidian-lp-->
```buffer
para┃
---
```

</td><td>

<!--ourus-->
```buffer
para┃

---
```

</td></tr>
</table>

#### 49. [BlockUp20](../../spec/block-up.md#blockup20)

> moveBlockUp

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
[a]: /u
para┃
```

</td><td>

<!--obsidian-lp-->
```buffer
para┃
[a]: /u
```

</td><td>

<!--ourus-->
```buffer
para┃

[a]: /u
```

</td></tr>
</table>

#### 50. [BlockUp21](../../spec/block-up.md#blockup21)

> moveBlockUp

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para
- a┃
- b
```

</td><td>

<!--obsidian-lp-->
```buffer
- a┃
para
- b
```

</td><td>

<!--ourus-->
```buffer
- a┃

para
- b
```

</td></tr>
</table>

#### 51. [BlockUp22](../../spec/block-up.md#blockup22)

> moveBlockUp

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Work
- email

# Home
- ┃review
- water
```

</td><td>

<!--obsidian-lp-->
```buffer
# Work
- email

- ┃review
# Home
- water
```

</td><td>

<!--ourus-->
```buffer
# Work
- email
- ┃review

# Home
- water
```

</td></tr>
</table>

#### 52. [BlockUp23](../../spec/block-up.md#blockup23)

> moveBlockUp

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# A
## sub
- s1

# B
┃para
```

</td><td>

<!--obsidian-lp-->
```buffer
# A
## sub
- s1

┃para
# B
```

</td><td>

<!--ourus-->
```buffer
# A
## sub
- s1

┃para

# B
```

</td></tr>
</table>

#### 53. [BlockUp24](../../spec/block-up.md#blockup24)

> moveBlockUp

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Todo
- one

## Later
- ┃two
- three
```

</td><td>

<!--obsidian-lp-->
```buffer
# Todo
- one

- ┃two
## Later
- three
```

</td><td>

<!--ourus-->
```buffer
# Todo
- one
- ┃two

## Later
- three
```

</td></tr>
</table>

#### 54. [Delete1](../../spec/del.md#delete1)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc┃
  - def
```

</td><td>

<!--obsidian-lp-->
```buffer
- abc┃→- def
```

</td><td>

<!--ourus-->
```buffer
- abc┃def
```

</td></tr>
</table>

#### 55. [Delete2](../../spec/del.md#delete2)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one┃
- two
```

</td><td>

<!--obsidian-lp-->
```buffer
- one┃- two
```

</td><td>

<!--ourus-->
```buffer
- one┃two
```

</td></tr>
</table>

#### 56. [Delete3](../../spec/del.md#delete3)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one┃
  two
```

</td><td>

<!--obsidian-lp-->
```buffer
- one┃→two
```

</td><td>

<!--ourus-->
```buffer
- one┃two
```

</td></tr>
</table>

#### 57. [Delete4](../../spec/del.md#delete4)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Title┃ #
- more
```

</td><td>

<!--obsidian-lp-->
```buffer
# Title┃#
- more
```

</td><td>

<!--ourus-->
```buffer
# Title┃more #
```

</td></tr>
</table>

#### 58. [Delete5](../../spec/del.md#delete5)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
  - a
    - b
  - c
- d
```

</td><td>

<!--obsidian-lp-->
```buffer
- ┃→- a
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

#### 59. [Delete5b](../../spec/del.md#delete5b)

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-lp-->
```buffer
- a
  - ┃→→- b
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

#### 60. [Delete5c](../../spec/del.md#delete5c)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- x
- ┃
  - a
    - b
```

</td><td>

<!--obsidian-lp-->
```buffer
- x
- ┃→- a
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

#### 61. [Delete5d](../../spec/del.md#delete5d)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃ 
  - a
    - b
```

</td><td>

<!--obsidian-lp-->
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

#### 62. [Delete6](../../spec/del.md#delete6)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃
- b
```

</td><td>

<!--obsidian-lp-->
```buffer
- a
- ┃- b
```

</td><td>

<!--ourus-->
```buffer
- a
- ┃b
```

</td></tr>
</table>

#### 63. [Delete7](../../spec/del.md#delete7)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
  - c
```

</td><td>

<!--obsidian-lp-->
```buffer
- a┃- b
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

#### 64. [Delete9](../../spec/del.md#delete9)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
# H1

┃a

## H2
```

</td></tr>
</table>

> deleteContentForward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
# H1

┃

## H2
```

</td></tr>
</table>

> cursorDocStart

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-lp-->
```buffer
┃# H1



## H2
```

</td><td>

<!--ourus-->
```buffer
┃# H1

## H2
```

</td></tr>
</table>

#### 65. [Delete10](../../spec/del.md#delete10)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
> q
```

</td><td>

<!--obsidian-lp-->
```buffer
- a┃> q
```

</td><td>

<!--ourus-->
```buffer
- a┃
> q
```

</td></tr>
</table>

#### 66. [Delete11](../../spec/del.md#delete11)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# H┃
    code
```

</td><td>

<!--obsidian-lp-->
```buffer
# H┃→→code
```

</td><td>

<!--ourus-->
```buffer
# H┃
    code
```

</td></tr>
</table>

#### 67. [Delete12](../../spec/del.md#delete12)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b┃
- c
→- d
```

</td><td>

<!--obsidian-lp-->
```buffer
- a
- b┃- c
→- d
```

</td><td>

<!--ourus-->
```buffer
- a
- b┃c
→- d
```

</td></tr>
</table>

#### 68. [Delete13](../../spec/del.md#delete13)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
a┃

# H1
```

</td><td>

<!--obsidian-lp-->
```buffer
a┃
# H1
```

</td><td>

<!--ourus-->
```buffer
a┃# H1
```

</td></tr>
</table>

#### 69. [Delete13c](../../spec/del.md#delete13c)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
a┃

# H1
text
```

</td><td>

<!--obsidian-lp-->
```buffer
a┃
# H1
text
```

</td><td>

<!--ourus-->
```buffer
a┃# H1

text
```

</td></tr>
</table>

#### 70. [Delete14](../../spec/del.md#delete14)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
a┃

# H1

body
```

</td><td>

<!--obsidian-lp-->
```buffer
a┃
# H1

body
```

</td><td>

<!--ourus-->
```buffer
a┃# H1

body
```

</td></tr>
</table>

#### 71. [Delete17](../../spec/del.md#delete17)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Shopping:┃

- milk
- eggs
```

</td><td>

<!--obsidian-lp-->
```buffer
Shopping:┃
- milk
- eggs
```

</td><td>

<!--ourus-->
```buffer
Shopping:┃milk
- eggs
```

</td></tr>
</table>

#### 72. [Enter3](../../spec/enter.md#enter3)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃ b
  - c
```

</td><td>

<!--obsidian-lp-->
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

#### 73. [Enter4](../../spec/enter.md#enter4)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - b
```

</td><td>

<!--obsidian-lp-->
```buffer
- a
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

#### 74. [Enter6](../../spec/enter.md#enter6)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃
```

</td><td>

<!--obsidian-lp-->
```buffer
- a
┃
```

</td><td>

<!--ourus-->
```buffer
- a

┃
```

</td></tr>
</table>

#### 75. [Enter7](../../spec/enter.md#enter7)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃
- b
```

</td><td>

<!--obsidian-lp-->
```buffer
- a
┃
- b
```

</td><td>

<!--ourus-->
```buffer
- a

┃

- b
```

</td></tr>
</table>

#### 76. [Enter8](../../spec/enter.md#enter8)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc ┃- def
```

</td><td>

<!--obsidian-lp-->
```buffer
- abc 
┃- def
```

</td><td>

<!--ourus-->
```buffer
- abc
- ┃\- def
```

</td></tr>
</table>

#### 77. [Enter9](../../spec/enter.md#enter9)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc ┃# def
```

</td><td>

<!--obsidian-lp-->
```buffer
- abc 
- ┃# def
```

</td><td>

<!--ourus-->
```buffer
- abc
- ┃\# def
```

</td></tr>
</table>

#### 78. [Enter10](../../spec/enter.md#enter10)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc ┃<div>
```

</td><td>

<!--obsidian-lp-->
```buffer
- abc 
- ┃<div>
```

</td><td>

<!--ourus-->
```buffer
- abc
- ┃\<div>
```

</td></tr>
</table>

#### 79. [Enter11](../../spec/enter.md#enter11)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
see ┃[a]: /url
```

</td><td>

<!--obsidian-lp-->
```buffer
see 
┃[a]: /url
```

</td><td>

<!--ourus-->
```buffer
see

┃\[a]: /url
```

</td></tr>
</table>

#### 80. [Enter12](../../spec/enter.md#enter12)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
some┃ text
```

</td><td>

<!--obsidian-lp-->
```buffer
some
┃text
```

</td><td>

<!--ourus-->
```buffer
some

┃text
```

</td></tr>
</table>

#### 81. [Enter14](../../spec/enter.md#enter14)

> enter enter enter "p"

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b┃
```

</td><td>

<!--obsidian-lp-->
```buffer
- a
  - b
p┃
```

</td><td>

<!--ourus-->
```buffer
- a
  - b

p┃
```

</td></tr>
</table>

#### 82. [Enter16](../../spec/enter.md#enter16)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
lazy
```

</td><td>

<!--obsidian-lp-->
```buffer
- a
- ┃
lazy
```

</td><td>

<!--ourus-->
```buffer
- a
- ┃lazy
```

</td></tr>
</table>

#### 83. [Enter21](../../spec/enter.md#enter21)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
  - a
```

</td><td>

<!--obsidian-lp-->
```buffer
┃
  - a
```

</td><td>

<!--ourus-->
```buffer
- 
  - ┃
  - a
```

</td></tr>
</table>

#### 84. [Enter22](../../spec/enter.md#enter22)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para ┃- x
- a
```

</td><td>

<!--obsidian-lp-->
```buffer
para 
┃- x
- a
```

</td><td>

<!--ourus-->
```buffer
para

- ┃x
- a
```

</td></tr>
</table>

#### 85. [Enter23](../../spec/enter.md#enter23)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
### H┃2
    - a
```

</td><td>

<!--obsidian-lp-->
```buffer
### H
┃2
    - a
```

</td><td>

<!--ourus-->
```buffer
### H
┃2

    - a
```

</td></tr>
</table>

#### 86. [Enter25](../../spec/enter.md#enter25)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
8. z┃
9. a
   - child
10. b
```

</td><td>

<!--obsidian-lp-->
```buffer
8. z
9. ┃
10. a
   - child
11. b
```

</td><td>

<!--ourus-->
```buffer
8. z
9. ┃
10. a
    - child
11. b
```

</td></tr>
</table>

#### 87. [Enter27](../../spec/enter.md#enter27)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b
  - ┃
  - c
```

</td><td>

<!--obsidian-lp-->
```buffer
- a
  - b
- ┃
  - c
```

</td><td>

<!--ourus-->
```buffer
- a
  - b
  - 
  - ┃
  - c
```

</td></tr>
</table>

#### 88. [Enter28](../../spec/enter.md#enter28)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃
  - c
```

</td><td>

<!--obsidian-lp-->
```buffer
- a
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

#### 89. [Enter34](../../spec/enter.md#enter34)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
-┃ alpha
```

</td><td>

<!--obsidian-lp-->
```buffer
-
┃alpha
```

</td><td>

<!--ourus-->
```buffer
- ┃
- alpha
```

</td></tr>
</table>

#### 90. [Enter35](../../spec/enter.md#enter35)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. abc ┃2. def
```

</td><td>

<!--obsidian-lp-->
```buffer
1. abc 
┃2. def
```

</td><td>

<!--ourus-->
```buffer
1. abc
2. ┃2\. def
```

</td></tr>
</table>

#### 91. [Enter36](../../spec/enter.md#enter36)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

- b┃
```

</td><td>

<!--obsidian-lp-->
```buffer
- a

- b
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

#### 92. [Enter37](../../spec/enter.md#enter37)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a
   text
   ┃
```

</td><td>

<!--obsidian-lp-->
```buffer
1. a
   text
  ┃
```

</td><td>

<!--ourus-->
```buffer
1. a
   text
2. ┃
```

</td></tr>
</table>

#### 93. [Fence7](../../spec/fences.md#fence7)

> enter "b"

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ```
  code
  ```┃
````

</td><td>

<!--obsidian-lp-->
````buffer
- a
  ```
  code
  ```
  b┃
````

</td><td>

<!--ourus-->
````buffer
- a
  ```
  code
  ```
- b┃
````

</td></tr>
</table>

#### 94. [Fence7c](../../spec/fences.md#fence7c)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ```
  code
  ```┃
  - c
````

</td><td>

<!--obsidian-lp-->
````buffer
- a
  ```
  code
  ```
  ┃
  - c
````

</td><td>

<!--ourus-->
````buffer
- a
  ```
  code
  ```
  - ┃
  - c
````

</td></tr>
</table>

#### 95. [Fence15](../../spec/fences.md#fence15)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- ┃```
  code
  ```
````

</td><td>

<!--obsidian-lp-->
````buffer
- 
  ┃```
  code
  ```
````

</td><td>

<!--ourus-->
````buffer
- ┃
- ```
  code
  ```
````

</td></tr>
</table>

#### 96. [Fence16](../../spec/fences.md#fence16)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ```
  one
  ┃two
  ```
````

</td><td>

<!--obsidian-lp-->
````buffer
- a
  ```
  one
┃two
  ```
````

</td><td>

<!--ourus-->
````buffer
- a
  ```
  one┃two
  ```
````

</td></tr>
</table>

#### 97. [Fence18](../../spec/fences.md#fence18)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ```
  one┃
  two
  ```
````

</td><td>

<!--obsidian-lp-->
````buffer
- a
  ```
  one┃→two
  ```
````

</td><td>

<!--ourus-->
````buffer
- a
  ```
  one┃two
  ```
````

</td></tr>
</table>

#### 98. [Fence20](../../spec/fences.md#fence20)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
> ```
> one
> ┃two
> ```
````

</td><td>

<!--obsidian-lp-->
````buffer
> ```
> one
>┃two
> ```
````

</td><td>

<!--ourus-->
````buffer
> ```
> one┃two
> ```
````

</td></tr>
</table>

#### 99. [Fence22](../../spec/fences.md#fence22)

> shiftEnter enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  - b
    ```
    x
    ```┃
````

</td><td>

<!--obsidian-lp-->
````buffer
- a
  - b
    ```
    x
    ```
┃
````

</td><td>

<!--ourus-->
````buffer
- a
  - b
    ```
    x
    ```
  - ┃
````

</td></tr>
</table>

#### 100. [moveBlockUp, moveBlockDown (Alt-Shift-Up, Alt-Shift-Down) › Gaps travel with their nodes](../../spec/gaps.md#gaps-travel-with-their-nodes)

> moveBlockUp

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
a



b┃

c
```

</td><td>

<!--obsidian-lp-->
```buffer
a


b┃


c
```

</td><td>

<!--ourus-->
```buffer
b┃

a



c
```

</td></tr>
</table>

#### 101. [moveBlockUp, moveBlockDown (Alt-Shift-Up, Alt-Shift-Down) › Moving down carries the gap too](../../spec/gaps.md#moving-down-carries-the-gap-too)

> moveBlockDown

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
a┃



b

c
```

</td><td>

<!--obsidian-lp-->
```buffer

a┃


b

c
```

</td><td>

<!--ourus-->
```buffer
b

a┃



c
```

</td></tr>
</table>

#### 102. [moveBlockUp, moveBlockDown (Alt-Shift-Up, Alt-Shift-Down) › A section carries its last line's gap](../../spec/gaps.md#a-section-carries-its-last-lines-gap)

> moveBlockUp

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# A
text


# B┃
more

# C
```

</td><td>

<!--obsidian-lp-->
```buffer
# A
text

# B┃

more

# C
```

</td><td>

<!--ourus-->
```buffer
# B┃
more

# A
text


# C
```

</td></tr>
</table>

#### 103. [moveBlockUp, moveBlockDown (Alt-Shift-Up, Alt-Shift-Down) › An item carries its gap inside a loose list](../../spec/gaps.md#an-item-carries-its-gap-inside-a-loose-list)

> moveBlockUp

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

- b┃
- c
```

</td><td>

<!--obsidian-lp-->
```buffer
- a
- b┃

- c
```

</td><td>

<!--ourus-->
```buffer
- b┃
- a

- c
```

</td></tr>
</table>

#### 104. [moveBlockUp, moveBlockDown (Alt-Shift-Up, Alt-Shift-Down) › A subtree's gap is its last descendant's](../../spec/gaps.md#a-subtrees-gap-is-its-last-descendants)

> moveBlockUp

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - a1


- b┃
- c
```

</td><td>

<!--obsidian-lp-->
```buffer
- a
  - a1

- b┃

- c
```

</td><td>

<!--ourus-->
```buffer
- b┃
- a
  - a1


- c
```

</td></tr>
</table>

#### 105. [moveBlockUp, moveBlockDown (Alt-Shift-Up, Alt-Shift-Down) › Sections written without blank lines stay without](../../spec/gaps.md#sections-written-without-blank-lines-stay-without)

> moveBlockDown

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
## A┃
a
## B
b
## C
```

</td><td>

<!--obsidian-lp-->
```buffer
a
## A┃
## B
b
## C
```

</td><td>

<!--ourus-->
```buffer
## B
b
## A┃
a
## C
```

</td></tr>
</table>

#### 106. [moveBlockUp, moveBlockDown (Alt-Shift-Up, Alt-Shift-Down) › A paragraph landing above another one is set off by a blank line](../../spec/gaps.md#a-paragraph-landing-above-another-one-is-set-off-by-a-blank-line)

> moveBlockDown

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
x┃
```
code
```

q
````

</td><td>

<!--obsidian-lp-->
````buffer
```
x┃
code
```

q
````

</td><td>

<!--ourus-->
````buffer
```
code
```

x┃

q
````

</td></tr>
</table>

#### 107. [moveBlockUp, moveBlockDown (Alt-Shift-Up, Alt-Shift-Down) › The gap ending a parent's children stays at their end](../../spec/gaps.md#the-gap-ending-a-parents-children-stays-at-their-end)

> moveBlockUp

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- p
  - x


  - y┃

- q
```

</td><td>

<!--obsidian-lp-->
```buffer
- p
  - x

  - y┃


- q
```

</td><td>

<!--ourus-->
```buffer
- p
  - y┃


  - x

- q
```

</td></tr>
</table>

#### 108. [moveBlockUp, moveBlockDown (Alt-Shift-Up, Alt-Shift-Down) › The document's trailing blank lines stay at its end](../../spec/gaps.md#the-documents-trailing-blank-lines-stay-at-its-end)

> moveBlockUp

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
a

b┃


```

</td><td>

<!--obsidian-lp-->
```buffer
a
b┃



```

</td><td>

<!--ourus-->
```buffer
b┃

a


```

</td></tr>
</table>

#### 109. [moveBlockUp, moveBlockDown (Alt-Shift-Up, Alt-Shift-Down) › The preamble stays at the top](../../spec/gaps.md#the-preamble-stays-at-the-top)

> moveBlockDown

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer


a┃


b

c
```

</td><td>

<!--obsidian-lp-->
```buffer



a┃

b

c
```

</td><td>

<!--ourus-->
```buffer


b

a┃


c
```

</td></tr>
</table>

#### 110. [New text and gaps › Items pasted at the end of a tight list keep it tight](../../spec/gaps.md#items-pasted-at-the-end-of-a-tight-list-keep-it-tight)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
- a
- b
```

</td><td>

```buffer
- t┃

para
```

</td><td>

<!--obsidian-lp-->
```buffer
- t- a
- b
┃

para
```

</td><td>

<!--ourus-->
```buffer
- t
- a
- b┃

para
```

</td></tr>
</table>

#### 111. [New text and gaps › Items pasted as first children land at the existing children's column](../../spec/gaps.md#items-pasted-as-first-children-land-at-the-existing-childrens-column)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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

<!--obsidian-lp-->
```buffer
- [ ] t- a
- b
┃
    - g
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

#### 112. [Keys on a blank line › Moving from a blank line moves the node above](../../spec/gaps.md#moving-from-a-blank-line-moves-the-node-above)

> moveBlockUp

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
a

b
┃

c
```

</td><td>

<!--obsidian-lp-->
```buffer
a

┃
b

c
```

</td><td>

<!--ourus-->
```buffer
b
┃

a

c
```

</td></tr>
</table>

#### 113. [Keys on a blank line › Tab on a blank line indents the node above](../../spec/gaps.md#tab-on-a-blank-line-indents-the-node-above)

> indent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b
┃
- c
```

</td><td>

<!--obsidian-lp-->
```buffer
- a
- b
  ┃
- c
```

</td><td>

<!--ourus-->
```buffer
- a
  - b
┃
- c
```

</td></tr>
</table>

#### 114. [Keys on a blank line › Shift-Tab on a blank line outdents the node above](../../spec/gaps.md#shift-tab-on-a-blank-line-outdents-the-node-above)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b
┃
- c
```

</td><td>

<!--obsidian-lp-->
```buffer
- a
  - b
┃
- c
```

</td><td>

<!--ourus-->
```buffer
- a
- b
┃
- c
```

</td></tr>
</table>

#### 115. [Keys on a blank line › A blank line between a node's text and its first child is the node's](../../spec/gaps.md#a-blank-line-between-a-nodes-text-and-its-first-child-is-the-nodes)

> moveBlockDown

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
┃
  b
- c
```

</td><td>

<!--obsidian-lp-->
```buffer
- a
  b
┃
- c
```

</td><td>

<!--ourus-->
```buffer
- c
- a
┃
  b
```

</td></tr>
</table>

#### 116. [Indent2](../../spec/indent.md#indent2)

> indent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b┃
  - c
    more c
```

</td><td>

<!--obsidian-lp-->
```buffer
- a
  - b┃
  - c
    more c
```

</td><td>

<!--ourus-->
```buffer
- a
  - b┃
    - c
      more c
```

</td></tr>
</table>

#### 117. [Indent3](../../spec/indent.md#indent3)

> indent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
    * x
- b┃
```

</td><td>

<!--obsidian-lp-->
```buffer
- a
    * x
  - b┃
```

</td><td>

<!--ourus-->
```buffer
- a
    * x
    * b┃
```

</td></tr>
</table>

#### 118. [Indent4](../../spec/indent.md#indent4)

> indent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a
2. b┃
3. c
```

</td><td>

<!--obsidian-lp-->
```buffer
1. a
  1. b┃
2. c
```

</td><td>

<!--ourus-->
```buffer
1. a
   1. b┃
2. c
```

</td></tr>
</table>

#### 119. [Indent5](../../spec/indent.md#indent5)

> indent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a
   1. x
2. b┃
```

</td><td>

<!--obsidian-lp-->
```buffer
1. a
   1. x
  2. b┃
```

</td><td>

<!--ourus-->
```buffer
1. a
   1. x
   2. b┃
```

</td></tr>
</table>

#### 120. [Indent12](../../spec/indent.md#indent12)

> indent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# A
## B┃
### C
```

</td><td>

<!--obsidian-lp-->
```buffer
# A
  ## B┃
### C
```

</td><td>

<!--ourus-->
```buffer
# A
### B┃
#### C
```

</td></tr>
</table>

#### 121. [Indent13](../../spec/indent.md#indent13)

> indent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
- b┃
  ```
  x

    y
  ```
````

</td><td>

<!--obsidian-lp-->
````buffer
- a
  - b┃
  ```
  x

    y
  ```
````

</td><td>

<!--ourus-->
````buffer
- a
  - b┃
    ```
    x

      y
    ```
````

</td></tr>
</table>

#### 122. [Indent15](../../spec/indent.md#indent15)

> indent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a
   - x
   - y┃
5. b
9. c
```

</td><td>

<!--obsidian-lp-->
```buffer
1. a
   - x
     - y┃
2. b
3. c
```

</td><td>

<!--ourus-->
```buffer
1. a
   - x
     - y┃
5. b
9. c
```

</td></tr>
</table>

#### 123. [Indent16](../../spec/indent.md#indent16)

> indent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Title┃
=====

## Sub
```

</td><td>

<!--obsidian-lp-->
```buffer
  Title┃
=====

## Sub
```

</td><td>

<!--ourus-->
```buffer
Title┃
-----

### Sub
```

</td></tr>
</table>

#### 124. [Indent19](../../spec/indent.md#indent19)

> indent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b  
  c┃
```

</td><td>

<!--obsidian-lp-->
```buffer
- a
- b  
    c┃
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

#### 125. [Indent20](../../spec/indent.md#indent20)

> indent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
- b┃
  ```
    x
  ```
````

</td><td>

<!--obsidian-lp-->
````buffer
- a
  - b┃
  ```
    x
  ```
````

</td><td>

<!--ourus-->
````buffer
- a
  - b┃
    ```
      x
    ```
````

</td></tr>
</table>

#### 126. [Indent21](../../spec/indent.md#indent21)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
para a

para b┃
```

</td></tr>
</table>

> indent

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-lp-->
```buffer
para a

  para b┃
```

</td><td>

<!--ourus-->
```buffer
para a

- para b┃
```

</td></tr>
</table>

> outdent

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
para a

para b┃
```

</td></tr>
</table>

#### 127. [Indent22](../../spec/indent.md#indent22)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
Para┃
```

</td></tr>
</table>

> indent

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-lp-->
```buffer
  Para┃
```

</td><td>

<!--ourus-->
```buffer
- Para┃
```

</td></tr>
</table>

> outdent

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
Para┃
```

</td></tr>
</table>

#### 128. [Enter › #228 › Renumbering stops at a delimiter change](../../spec/obsidian-true-outliner.md#renumbering-stops-at-a-delimiter-change)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a┃
1) b
2) c
```

</td><td>

<!--obsidian-lp-->
```buffer
1. a
2. ┃
3) b
4) c
```

</td><td>

<!--ourus-->
```buffer
1. a
2. ┃
1) b
2) c
```

</td></tr>
</table>

#### 129. [Enter › E4](../../spec/obsidian-true-outliner.md#e4)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- first
  second┃ line
```

</td><td>

<!--obsidian-lp-->
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

#### 130. [Enter › E7, E8 › Split item becomes first tab-indented child](../../spec/obsidian-true-outliner.md#split-item-becomes-first-tab-indented-child)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- alpha┃ beta
→- child
```

</td><td>

<!--obsidian-lp-->
```buffer
- alpha
- ┃beta
→- child
```

</td><td>

<!--ourus-->
```buffer
- alpha
→- ┃beta
→- child
```

</td></tr>
</table>

#### 131. [Enter › E7, E8 › End of parent opens empty first child](../../spec/obsidian-true-outliner.md#end-of-parent-opens-empty-first-child)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- alpha┃
→- child
```

</td><td>

<!--obsidian-lp-->
```buffer
- alpha
- ┃
→- child
```

</td><td>

<!--ourus-->
```buffer
- alpha
→- ┃
→- child
```

</td></tr>
</table>

#### 132. [Enter › E9](../../spec/obsidian-true-outliner.md#e9)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
one┃ two
- child
```

</td><td>

<!--obsidian-lp-->
```buffer
one
┃two
- child
```

</td><td>

<!--ourus-->
```buffer
one

┃two
- child
```

</td></tr>
</table>

#### 133. [Enter › E10](../../spec/obsidian-true-outliner.md#e10)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- item┃

  para
```

</td><td>

<!--obsidian-lp-->
```buffer
- item
- ┃

  para
```

</td><td>

<!--ourus-->
```buffer
- item
  - ┃

  para
```

</td></tr>
</table>

#### 134. [Enter › E11](../../spec/obsidian-true-outliner.md#e11)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- item┃ text
→```
→code
→```
````

</td><td>

<!--obsidian-lp-->
````buffer
- item
- ┃text
→```
→code
→```
````

</td><td>

<!--ourus-->
````buffer
- item
→- ┃text
→```
→code
→```
````

</td></tr>
</table>

#### 135. [Enter › E15](../../spec/obsidian-true-outliner.md#e15)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Head┃line
- item
```

</td><td>

<!--obsidian-lp-->
```buffer
# Head
┃line
- item
```

</td><td>

<!--ourus-->
```buffer
# Head
┃line

- item
```

</td></tr>
</table>

#### 136. [Enter › E17](../../spec/obsidian-true-outliner.md#e17)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Hello┃ world
====
```

</td><td>

<!--obsidian-lp-->
```buffer
Hello
┃world
====
```

</td><td>

<!--ourus-->
```buffer
Hello
====
┃world
```

</td></tr>
</table>

#### 137. [Enter › E18](../../spec/obsidian-true-outliner.md#e18)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Hello world
==┃==
```

</td><td>

<!--obsidian-lp-->
```buffer
Hello world
==
┃==
```

</td><td>

<!--ourus-->
```buffer
Hello world
====
┃
```

</td></tr>
</table>

#### 138. [Enter › E19, E21 › Empty paragraph before a section list](../../spec/obsidian-true-outliner.md#empty-paragraph-before-a-section-list)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Head┃
- item
```

</td><td>

<!--obsidian-lp-->
```buffer
# Head
┃
- item
```

</td><td>

<!--ourus-->
```buffer
# Head
┃

- item
```

</td></tr>
</table>

#### 139. [Enter › E33](../../spec/obsidian-true-outliner.md#e33)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- al«pha be»ta
```

</td><td>

<!--obsidian-lp-->
```buffer
- al
┃ta
```

</td><td>

<!--ourus-->
```buffer
- al
- ┃ta
```

</td></tr>
</table>

#### 140. [Enter › #267, E5](../../spec/obsidian-true-outliner.md#267-e5)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# H
para┃ text
> q
```

</td><td>

<!--obsidian-lp-->
```buffer
# H
para
┃text
> q
```

</td><td>

<!--ourus-->
```buffer
# H
para

┃text
> q
```

</td></tr>
</table>

#### 141. [Enter › E14, E20 › Split title above an existing paragraph](../../spec/obsidian-true-outliner.md#split-title-above-an-existing-paragraph)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Head┃line
Body.
```

</td><td>

<!--obsidian-lp-->
```buffer
# Head
┃line
Body.
```

</td><td>

<!--ourus-->
```buffer
# Head
┃line

Body.
```

</td></tr>
</table>

#### 142. [Enter › E14, E20 › End of heading above a paragraph](../../spec/obsidian-true-outliner.md#end-of-heading-above-a-paragraph)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Head┃
Body.
```

</td><td>

<!--obsidian-lp-->
```buffer
# Head
┃
Body.
```

</td><td>

<!--ourus-->
```buffer
# Head
┃

Body.
```

</td></tr>
</table>

#### 143. [Shift-Enter › S4](../../spec/obsidian-true-outliner.md#s4)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
one┃ two
```

</td><td>

<!--obsidian-lp-->
```buffer
one
┃ two
```

</td><td>

<!--ourus-->
```buffer
one
┃two
```

</td></tr>
</table>

#### 144. [Shift-Enter › S9](../../spec/obsidian-true-outliner.md#s9)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- item

  para┃ text
```

</td><td>

<!--obsidian-lp-->
```buffer
- item

  para
  ┃ text
```

</td><td>

<!--ourus-->
```buffer
- item

  para
  ┃text
```

</td></tr>
</table>

#### 145. [Shift-Enter › S11 › Leaving the place removes it](../../spec/obsidian-true-outliner.md#leaving-the-place-removes-it)

> shiftEnter cursorDocStart

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
foo┃
bar
```

</td><td>

<!--obsidian-lp-->
```buffer
┃foo

bar
```

</td><td>

<!--ourus-->
```buffer
┃foo
bar
```

</td></tr>
</table>

#### 146. [Shift-Enter › S13](../../spec/obsidian-true-outliner.md#s13)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a«lpha» beta
```

</td><td>

<!--obsidian-lp-->
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

#### 147. [Backspace › #269 › Emptied middle item removed and renumbered](../../spec/obsidian-true-outliner.md#emptied-middle-item-removed-and-renumbered)

> deleteContentBackward deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. p
2. a┃
3. q
```

</td><td>

<!--obsidian-lp-->
```buffer
1. p
2.┃
2. q
```

</td><td>

<!--ourus-->
```buffer
1. p┃
2. q
```

</td></tr>
</table>

#### 148. [Backspace › #153 › Undoing a fresh line break](../../spec/obsidian-true-outliner.md#undoing-a-fresh-line-break)

> shiftEnter deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - kid
- foo┃
```

</td><td>

<!--obsidian-lp-->
```buffer
- one
  - kid
- foo
┃
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

#### 149. [Backspace › Joining an item with children › Children move to the joined node](../../spec/obsidian-true-outliner.md#children-move-to-the-joined-node)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃b
    - c
```

</td><td>

<!--obsidian-lp-->
```buffer
- a
  -┃b
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

#### 150. [Backspace › Joining an item with children › Delete forward absorbs child with grandchildren](../../spec/obsidian-true-outliner.md#delete-forward-absorbs-child-with-grandchildren)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - b
    - c
```

</td><td>

<!--obsidian-lp-->
```buffer
- a┃→- b
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

#### 151. [Backspace › Joining across ordered runs](../../spec/obsidian-true-outliner.md#joining-across-ordered-runs)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a
2. b
- ┃x
3. c
```

</td><td>

<!--obsidian-lp-->
```buffer
1. a
2. b
-┃x
3. c
```

</td><td>

<!--ourus-->
```buffer
1. a
2. b┃x
3. c
```

</td></tr>
</table>

#### 152. [Backspace › Joining away the head of a list › Next item becomes the new 1.](../../spec/obsidian-true-outliner.md#next-item-becomes-the-new-1)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- p
  1. ┃a
  2. b
```

</td><td>

<!--obsidian-lp-->
```buffer
- p
  1.┃a
  1. b
```

</td><td>

<!--ourus-->
```buffer
- p┃a
  1. b
```

</td></tr>
</table>

#### 153. [Backspace › Joining away the head of a list › List starting at 3 keeps its start](../../spec/obsidian-true-outliner.md#list-starting-at-3-keeps-its-start)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
3. a
4. ┃b
5. c
```

</td><td>

<!--obsidian-lp-->
```buffer
3. a
4.┃b
4. c
```

</td><td>

<!--ourus-->
```buffer
3. a┃b
4. c
```

</td></tr>
</table>

#### 154. [Indentation › list-marker-content-column](../../spec/obsidian-true-outliner.md#list-marker-content-column)

> indent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
-  parent
-  kid┃
```

</td><td>

<!--obsidian-lp-->
```buffer
-  parent
  -  kid┃
```

</td><td>

<!--ourus-->
```buffer
-  parent
   -  kid┃
```

</td></tr>
</table>

#### 155. [Indentation › indent-unit-on-every-line](../../spec/obsidian-true-outliner.md#indent-unit-on-every-line)

> indent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
→- x
- b┃
  cont
```

</td><td>

<!--obsidian-lp-->
```buffer
- a
→- x
→- b┃
  cont
```

</td><td>

<!--ourus-->
```buffer
- a
→- x
→- b┃
→  cont
```

</td></tr>
</table>

#### 156. [Indentation › seams-across-a-re-indent › Indented item keeps its quote](../../spec/obsidian-true-outliner.md#indented-item-keeps-its-quote)

> indent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b┃
  > q
```

</td><td>

<!--obsidian-lp-->
```buffer
- a
  - b┃
  > q
```

</td><td>

<!--ourus-->
```buffer
- a
  - b┃
    > q
```

</td></tr>
</table>

#### 157. [Indentation › seams-across-a-re-indent › Outdented item keeps its quote](../../spec/obsidian-true-outliner.md#outdented-item-keeps-its-quote)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b┃
    > q
```

</td><td>

<!--obsidian-lp-->
```buffer
- a
- b┃
    > q
```

</td><td>

<!--ourus-->
```buffer
- a
- b┃
  > q
```

</td></tr>
</table>

#### 158. [Indentation › seams-across-a-re-indent › Indented item keeps its thematic break](../../spec/obsidian-true-outliner.md#indented-item-keeps-its-thematic-break)

> indent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b┃

  ---
```

</td><td>

<!--obsidian-lp-->
```buffer
- a
  - b┃

  ---
```

</td><td>

<!--ourus-->
```buffer
- a
  - b┃

    ---
```

</td></tr>
</table>

#### 159. [Indentation › seams-across-a-re-indent › Outdented item keeps its code block](../../spec/obsidian-true-outliner.md#outdented-item-keeps-its-code-block)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b┃

        code
```

</td><td>

<!--obsidian-lp-->
```buffer
- a
- b┃

        code
```

</td><td>

<!--ourus-->
```buffer
- a
- b┃

      code
```

</td></tr>
</table>

#### 160. [Indentation › destination-list-style](../../spec/obsidian-true-outliner.md#destination-list-style)

> indent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
* a
  * x
- b┃
```

</td><td>

<!--obsidian-lp-->
```buffer
* a
  * x
  - b┃
```

</td><td>

<!--ourus-->
```buffer
* a
  * x
  * b┃
```

</td></tr>
</table>

#### 161. [Moving › lone-block-id › Block id moves with its item](../../spec/obsidian-true-outliner.md#block-id-moves-with-its-item)

> moveBlockUp

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b┃
  ^id
```

</td><td>

<!--obsidian-lp-->
```buffer
- b┃
- a
  ^id
```

</td><td>

<!--ourus-->
```buffer
- b┃
  ^id
- a
```

</td></tr>
</table>

#### 162. [Moving › lone-block-id › Block id moves with its paragraph](../../spec/obsidian-true-outliner.md#block-id-moves-with-its-paragraph)

> moveBlockUp

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para one
^blk

para┃ two
```

</td><td>

<!--obsidian-lp-->
```buffer
para one
^blk
para┃ two

```

</td><td>

<!--ourus-->
```buffer
para┃ two

para one
^blk
```

</td></tr>
</table>

#### 163. [Moving › lazy-continuation-at-seams › Blank line added below a quote](../../spec/obsidian-true-outliner.md#blank-line-added-below-a-quote)

> moveBlockDown

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para┃
> q
```

</td><td>

<!--obsidian-lp-->
```buffer
> q
para┃
```

</td><td>

<!--ourus-->
```buffer
> q

para┃
```

</td></tr>
</table>

#### 164. [Moving › lazy-continuation-at-seams › No blank line needed after a fence](../../spec/obsidian-true-outliner.md#no-blank-line-needed-after-a-fence)

> moveBlockDown

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
para┃
```
code
```
````

</td><td>

<!--obsidian-lp-->
````buffer
```
para┃
code
```
````

</td><td>

<!--ourus-->
````buffer
```
code
```
para┃
````

</td></tr>
</table>

#### 165. [Moving › lazy-continuation-at-seams › No blank line needed before a fence](../../spec/obsidian-true-outliner.md#no-blank-line-needed-before-a-fence)

> moveBlockDown

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
```
code┃
```
para
````

</td><td>

<!--obsidian-lp-->
````buffer
```
```
code┃
para
````

</td><td>

<!--ourus-->
````buffer
para
```
code┃
```
````

</td></tr>
</table>

#### 166. [Abandoning an empty place › Shift-Enter, Tab, then leave › Carried place removed on leaving](../../spec/obsidian-true-outliner.md#carried-place-removed-on-leaving)

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-lp-->
```buffer
- one
  - kid
- foo
    ┃
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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-lp-->
```buffer
┃- one
  - kid
- foo
    
```

</td><td>

<!--ourus-->
```buffer
┃- one
  - kid
  - foo
```

</td></tr>
</table>

#### 167. [Abandoning an empty place › Shift-Enter, Tab, then leave › Doubly indented place removed on leaving](../../spec/obsidian-true-outliner.md#doubly-indented-place-removed-on-leaving)

> shiftEnter indent indent cursorDocStart

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - kid
  - sib
- foo┃
```

</td><td>

<!--obsidian-lp-->
```buffer
┃- one
  - kid
  - sib
- foo
      
```

</td><td>

<!--ourus-->
```buffer
┃- one
  - kid
  - sib
    - foo
```

</td></tr>
</table>

#### 168. [Abandoning an empty place › Shift-Enter, Tab, then leave › Backspace returns to the start](../../spec/obsidian-true-outliner.md#backspace-returns-to-the-start)

> shiftEnter indent deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - kid
- foo┃
```

</td><td>

<!--obsidian-lp-->
```buffer
- one
  - kid
- foo
  ┃
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

#### 169. [Abandoning an empty place › Shift-Enter, Tab, then leave › Shift-Tab then Backspace returns to start](../../spec/obsidian-true-outliner.md#shift-tab-then-backspace-returns-to-start)

> shiftEnter outdent deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b┃
- c
```

</td><td>

<!--obsidian-lp-->
```buffer
- a
  - b
┃
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

#### 170. [Abandoning an empty place › Shift-Enter, Tab, then Enter](../../spec/obsidian-true-outliner.md#shift-enter-tab-then-enter)

> shiftEnter indent enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - kid
- foo┃
- bar
```

</td><td>

<!--obsidian-lp-->
```buffer
- one
  - kid
- foo
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

#### 171. [Abandoning an empty place › Enter, then Shift-Enter and Backspace](../../spec/obsidian-true-outliner.md#enter-then-shift-enter-and-backspace)

> enter shiftEnter deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- foo┃
```

</td><td>

<!--obsidian-lp-->
```buffer
- foo
- 
┃
```

</td><td>

<!--ourus-->
```buffer
- foo
- ┃
```

</td></tr>
</table>

#### 172. [Abandoning an empty place › Enter, Tab, then leave › Empty child under parent text kept with a blank line](../../spec/obsidian-true-outliner.md#empty-child-under-parent-text-kept-with-a-blank-line)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- one
- foo┃
```

</td></tr>
</table>

> enter indent

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- one
- foo
  - ┃
```

</td></tr>
</table>

> cursorDocStart

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-lp-->
```buffer
┃- one
- foo
  - 
```

</td><td>

<!--ourus-->
```buffer
┃- one
- foo

  - 
```

</td></tr>
</table>

#### 173. [Abandoning an empty place › Enter, Tab, then leave › An empty ordered child kept with a blank line](../../spec/obsidian-true-outliner.md#an-empty-ordered-child-kept-with-a-blank-line)

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-lp-->
```buffer
1. a
  1. ┃
2. b
```

</td><td>

<!--ourus-->
```buffer
1. a
   1. ┃
2. b
```

</td></tr>
</table>

> cursorDocStart

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-lp-->
```buffer
┃1. a
  1. 
2. b
```

</td><td>

<!--ourus-->
```buffer
┃1. a

   1. 
2. b
```

</td></tr>
</table>

#### 174. [Abandoning an empty place › Enter, Tab, then leave › Blank line after the list stays](../../spec/obsidian-true-outliner.md#blank-line-after-the-list-stays)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- foo┃

para
```

</td></tr>
</table>

> enter

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- foo
- ┃

para
```

</td></tr>
</table>

> indent

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- foo
  - ┃

para
```

</td></tr>
</table>

> cursorDocStart

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-lp-->
```buffer
┃- foo
  - 

para
```

</td><td>

<!--ourus-->
```buffer
┃- foo

  - 

para
```

</td></tr>
</table>

#### 175. [Abandoning an empty place › Enter, Shift-Tab, then leave › Outdented empty ordered item stays](../../spec/obsidian-true-outliner.md#outdented-empty-ordered-item-stays)

> enter outdent cursorDocStart

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. p
   1. a┃
2. q
```

</td><td>

<!--obsidian-lp-->
```buffer
┃1. p
   1. a
 2. 
3. q
```

</td><td>

<!--ourus-->
```buffer
┃1. p
   1. a
2. 
3. q
```

</td></tr>
</table>

#### 176. [Abandoning an empty place › Enter twice, then leave › Empty paragraph and blank lines removed](../../spec/obsidian-true-outliner.md#empty-paragraph-and-blank-lines-removed)

> enter enter cursorDocStart

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

<!--obsidian-lp-->
```buffer
┃- a

- b
```

</td><td>

<!--ourus-->
```buffer
┃- a
- b
```

</td></tr>
</table>

#### 177. [Abandoning an empty place › Enter twice, then leave › Indented list under paragraph restored](../../spec/obsidian-true-outliner.md#indented-list-under-paragraph-restored)

> enter enter cursorDocStart

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para
  - a┃
  - b
```

</td><td>

<!--obsidian-lp-->
```buffer
┃para
  - a
- 
  - b
```

</td><td>

<!--ourus-->
```buffer
┃para
  - a
  - b
```

</td></tr>
</table>

#### 178. [Paste › #216 › Pasted list takes space indent unit](../../spec/obsidian-true-outliner.md#pasted-list-takes-space-indent-unit)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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

<!--obsidian-lp-->
```buffer
- top
  - sib- a
  - b
    - c
┃
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

#### 179. [Paste › #216 › Pasted list takes tab indent unit](../../spec/obsidian-true-outliner.md#pasted-list-takes-tab-indent-unit)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
- a
  - b
    - c
```

</td><td>

```buffer
- top
→- sib┃
```

</td><td>

<!--obsidian-lp-->
```buffer
- top
→- sib- a
  - b
    - c
┃
```

</td><td>

<!--ourus-->
```buffer
- top
→- sib
→- a
→→- b
→→→- c┃
```

</td></tr>
</table>

#### 180. [Paste › #264 › Pasted quote set off from paragraph](../../spec/obsidian-true-outliner.md#pasted-quote-set-off-from-paragraph)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
    first

    > quote
```

</td><td>

```buffer
## H┃
below
```

</td><td>

<!--obsidian-lp-->
```buffer
## H    first

    > quote
┃
below
```

</td><td>

<!--ourus-->
```buffer
## H

first

> quote┃

below
```

</td></tr>
</table>

#### 181. [Paste › #197 › Pasted list and block become children](../../spec/obsidian-true-outliner.md#pasted-list-and-block-become-children)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
- alpha

> note
```

</td><td>

```buffer
- top┃
  - see
```

</td><td>

<!--obsidian-lp-->
```buffer
- top- alpha

> note
┃
  - see
```

</td><td>

<!--ourus-->
```buffer
- top
  - alpha

  > note┃

  - see
```

</td></tr>
</table>

#### 182. [Outdent4](../../spec/outdent.md#outdent4)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
## A┃
### B
```

</td><td>

<!--obsidian-lp-->
```buffer
## A┃
### B
```

</td><td>

<!--ourus-->
```buffer
# A┃
## B
```

</td></tr>
</table>

#### 183. [Outdent8](../../spec/outdent.md#outdent8)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para
- «a
  - b
- c»
```

</td><td>

<!--obsidian-lp-->
```buffer
para
- «a
- b
- c»
```

</td><td>

<!--ourus-->
```buffer
para

«a

- b

c»
```

</td></tr>
</table>

#### 184. [Direct outdent › DirectOutdent1](../../spec/outdent.md#directoutdent1)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b┃
    - b1
  - c
- d
```

</td><td>

<!--obsidian-lp-->
```buffer
- a
- b┃
    - b1
  - c
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

#### 185. [Direct outdent › DirectOutdent2](../../spec/outdent.md#directoutdent2)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

<!--obsidian-lp-->
```buffer
- a┃
- b
```

</td><td>

<!--ourus-->
```buffer
a┃
- b
```

</td></tr>
</table>

#### 186. [Direct outdent › DirectOutdent3](../../spec/outdent.md#directoutdent3)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - a1
- b
```

</td><td>

<!--obsidian-lp-->
```buffer
- a┃
  - a1
- b
```

</td><td>

<!--ourus-->
```buffer
a┃
- a1
- b
```

</td></tr>
</table>

#### 187. [Direct outdent › DirectOutdent4](../../spec/outdent.md#directoutdent4)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para
- a┃
- b
```

</td><td>

<!--obsidian-lp-->
```buffer
para
- a┃
- b
```

</td><td>

<!--ourus-->
```buffer
para

a┃
- b
```

</td></tr>
</table>

#### 188. [Paste1](../../spec/paste.md#paste1)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````clipboard
```
c
```
````

</td><td>

```buffer
para
- a┃
- b
```

</td><td>

<!--obsidian-lp-->
````buffer
para
- a```
c
```
┃
- b
````

</td><td>

<!--ourus-->
````buffer
para
- a

```
c
```┃

- b
````

</td></tr>
</table>

#### 189. [Paste2](../../spec/paste.md#paste2)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
- x
- y
```

</td><td>

```buffer
1. a┃
2. b
```

</td><td>

<!--obsidian-lp-->
```buffer
1. a- x
- y
┃
1. b
```

</td><td>

<!--ourus-->
```buffer
1. a
2. x
3. y┃
2. b
```

</td></tr>
</table>

#### 190. [Paste3](../../spec/paste.md#paste3)

> pastePlain

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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

<!--obsidian-lp-->
```buffer
- ax
y
┃b
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

#### 191. [Paste4](../../spec/paste.md#paste4)

> pastePlain

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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

<!--obsidian-lp-->
```buffer
- ax
- y
┃b
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

#### 192. [Paste5](../../spec/paste.md#paste5)

> pastePlain

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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

<!--obsidian-lp-->
```buffer
- ax
y
┃
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

#### 193. [Paste7](../../spec/paste.md#paste7)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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

<!--obsidian-lp-->
```buffer
- ax
y
┃b
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

#### 194. [Paste9](../../spec/paste.md#paste9)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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

<!--obsidian-lp-->
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
  code
  ```┃
````

</td></tr>
</table>

#### 195. [Paste10](../../spec/paste.md#paste10)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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

<!--obsidian-lp-->
```buffer
- a
- x
y
┃
```

</td><td>

<!--ourus-->
```buffer
- a
- x
- y┃
```

</td></tr>
</table>

#### 196. [Paste11](../../spec/paste.md#paste11)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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

<!--obsidian-lp-->
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
    code
    ```┃
````

</td></tr>
</table>

#### 197. [Paste12](../../spec/paste.md#paste12)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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

<!--obsidian-lp-->
```buffer
- a
- > q
> r
┃
```

</td><td>

<!--ourus-->
```buffer
- a
- \> q
  \> r
  ┃
```

</td></tr>
</table>

#### 198. [Paste13](../../spec/paste.md#paste13)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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

<!--obsidian-lp-->
```buffer
- a1. x
2. y
┃
- b
```

</td><td>

<!--ourus-->
```buffer
- a
- 1\. x
- 2\. y┃
- b
```

</td></tr>
</table>

#### 199. [Paste14](../../spec/paste.md#paste14)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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

<!--obsidian-lp-->
```buffer
- a1. x
2. y
┃
  - kid
```

</td><td>

<!--ourus-->
```buffer
- a
  - 1\. x
  - 2\. y┃
  - kid
```

</td></tr>
</table>

#### 200. [Paste15](../../spec/paste.md#paste15)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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

<!--obsidian-lp-->
```buffer
- x
2. y
┃
- b
```

</td><td>

<!--ourus-->
```buffer
1. x
2. y┃
3. b
```

</td></tr>
</table>

#### 201. [Paste16](../../spec/paste.md#paste16)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
- x
- y
```

</td><td>

```buffer
1. ┃
2. b
```

</td><td>

<!--obsidian-lp-->
```buffer
1. x
- y
┃
1. b
```

</td><td>

<!--ourus-->
```buffer
1. x
2. y┃
2. b
```

</td></tr>
</table>

#### 202. [Paste17](../../spec/paste.md#paste17)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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

<!--obsidian-lp-->
```buffer
- a1. x
   1. x1
2. y
┃
```

</td><td>

<!--ourus-->
```buffer
- a
- 1\. x
  1. x1
- 2\. y┃
```

</td></tr>
</table>

#### 203. [Paste18](../../spec/paste.md#paste18)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
1. x
2. y
```

</td><td>

```buffer
1. a┃
2. b
```

</td><td>

<!--obsidian-lp-->
```buffer
1. a1. x
2. y
┃
3. b
```

</td><td>

<!--ourus-->
```buffer
1. a
1. x
2. y┃
2. b
```

</td></tr>
</table>

#### 204. [Paste19](../../spec/paste.md#paste19)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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

<!--obsidian-lp-->
```buffer
- a# h
text
┃
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

#### 205. [Paste20](../../spec/paste.md#paste20)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
- p
- q
```

</td><td>

```buffer
Notes┃

- x
- z
```

</td><td>

<!--obsidian-lp-->
```buffer
Notes- p
- q
┃

- x
- z
```

</td><td>

<!--ourus-->
```buffer
Notes

- p
- q┃
- x
- z
```

</td></tr>
</table>

#### 206. [Paste21](../../spec/paste.md#paste21)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
- p
- q
```

</td><td>

```buffer
Notes┃
- x
```

</td><td>

<!--obsidian-lp-->
```buffer
Notes- p
- q
┃
- x
```

</td><td>

<!--ourus-->
```buffer
Notes
- p
- q┃
- x
```

</td></tr>
</table>

#### 207. [Paste22](../../spec/paste.md#paste22)

> pastePlain

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
a = 1
  b = 2
```

</td><td>

````buffer
- code
  ```
  ┃
  ```
````

</td><td>

<!--obsidian-lp-->
````buffer
- code
  ```
  a = 1
  b = 2┃
  ```
````

</td><td>

<!--ourus-->
````buffer
- code
  ```
  a = 1
    b = 2┃
  ```
````

</td></tr>
</table>

#### 208. [Paste23](../../spec/paste.md#paste23)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
- a
- b
```

</td><td>

````buffer
> ```
> x┃
> ```
````

</td><td>

<!--obsidian-lp-->
````buffer
> ```
> x- a
- b┃
> ```
````

</td><td>

<!--ourus-->
````buffer
> ```
> x- a
> - b┃
> ```
````

</td></tr>
</table>

#### 209. [Placeholder1](../../spec/placeholders.md#placeholder1)

Also: [scenarios.md › Outliner flows › Walking away keeps the empty child, set off by a blank line](../../spec/scenarios.md#walking-away-keeps-the-empty-child-set-off-by-a-blank-line)

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-lp-->
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

#### 210. [Placeholder2](../../spec/placeholders.md#placeholder2)

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-lp-->
```buffer
- a
┃
```

</td><td>

<!--ourus-->
```buffer
- a

┃
```

</td></tr>
</table>

> cursorDocStart

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-lp-->
```buffer
┃- a

```

</td><td>

<!--ourus-->
```buffer
┃- a
```

</td></tr>
</table>

#### 211. [Placeholder3](../../spec/placeholders.md#placeholder3)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
para┃
```

</td></tr>
</table>

> enter

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-lp-->
```buffer
para
┃
```

</td><td>

<!--ourus-->
```buffer
para

┃
```

</td></tr>
</table>

> cursorDocStart

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-lp-->
```buffer
┃para

```

</td><td>

<!--ourus-->
```buffer
┃para
```

</td></tr>
</table>

#### 212. [Placeholder4](../../spec/placeholders.md#placeholder4)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
para┃
```

</td></tr>
</table>

> shiftEnter

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
para
┃
```

</td></tr>
</table>

> cursorDocStart

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-lp-->
```buffer
┃para

```

</td><td>

<!--ourus-->
```buffer
┃para
```

</td></tr>
</table>

#### 213. [Placeholder5](../../spec/placeholders.md#placeholder5)

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

> outdent

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-lp-->
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

#### 214. [Placeholder7](../../spec/placeholders.md#placeholder7)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b┃
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
```

</td></tr>
</table>

> cursorDocStart cursorLineBoundaryForward

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-lp-->
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

#### 215. [Placeholder9](../../spec/placeholders.md#placeholder9)

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

> cursorDocEnd cursorCharLeft

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-lp-->
```buffer
-  b
  - c┃
```

</td><td>

<!--ourus-->
```buffer
- b
  - c┃
```

</td></tr>
</table>

#### 216. [Placeholder13](../../spec/placeholders.md#placeholder13)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
# H1

┃a

## H2
```

</td></tr>
</table>

> deleteContentForward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
# H1

┃

## H2
```

</td></tr>
</table>

> deleteContentForward

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-lp-->
```buffer
# H1

┃
## H2
```

</td><td>

<!--ourus-->
```buffer
# H1

┃## H2
```

</td></tr>
</table>

#### 217. [Placeholder14](../../spec/placeholders.md#placeholder14)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
para

┃x

text
```

</td></tr>
</table>

> deleteContentForward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
para

┃

text
```

</td></tr>
</table>

> deleteContentForward

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-lp-->
```buffer
para

┃
text
```

</td><td>

<!--ourus-->
```buffer
para

┃text
```

</td></tr>
</table>

#### 218. [Placeholder15](../../spec/placeholders.md#placeholder15)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
para
- ┃a
```

</td></tr>
</table>

> enter

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-lp-->
```buffer
para
- 
- ┃a
```

</td><td>

<!--ourus-->
```buffer
para
- ┃
- a
```

</td></tr>
</table>

> cursorDocEnd cursorCharLeft

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-lp-->
```buffer
para
- 
- a┃
```

</td><td>

<!--ourus-->
```buffer
para

- 
- a┃
```

</td></tr>
</table>

#### 219. [A quote as an item's first block](../../spec/quotes.md#a-quote-as-an-items-first-block)

> indent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- > - a
  > - b┃
```

</td><td>

<!--obsidian-lp-->
```buffer
- > - a
  > →- b┃
```

</td><td>

<!--ourus-->
```buffer
- > - a
  >   - b┃
```

</td></tr>
</table>

#### 220. [Indent inside a quote › Item nests after the quote marker](../../spec/quotes.md#item-nests-after-the-quote-marker)

> indent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a
> - b┃
```

</td><td>

<!--obsidian-lp-->
```buffer
> - a
> →- b┃
```

</td><td>

<!--ourus-->
```buffer
> - a
>   - b┃
```

</td></tr>
</table>

#### 221. [Indent inside a quote › No space after the quote marker](../../spec/quotes.md#no-space-after-the-quote-marker)

> indent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
>- a
>- b┃
```

</td><td>

<!--obsidian-lp-->
```buffer
>- a
>→- b┃
```

</td><td>

<!--ourus-->
```buffer
>- a
>   - b┃
```

</td></tr>
</table>

#### 222. [Indent inside a quote › Quote inside an item](../../spec/quotes.md#quote-inside-an-item)

> indent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- x
  > - a
  > - b┃
```

</td><td>

<!--obsidian-lp-->
```buffer
- x
  > - a
  > →- b┃
```

</td><td>

<!--ourus-->
```buffer
- x
  > - a
  >   - b┃
```

</td></tr>
</table>

#### 223. [Indent inside a quote › Item in nested quotes](../../spec/quotes.md#item-in-nested-quotes)

> indent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> > - a
> > - b┃
```

</td><td>

<!--obsidian-lp-->
```buffer
> > - a
> > →- b┃
```

</td><td>

<!--ourus-->
```buffer
> > - a
> >   - b┃
```

</td></tr>
</table>

#### 224. [Indent inside a quote › Item in a callout](../../spec/quotes.md#item-in-a-callout)

> indent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> [!note] Title
> - a
> - b┃
```

</td><td>

<!--obsidian-lp-->
```buffer
> [!note] Title
> - a
> →- b┃
```

</td><td>

<!--ourus-->
```buffer
> [!note] Title
> - a
>   - b┃
```

</td></tr>
</table>

#### 225. [Indent inside a quote › Lazy continuation line stays put](../../spec/quotes.md#lazy-continuation-line-stays-put)

> indent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a
> - b┃
c
```

</td><td>

<!--obsidian-lp-->
```buffer
> - a
> →- b┃
c
```

</td><td>

<!--ourus-->
```buffer
> - a
>   - b┃
c
```

</td></tr>
</table>

#### 226. [Outdent out of a quote › Item becomes the quote's next sibling](../../spec/quotes.md#item-becomes-the-quotes-next-sibling)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a
> - b┃
```

</td><td>

<!--obsidian-lp-->
```buffer
> - a
> - b┃
```

</td><td>

<!--ourus-->
```buffer
> - a
- b┃
```

</td></tr>
</table>

#### 227. [Outdent out of a quote › Item with a child leaves below its siblings](../../spec/quotes.md#item-with-a-child-leaves-below-its-siblings)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a┃
>   - c
> - b
```

</td><td>

<!--obsidian-lp-->
```buffer
> - a┃
>   - c
> - b
```

</td><td>

<!--ourus-->
```buffer
> - b
- a┃
  - c
```

</td></tr>
</table>

#### 228. [Outdent out of a quote › Lazy continuation line goes along](../../spec/quotes.md#lazy-continuation-line-goes-along)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a
> - b┃
c
```

</td><td>

<!--obsidian-lp-->
```buffer
> - a
> - b┃
c
```

</td><td>

<!--ourus-->
```buffer
> - a
- b┃
c
```

</td></tr>
</table>

#### 229. [Outdent out of a quote › From a quote inside an item](../../spec/quotes.md#from-a-quote-inside-an-item)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- x
  > - a
  > - b┃
```

</td><td>

<!--obsidian-lp-->
```buffer
- x
  > - a
> - b┃
```

</td><td>

<!--ourus-->
```buffer
- x
  > - a
  - b┃
```

</td></tr>
</table>

#### 230. [Outdent out of a quote › Quoted blank lines lose their marker](../../spec/quotes.md#quoted-blank-lines-lose-their-marker)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a
> - b┃
>
>   c
```

</td><td>

<!--obsidian-lp-->
```buffer
> - a
> - b┃
>
>   c
```

</td><td>

<!--ourus-->
```buffer
> - a
- b┃

  c
```

</td></tr>
</table>

#### 231. [Indent into a quote › Item joins the quote above](../../spec/quotes.md#item-joins-the-quote-above)

> indent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a
- b┃
```

</td><td>

<!--obsidian-lp-->
```buffer
> - a
  - b┃
```

</td><td>

<!--ourus-->
```buffer
> - a
> - b┃
```

</td></tr>
</table>

#### 232. [Indent into a quote › Children and blank lines enter the quote](../../spec/quotes.md#children-and-blank-lines-enter-the-quote)

> indent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a

- b┃
  - c

  d
```

</td><td>

<!--obsidian-lp-->
```buffer
> - a

  - b┃
  - c

  d
```

</td><td>

<!--ourus-->
```buffer
> - a
>
> - b┃
>   - c
>
>   d
```

</td></tr>
</table>

#### 233. [Moving between quotes › Out of one quote and into the next](../../spec/quotes.md#out-of-one-quote-and-into-the-next)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
> - a┃
> - x

> - b
```

</td></tr>
</table>

> outdent

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-lp-->
```buffer
> - a┃
> - x

> - b
```

</td><td>

<!--ourus-->
```buffer
> - x

- a┃

> - b
```

</td></tr>
</table>

> moveBlockDown

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-lp-->
```buffer
> - x
> - a┃

> - b
```

</td><td>

<!--ourus-->
```buffer
> - x

> - b

- a┃
```

</td></tr>
</table>

> indent

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-lp-->
```buffer
> - x
> →- a┃

> - b
```

</td><td>

<!--ourus-->
```buffer
> - x

> - b
>
> - a┃
```

</td></tr>
</table>

#### 234. [Moving between quotes › Adjacent quotes kept apart by a blank line](../../spec/quotes.md#adjacent-quotes-kept-apart-by-a-blank-line)

> moveBlockDown

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - x
- a┃

> - b
```

</td><td>

<!--obsidian-lp-->
```buffer
> - x

- a┃
> - b
```

</td><td>

<!--ourus-->
```buffer
> - x

> - b

- a┃
```

</td></tr>
</table>

#### 235. [Moving inside a quote › Loose list keeps its quoted blank line](../../spec/quotes.md#loose-list-keeps-its-quoted-blank-line)

> moveBlockUp

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a
>
> - b┃
```

</td><td>

<!--obsidian-lp-->
```buffer
> - a
> - b┃
>
```

</td><td>

<!--ourus-->
```buffer
> - b┃
>
> - a
```

</td></tr>
</table>

#### 236. [Enter in a quote › At the end of a lazy line](../../spec/quotes.md#at-the-end-of-a-lazy-line)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a
b┃
```

</td><td>

<!--obsidian-lp-->
```buffer
> - a
b
┃
```

</td><td>

<!--ourus-->
```buffer
> - a
b
> - ┃
```

</td></tr>
</table>

#### 237. [Enter in a quote › Empty item leaves the list, then the quote](../../spec/quotes.md#empty-item-leaves-the-list-then-the-quote)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
> Quote:
> - one┃
```

</td></tr>
</table>

> enter

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
> Quote:
> - one
> - ┃
```

</td></tr>
</table>

> enter

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-lp-->
```buffer
> Quote:
> - one
> ┃
```

</td><td>

<!--ourus-->
```buffer
> Quote:
> - one
>
> ┃
```

</td></tr>
</table>

> enter

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
> Quote:
> - one

┃
```

</td></tr>
</table>

> "Back to text."

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
> Quote:
> - one

Back to text.┃
```

</td></tr>
</table>

#### 238. [Enter in a quote › Empty item leaves a quote inside an item](../../spec/quotes.md#empty-item-leaves-a-quote-inside-an-item)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- x
  > - a┃
```

</td></tr>
</table>

> enter enter

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-lp-->
```buffer
- x
  > - a
  > ┃
```

</td><td>

<!--ourus-->
```buffer
- x
  > - a
  >
  > ┃
```

</td></tr>
</table>

> enter

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-lp-->
```buffer
- x
  > - a
  
  ┃
```

</td><td>

<!--ourus-->
```buffer
- x
  > - a

  ┃
```

</td></tr>
</table>

#### 239. [Enter in a quote › Empty paragraph that is all of its quote](../../spec/quotes.md#empty-paragraph-that-is-all-of-its-quote)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
> - ┃
```

</td></tr>
</table>

> enter

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
> ┃
```

</td></tr>
</table>

> enter

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-lp-->
```buffer

┃
```

</td><td>

<!--ourus-->
```buffer
┃
```

</td></tr>
</table>

#### 240. [Enter in a quote › Splitting a quoted paragraph](../../spec/quotes.md#splitting-a-quoted-paragraph)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> ab┃cd
```

</td><td>

<!--obsidian-lp-->
```buffer
> ab
> ┃cd
```

</td><td>

<!--ourus-->
```buffer
> ab
>
> ┃cd
```

</td></tr>
</table>

#### 241. [Enter in a quote › Splitting a callout title before a list marker](../../spec/quotes.md#splitting-a-callout-title-before-a-list-marker)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> [!tip] Title┃- x
> - y
```

</td><td>

<!--obsidian-lp-->
```buffer
> [!tip] Title
> ┃- x
> - y
```

</td><td>

<!--ourus-->
```buffer
> [!tip] Title
> ┃\- x
> - y
```

</td></tr>
</table>

#### 242. [Joining in a quote › Backspace joins two quoted items](../../spec/quotes.md#backspace-joins-two-quoted-items)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a
> - ┃b
```

</td><td>

<!--obsidian-lp-->
```buffer
> - a
> -┃b
```

</td><td>

<!--ourus-->
```buffer
> - a┃b
```

</td></tr>
</table>

#### 243. [Joining in a quote › Item joins a quoted paragraph above](../../spec/quotes.md#item-joins-a-quoted-paragraph-above)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> a
> - ┃b
```

</td><td>

<!--obsidian-lp-->
```buffer
> a
> -┃b
```

</td><td>

<!--ourus-->
```buffer
> a┃b
```

</td></tr>
</table>

#### 244. [Joining in a quote › Delete joins the item below](../../spec/quotes.md#delete-joins-the-item-below)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> a┃
> - b
```

</td><td>

<!--obsidian-lp-->
```buffer
> a┃> - b
```

</td><td>

<!--ourus-->
```buffer
> a┃b
```

</td></tr>
</table>

#### 245. [Joining across a quote's edge › Item below joins the quoted node](../../spec/quotes.md#item-below-joins-the-quoted-node)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a
- ┃b
  - c
```

</td><td>

<!--obsidian-lp-->
```buffer
> - a
-┃b
  - c
```

</td><td>

<!--ourus-->
```buffer
> - a┃b
>   - c
```

</td></tr>
</table>

#### 246. [Pasting in a quote](../../spec/quotes.md#pasting-in-a-quote)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
- x
  - y
```

</td><td>

```buffer
> - a┃
```

</td><td>

<!--obsidian-lp-->
```buffer
> - a- x
  - y
┃
```

</td><td>

<!--ourus-->
```buffer
> - a
> - x
>   - y┃
```

</td></tr>
</table>

#### 247. [Headings in a quote](../../spec/quotes.md#headings-in-a-quote)

> indent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> # H
> - a
> - b┃
```

</td><td>

<!--obsidian-lp-->
```buffer
> # H
> - a
> →- b┃
```

</td><td>

<!--ourus-->
```buffer
> # H
> - a
>   - b┃
```

</td></tr>
</table>

#### 248. [Indenting a paragraph into a quote › Paragraph becomes the quote's last child](../../spec/quotes.md#paragraph-becomes-the-quotes-last-child)

> indent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> q

para┃
```

</td><td>

<!--obsidian-lp-->
```buffer
> q

  para┃
```

</td><td>

<!--ourus-->
```buffer
> q
>
> para┃
```

</td></tr>
</table>

#### 249. [Indenting a paragraph into a quote › Paragraph back out with a blank line](../../spec/quotes.md#paragraph-back-out-with-a-blank-line)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> q
>
> para┃
```

</td><td>

<!--obsidian-lp-->
```buffer
> q
>
> para┃
```

</td><td>

<!--ourus-->
```buffer
> q

para┃
```

</td></tr>
</table>

#### 250. [A whole quote moves](../../spec/quotes.md#a-whole-quote-moves)

> moveBlockUp

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - x
> - y

> q┃
```

</td><td>

<!--obsidian-lp-->
```buffer
> - x
> - y
> q┃

```

</td><td>

<!--ourus-->
```buffer
> q┃

> - x
> - y
```

</td></tr>
</table>

#### 251. [A paragraph outdented out of a nested quote › Inner quote emptied and removed](../../spec/quotes.md#inner-quote-emptied-and-removed)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a
> > q┃
```

</td><td>

<!--obsidian-lp-->
```buffer
> - a
> > q┃
```

</td><td>

<!--ourus-->
```buffer
> - a
>
> q┃
```

</td></tr>
</table>

#### 252. [A paragraph outdented out of a nested quote › Paragraph above a quoted item](../../spec/quotes.md#paragraph-above-a-quoted-item)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> > q┃
> - a
```

</td><td>

<!--obsidian-lp-->
```buffer
> > q┃
> - a
```

</td><td>

<!--ourus-->
```buffer
> q┃
> - a
```

</td></tr>
</table>

#### 253. [Outliner flows › Backspace removes the empty child](../../spec/scenarios.md#backspace-removes-the-empty-child)

> enter indent deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
```

</td><td>

<!--obsidian-lp-->
```buffer
- a
  -┃
```

</td><td>

<!--ourus-->
```buffer
- a┃
```

</td></tr>
</table>

#### 254. [ShiftEnter1](../../spec/shift-enter.md#shiftenter1)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one two┃ three
```

</td><td>

<!--obsidian-lp-->
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

#### 255. [ShiftEnter2](../../spec/shift-enter.md#shiftenter2)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a
   - b┃ c
```

</td><td>

<!--obsidian-lp-->
```buffer
1. a
   - b
     ┃ c
```

</td><td>

<!--ourus-->
```buffer
1. a
   - b
     ┃c
```

</td></tr>
</table>

#### 256. [ShiftEnter3](../../spec/shift-enter.md#shiftenter3)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- x
→- a┃ b
```

</td><td>

<!--obsidian-lp-->
```buffer
- x
→- a
→  ┃ b
```

</td><td>

<!--ourus-->
```buffer
- x
→- a
→  ┃b
```

</td></tr>
</table>

#### 257. [ShiftEnter5](../../spec/shift-enter.md#shiftenter5)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc ┃- def
```

</td><td>

<!--obsidian-lp-->
```buffer
- abc 
  ┃- def
```

</td><td>

<!--ourus-->
```buffer
- abc
  ┃\- def
```

</td></tr>
</table>

#### 258. [ShiftEnter6](../../spec/shift-enter.md#shiftenter6)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc ┃1. def
```

</td><td>

<!--obsidian-lp-->
```buffer
- abc 
  ┃1. def
```

</td><td>

<!--ourus-->
```buffer
- abc
  ┃1\. def
```

</td></tr>
</table>

#### 259. [ShiftEnter7](../../spec/shift-enter.md#shiftenter7)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Title ┃===
```

</td><td>

<!--obsidian-lp-->
```buffer
Title 
┃===
```

</td><td>

<!--ourus-->
```buffer
Title
┃\===
```

</td></tr>
</table>

#### 260. [ShiftEnter8](../../spec/shift-enter.md#shiftenter8)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Title ┃--
```

</td><td>

<!--obsidian-lp-->
```buffer
Title 
┃--
```

</td><td>

<!--ourus-->
```buffer
Title
┃\--
```

</td></tr>
</table>

#### 261. [ShiftEnter9](../../spec/shift-enter.md#shiftenter9)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one ┃<div>
```

</td><td>

<!--obsidian-lp-->
```buffer
- one 
  ┃<div>
```

</td><td>

<!--ourus-->
```buffer
- one
  ┃\<div>
```

</td></tr>
</table>

#### 262. [TaskEnter1](../../spec/tasks.md#taskenter1)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- [ ] ┃
```

</td><td>

<!--obsidian-lp-->
```buffer
- a
┃
```

</td><td>

<!--ourus-->
```buffer
- a

┃
```

</td></tr>
</table>

#### 263. [Undo3](../../spec/undo.md#undo3)

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-lp-->
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

> undo

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-lp-->
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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-lp-->
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

#### 264. [Undo4](../../spec/undo.md#undo4)

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
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃
```

</td></tr>
</table>

> redo

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-lp-->
```buffer
- a┃
```

</td><td>

<!--ourus-->
```buffer
- a
  - ┃
```

</td></tr>
</table>

#### 265. [Decisions of the redesign › The guard › Deleting the space after a marker › Nested item with children is refused](../../spec/zzz-redesign.md#nested-item-with-children-is-refused)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- p
  -┃ a
    - b
```

</td><td>

<!--obsidian-lp-->
```buffer
- p
  -┃a
    - b
```

</td><td>

<!--ourus-->
```buffer
- p
  -┃ a
    - b
```

</td></tr>
</table>

#### 266. [Decisions of the redesign › The guard › Typing in a list marker](../../spec/zzz-redesign.md#typing-in-a-list-marker)

> "x"

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
-┃ a
```

</td><td>

<!--obsidian-lp-->
```buffer
-x┃ a
```

</td><td>

<!--ourus-->
```buffer
- x┃a
```

</td></tr>
</table>

#### 267. [Findings of the design experiments › Empty tasks and empty items › B8: joining into an empty task](../../spec/zzz-redesign.md#b8-joining-into-an-empty-task)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] 
- [x] ┃a
```

</td><td>

<!--obsidian-lp-->
```buffer
- [ ] 
- [x]┃a
```

</td><td>

<!--ourus-->
```buffer
- ┃[x] a
```

</td></tr>
</table>

#### 268. [Findings of the design experiments › Separators › Moves that would need a block re-encoded, not a separator › Leftover paragraph loses its four spaces](../../spec/zzz-redesign.md#leftover-paragraph-loses-its-four-spaces)

> moveBlockUp

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
[a]: /u
    ┃code
```

</td><td>

<!--obsidian-lp-->
```buffer
    ┃code
[a]: /u
```

</td><td>

<!--ourus-->
```buffer
┃code

[a]: /u
```

</td></tr>
</table>

#### 269. [Findings of the design experiments › Escapes › Cmd-Backspace leaving a link reference definition](../../spec/zzz-redesign.md#cmd-backspace-leaving-a-link-reference-definition)

> deleteSoftLineBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
abc ┃[a]: tail
```

</td><td>

<!--obsidian-lp-->
```buffer
┃[a]: tail
```

</td><td>

<!--ourus-->
```buffer
┃\[a]: tail
```

</td></tr>
</table>

#### 270. [Findings of the design experiments › Escapes › Cmd-Backspace in a setext title](../../spec/zzz-redesign.md#cmd-backspace-in-a-setext-title)

> deleteSoftLineBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
abc ┃- x tail
===
```

</td><td>

<!--obsidian-lp-->
```buffer
┃- x tail
===
```

</td><td>

<!--ourus-->
```buffer
┃\- x tail
===
```

</td></tr>
</table>

#### 271. [Findings of the design experiments › Escapes › Text other readers would read differently › Ordered marker split onto a new line](../../spec/zzz-redesign.md#ordered-marker-split-onto-a-new-line)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. abc ┃2. x
```

</td><td>

<!--obsidian-lp-->
```buffer
1. abc 
   ┃2. x
```

</td><td>

<!--ourus-->
```buffer
1. abc
   ┃2\. x
```

</td></tr>
</table>

#### 272. [Findings of the design experiments › Escapes › Text other readers would read differently › Table delimiter row split onto a new line](../../spec/zzz-redesign.md#table-delimiter-row-split-onto-a-new-line)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
a | b ┃|---|---|
```

</td><td>

<!--obsidian-lp-->
```buffer
a | b 
┃|---|---|
```

</td><td>

<!--ourus-->
```buffer
a | b
┃\|---|---|
```

</td></tr>
</table>

### Whitespace (6)

#### 1. [Fence12](../../spec/fences.md#fence12)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ┃```
  code
  ```
````

</td><td>

<!--obsidian-lp-->
````buffer
- a
  
  ┃```
  code
  ```
````

</td><td>

<!--ourus-->
````buffer
- a

  ┃```
  code
  ```
````

</td></tr>
</table>

#### 2. [Fence13](../../spec/fences.md#fence13)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ```
  code
  ┃```
````

</td><td>

<!--obsidian-lp-->
````buffer
- a
  ```
  code
  
  ┃```
````

</td><td>

<!--ourus-->
````buffer
- a
  ```
  code

  ┃```
````

</td></tr>
</table>

#### 3. [ShiftEnter10](../../spec/shift-enter.md#shiftenter10)

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-lp-->
```buffer
- a
  
  ┃bc
```

</td><td>

<!--ourus-->
```buffer
- a

  ┃bc
```

</td></tr>
</table>

> "x"

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-lp-->
```buffer
- a
  
  x┃bc
```

</td><td>

<!--ourus-->
```buffer
- a

  x┃bc
```

</td></tr>
</table>

#### 4. [ShiftEnter11](../../spec/shift-enter.md#shiftenter11)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  ┃
- two
```

</td><td>

<!--obsidian-lp-->
```buffer
- one
  
  ┃
- two
```

</td><td>

<!--ourus-->
```buffer
- one

  ┃
- two
```

</td></tr>
</table>

#### 5. [ShiftEnter15](../../spec/shift-enter.md#shiftenter15)

> shiftEnter shiftEnter "p"

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one┃
```

</td><td>

<!--obsidian-lp-->
```buffer
- one
  
  p┃
```

</td><td>

<!--ourus-->
```buffer
- one

  p┃
```

</td></tr>
</table>

#### 6. [TaskEnter3](../../spec/tasks.md#taskenter3)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] abc ┃# x
```

</td><td>

<!--obsidian-lp-->
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

### Caret (11)

#### 1. [CursorUp1](../../spec/cursor.md#cursorup1)

> cursorLineUp

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
ab┃
```

</td><td>

<!--obsidian-lp-->
```buffer
ab
```

</td><td>

<!--ourus-->
```buffer
┃ab
```

</td></tr>
</table>

#### 2. [CursorUp2](../../spec/cursor.md#cursorup2)

> cursorLineUp

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
## Title
- ┃a
```

</td><td>

<!--obsidian-lp-->
```buffer
## Ti┃tle
- a
```

</td><td>

<!--ourus-->
```buffer
## ┃Title
- a
```

</td></tr>
</table>

#### 3. [CursorUp3](../../spec/cursor.md#cursorup3)

> cursorLineUp

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
    - b
- c┃
```

</td><td>

<!--obsidian-lp-->
```buffer
- a
  ┃  - b
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

#### 4. [CursorDown3](../../spec/cursor.md#cursordown3)

> cursorLineDown

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃a
  - b
```

</td><td>

<!--obsidian-lp-->
```buffer
- a
  ┃- b
```

</td><td>

<!--ourus-->
```buffer
- a
  - ┃b
```

</td></tr>
</table>

#### 5. [CursorDown4](../../spec/cursor.md#cursordown4)

> cursorLineDown

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc┃
  - bcd
```

</td><td>

<!--obsidian-lp-->
```buffer
- abc
  -┃ bcd
```

</td><td>

<!--ourus-->
```buffer
- abc
  - b┃cd
```

</td></tr>
</table>

#### 6. [CursorHome3](../../spec/cursor.md#cursorhome3)

> cursorLineBoundaryBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
┃- one two
```

</td><td>

<!--obsidian-lp-->
```buffer
┃- one two
```

</td><td>

<!--ourus-->
```buffer
- ┃one two
```

</td></tr>
</table>

#### 7. [CursorHome4](../../spec/cursor.md#cursorhome4)

> cursorLineBoundaryBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
-┃ one
```

</td><td>

<!--obsidian-lp-->
```buffer
┃- one
```

</td><td>

<!--ourus-->
```buffer
- ┃one
```

</td></tr>
</table>

#### 8. [CursorHome10](../../spec/cursor.md#cursorhome10)

> cursorLineBoundaryBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
## Title┃
```

</td><td>

<!--obsidian-lp-->
```buffer
┃## Title
```

</td><td>

<!--ourus-->
```buffer
## ┃Title
```

</td></tr>
</table>

#### 9. [Enter26](../../spec/enter.md#enter26)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃b
```

</td><td>

<!--obsidian-lp-->
```buffer
- a
  - 
  - ┃b
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

#### 10. [Enter29](../../spec/enter.md#enter29)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b
  - ┃c
```

</td><td>

<!--obsidian-lp-->
```buffer
- a
  - b
  - 
  - ┃c
```

</td><td>

<!--ourus-->
```buffer
- a
  - b
  - ┃
  - c
```

</td></tr>
</table>

#### 11. [Enter31](../../spec/enter.md#enter31)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃a
  - b
```

</td><td>

<!--obsidian-lp-->
```buffer
- 
- ┃a
  - b
```

</td><td>

<!--ourus-->
```buffer
- ┃
- a
  - b
```

</td></tr>
</table>

### Agree (107)

1. [Backspace12](../../spec/backspace.md#backspace12)
2. [Backspace13](../../spec/backspace.md#backspace13)
3. [BlockDown11](../../spec/block-down.md#blockdown11)
4. [BlockDown12](../../spec/block-down.md#blockdown12)
5. [BlockDown14](../../spec/block-down.md#blockdown14)
6. [BlockDown15](../../spec/block-down.md#blockdown15)
7. [BlockUp6](../../spec/block-up.md#blockup6)
8. [BlockUp10](../../spec/block-up.md#blockup10)
9. [BlockUp11](../../spec/block-up.md#blockup11)
10. [BlockUp14](../../spec/block-up.md#blockup14)
11. [CursorLeft1](../../spec/cursor.md#cursorleft1)
12. [CursorLeft3](../../spec/cursor.md#cursorleft3)
13. [CursorRight1](../../spec/cursor.md#cursorright1)
14. [CursorRight2](../../spec/cursor.md#cursorright2)
15. [CursorDown1](../../spec/cursor.md#cursordown1)
16. [CursorDown2](../../spec/cursor.md#cursordown2)
17. [CursorHome1](../../spec/cursor.md#cursorhome1)
18. [CursorHome2](../../spec/cursor.md#cursorhome2)
19. [CursorHome5](../../spec/cursor.md#cursorhome5)
20. [CursorHome6](../../spec/cursor.md#cursorhome6)
21. [CursorHome7](../../spec/cursor.md#cursorhome7)
22. [CursorHome8](../../spec/cursor.md#cursorhome8)
23. [CursorHome9](../../spec/cursor.md#cursorhome9)
24. [CursorHome11](../../spec/cursor.md#cursorhome11)
25. [CursorHome12](../../spec/cursor.md#cursorhome12)
26. [CursorHome13](../../spec/cursor.md#cursorhome13)
27. [CursorHome14](../../spec/cursor.md#cursorhome14)
28. [CursorEnd1](../../spec/cursor.md#cursorend1)
29. [CursorDocStart1](../../spec/cursor.md#cursordocstart1)
30. [CursorDocEndLeft1](../../spec/cursor.md#cursordocendleft1)
31. [SelectLeft1](../../spec/cursor.md#selectleft1)
32. [SelectRightEnd1](../../spec/cursor.md#selectrightend1)
33. [SelectHome1](../../spec/cursor.md#selecthome1)
34. [Delete8](../../spec/del.md#delete8)
35. [Delete15](../../spec/del.md#delete15)
36. [Delete16](../../spec/del.md#delete16)
37. [Enter1](../../spec/enter.md#enter1)
38. [Enter2](../../spec/enter.md#enter2)
39. [Enter5](../../spec/enter.md#enter5)
40. [Enter15](../../spec/enter.md#enter15)
41. [Enter32](../../spec/enter.md#enter32)
42. [Enter33](../../spec/enter.md#enter33)
43. [Fence1](../../spec/fences.md#fence1)
44. [Fence2](../../spec/fences.md#fence2)
45. [Fence3](../../spec/fences.md#fence3)
46. [Fence4](../../spec/fences.md#fence4)
47. [Fence5](../../spec/fences.md#fence5)
48. [Fence6](../../spec/fences.md#fence6)
49. [Fence7b](../../spec/fences.md#fence7b)
50. [Fence7d](../../spec/fences.md#fence7d)
51. [Fence8](../../spec/fences.md#fence8)
52. [moveBlockUp, moveBlockDown (Alt-Shift-Up, Alt-Shift-Down) › The gap ending a list stays at the list's end](../../spec/gaps.md#the-gap-ending-a-list-stays-at-the-lists-end)
53. [New text and gaps › Enter at the end of a heading keeps its gap below the new paragraph](../../spec/gaps.md#enter-at-the-end-of-a-heading-keeps-its-gap-below-the-new-paragraph)
54. [Indent1](../../spec/indent.md#indent1)
55. [Indent6](../../spec/indent.md#indent6)
56. [Indent7](../../spec/indent.md#indent7)
57. [Indent8](../../spec/indent.md#indent8)
58. [Indent9](../../spec/indent.md#indent9)
59. [Indent14](../../spec/indent.md#indent14)
60. [Enter › E1](../../spec/obsidian-true-outliner.md#e1)
61. [Enter › E3](../../spec/obsidian-true-outliner.md#e3)
62. [Enter › E19, E21 › End of lone heading starts a paragraph](../../spec/obsidian-true-outliner.md#end-of-lone-heading-starts-a-paragraph)
63. [Enter › E32 › Task checkbox carries over unchecked](../../spec/obsidian-true-outliner.md#task-checkbox-carries-over-unchecked)
64. [Enter › E32 › Checked task gives unchecked new item](../../spec/obsidian-true-outliner.md#checked-task-gives-unchecked-new-item)
65. [Enter › E13, E16 › Rest of title becomes first paragraph](../../spec/obsidian-true-outliner.md#rest-of-title-becomes-first-paragraph)
66. [Enter › E13, E16 › Split title above a subheading](../../spec/obsidian-true-outliner.md#split-title-above-a-subheading)
67. [Enter › E29 › Start of paragraph opens line above](../../spec/obsidian-true-outliner.md#start-of-paragraph-opens-line-above)
68. [Shift-Enter › S11 › Place inside a multi-line item](../../spec/obsidian-true-outliner.md#place-inside-a-multi-line-item)
69. [Backspace › delete-to-content-start](../../spec/obsidian-true-outliner.md#delete-to-content-start)
70. [Indentation › #255 › Outdented child leaves quote above alone](../../spec/obsidian-true-outliner.md#outdented-child-leaves-quote-above-alone)
71. [Ordered lists › #159 (ordered-run-split-numbering) › Renumbering only the touched part](../../spec/obsidian-true-outliner.md#renumbering-only-the-touched-part)
72. [Abandoning an empty place › Enter, Shift-Tab, then leave › Second Enter outdents to a kept item](../../spec/obsidian-true-outliner.md#second-enter-outdents-to-a-kept-item)
73. [Outdent1](../../spec/outdent.md#outdent1)
74. [Outdent3](../../spec/outdent.md#outdent3)
75. [Outdent6](../../spec/outdent.md#outdent6)
76. [Placeholder6](../../spec/placeholders.md#placeholder6)
77. [Placeholder8](../../spec/placeholders.md#placeholder8)
78. [Placeholder10](../../spec/placeholders.md#placeholder10)
79. [Placeholder11](../../spec/placeholders.md#placeholder11)
80. [Placeholder12](../../spec/placeholders.md#placeholder12)
81. [Indent inside a quote › Tab-indented items in a quote](../../spec/quotes.md#tab-indented-items-in-a-quote)
82. [Outdent inside a quote](../../spec/quotes.md#outdent-inside-a-quote)
83. [Indent into a quote › Outdent undoes indent into a quote](../../spec/quotes.md#outdent-undoes-indent-into-a-quote)
84. [Moving inside a quote › Swapping two quoted items](../../spec/quotes.md#swapping-two-quoted-items)
85. [Moving inside a quote › Quote moves past an item](../../spec/quotes.md#quote-moves-past-an-item)
86. [A quote and a heading don't swap › A quote moved down past a heading joins its section](../../spec/quotes.md#a-quote-moved-down-past-a-heading-joins-its-section)
87. [Enter in a quote › New item gets the quote marker](../../spec/quotes.md#new-item-gets-the-quote-marker)
88. [Enter in a quote › New item in a quote inside an item](../../spec/quotes.md#new-item-in-a-quote-inside-an-item)
89. [Enter in a quote › Splitting a callout title](../../spec/quotes.md#splitting-a-callout-title)
90. [Enter in a quote › Empty body line after a lone title](../../spec/quotes.md#empty-body-line-after-a-lone-title)
91. [Shift-Enter in a quote › Line break in a quoted paragraph](../../spec/quotes.md#line-break-in-a-quoted-paragraph)
92. [Shift-Enter in a quote › Held-open empty line at the end](../../spec/quotes.md#held-open-empty-line-at-the-end)
93. [Shift-Enter in a quote › Line break in a quoted item](../../spec/quotes.md#line-break-in-a-quoted-item)
94. [A paragraph moves inside a quote without becoming its text](../../spec/quotes.md#a-paragraph-moves-inside-a-quote-without-becoming-its-text)
95. [Outliner flows › Typing a new child](../../spec/scenarios.md#typing-a-new-child)
96. [Outliner flows › Enter outdents the empty child](../../spec/scenarios.md#enter-outdents-the-empty-child)
97. [ShiftEnter4](../../spec/shift-enter.md#shiftenter4)
98. [ShiftEnter12](../../spec/shift-enter.md#shiftenter12)
99. [TaskEnter2](../../spec/tasks.md#taskenter2)
100. [TaskBackspace5](../../spec/tasks.md#taskbackspace5)
101. [Undo1](../../spec/undo.md#undo1)
102. [Undo2](../../spec/undo.md#undo2)
103. [Decisions of the redesign › The guard › Deleting the space after a marker › Childless item becomes text](../../spec/zzz-redesign.md#childless-item-becomes-text)
104. [Decisions of the redesign › The guard › Setext authoring › Typing an underline makes a heading](../../spec/zzz-redesign.md#typing-an-underline-makes-a-heading)
105. [Decisions of the redesign › The guard › Setext authoring › Deleting to finish the underline](../../spec/zzz-redesign.md#deleting-to-finish-the-underline)
106. [Decisions of the redesign › The guard › A list marker typed on a continuation line](../../spec/zzz-redesign.md#a-list-marker-typed-on-a-continuation-line)
107. [Decisions of the redesign › Paragraphs own the list that follows them › A paragraph owns consecutive lists](../../spec/zzz-redesign.md#a-paragraph-owns-consecutive-lists)

## Skipped

### nothing to compare (28)

1. [backspace.md › Backspace16](../../spec/backspace.md#backspace16)
2. [block-down.md › BlockDown3](../../spec/block-down.md#blockdown3)
3. [block-down.md › BlockDown6](../../spec/block-down.md#blockdown6)
4. [block-down.md › BlockDown17](../../spec/block-down.md#blockdown17)
5. [block-down.md › BlockDown19](../../spec/block-down.md#blockdown19)
6. [block-up.md › BlockUp2](../../spec/block-up.md#blockup2)
7. [block-up.md › BlockUp5](../../spec/block-up.md#blockup5)
8. [fences.md › Fence9](../../spec/fences.md#fence9)
9. [fences.md › Fence14](../../spec/fences.md#fence14)
10. [fences.md › Fence17](../../spec/fences.md#fence17)
11. [fences.md › Fence19](../../spec/fences.md#fence19)
12. [fences.md › Fence21](../../spec/fences.md#fence21)
13. [indent.md › Indent10](../../spec/indent.md#indent10)
14. [indent.md › Indent11](../../spec/indent.md#indent11)
15. [obsidian-true-outliner.md › Shift-Enter › S5](../../spec/obsidian-true-outliner.md#s5)
16. [obsidian-true-outliner.md › Shift-Enter › S7, S8 › Line break in setext title refused](../../spec/obsidian-true-outliner.md#line-break-in-setext-title-refused)
17. [obsidian-true-outliner.md › Shift-Enter › S7, S8 › Line break in setext underline refused](../../spec/obsidian-true-outliner.md#line-break-in-setext-underline-refused)
18. [outdent.md › Outdent2](../../spec/outdent.md#outdent2)
19. [outdent.md › Outdent5](../../spec/outdent.md#outdent5)
20. [outdent.md › Outdent7](../../spec/outdent.md#outdent7)
21. [paste.md › Paste6](../../spec/paste.md#paste6)
22. [quotes.md › A quote and a heading don't swap › A heading doesn't move above a quote](../../spec/quotes.md#a-heading-doesnt-move-above-a-quote)
23. [quotes.md › Enter in a quote › Enter in a callout's type](../../spec/quotes.md#enter-in-a-callouts-type)
24. [quotes.md › Shift-Enter in a quote › No line break in an Obsidian callout title](../../spec/quotes.md#no-line-break-in-an-obsidian-callout-title)
25. [quotes.md › Joining across a quote's edge › Quote's first paragraph left to the host](../../spec/quotes.md#quotes-first-paragraph-left-to-the-host)
26. [quotes.md › Joining across a quote's edge › Quote's first item cannot leave](../../spec/quotes.md#quotes-first-item-cannot-leave)
27. [shift-enter.md › ShiftEnter13](../../spec/shift-enter.md#shiftenter13)
28. [shift-enter.md › ShiftEnter14](../../spec/shift-enter.md#shiftenter14)

### CR line endings (5)

1. [cursor.md › CursorLeft2](../../spec/cursor.md#cursorleft2)
2. [enter.md › Enter17](../../spec/enter.md#enter17)
3. [enter.md › Enter18](../../spec/enter.md#enter18)
4. [indent.md › Indent17](../../spec/indent.md#indent17)
5. [shift-enter.md › ShiftEnter16](../../spec/shift-enter.md#shiftenter16)

### option outdent: logical (5)

1. [obsidian-true-outliner.md › Ordered lists › Outdenting the head of a nested list](../../spec/obsidian-true-outliner.md#outdenting-the-head-of-a-nested-list)
2. [outdent.md › Logical outdent › LogicalOutdent1](../../spec/outdent.md#logicaloutdent1)
3. [outdent.md › Logical outdent › LogicalOutdent2](../../spec/outdent.md#logicaloutdent2)
4. [outdent.md › Logical outdent › LogicalOutdent3](../../spec/outdent.md#logicaloutdent3)
5. [outdent.md › Logical outdent › LogicalOutdent4](../../spec/outdent.md#logicaloutdent4)

### action deleteSubtree (4)

1. [delete-subtree.md › BlockDelete1](../../spec/delete-subtree.md#blockdelete1)
2. [delete-subtree.md › BlockDelete2](../../spec/delete-subtree.md#blockdelete2)
3. [delete-subtree.md › BlockDelete3](../../spec/delete-subtree.md#blockdelete3)
4. [delete-subtree.md › BlockDelete4](../../spec/delete-subtree.md#blockdelete4)

### option headingEditing: block (3)

1. [backspace.md › Backspace18b](../../spec/backspace.md#backspace18b)
2. [del.md › Delete13b](../../spec/del.md#delete13b)
3. [del.md › Delete13d](../../spec/del.md#delete13d)

### a caret in a task's checkbox (Live Preview draws it) (2)

1. [obsidian-true-outliner.md › Backspace › Joining a task › Backspace before the checkbox](../../spec/obsidian-true-outliner.md#backspace-before-the-checkbox)
2. [tasks.md › TaskBackspace1](../../spec/tasks.md#taskbackspace1)

### action duplicateNode (2)

1. [duplicate-block.md › BlockDuplicate1](../../spec/duplicate-block.md#blockduplicate1)
2. [duplicate-block.md › BlockDuplicate2](../../spec/duplicate-block.md#blockduplicate2)

### option deleteAtGap: gap (2)

1. [backspace.md › Backspace21b](../../spec/backspace.md#backspace21b)
2. [del.md › Delete17b](../../spec/del.md#delete17b)

### option handleFenceContents: false (2)

1. [fences.md › Fence10](../../spec/fences.md#fence10)
2. [fences.md › Fence11](../../spec/fences.md#fence11)

### option taskEditing: checkbox (2)

1. [tasks.md › TaskBackspace2](../../spec/tasks.md#taskbackspace2)
2. [tasks.md › TaskBackspace3](../../spec/tasks.md#taskbackspace3)

### a caret in the frontmatter (Live Preview shows it as properties) (1)

1. [zzz-redesign.md › Decisions of the redesign › Obsidian: frontmatter is a preamble](../../spec/zzz-redesign.md#obsidian-frontmatter-is-a-preamble)

### a caret inside two spaces of indentation (1)

1. [gaps.md › Keys on a blank line › Keys in the preamble do nothing](../../spec/gaps.md#keys-in-the-preamble-do-nothing)

### option bullet: + (1)

1. [indent.md › Indent18](../../spec/indent.md#indent18)

### option enterOnEmptyItem: outdent (1)

1. [enter.md › Enter30](../../spec/enter.md#enter30)

### option pasteMidText: split (1)

1. [paste.md › Paste8](../../spec/paste.md#paste8)

### option taskEditing: block (1)

1. [tasks.md › TaskBackspace4](../../spec/tasks.md#taskbackspace4)
