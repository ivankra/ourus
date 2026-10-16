---
type: "SxS"
app: "obsidian-outliner"
version: "1.14.4 (installer 1.14.4), obsidian-outliner 4.10.2"
url: "app://obsidian.md/"
model: "text"
command: "node sxs/run.ts obsidian-outliner"
elapsed_s: 101
---

# Obsidian with Outliner vs ourus

Spec test suite replayed in Obsidian with Outliner and compared against ourus.

Regenerated from an earlier run (`--regenerate-report`): what Obsidian with Outliner did then, judged against the spec as it is now. It played every example as it is now.

Model: [text](../lib/text.ts) (buffers loaded and compared as written, caret included)

## Summary

|  | agree | caret | whitespace | disagree | error | skipped | total |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **total** | **183 (28%)** | **18 (2.8%)** | **4 (0.61%)** | **382 (58%)** | **0 (0%)** | **67 (10%)** | **654** |

Per-file:

|  | agree | caret | whitespace | disagree | error | skipped | total |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [backspace.md](../../spec/backspace.md) | 15 |  |  | 33 |  | 4 | **52** |
| [cursor.md](../../spec/cursor.md) | 24 | 8 |  |  |  | 4 | **36** |
| [del.md](../../spec/del.md) | 14 |  |  | 16 |  | 14 | **44** |
| [delete-subtree.md](../../spec/delete-subtree.md) |  |  |  |  |  | 6 | **6** |
| [duplicate-subtree.md](../../spec/duplicate-subtree.md) |  |  |  |  |  | 3 | **3** |
| [enter.md](../../spec/enter.md) | 11 | 3 |  | 34 |  | 4 | **52** |
| [fences.md](../../spec/fences.md) | 16 | 4 |  | 21 |  | 3 | **44** |
| [gaps.md](../../spec/gaps.md) | 2 |  |  | 15 |  | 2 | **19** |
| [indent.md](../../spec/indent.md) | 14 |  |  | 12 |  | 3 | **29** |
| [move-subtree-down.md](../../spec/move-subtree-down.md) | 10 |  |  | 21 |  | 1 | **32** |
| [move-subtree-up.md](../../spec/move-subtree-up.md) | 10 |  |  | 24 |  | 1 | **35** |
| [obsidian-true-outliner.md](../../spec/obsidian-true-outliner.md) | 23 | 2 |  | 38 |  | 4 | **67** |
| [outdent.md](../../spec/outdent.md) | 8 |  |  | 15 |  | 1 | **24** |
| [paste.md](../../spec/paste.md) | 2 |  |  | 41 |  | 5 | **48** |
| [placeholders.md](../../spec/placeholders.md) | 5 |  |  | 11 |  |  | **16** |
| [quotes.md](../../spec/quotes.md) | 8 |  |  | 64 |  | 2 | **74** |
| [scenarios.md](../../spec/scenarios.md) | 10 |  |  | 12 |  | 2 | **24** |
| [shift-enter.md](../../spec/shift-enter.md) | 3 |  | 3 | 14 |  | 3 | **23** |
| [tasks.md](../../spec/tasks.md) | 3 | 1 | 1 | 8 |  | 4 | **17** |
| [typing.md](../../spec/typing.md) | 3 |  |  |  |  | 1 | **4** |
| [undo.md](../../spec/undo.md) | 2 |  |  | 3 |  |  | **5** |
| **total** | **183 (28%)** | **18 (2.8%)** | **4 (0.61%)** | **382 (58%)** | **0 (0%)** | **67 (10%)** | **654** |

## Examples

### Disagree (382)

#### 1. [Backspace4](../../spec/backspace.md#backspace4)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Title #
- ┃more
```

</td><td>

<!--obsidian-outliner-->
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

#### 2. [Backspace10](../../spec/backspace.md#backspace10)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

┃
```

</td><td>

<!--obsidian-outliner-->
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

#### 3. [Backspace11](../../spec/backspace.md#backspace11)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

┃b
```

</td><td>

<!--obsidian-outliner-->
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

#### 4. [Backspace12b](../../spec/backspace.md#backspace12b)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
a┃b
```

</td></tr>
</table>

> enter

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
a
┃b
```

</td><td>

<!--ourus-->
```buffer
a

┃b
```

</td></tr>
</table>

> deleteContentBackward deleteContentBackward

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
┃b
```

</td><td>

<!--ourus-->
```buffer
a┃b
```

</td></tr>
</table>

#### 5. [Backspace14](../../spec/backspace.md#backspace14)

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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
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

#### 6. [Backspace15](../../spec/backspace.md#backspace15)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para

- ┃a
```

</td><td>

<!--obsidian-outliner-->
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

#### 7. [Backspace16](../../spec/backspace.md#backspace16)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
```
x
```
- ┃a
````

</td><td>

<!--obsidian-outliner-->
````buffer
```
x
```
-┃a
````

</td><td>

<!--ourus-->
````buffer
```
x
```
- ┃a
````

</td></tr>
</table>

#### 8. [Backspace17](../../spec/backspace.md#backspace17)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
- b
- c
```

</td><td>

<!--obsidian-outliner-->
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

#### 9. [Backspace17b](../../spec/backspace.md#backspace17b)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
  - a
    - b
```

</td><td>

<!--obsidian-outliner-->
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

#### 10. [Backspace17c](../../spec/backspace.md#backspace17c)

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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
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

#### 11. [Backspace17e](../../spec/backspace.md#backspace17e)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

<!--obsidian-outliner-->
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

#### 12. [Backspace18](../../spec/backspace.md#backspace18)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para

# ┃Hello

body
```

</td><td>

<!--obsidian-outliner-->
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

#### 13. [Backspace18c](../../spec/backspace.md#backspace18c)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
┃Title
===

text
```

</td><td>

<!--obsidian-outliner-->
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

#### 14. [Backspace18d](../../spec/backspace.md#backspace18d)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
a
# ┃H1
text
```

</td><td>

<!--obsidian-outliner-->
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

#### 15. [Backspace18e](../../spec/backspace.md#backspace18e)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- # ┃H
```

</td><td>

<!--obsidian-outliner-->
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

#### 16. [Backspace19](../../spec/backspace.md#backspace19)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

  ┃bc
```

</td><td>

<!--obsidian-outliner-->
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

#### 17. [Backspace20](../../spec/backspace.md#backspace20)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

┃

- b
```

</td><td>

<!--obsidian-outliner-->
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

#### 18. [Backspace21](../../spec/backspace.md#backspace21)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

- ┃b
```

</td><td>

<!--obsidian-outliner-->
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

#### 19. [Backspace21b](../../spec/backspace.md#backspace21b)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a

- ┃b
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
- a

-┃b
```

</td><td>

<!--ourus-->
```buffer
- a
- ┃b
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
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

#### 20. [Backspace22](../../spec/backspace.md#backspace22)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Title

┃more
```

</td><td>

<!--obsidian-outliner-->
```buffer
# Title
┃more
```

</td><td>

<!--ourus-->
```buffer
# Title┃more
```

</td></tr>
</table>

#### 21. [Backspace23](../../spec/backspace.md#backspace23)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Title

┃more
lines
```

</td><td>

<!--obsidian-outliner-->
```buffer
# Title
┃more
lines
```

</td><td>

<!--ourus-->
```buffer
# Title

┃more
lines
```

</td></tr>
</table>

#### 22. [Backspace24](../../spec/backspace.md#backspace24)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
```
x
```

┃para
````

</td><td>

<!--obsidian-outliner-->
````buffer
```
x
```
┃para
````

</td><td>

<!--ourus-->
````buffer
```
x
```

┃para
````

</td></tr>
</table>

#### 23. [Backspace25](../../spec/backspace.md#backspace25)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- 

┃para
```

</td><td>

<!--obsidian-outliner-->
```buffer
- a
- 
┃para
```

</td><td>

<!--ourus-->
```buffer
- a
- ┃para
```

</td></tr>
</table>

#### 24. [Backspace27](../../spec/backspace.md#backspace27)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> q

┃b
```

</td><td>

<!--obsidian-outliner-->
```buffer
> q
┃b
```

</td><td>

<!--ourus-->
```buffer
> q
> ┃b
```

</td></tr>
</table>

#### 25. [Backspace28](../../spec/backspace.md#backspace28)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
```
x
```
- ┃
````

</td><td>

<!--obsidian-outliner-->
````buffer
```
x
```
-┃
````

</td><td>

<!--ourus-->
````buffer
```
x┃
```
````

</td></tr>
</table>

#### 26. [Backspace33](../../spec/backspace.md#backspace33)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃a
- b
```

</td><td>

<!--obsidian-outliner-->
```buffer
-┃a
- b
```

</td><td>

<!--ourus-->
```buffer
┃a
- b
```

</td></tr>
</table>

#### 27. [Backspace35](../../spec/backspace.md#backspace35)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

<!--obsidian-outliner-->
```buffer
# A

intro

##┃B

para

- item

## C
```

</td><td>

<!--ourus-->
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

#### 28. [Cmd-Backspace › SoftBackspace1](../../spec/backspace.md#softbackspace1)

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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
┃def
```

</td><td>

<!--ourus-->
```buffer
- ┃def
```

</td></tr>
</table>

#### 29. [Cmd-Backspace › SoftBackspace2](../../spec/backspace.md#softbackspace2)

> deleteSoftLineBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
abc ┃[a]: tail
```

</td><td>

<!--obsidian-outliner-->
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

#### 30. [Cmd-Backspace › SoftBackspace3](../../spec/backspace.md#softbackspace3)

> deleteSoftLineBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
abc ┃- x tail
===
```

</td><td>

<!--obsidian-outliner-->
```buffer
- ┃x tail
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

#### 31. [Cmd-Backspace › SoftBackspace4](../../spec/backspace.md#softbackspace4)

> deleteSoftLineBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# abc ┃title #
```

</td><td>

<!--obsidian-outliner-->
```buffer
┃title #
```

</td><td>

<!--ourus-->
```buffer
# ┃title #
```

</td></tr>
</table>

#### 32. [Cmd-Backspace › SoftBackspace5](../../spec/backspace.md#softbackspace5)

> deleteSoftLineBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
first
abc ┃- x
===
```

</td><td>

<!--obsidian-outliner-->
```buffer
first
- ┃x
===
```

</td><td>

<!--ourus-->
```buffer
first
┃\- x
===
```

</td></tr>
</table>

#### 33. [Cmd-Backspace › SoftBackspace6](../../spec/backspace.md#softbackspace6)

> deleteSoftLineBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
title
=┃==
```

</td><td>

<!--obsidian-outliner-->
```buffer
title
┃==
```

</td><td>

<!--ourus-->
```buffer
title
=┃==
```

</td></tr>
</table>

#### 34. [Delete4](../../spec/del.md#delete4)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Title┃ #
- more
```

</td><td>

<!--obsidian-outliner-->
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

#### 35. [Delete4b](../../spec/del.md#delete4b)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Title #┃
- more
```

</td><td>

<!--obsidian-outliner-->
```buffer
# Title #┃- more
```

</td><td>

<!--ourus-->
```buffer
# Title┃more #
```

</td></tr>
</table>

#### 36. [Delete5](../../spec/del.md#delete5)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
  - a
    - b
  - c
- d
```

</td><td>

<!--obsidian-outliner-->
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

#### 37. [Delete5b](../../spec/del.md#delete5b)

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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
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

#### 38. [Delete5c](../../spec/del.md#delete5c)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- x
- ┃
  - a
    - b
```

</td><td>

<!--obsidian-outliner-->
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

#### 39. [Delete5d](../../spec/del.md#delete5d)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃ 
  - a
    - b
```

</td><td>

<!--obsidian-outliner-->
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

#### 40. [Delete9](../../spec/del.md#delete9)

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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
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

#### 41. [Delete10](../../spec/del.md#delete10)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
> q
```

</td><td>

<!--obsidian-outliner-->
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

#### 42. [Delete11](../../spec/del.md#delete11)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# H┃
    code
```

</td><td>

<!--obsidian-outliner-->
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

#### 43. [Delete13](../../spec/del.md#delete13)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
a┃

# H1
```

</td><td>

<!--obsidian-outliner-->
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

#### 44. [Delete13c](../../spec/del.md#delete13c)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
a┃

# H1
text
```

</td><td>

<!--obsidian-outliner-->
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

#### 45. [Delete13e](../../spec/del.md#delete13e)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
a┃

Title
=====
```

</td><td>

<!--obsidian-outliner-->
```buffer
a┃
Title
=====
```

</td><td>

<!--ourus-->
```buffer
a┃

Title
=====
```

</td></tr>
</table>

#### 46. [Delete14](../../spec/del.md#delete14)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
a┃

# H1

body
```

</td><td>

<!--obsidian-outliner-->
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

#### 47. [Delete17](../../spec/del.md#delete17)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Shopping:┃

- milk
- eggs
```

</td><td>

<!--obsidian-outliner-->
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

#### 48. [Delete17b](../../spec/del.md#delete17b)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
Shopping:┃

- milk
- eggs
```

</td></tr>
</table>

> deleteContentForward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
Shopping:┃
- milk
- eggs
```

</td></tr>
</table>

> deleteContentForward

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
Shopping:┃- milk
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

#### 49. [Delete18c](../../spec/del.md#delete18c)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
a┃


b
```

</td><td>

<!--obsidian-outliner-->
```buffer
a┃

b
```

</td><td>

<!--ourus-->
```buffer
a┃
b
```

</td></tr>
</table>

#### 50. [Enter1](../../spec/enter.md#enter1)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one two┃ three
- next
```

</td><td>

<!--obsidian-outliner-->
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

#### 51. [Enter3](../../spec/enter.md#enter3)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃ b
  - c
```

</td><td>

<!--obsidian-outliner-->
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

#### 52. [Enter3c](../../spec/enter.md#enter3c)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
9. a┃ b
   - c
10. d
```

</td><td>

<!--obsidian-outliner-->
```buffer
1. a
2. ┃ b
   - c
3. d
```

</td><td>

<!--ourus-->
```buffer
9. a
10. ┃b
    - c
11. d
```

</td></tr>
</table>

#### 53. [Enter6](../../spec/enter.md#enter6)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃
```

</td><td>

<!--obsidian-outliner-->
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

#### 54. [Enter7](../../spec/enter.md#enter7)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃
- b
```

</td><td>

<!--obsidian-outliner-->
```buffer
- a
┃
- b
```

</td><td>

<!--ourus-->
```buffer
- a
- 
- ┃
- b
```

</td></tr>
</table>

#### 55. [Enter7b](../../spec/enter.md#enter7b)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃
- b
```

</td><td>

<!--obsidian-outliner-->
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

#### 56. [Enter8](../../spec/enter.md#enter8)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc ┃- def
```

</td><td>

<!--obsidian-outliner-->
```buffer
- abc 
- ┃- def
```

</td><td>

<!--ourus-->
```buffer
- abc
- ┃\- def
```

</td></tr>
</table>

#### 57. [Enter9](../../spec/enter.md#enter9)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc ┃# def
```

</td><td>

<!--obsidian-outliner-->
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

#### 58. [Enter10](../../spec/enter.md#enter10)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc ┃<div>
```

</td><td>

<!--obsidian-outliner-->
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

#### 59. [Enter11](../../spec/enter.md#enter11)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
see ┃[a]: /url
```

</td><td>

<!--obsidian-outliner-->
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

#### 60. [Enter12](../../spec/enter.md#enter12)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
some┃ text
```

</td><td>

<!--obsidian-outliner-->
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

#### 61. [Enter14](../../spec/enter.md#enter14)

> enter enter enter "p"

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b┃
```

</td><td>

<!--obsidian-outliner-->
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

#### 62. [Enter15](../../spec/enter.md#enter15)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

- ┃

- b
```

</td><td>

<!--obsidian-outliner-->
```buffer
- a

┃

- b
```

</td><td>

<!--ourus-->
```buffer
- a

- 

- ┃

- b
```

</td></tr>
</table>

#### 63. [Enter16](../../spec/enter.md#enter16)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
lazy
```

</td><td>

<!--obsidian-outliner-->
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

#### 64. [Enter21](../../spec/enter.md#enter21)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
  - a
```

</td><td>

<!--obsidian-outliner-->
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

#### 65. [Enter22](../../spec/enter.md#enter22)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para ┃- x
- a
```

</td><td>

<!--obsidian-outliner-->
```buffer
para 
- ┃x
- a
```

</td><td>

<!--ourus-->
```buffer
para

┃\- x
- a
```

</td></tr>
</table>

#### 66. [Enter23](../../spec/enter.md#enter23)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
### H┃2
    - a
```

</td><td>

<!--obsidian-outliner-->
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

#### 67. [Enter25](../../spec/enter.md#enter25)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
8. z┃
9. a
   - child
10. b
```

</td><td>

<!--obsidian-outliner-->
```buffer
1. z
2. ┃
3. a
   - child
4. b
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

#### 68. [Enter26b](../../spec/enter.md#enter26b)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃b
```

</td><td>

<!--obsidian-outliner-->
```buffer
- a
  - 
  - ┃b
```

</td><td>

<!--ourus-->
```buffer
- a

  - 
  - ┃b
```

</td></tr>
</table>

#### 69. [Enter27](../../spec/enter.md#enter27)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b
  - ┃
  - c
```

</td><td>

<!--obsidian-outliner-->
```buffer
- a
  - b
  - c
- ┃
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

#### 70. [Enter28](../../spec/enter.md#enter28)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃
  - c
```

</td><td>

<!--obsidian-outliner-->
```buffer
- a
  - c
- ┃
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

#### 71. [Enter32](../../spec/enter.md#enter32)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para

# ┃Title

body
```

</td><td>

<!--obsidian-outliner-->
```buffer
para

# 
┃Title

body
```

</td><td>

<!--ourus-->
```buffer
para

┃

# Title

body
```

</td></tr>
</table>

#### 72. [Enter33](../../spec/enter.md#enter33)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
intro

┃hello
```

</td></tr>
</table>

> enter

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
intro


┃hello
```

</td><td>

<!--ourus-->
```buffer
intro

┃

hello
```

</td></tr>
</table>

> "x"

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
intro


x┃hello
```

</td><td>

<!--ourus-->
```buffer
intro

x┃

hello
```

</td></tr>
</table>

#### 73. [Enter35](../../spec/enter.md#enter35)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. abc ┃2. def
```

</td><td>

<!--obsidian-outliner-->
```buffer
1. abc 
2. ┃2. def
```

</td><td>

<!--ourus-->
```buffer
1. abc
2. ┃2\. def
```

</td></tr>
</table>

#### 74. [Enter36](../../spec/enter.md#enter36)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

- b┃
```

</td><td>

<!--obsidian-outliner-->
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

#### 75. [Enter36b](../../spec/enter.md#enter36b)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a
>
> - b┃
```

</td><td>

<!--obsidian-outliner-->
```buffer
> - a
>
> - b
> - ┃
```

</td><td>

<!--ourus-->
```buffer
> - a
>
> - b
>
> - ┃
```

</td></tr>
</table>

#### 76. [Enter37](../../spec/enter.md#enter37)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a
   text
   ┃
```

</td><td>

<!--obsidian-outliner-->
```buffer
1. a
   text
   
2. ┃
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

#### 77. [Enter40](../../spec/enter.md#enter40)

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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
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

> enter

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a

┃
```

</td></tr>
</table>

#### 78. [Enter41](../../spec/enter.md#enter41)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Title ┃- x
- y
```

</td><td>

<!--obsidian-outliner-->
```buffer
# Title 
- ┃x
- y
```

</td><td>

<!--ourus-->
```buffer
# Title
┃\- x
- y
```

</td></tr>
</table>

#### 79. [Enter42](../../spec/enter.md#enter42)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
title ┃- x
===
```

</td><td>

<!--obsidian-outliner-->
```buffer
title 
- ┃x
===
```

</td><td>

<!--ourus-->
```buffer
title
===
┃\- x
```

</td></tr>
</table>

#### 80. [Enter43](../../spec/enter.md#enter43)

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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
- abc
- ┃- def
```

</td><td>

<!--ourus-->
```buffer
- abc
- ┃\- def
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- abc┃- def
```

</td></tr>
</table>

#### 81. [Enter44](../../spec/enter.md#enter44)

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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
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

#### 82. [Enter45](../../spec/enter.md#enter45)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para
# ┃Title
```

</td><td>

<!--obsidian-outliner-->
```buffer
para
# 
┃Title
```

</td><td>

<!--ourus-->
```buffer
para

┃

# Title
```

</td></tr>
</table>

#### 83. [Enter46](../../spec/enter.md#enter46)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> ┃quote
```

</td><td>

<!--obsidian-outliner-->
```buffer
> 
> ┃quote
```

</td><td>

<!--ourus-->
```buffer
> ┃
>
> quote
```

</td></tr>
</table>

#### 84. [Fence7d](../../spec/fences.md#fence7d)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ```
  code
  ```┃

  para
````

</td><td>

<!--obsidian-outliner-->
````buffer
- a
  ```
  code
  ```
- ┃

  para
````

</td><td>

<!--ourus-->
````buffer
- a
  ```
  code
  ```
  ┃

  para
````

</td></tr>
</table>

#### 85. [Fence9](../../spec/fences.md#fence9)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
`┃``
code
```
````

</td><td>

<!--obsidian-outliner-->
````buffer
`
┃``
code
```
````

</td><td>

<!--ourus-->
````buffer
`┃``
code
```
````

</td></tr>
</table>

#### 86. [Fence12](../../spec/fences.md#fence12)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ┃```
  code
  ```
````

</td><td>

<!--obsidian-outliner-->
````buffer
- a
  
- ┃```
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

#### 87. [Fence14](../../spec/fences.md#fence14)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
```
code
``┃`
````

</td><td>

<!--obsidian-outliner-->
````buffer
```
code
``
┃`
````

</td><td>

<!--ourus-->
````buffer
```
code
``┃`
````

</td></tr>
</table>

#### 88. [Fence17](../../spec/fences.md#fence17)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ```
  ┃one
  ```
````

</td><td>

<!--obsidian-outliner-->
````buffer
- a
  ```┃one
  ```
````

</td><td>

<!--ourus-->
````buffer
- a
  ```
  ┃one
  ```
````

</td></tr>
</table>

#### 89. [Fence19](../../spec/fences.md#fence19)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ```
  one┃
  ```
````

</td><td>

<!--obsidian-outliner-->
````buffer
- a
  ```
  one┃```
````

</td><td>

<!--ourus-->
````buffer
- a
  ```
  one┃
  ```
````

</td></tr>
</table>

#### 90. [Fence20](../../spec/fences.md#fence20)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
> ```
> one
> ┃two
> ```
````

</td><td>

<!--obsidian-outliner-->
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

#### 91. [Fence22](../../spec/fences.md#fence22)

> shiftEnter enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  - b
    ```
    x
    ```┃
````

</td><td>

<!--obsidian-outliner-->
````buffer
- a
  - b
    ```
    x
    ```
    
  - ┃
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

#### 92. [Fence23](../../spec/fences.md#fence23)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ```
  one
  ┃```
````

</td><td>

<!--obsidian-outliner-->
````buffer
- a
  ```
  one┃```
````

</td><td>

<!--ourus-->
````buffer
- a
  ```
  one
  ┃```
````

</td></tr>
</table>

#### 93. [Fence24](../../spec/fences.md#fence24)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ```js┃
  one
  ```
````

</td><td>

<!--obsidian-outliner-->
````buffer
- a
  ```js┃one
  ```
````

</td><td>

<!--ourus-->
````buffer
- a
  ```js┃
  one
  ```
````

</td></tr>
</table>

#### 94. [Fence25](../../spec/fences.md#fence25)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ┃```
  one
  ```
````

</td><td>

<!--obsidian-outliner-->
````buffer
- a┃```
  one
  ```
````

</td><td>

<!--ourus-->
````buffer
- a
  ┃```
  one
  ```
````

</td></tr>
</table>

#### 95. [Fence26](../../spec/fences.md#fence26)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
- ┃```
  one
  ```
````

</td><td>

<!--obsidian-outliner-->
````buffer
- a┃```
  one
  ```
````

</td><td>

<!--ourus-->
````buffer
- a┃
  ```
  one
  ```
````

</td></tr>
</table>

#### 96. [Fence31](../../spec/fences.md#fence31)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

````buffer
- a
  ┃```
  code
  ```
````

</td></tr>
</table>

> enter

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
````buffer
- a
  
- ┃```
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

> deleteContentBackward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

````buffer
- a
  ┃```
  code
  ```
````

</td></tr>
</table>

#### 97. [Fence33](../../spec/fences.md#fence33)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
para
┃```
x
```
````

</td><td>

<!--obsidian-outliner-->
````buffer
para┃```
x
```
````

</td><td>

<!--ourus-->
````buffer
para
┃```
x
```
````

</td></tr>
</table>

#### 98. [Fence34](../../spec/fences.md#fence34)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a┃
- ```
  one
  ```
````

</td><td>

<!--obsidian-outliner-->
````buffer
- a┃```
  one
  ```
````

</td><td>

<!--ourus-->
````buffer
- a┃
  ```
  one
  ```
````

</td></tr>
</table>

#### 99. [Fence35](../../spec/fences.md#fence35)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ```
  one
  ```┃
- b
````

</td><td>

<!--obsidian-outliner-->
````buffer
- a
  ```
  one
  ```┃b
````

</td><td>

<!--ourus-->
````buffer
- a
  ```
  one
  ```┃
- b
````

</td></tr>
</table>

#### 100. [Fence36](../../spec/fences.md#fence36)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
```
``
┃`
body
```
````

</td><td>

<!--obsidian-outliner-->
````buffer
```
``┃`
body
```
````

</td><td>

<!--ourus-->
````buffer
```
``
┃`
body
```
````

</td></tr>
</table>

#### 101. [Fence37](../../spec/fences.md#fence37)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
```
``┃
`
body
```
````

</td><td>

<!--obsidian-outliner-->
````buffer
```
``┃`
body
```
````

</td><td>

<!--ourus-->
````buffer
```
``┃
`
body
```
````

</td></tr>
</table>

#### 102. [Fence38](../../spec/fences.md#fence38)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
```
x┃```
body
```
````

</td><td>

<!--obsidian-outliner-->
````buffer
```
x
┃```
body
```
````

</td><td>

<!--ourus-->
````buffer
```
x┃```
body
```
````

</td></tr>
</table>

#### 103. [Fence39](../../spec/fences.md#fence39)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
```
```┃x
body
```
````

</td><td>

<!--obsidian-outliner-->
````buffer
```
```
┃x
body
```
````

</td><td>

<!--ourus-->
````buffer
```
```┃x
body
```
````

</td></tr>
</table>

#### 104. [Fence40](../../spec/fences.md#fence40)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> ~~~
> ~~┃
> ~
> body
> ~~~
```

</td><td>

<!--obsidian-outliner-->
```buffer
> ~~~
> ~~┃> ~
> body
> ~~~
```

</td><td>

<!--ourus-->
```buffer
> ~~~
> ~~┃
> ~
> body
> ~~~
```

</td></tr>
</table>

#### 105. [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap1](../../spec/gaps.md#gap1)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
a

b┃

c
```

</td><td>

<!--obsidian-outliner-->
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

#### 106. [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap2](../../spec/gaps.md#gap2)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
a┃

b

c
```

</td><td>

<!--obsidian-outliner-->
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

#### 107. [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap3](../../spec/gaps.md#gap3)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# A
text

# B┃
more

# C
```

</td><td>

<!--obsidian-outliner-->
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

#### 108. [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap4](../../spec/gaps.md#gap4)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

- b┃
- c
```

</td><td>

<!--obsidian-outliner-->
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

#### 109. [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap5](../../spec/gaps.md#gap5)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - a1

- b┃
- c
```

</td><td>

<!--obsidian-outliner-->
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

#### 110. [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap6](../../spec/gaps.md#gap6)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
## A┃
a
## B
b
## C
```

</td><td>

<!--obsidian-outliner-->
```buffer
## A┃
a
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

#### 111. [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap7](../../spec/gaps.md#gap7)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
x┃
```
code
```

q
````

</td><td>

<!--obsidian-outliner-->
````buffer
x┃
```
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

#### 112. [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap9](../../spec/gaps.md#gap9)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- p
  - x

  - y┃

- q
```

</td><td>

<!--obsidian-outliner-->
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

#### 113. [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap10](../../spec/gaps.md#gap10)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
a

b┃

```

</td><td>

<!--obsidian-outliner-->
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

#### 114. [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap11](../../spec/gaps.md#gap11)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer

a┃

b

c
```

</td><td>

<!--obsidian-outliner-->
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

#### 115. [New text and gaps › Gap13](../../spec/gaps.md#gap13)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

<!--obsidian-outliner-->
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

#### 116. [Keys on a blank line › Gap14](../../spec/gaps.md#gap14)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
a

b
┃

c
```

</td><td>

<!--obsidian-outliner-->
```buffer
a

b
┃

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

#### 117. [Keys on a blank line › Gap15](../../spec/gaps.md#gap15)

> indent

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b
┃
- c
```

</td><td>

<!--obsidian-outliner-->
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

#### 118. [Keys on a blank line › Gap16](../../spec/gaps.md#gap16)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b
┃
- c
```

</td><td>

<!--obsidian-outliner-->
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

#### 119. [Keys on a blank line › Gap17](../../spec/gaps.md#gap17)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
┃
  b
- c
```

</td><td>

<!--obsidian-outliner-->
```buffer
- a
┃
  b
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

#### 120. [Indent3](../../spec/indent.md#indent3)

> indent

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
    * x
- b┃
```

</td><td>

<!--obsidian-outliner-->
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

#### 121. [Indent4](../../spec/indent.md#indent4)

> indent

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a
2. b┃
3. c
```

</td><td>

<!--obsidian-outliner-->
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

#### 122. [Indent12](../../spec/indent.md#indent12)

> indent

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# A
## B┃
### C
```

</td><td>

<!--obsidian-outliner-->
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

#### 123. [Indent13](../../spec/indent.md#indent13)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

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

> indent

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
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

> outdent

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

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

#### 124. [Indent15](../../spec/indent.md#indent15)

> indent

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a
   - x
   - y┃
5. b
9. c
```

</td><td>

<!--obsidian-outliner-->
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

#### 125. [Indent16](../../spec/indent.md#indent16)

> indent

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Title┃
=====

## Sub
```

</td><td>

<!--obsidian-outliner-->
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
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

#### 128. [Indent23](../../spec/indent.md#indent23)

> indent

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# A
## B
## C┃
### D
```

</td><td>

<!--obsidian-outliner-->
```buffer
# A
## B
  ## C┃
### D
```

</td><td>

<!--ourus-->
```buffer
# A
## B
### C┃
#### D
```

</td></tr>
</table>

#### 129. [Indent24](../../spec/indent.md#indent24)

> indent

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# A
###### B┃
```

</td><td>

<!--obsidian-outliner-->
```buffer
# A
  ###### B┃
```

</td><td>

<!--ourus-->
```buffer
# A
###### B┃
```

</td></tr>
</table>

#### 130. [Indent25](../../spec/indent.md#indent25)

> indent

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Title┃
-----

### Sub
```

</td><td>

<!--obsidian-outliner-->
```buffer
  Title┃
-----

### Sub
```

</td><td>

<!--ourus-->
```buffer
### Title┃

#### Sub
```

</td></tr>
</table>

#### 131. [Indent29](../../spec/indent.md#indent29)

> indent

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

para┃
```

</td><td>

<!--obsidian-outliner-->
```buffer
- a

  para┃
```

</td><td>

<!--ourus-->
```buffer
- a
  - para┃
```

</td></tr>
</table>

#### 132. [MoveDown1](../../spec/move-subtree-down.md#movedown1)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - a1

- b
```

</td><td>

<!--obsidian-outliner-->
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

#### 133. [MoveDown2](../../spec/move-subtree-down.md#movedown2)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# H
- a┃

para
```

</td><td>

<!--obsidian-outliner-->
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

#### 134. [MoveDown4](../../spec/move-subtree-down.md#movedown4)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
# A┃

text a

# B

text b
```

</td></tr>
</table>

> moveSubtreeDown

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
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

> moveSubtreeUp

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
# A┃

text a

# B

text b
```

</td></tr>
</table>

#### 135. [MoveDown5](../../spec/move-subtree-down.md#movedown5)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
one┃

two
```

</td><td>

<!--obsidian-outliner-->
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

#### 136. [MoveDown8](../../spec/move-subtree-down.md#movedown8)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b┃

para

- c
```

</td><td>

<!--obsidian-outliner-->
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

#### 137. [MoveDown11](../../spec/move-subtree-down.md#movedown11)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- «b
  - b1
- c»
- d
```

</td><td>

<!--obsidian-outliner-->
```buffer
- a
- «b
  - b1
- c»
- d
```

</td><td>

<!--ourus-->
```buffer
- a
- d
- «b
  - b1
- c»
```

</td></tr>
</table>

#### 138. [MoveDown12](../../spec/move-subtree-down.md#movedown12)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b
  - «c
    - c1
  - d»
- e
  - e1
```

</td></tr>
</table>

> moveSubtreeDown

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
- a
  - b
  - «c
    - c1
  - d»
- e
  - e1
```

</td><td>

<!--ourus-->
```buffer
- a
  - b
- e
  - «c
    - c1
  - d»
  - e1
```

</td></tr>
</table>

> moveSubtreeDown

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
- a
  - b
  - «c
    - c1
  - d»
- e
  - e1
```

</td><td>

<!--ourus-->
```buffer
- a
  - b
- e
  - e1
  - «c
    - c1
  - d»
```

</td></tr>
</table>

#### 139. [MoveDown13](../../spec/move-subtree-down.md#movedown13)

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

> moveSubtreeDown

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
- b┃
  - b1

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

> moveSubtreeUp

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

#### 140. [MoveDown14](../../spec/move-subtree-down.md#movedown14)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- «a
  - b»
- c
```

</td><td>

<!--obsidian-outliner-->
```buffer
- «a
  - b»
- c
```

</td><td>

<!--ourus-->
```buffer
- c
- «a
  - b»
```

</td></tr>
</table>

#### 141. [MoveDown16](../../spec/move-subtree-down.md#movedown16)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# A┃
- x
# B
- y
```

</td><td>

<!--obsidian-outliner-->
```buffer
# A┃
- x
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

#### 142. [MoveDown18](../../spec/move-subtree-down.md#movedown18)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Work
- email
- ┃review

# Home
- water
```

</td><td>

<!--obsidian-outliner-->
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

#### 143. [MoveDown20](../../spec/move-subtree-down.md#movedown20)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Todo
- one
- two┃

## Later
- three
```

</td><td>

<!--obsidian-outliner-->
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

#### 144. [MoveDown21](../../spec/move-subtree-down.md#movedown21)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a┃
  ```
  x

  y
  ```
- b
````

</td><td>

<!--obsidian-outliner-->
````buffer
- a┃
  ```
  x

  y
  ```
- b
````

</td><td>

<!--ourus-->
````buffer
- b
- a┃
  ```
  x

  y
  ```
````

</td></tr>
</table>

#### 145. [MoveDown23](../../spec/move-subtree-down.md#movedown23)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
9. a┃
   - x
10. b
```

</td><td>

<!--obsidian-outliner-->
```buffer
1. b
2. a┃
   - x
```

</td><td>

<!--ourus-->
```buffer
9. b
10. a┃
    - x
```

</td></tr>
</table>

#### 146. [MoveDown24](../../spec/move-subtree-down.md#movedown24)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para┃
- a

last
```

</td><td>

<!--obsidian-outliner-->
```buffer
para┃
- a

last
```

</td><td>

<!--ourus-->
```buffer
last

para┃
- a
```

</td></tr>
</table>

#### 147. [MoveDown26](../../spec/move-subtree-down.md#movedown26)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Work
- review┃

# Home
para
```

</td><td>

<!--obsidian-outliner-->
```buffer
# Work
- review┃

# Home
para
```

</td><td>

<!--ourus-->
```buffer
# Work

# Home
- review┃

para
```

</td></tr>
</table>

#### 148. [MoveDown27](../../spec/move-subtree-down.md#movedown27)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# A
## s┃

# B
## t
```

</td><td>

<!--obsidian-outliner-->
```buffer
# A
## s┃

# B
## t
```

</td><td>

<!--ourus-->
```buffer
# A

# B
## s┃
## t
```

</td></tr>
</table>

#### 149. [MoveDown28](../../spec/move-subtree-down.md#movedown28)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# A
## sub
- s1

┃para

# B
```

</td><td>

<!--obsidian-outliner-->
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

# B
┃para
```

</td></tr>
</table>

#### 150. [MoveDown29](../../spec/move-subtree-down.md#movedown29)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
pa┃ra
1. a
- b

next
```

</td><td>

<!--obsidian-outliner-->
```buffer
pa┃ra
1. a
- b

next
```

</td><td>

<!--ourus-->
```buffer
next

pa┃ra
1. a
- b
```

</td></tr>
</table>

#### 151. [MoveDown30](../../spec/move-subtree-down.md#movedown30)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
9. a┃
10. b
    - x
```

</td><td>

<!--obsidian-outliner-->
```buffer
1. b
    - x
2. a┃
```

</td><td>

<!--ourus-->
```buffer
9. b
   - x
10. a┃
```

</td></tr>
</table>

#### 152. [MoveDown31](../../spec/move-subtree-down.md#movedown31)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para┃

---
```

</td><td>

<!--obsidian-outliner-->
```buffer
para┃

---
```

</td><td>

<!--ourus-->
```buffer
---

para┃
```

</td></tr>
</table>

#### 153. [MoveUp3](../../spec/move-subtree-up.md#moveup3)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# A

text a

# B┃

text b
```

</td><td>

<!--obsidian-outliner-->
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

#### 154. [MoveUp4](../../spec/move-subtree-up.md#moveup4)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
one

two┃
```

</td><td>

<!--obsidian-outliner-->
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

#### 155. [MoveUp7](../../spec/move-subtree-up.md#moveup7)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

para

- b┃
- c
```

</td><td>

<!--obsidian-outliner-->
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

#### 156. [MoveUp10](../../spec/move-subtree-up.md#moveup10)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- «b
  - b1
- c»
- d
```

</td><td>

<!--obsidian-outliner-->
```buffer
- a
- «b
  - b1
- c»
- d
```

</td><td>

<!--ourus-->
```buffer
- «b
  - b1
- c»
- a
- d
```

</td></tr>
</table>

#### 157. [MoveUp11](../../spec/move-subtree-up.md#moveup11)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - a1
- b
  - «c
    - c1
  - d»
  - e
```

</td><td>

<!--obsidian-outliner-->
```buffer
- a
  - a1
- b
  - «c
    - c1
  - d»
  - e
```

</td><td>

<!--ourus-->
```buffer
- a
  - a1
  - «c
    - c1
  - d»
- b
  - e
```

</td></tr>
</table>

#### 158. [MoveUp12](../../spec/move-subtree-up.md#moveup12)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
intro

- b┃
  - b1
```

</td><td>

<!--obsidian-outliner-->
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

#### 159. [MoveUp13](../../spec/move-subtree-up.md#moveup13)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

<!--obsidian-outliner-->
````buffer
- b┃
  ```
  x
- a

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

#### 160. [MoveUp15](../../spec/move-subtree-up.md#moveup15)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
9. a
   - x
10. b┃
```

</td><td>

<!--obsidian-outliner-->
```buffer
1. b
2. ┃a
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

#### 161. [MoveUp16](../../spec/move-subtree-up.md#moveup16)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# A
## a1
# B┃
## b1
```

</td><td>

<!--obsidian-outliner-->
```buffer
# A
## a1
# B┃
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

#### 162. [MoveUp17](../../spec/move-subtree-up.md#moveup17)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
first

para┃
- a
```

</td><td>

<!--obsidian-outliner-->
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

#### 163. [MoveUp18](../../spec/move-subtree-up.md#moveup18)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
→- a
┃para
```

</td><td>

<!--obsidian-outliner-->
```buffer
→- a
┃para
```

</td><td>

<!--ourus-->
```buffer
┃para

→- a
```

</td></tr>
</table>

#### 164. [MoveUp19](../../spec/move-subtree-up.md#moveup19)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
---
para┃
```

</td><td>

<!--obsidian-outliner-->
```buffer
---
para┃
```

</td><td>

<!--ourus-->
```buffer
para┃

---
```

</td></tr>
</table>

#### 165. [MoveUp20](../../spec/move-subtree-up.md#moveup20)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
[a]: /u
para┃
```

</td><td>

<!--obsidian-outliner-->
```buffer
[a]: /u
para┃
```

</td><td>

<!--ourus-->
```buffer
para┃

[a]: /u
```

</td></tr>
</table>

#### 166. [MoveUp21](../../spec/move-subtree-up.md#moveup21)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para
- a┃
- b
```

</td><td>

<!--obsidian-outliner-->
```buffer
para
- a┃
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

#### 167. [MoveUp22](../../spec/move-subtree-up.md#moveup22)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Work
- email

# Home
- ┃review
- water
```

</td><td>

<!--obsidian-outliner-->
```buffer
# Work
- email

# Home
- ┃review
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

#### 168. [MoveUp23](../../spec/move-subtree-up.md#moveup23)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# A
## sub
- s1

# B
┃para
```

</td><td>

<!--obsidian-outliner-->
```buffer
# A
## sub
- s1

# B
┃para
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

#### 169. [MoveUp24](../../spec/move-subtree-up.md#moveup24)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Todo
- one

## Later
- ┃two
- three
```

</td><td>

<!--obsidian-outliner-->
```buffer
# Todo
- one

## Later
- ┃two
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

#### 170. [MoveUp25](../../spec/move-subtree-up.md#moveup25)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

- b┃
  - b1
```

</td><td>

<!--obsidian-outliner-->
```buffer
- a

- b┃
  - b1
```

</td><td>

<!--ourus-->
```buffer
- b┃
  - b1

- a
```

</td></tr>
</table>

#### 171. [MoveUp26](../../spec/move-subtree-up.md#moveup26)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
# A
- x

# B
## s┃
- y
```

</td></tr>
</table>

> moveSubtreeUp

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
# A
- x

# B
## s┃
- y
```

</td><td>

<!--ourus-->
```buffer
# A
- x
## s┃
- y

# B
```

</td></tr>
</table>

> moveSubtreeDown

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
# A
- x

# B
## s┃
- y
```

</td></tr>
</table>

#### 172. [MoveUp27](../../spec/move-subtree-up.md#moveup27)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
# Work
para

# Home
- ┃review
```

</td></tr>
</table>

> moveSubtreeUp

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
# Work
para

# Home
- ┃review
```

</td><td>

<!--ourus-->
```buffer
# Work
para
- ┃review

# Home
```

</td></tr>
</table>

> moveSubtreeDown

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
# Work
para

# Home
- ┃review
```

</td></tr>
</table>

#### 173. [MoveUp29](../../spec/move-subtree-up.md#moveup29)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# H
- ┃a
- b
```

</td><td>

<!--obsidian-outliner-->
```buffer
# H
- ┃a
- b
```

</td><td>

<!--ourus-->
```buffer
- ┃a
# H
- b
```

</td></tr>
</table>

#### 174. [MoveUp30](../../spec/move-subtree-up.md#moveup30)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
[a]: /u
    ┃code
```

</td><td>

<!--obsidian-outliner-->
```buffer
[a]: /u
    ┃code
```

</td><td>

<!--ourus-->
```buffer
┃code

[a]: /u
```

</td></tr>
</table>

#### 175. [MoveUp31](../../spec/move-subtree-up.md#moveup31)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- c
- «a
  - b»
```

</td><td>

<!--obsidian-outliner-->
```buffer
- c
- «a
  - b»
```

</td><td>

<!--ourus-->
```buffer
- «a
  - b»
- c
```

</td></tr>
</table>

#### 176. [MoveUp35](../../spec/move-subtree-up.md#moveup35)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
para
> q┃
- a
```

</td></tr>
</table>

> moveSubtreeUp

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
para
> q┃
- a
```

</td><td>

<!--ourus-->
```buffer
> q┃

para
- a
```

</td></tr>
</table>

> moveSubtreeDown

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
para
> q┃
- a
```

</td><td>

<!--ourus-->
```buffer
para
- a

> q┃
```

</td></tr>
</table>

#### 177. [Enter › #228 › Renumbering stops at a delimiter change](../../spec/obsidian-true-outliner.md#renumbering-stops-at-a-delimiter-change)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a┃
1) b
2) c
```

</td><td>

<!--obsidian-outliner-->
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

#### 178. [Enter › E4](../../spec/obsidian-true-outliner.md#e4)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- first
  second┃ line
```

</td><td>

<!--obsidian-outliner-->
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

#### 179. [Enter › E9](../../spec/obsidian-true-outliner.md#e9)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
one┃ two
- child
```

</td><td>

<!--obsidian-outliner-->
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

#### 180. [Enter › E10](../../spec/obsidian-true-outliner.md#e10)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- item┃

  para
```

</td><td>

<!--obsidian-outliner-->
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

#### 181. [Enter › E17](../../spec/obsidian-true-outliner.md#e17)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Hello┃ world
====
```

</td><td>

<!--obsidian-outliner-->
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

#### 182. [Enter › E18](../../spec/obsidian-true-outliner.md#e18)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Hello world
==┃==
```

</td><td>

<!--obsidian-outliner-->
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

#### 183. [Enter › E32 › Task checkbox carries over unchecked](../../spec/obsidian-true-outliner.md#task-checkbox-carries-over-unchecked)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] alpha┃ beta
```

</td><td>

<!--obsidian-outliner-->
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

#### 184. [Enter › #267, E5](../../spec/obsidian-true-outliner.md#267-e5)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# H
para┃ text
> q
```

</td><td>

<!--obsidian-outliner-->
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

#### 185. [Enter › E14, E20 › Split title above an existing paragraph](../../spec/obsidian-true-outliner.md#split-title-above-an-existing-paragraph)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Head┃line
Body.
```

</td><td>

<!--obsidian-outliner-->
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

#### 186. [Enter › E14, E20 › End of heading above a paragraph](../../spec/obsidian-true-outliner.md#end-of-heading-above-a-paragraph)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Head┃
Body.
```

</td><td>

<!--obsidian-outliner-->
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

#### 187. [Shift-Enter › S4](../../spec/obsidian-true-outliner.md#s4)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
one┃ two
```

</td><td>

<!--obsidian-outliner-->
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

#### 188. [Shift-Enter › S7, S8 › Line break in setext title refused](../../spec/obsidian-true-outliner.md#line-break-in-setext-title-refused)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Hello┃ world
====
```

</td><td>

<!--obsidian-outliner-->
```buffer
Hello
┃ world
====
```

</td><td>

<!--ourus-->
```buffer
Hello┃ world
====
```

</td></tr>
</table>

#### 189. [Shift-Enter › S7, S8 › Line break in setext underline refused](../../spec/obsidian-true-outliner.md#line-break-in-setext-underline-refused)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Hello world
==┃==
```

</td><td>

<!--obsidian-outliner-->
```buffer
Hello world
==
┃==
```

</td><td>

<!--ourus-->
```buffer
Hello world
==┃==
```

</td></tr>
</table>

#### 190. [Shift-Enter › S9](../../spec/obsidian-true-outliner.md#s9)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- item

  para┃ text
```

</td><td>

<!--obsidian-outliner-->
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

#### 191. [Shift-Enter › S11 › Leaving the place removes it](../../spec/obsidian-true-outliner.md#leaving-the-place-removes-it)

> shiftEnter cursorDocStart

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
foo┃
bar
```

</td><td>

<!--obsidian-outliner-->
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

#### 192. [Shift-Enter › S13](../../spec/obsidian-true-outliner.md#s13)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a«lpha» beta
```

</td><td>

<!--obsidian-outliner-->
```buffer
- a
 ┃beta
```

</td><td>

<!--ourus-->
```buffer
- a
  ┃beta
```

</td></tr>
</table>

#### 193. [Backspace › Joining an item with children › Children move to the joined node](../../spec/obsidian-true-outliner.md#children-move-to-the-joined-node)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃b
    - c
```

</td><td>

<!--obsidian-outliner-->
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

#### 194. [Backspace › Joining an item with children › Delete forward absorbs child with grandchildren](../../spec/obsidian-true-outliner.md#delete-forward-absorbs-child-with-grandchildren)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - b
    - c
```

</td><td>

<!--obsidian-outliner-->
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

#### 195. [Backspace › Joining away the head of a list › List starting at 3 keeps its start](../../spec/obsidian-true-outliner.md#list-starting-at-3-keeps-its-start)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
3. a
4. ┃b
5. c
```

</td><td>

<!--obsidian-outliner-->
```buffer
1. a┃b
2. c
```

</td><td>

<!--ourus-->
```buffer
3. a┃b
4. c
```

</td></tr>
</table>

#### 196. [Indentation › list-marker-content-column](../../spec/obsidian-true-outliner.md#list-marker-content-column)

> indent

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
-  parent
-  kid┃
```

</td><td>

<!--obsidian-outliner-->
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

#### 197. [Indentation › seams-across-a-re-indent › Indented item keeps its thematic break](../../spec/obsidian-true-outliner.md#indented-item-keeps-its-thematic-break)

> indent

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b┃

  ---
```

</td><td>

<!--obsidian-outliner-->
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

#### 198. [Indentation › seams-across-a-re-indent › Outdented item keeps its code block](../../spec/obsidian-true-outliner.md#outdented-item-keeps-its-code-block)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b┃

        code
```

</td><td>

<!--obsidian-outliner-->
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

#### 199. [Indentation › destination-list-style](../../spec/obsidian-true-outliner.md#destination-list-style)

> indent

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
* a
  * x
- b┃
```

</td><td>

<!--obsidian-outliner-->
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

#### 200. [Moving › lone-block-id › Block id moves with its paragraph](../../spec/obsidian-true-outliner.md#block-id-moves-with-its-paragraph)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para one
^blk

para┃ two
```

</td><td>

<!--obsidian-outliner-->
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

#### 201. [Moving › lazy-continuation-at-seams › Blank line added below a quote](../../spec/obsidian-true-outliner.md#blank-line-added-below-a-quote)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para┃
> q
```

</td><td>

<!--obsidian-outliner-->
```buffer
para┃
> q
```

</td><td>

<!--ourus-->
```buffer
> q

para┃
```

</td></tr>
</table>

#### 202. [Moving › lazy-continuation-at-seams › No blank line needed after a fence](../../spec/obsidian-true-outliner.md#no-blank-line-needed-after-a-fence)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
para┃
```
code
```
````

</td><td>

<!--obsidian-outliner-->
````buffer
para┃
```
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

#### 203. [Moving › lazy-continuation-at-seams › No blank line needed before a fence](../../spec/obsidian-true-outliner.md#no-blank-line-needed-before-a-fence)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
```
code┃
```
para
````

</td><td>

<!--obsidian-outliner-->
````buffer
```
code┃
```
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

#### 204. [Abandoning an empty place › Shift-Enter, Tab, then leave › Carried place removed on leaving](../../spec/obsidian-true-outliner.md#carried-place-removed-on-leaving)

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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
- ┃one
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

#### 205. [Abandoning an empty place › Shift-Enter, Tab, then leave › Doubly indented place removed on leaving](../../spec/obsidian-true-outliner.md#doubly-indented-place-removed-on-leaving)

> shiftEnter indent indent cursorDocStart

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - kid
  - sib
- foo┃
```

</td><td>

<!--obsidian-outliner-->
```buffer
- ┃one
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

#### 206. [Abandoning an empty place › Shift-Enter, Tab, then Enter](../../spec/obsidian-true-outliner.md#shift-enter-tab-then-enter)

> shiftEnter indent enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - kid
- foo┃
- bar
```

</td><td>

<!--obsidian-outliner-->
```buffer
- one
  - kid
  - foo
    
  - ┃
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

#### 207. [Abandoning an empty place › Enter, Tab, then leave › An empty ordered child kept with a blank line](../../spec/obsidian-true-outliner.md#an-empty-ordered-child-kept-with-a-blank-line)

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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
1. ┃a
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

#### 208. [Abandoning an empty place › Enter, Tab, then leave › Blank line after the list stays](../../spec/obsidian-true-outliner.md#blank-line-after-the-list-stays)

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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
- ┃foo
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

#### 209. [Abandoning an empty place › Enter twice, then leave › Empty paragraph and blank lines removed](../../spec/obsidian-true-outliner.md#empty-paragraph-and-blank-lines-removed)

> enter enter cursorDocStart

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

<!--obsidian-outliner-->
```buffer
- ┃a

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

#### 210. [Abandoning an empty place › Enter twice, then leave › Indented list under paragraph restored](../../spec/obsidian-true-outliner.md#indented-list-under-paragraph-restored)

> enter enter cursorDocStart

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para
  - a┃
  - b
```

</td><td>

<!--obsidian-outliner-->
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

#### 211. [Paste › #216 › Pasted list takes space indent unit](../../spec/obsidian-true-outliner.md#pasted-list-takes-space-indent-unit)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

<!--obsidian-outliner-->
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

#### 212. [Paste › #216 › Pasted list takes tab indent unit](../../spec/obsidian-true-outliner.md#pasted-list-takes-tab-indent-unit)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

<!--obsidian-outliner-->
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

#### 213. [Paste › #264 › Pasted quote set off from paragraph](../../spec/obsidian-true-outliner.md#pasted-quote-set-off-from-paragraph)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

<!--obsidian-outliner-->
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

#### 214. [Paste › #197 › Pasted list and block become children](../../spec/obsidian-true-outliner.md#pasted-list-and-block-become-children)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

<!--obsidian-outliner-->
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

#### 215. [Outdent4](../../spec/outdent.md#outdent4)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
## A┃
### B
```

</td><td>

<!--obsidian-outliner-->
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

#### 216. [Outdent7](../../spec/outdent.md#outdent7)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃x
  - 
```

</td><td>

<!--obsidian-outliner-->
```buffer
- a
  - 
- ┃x
```

</td><td>

<!--ourus-->
```buffer
- a
- ┃x

  - 
```

</td></tr>
</table>

#### 217. [Outdent8](../../spec/outdent.md#outdent8)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para
- «a
  - b
- c»
```

</td><td>

<!--obsidian-outliner-->
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

#### 218. [Outdent11](../../spec/outdent.md#outdent11)

> outdent

Also: [outdent.md › Logical outdent › LogicalOutdent5](../../spec/outdent.md#logicaloutdent5)

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# T
## A┃
## B
```

</td><td>

<!--obsidian-outliner-->
```buffer
# T
## A┃
## B
```

</td><td>

<!--ourus-->
```buffer
# T
# A┃
## B
```

</td></tr>
</table>

#### 219. [Outdent12](../../spec/outdent.md#outdent12)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- «a
- b»
```

</td><td>

<!--obsidian-outliner-->
```buffer
- «a
- b»
```

</td><td>

<!--ourus-->
```buffer
«a

b»
```

</td></tr>
</table>

#### 220. [Outdent13](../../spec/outdent.md#outdent13)

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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
- a
  - d
- b┃
  - c
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

> indent

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
- a
  - d
  - b┃
    - c
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

#### 221. [Outdent15](../../spec/outdent.md#outdent15)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
para
- b┃
```

</td></tr>
</table>

> outdent

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
para
- b┃
```

</td><td>

<!--ourus-->
```buffer
para

b┃
```

</td></tr>
</table>

> indent

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
para
- b┃
```

</td></tr>
</table>

#### 222. [Direct outdent › DirectOutdent1](../../spec/outdent.md#directoutdent1)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b┃
    - b1
  - c
- d
```

</td><td>

<!--obsidian-outliner-->
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

#### 223. [Direct outdent › DirectOutdent2](../../spec/outdent.md#directoutdent2)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

<!--obsidian-outliner-->
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

#### 224. [Direct outdent › DirectOutdent3](../../spec/outdent.md#directoutdent3)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - a1
- b
```

</td><td>

<!--obsidian-outliner-->
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

#### 225. [Direct outdent › DirectOutdent4](../../spec/outdent.md#directoutdent4)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para
- a┃
- b
```

</td><td>

<!--obsidian-outliner-->
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

#### 226. [Logical outdent › LogicalOutdent2](../../spec/outdent.md#logicaloutdent2)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

<!--obsidian-outliner-->
```buffer
- a┃
- b
```

</td><td>

<!--ourus-->
```buffer
- b

a┃
```

</td></tr>
</table>

#### 227. [Logical outdent › LogicalOutdent3](../../spec/outdent.md#logicaloutdent3)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - a1
- b
```

</td><td>

<!--obsidian-outliner-->
```buffer
- a┃
  - a1
- b
```

</td><td>

<!--ourus-->
```buffer
- b

a┃
- a1
```

</td></tr>
</table>

#### 228. [Logical outdent › LogicalOutdent4](../../spec/outdent.md#logicaloutdent4)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para
- a┃
- b
```

</td><td>

<!--obsidian-outliner-->
```buffer
para
- a┃
- b
```

</td><td>

<!--ourus-->
```buffer
para
- b

a┃
```

</td></tr>
</table>

#### 229. [Paste1](../../spec/paste.md#paste1)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

<!--obsidian-outliner-->
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
  c┃
  ```
- b
````

</td></tr>
</table>

#### 230. [Paste2](../../spec/paste.md#paste2)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

<!--obsidian-outliner-->
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
4. b
```

</td></tr>
</table>

#### 231. [Paste3](../../spec/paste.md#paste3)

> pastePlain

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

<!--obsidian-outliner-->
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

#### 232. [Paste4](../../spec/paste.md#paste4)

> pastePlain

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

<!--obsidian-outliner-->
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

#### 233. [Paste5](../../spec/paste.md#paste5)

> pastePlain

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

<!--obsidian-outliner-->
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

#### 234. [Paste6](../../spec/paste.md#paste6)

> pastePlain

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
x
y
```

</td><td>

```buffer
# H┃
```

</td><td>

<!--obsidian-outliner-->
```buffer
# Hx
y
┃
```

</td><td>

<!--ourus-->
```buffer
# H┃
```

</td></tr>
</table>

#### 235. [Paste7](../../spec/paste.md#paste7)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

<!--obsidian-outliner-->
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

#### 236. [Paste9](../../spec/paste.md#paste9)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

<!--obsidian-outliner-->
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

#### 237. [Paste10](../../spec/paste.md#paste10)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

<!--obsidian-outliner-->
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
  y
  ┃
```

</td></tr>
</table>

#### 238. [Paste11](../../spec/paste.md#paste11)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

<!--obsidian-outliner-->
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

#### 239. [Paste12](../../spec/paste.md#paste12)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

<!--obsidian-outliner-->
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
- > q
  > r┃
```

</td></tr>
</table>

#### 240. [Paste13](../../spec/paste.md#paste13)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

<!--obsidian-outliner-->
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

#### 241. [Paste14](../../spec/paste.md#paste14)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

<!--obsidian-outliner-->
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

#### 242. [Paste15](../../spec/paste.md#paste15)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

<!--obsidian-outliner-->
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

#### 243. [Paste16](../../spec/paste.md#paste16)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

<!--obsidian-outliner-->
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
3. b
```

</td></tr>
</table>

#### 244. [Paste17](../../spec/paste.md#paste17)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

<!--obsidian-outliner-->
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

#### 245. [Paste18](../../spec/paste.md#paste18)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

<!--obsidian-outliner-->
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
2. x
3. y┃
4. b
```

</td></tr>
</table>

#### 246. [Paste19](../../spec/paste.md#paste19)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

<!--obsidian-outliner-->
```buffer
- a# h
text
┃
```

</td><td>

<!--ourus-->
```buffer
- a
- # h
  text┃
```

</td></tr>
</table>

#### 247. [Paste20](../../spec/paste.md#paste20)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

<!--obsidian-outliner-->
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

#### 248. [Paste21](../../spec/paste.md#paste21)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

<!--obsidian-outliner-->
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

#### 249. [Paste22](../../spec/paste.md#paste22)

> pastePlain

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

<!--obsidian-outliner-->
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

#### 250. [Paste23](../../spec/paste.md#paste23)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

<!--obsidian-outliner-->
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

#### 251. [Paste25](../../spec/paste.md#paste25)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

<!--obsidian-outliner-->
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
  ```
  c┃
  ```
  - kid
- b
````

</td></tr>
</table>

#### 252. [Paste26](../../spec/paste.md#paste26)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

<!--obsidian-outliner-->
```buffer
- a- x
┃
- b
```

</td><td>

<!--ourus-->
```buffer
- a
- x┃
- b
```

</td></tr>
</table>

#### 253. [Paste27](../../spec/paste.md#paste27)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

<!--obsidian-outliner-->
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

#### 254. [Paste28](../../spec/paste.md#paste28)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
> [!note] t
> body
```

</td><td>

```buffer
- a┃
- b
```

</td><td>

<!--obsidian-outliner-->
```buffer
- a> [!note] t
> body
┃
- b
```

</td><td>

<!--ourus-->
```buffer
- a
  > [!note] t
  > body┃
- b
```

</td></tr>
</table>

#### 255. [Paste29](../../spec/paste.md#paste29)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
- alpha

> note
```

</td><td>

```buffer
- top┃
- next
```

</td><td>

<!--obsidian-outliner-->
```buffer
- top- alpha

> note
┃
- next
```

</td><td>

<!--ourus-->
```buffer
- top
- alpha
  > note┃
- next
```

</td></tr>
</table>

#### 256. [Paste30](../../spec/paste.md#paste30)

> pastePlain

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
x
2. y
```

</td><td>

```buffer
- a┃
```

</td><td>

<!--obsidian-outliner-->
```buffer
- ax
2. y┃
```

</td><td>

<!--ourus-->
```buffer
- ax
  2\. y┃
```

</td></tr>
</table>

#### 257. [Paste32](../../spec/paste.md#paste32)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
# h
```

</td><td>

```buffer
para┃
```

</td><td>

<!--obsidian-outliner-->
```buffer
para# h
┃
```

</td><td>

<!--ourus-->
```buffer
para

# h┃
```

</td></tr>
</table>

#### 258. [Paste33](../../spec/paste.md#paste33)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
## h
```

</td><td>

```buffer
## A

para┃
```

</td><td>

<!--obsidian-outliner-->
```buffer
## A

para## h
┃
```

</td><td>

<!--ourus-->
```buffer
## A

para

## h┃
```

</td></tr>
</table>

#### 259. [Paste34](../../spec/paste.md#paste34)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
# h
```

</td><td>

```buffer
para┃

next
```

</td><td>

<!--obsidian-outliner-->
```buffer
para# h
┃

next
```

</td><td>

<!--ourus-->
```buffer
para

# h┃

next
```

</td></tr>
</table>

#### 260. [Paste35](../../spec/paste.md#paste35)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
## h
```

</td><td>

```buffer
## A

para┃

more

### C

## B
```

</td><td>

<!--obsidian-outliner-->
```buffer
## A

para## h
┃

more

### C

## B
```

</td><td>

<!--ourus-->
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

#### 261. [Paste36](../../spec/paste.md#paste36)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

<!--obsidian-outliner-->
```buffer
- list
  - See x
- y
┃here.
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

#### 262. [Paste37](../../spec/paste.md#paste37)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
x
- y
```

</td><td>

```buffer
See ┃here.
```

</td><td>

<!--obsidian-outliner-->
```buffer
See x
- y
┃here.
```

</td><td>

<!--ourus-->
```buffer
See x
- y

┃here.
```

</td></tr>
</table>

#### 263. [Paste40](../../spec/paste.md#paste40)

> pastePlain

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

<!--obsidian-outliner-->
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

  y
  ┃b
- c
```

</td></tr>
</table>

#### 264. [Paste41](../../spec/paste.md#paste41)

> pastePlain

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
x

y
```

</td><td>

```buffer
> See ┃here.
```

</td><td>

<!--obsidian-outliner-->
```buffer
> See x

y
┃here.
```

</td><td>

<!--ourus-->
```buffer
> See x
>
> y
> ┃here.
```

</td></tr>
</table>

#### 265. [Paste42](../../spec/paste.md#paste42)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

<!--obsidian-outliner-->
```buffer
- a- x
- y
┃b
  - child
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

#### 266. [Paste44](../../spec/paste.md#paste44)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

<!--obsidian-outliner-->
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

#### 267. [Paste45](../../spec/paste.md#paste45)

> pastePlain

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

<!--obsidian-outliner-->
```buffer
- a$$
x^2
$$
┃b
```

</td><td>

<!--ourus-->
```buffer
- a$$
  x^2
  \$$
  ┃b
```

</td></tr>
</table>

#### 268. [Paste46](../../spec/paste.md#paste46)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

````clipboard
```js
code
```
````

</td><td>

````buffer
- list
  ```js
  code
  ```┃
````

</td><td>

<!--obsidian-outliner-->
```````buffer
- list
  ```js
  code
  ``````js
code
```
┃
```````

</td><td>

<!--ourus-->
````buffer
- list
  ```js
  code
  ```

  ```js
  code┃
  ```
````

</td></tr>
</table>

#### 269. [Paste47](../../spec/paste.md#paste47)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
one
two
```

</td><td>

````buffer
```
x
```┃
````

</td><td>

<!--obsidian-outliner-->
````buffer
```
x
```one
two
┃
````

</td><td>

<!--ourus-->
````buffer
```
x
```

one
two┃
````

</td></tr>
</table>

#### 270. [Placeholder1](../../spec/placeholders.md#placeholder1)

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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
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

#### 271. [Placeholder2](../../spec/placeholders.md#placeholder2)

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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
- ┃a

```

</td><td>

<!--ourus-->
```buffer
┃- a
```

</td></tr>
</table>

#### 272. [Placeholder3](../../spec/placeholders.md#placeholder3)

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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
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

#### 273. [Placeholder4](../../spec/placeholders.md#placeholder4)

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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
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

#### 274. [Placeholder5](../../spec/placeholders.md#placeholder5)

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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
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

#### 275. [Placeholder7](../../spec/placeholders.md#placeholder7)

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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
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

#### 276. [Placeholder9](../../spec/placeholders.md#placeholder9)

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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
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

#### 277. [Placeholder13](../../spec/placeholders.md#placeholder13)

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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
# H1

┃
## H2
```

</td><td>

<!--ourus-->
```buffer
# H1

## ┃H2
```

</td></tr>
</table>

#### 278. [Placeholder14](../../spec/placeholders.md#placeholder14)

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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
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

#### 279. [Placeholder15](../../spec/placeholders.md#placeholder15)

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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
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

#### 280. [Placeholder16](../../spec/placeholders.md#placeholder16)

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
  -┃« »
```

</td></tr>
</table>

> cursorCharRight

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃
```

</td></tr>
</table>

> selectDocStart

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
┃«- a
  - »
```

</td><td>

<!--ourus-->
```buffer
┃«- a

  - »
```

</td></tr>
</table>

#### 281. [Quote1](../../spec/quotes.md#quote1)

> indent

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- > - a
  > - b┃
```

</td><td>

<!--obsidian-outliner-->
```buffer
- > - a
  > - b┃
```

</td><td>

<!--ourus-->
```buffer
- > - a
  >   - b┃
```

</td></tr>
</table>

#### 282. [Indent inside a quote › Quote2](../../spec/quotes.md#quote2)

> indent

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a
> - b┃
```

</td><td>

<!--obsidian-outliner-->
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

#### 283. [Indent inside a quote › Quote3](../../spec/quotes.md#quote3)

> indent

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
>- a
>- b┃
```

</td><td>

<!--obsidian-outliner-->
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

#### 284. [Indent inside a quote › Quote5](../../spec/quotes.md#quote5)

> indent

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- x
  > - a
  > - b┃
```

</td><td>

<!--obsidian-outliner-->
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
  >   - b┃
```

</td></tr>
</table>

#### 285. [Indent inside a quote › Quote6](../../spec/quotes.md#quote6)

> indent

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> > - a
> > - b┃
```

</td><td>

<!--obsidian-outliner-->
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

#### 286. [Indent inside a quote › Quote7](../../spec/quotes.md#quote7)

> indent

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> [!note] Title
> - a
> - b┃
```

</td><td>

<!--obsidian-outliner-->
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

#### 287. [Indent inside a quote › Quote8](../../spec/quotes.md#quote8)

> indent

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a
> - b┃
c
```

</td><td>

<!--obsidian-outliner-->
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

#### 288. [Indent inside a quote › Quote9](../../spec/quotes.md#quote9)

> indent

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> a
>
> b┃
```

</td><td>

<!--obsidian-outliner-->
```buffer
> a
>
> →b┃
```

</td><td>

<!--ourus-->
```buffer
> a
>
> - b┃
```

</td></tr>
</table>

#### 289. [Outdent out of a quote › Quote11](../../spec/quotes.md#quote11)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a
> - b┃
```

</td><td>

<!--obsidian-outliner-->
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

#### 290. [Outdent out of a quote › Quote12](../../spec/quotes.md#quote12)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a┃
>   - c
> - b
```

</td><td>

<!--obsidian-outliner-->
```buffer
> - a┃
>   - c
> - b
```

</td><td>

<!--ourus-->
```buffer
- a┃
  - c
> - b
```

</td></tr>
</table>

#### 291. [Outdent out of a quote › Quote12b](../../spec/quotes.md#quote12b)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a┃
>   - c
> - b
```

</td><td>

<!--obsidian-outliner-->
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

#### 292. [Outdent out of a quote › Quote13](../../spec/quotes.md#quote13)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> [!note] T
> - a┃
```

</td><td>

<!--obsidian-outliner-->
```buffer
> [!note] T
> - a┃
```

</td><td>

<!--ourus-->
```buffer
> [!note] T
- a┃
```

</td></tr>
</table>

#### 293. [Outdent out of a quote › Quote14](../../spec/quotes.md#quote14)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a
> - b┃
c
```

</td><td>

<!--obsidian-outliner-->
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

#### 294. [Outdent out of a quote › Quote15](../../spec/quotes.md#quote15)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- x
  > - a
  > - b┃
```

</td><td>

<!--obsidian-outliner-->
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

#### 295. [Outdent out of a quote › Quote16](../../spec/quotes.md#quote16)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a
> - b┃
>
>   c
```

</td><td>

<!--obsidian-outliner-->
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

#### 296. [Indent into a quote › Quote17](../../spec/quotes.md#quote17)

> indent

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a
- b┃
```

</td><td>

<!--obsidian-outliner-->
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

#### 297. [Indent into a quote › Quote18](../../spec/quotes.md#quote18)

> indent

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a

- b┃
  - c

  d
```

</td><td>

<!--obsidian-outliner-->
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

#### 298. [Indent into a quote › Quote19](../../spec/quotes.md#quote19)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
> - a
- b┃
```

</td></tr>
</table>

> indent

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
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

> outdent

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
> - a
- b┃
```

</td></tr>
</table>

#### 299. [Moving between quotes › Quote20](../../spec/quotes.md#quote20)

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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
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

> moveSubtreeDown

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
> - a┃
> - x

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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
> →- a┃
> - x

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

#### 300. [Moving between quotes › Quote21](../../spec/quotes.md#quote21)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - x
- a┃

> - b
```

</td><td>

<!--obsidian-outliner-->
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

#### 301. [Moving between quotes › Quote22](../../spec/quotes.md#quote22)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
> - a
> - b┃

- c
```

</td></tr>
</table>

> moveSubtreeDown

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
> - a
> - b┃

- c
```

</td><td>

<!--ourus-->
```buffer
> - a

- c
  - b┃
```

</td></tr>
</table>

> moveSubtreeUp

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
> - a
> - b┃

- c
```

</td></tr>
</table>

#### 302. [Moving between quotes › Quote23](../../spec/quotes.md#quote23)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- c
> - a┃
> - b
```

</td></tr>
</table>

> moveSubtreeUp

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
- c
> - a┃
> - b
```

</td><td>

<!--ourus-->
```buffer
- c
  - a┃
> - b
```

</td></tr>
</table>

> moveSubtreeDown

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- c
> - a┃
> - b
```

</td></tr>
</table>

#### 303. [Moving inside a quote › Quote24](../../spec/quotes.md#quote24)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a
> - b┃
```

</td><td>

<!--obsidian-outliner-->
```buffer
> - a
> - b┃
```

</td><td>

<!--ourus-->
```buffer
> - b┃
> - a
```

</td></tr>
</table>

#### 304. [Moving inside a quote › Quote25](../../spec/quotes.md#quote25)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a
>
> - b┃
```

</td><td>

<!--obsidian-outliner-->
```buffer
> - a
>
> - b┃
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

#### 305. [Moving inside a quote › Quote26](../../spec/quotes.md#quote26)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
> q┃
```

</td><td>

<!--obsidian-outliner-->
```buffer
- a
> q┃
```

</td><td>

<!--ourus-->
```buffer
> q┃
- a
```

</td></tr>
</table>

#### 306. [A quote and a heading don't swap › Quote28](../../spec/quotes.md#quote28)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> ┃q
## S
```

</td><td>

<!--obsidian-outliner-->
```buffer
> ┃q
## S
```

</td><td>

<!--ourus-->
```buffer
## S
> ┃q
```

</td></tr>
</table>

#### 307. [Enter in a quote › Quote30](../../spec/quotes.md#quote30)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- x
  > - a┃
```

</td><td>

<!--obsidian-outliner-->
```buffer
- x
  > - a
- ┃
```

</td><td>

<!--ourus-->
```buffer
- x
  > - a
  > - ┃
```

</td></tr>
</table>

#### 308. [Enter in a quote › Quote31](../../spec/quotes.md#quote31)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a
b┃
```

</td><td>

<!--obsidian-outliner-->
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

#### 309. [Enter in a quote › Quote32](../../spec/quotes.md#quote32)

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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
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

#### 310. [Enter in a quote › Quote33](../../spec/quotes.md#quote33)

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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
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
  >
  > ┃
```

</td></tr>
</table>

> enter

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
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

#### 311. [Enter in a quote › Quote34](../../spec/quotes.md#quote34)

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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
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

#### 312. [Enter in a quote › Quote35](../../spec/quotes.md#quote35)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
> ab┃
```

</td></tr>
</table>

> enter

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
> ab
> ┃
```

</td><td>

<!--ourus-->
```buffer
> ab
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
> ab

┃
```

</td></tr>
</table>

> "c"

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
> ab

c┃
```

</td></tr>
</table>

#### 313. [Enter in a quote › Quote36](../../spec/quotes.md#quote36)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> ab┃cd
```

</td><td>

<!--obsidian-outliner-->
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

#### 314. [Enter in a quote › Quote37](../../spec/quotes.md#quote37)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> a
>
> ┃b
```

</td><td>

<!--obsidian-outliner-->
```buffer
> a
>
> 
> ┃b
```

</td><td>

<!--ourus-->
```buffer
> a
>
> ┃
>
> b
```

</td></tr>
</table>

#### 315. [Enter in a quote › Quote38](../../spec/quotes.md#quote38)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> [!note] Ti┃tle
> body
```

</td><td>

<!--obsidian-outliner-->
```buffer
> [!note] Ti
> ┃tle
> body
```

</td><td>

<!--ourus-->
```buffer
> [!note] Ti
> ┃tle
>
> body
```

</td></tr>
</table>

#### 316. [Enter in a quote › Quote40](../../spec/quotes.md#quote40)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
> [!note] Title┃
> body
```

</td></tr>
</table>

> enter

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
> [!note] Title
> ┃
> body
```

</td><td>

<!--ourus-->
```buffer
> [!note] Title
> ┃
>
> body
```

</td></tr>
</table>

> "x"

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
> [!note] Title
> x┃
> body
```

</td><td>

<!--ourus-->
```buffer
> [!note] Title
> x┃
>
> body
```

</td></tr>
</table>

#### 317. [Enter in a quote › Quote41](../../spec/quotes.md#quote41)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> [!tip] Title┃- x
> - y
```

</td><td>

<!--obsidian-outliner-->
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

#### 318. [Enter in a quote › Quote42](../../spec/quotes.md#quote42)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> para ┃- x
> - a
```

</td><td>

<!--obsidian-outliner-->
```buffer
> para 
> ┃- x
> - a
```

</td><td>

<!--ourus-->
```buffer
> para
>
> ┃\- x
> - a
```

</td></tr>
</table>

#### 319. [Enter in a quote › Quote43](../../spec/quotes.md#quote43)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> [!ti┃p] Title
```

</td><td>

<!--obsidian-outliner-->
```buffer
> [!ti
> ┃p] Title
```

</td><td>

<!--ourus-->
```buffer
> [!ti
┃p] Title
```

</td></tr>
</table>

#### 320. [Shift-Enter in a quote › Quote47](../../spec/quotes.md#quote47)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> [!tip] Ti┃tle
> body
```

</td><td>

<!--obsidian-outliner-->
```buffer
> [!tip] Ti
> ┃tle
> body
```

</td><td>

<!--ourus-->
```buffer
> [!tip] Ti┃tle
> body
```

</td></tr>
</table>

#### 321. [Joining in a quote › Quote48](../../spec/quotes.md#quote48)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a
> - ┃b
```

</td><td>

<!--obsidian-outliner-->
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

#### 322. [Joining in a quote › Quote49](../../spec/quotes.md#quote49)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> a
> - ┃b
```

</td><td>

<!--obsidian-outliner-->
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

#### 323. [Joining in a quote › Quote50](../../spec/quotes.md#quote50)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> a┃
> - b
```

</td><td>

<!--obsidian-outliner-->
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

#### 324. [Joining in a quote › Quote51](../../spec/quotes.md#quote51)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> a┃
>
> b
```

</td><td>

<!--obsidian-outliner-->
```buffer
> a┃>
> b
```

</td><td>

<!--ourus-->
```buffer
> a┃
> b
```

</td></tr>
</table>

#### 325. [Joining across a quote's edge › Quote52](../../spec/quotes.md#quote52)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a
- ┃b
  - c
```

</td><td>

<!--obsidian-outliner-->
```buffer
> - a
- ┃b
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

#### 326. [Backspace at a quote's start › Quote53](../../spec/quotes.md#quote53)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

> ┃q
```

</td><td>

<!--obsidian-outliner-->
```buffer
- a

>┃q
```

</td><td>

<!--ourus-->
```buffer
- a

┃q
```

</td></tr>
</table>

#### 327. [Backspace at a quote's start › Quote54](../../spec/quotes.md#quote54)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
> - ┃b
> - c
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
- a
> -┃b
> - c
```

</td><td>

<!--ourus-->
```buffer
- a
> ┃b
> - c
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
- a
> ┃b
> - c
```

</td><td>

<!--ourus-->
```buffer
- a

┃b
> - c
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
- a
>┃b
> - c
```

</td><td>

<!--ourus-->
```buffer
- a┃b

> - c
```

</td></tr>
</table>

#### 328. [Backspace at a quote's start › Quote56](../../spec/quotes.md#quote56)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

> ┃q
>
> r
```

</td><td>

<!--obsidian-outliner-->
```buffer
- a

>┃q
>
> r
```

</td><td>

<!--ourus-->
```buffer
- a

┃q

> r
```

</td></tr>
</table>

#### 329. [Backspace at a quote's start › Quote57](../../spec/quotes.md#quote57)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para

> [!note] ┃Title
> body
```

</td><td>

<!--obsidian-outliner-->
```buffer
para

> [!note]┃Title
> body
```

</td><td>

<!--ourus-->
```buffer
para

> ┃Title
>
> body
```

</td></tr>
</table>

#### 330. [Backspace at a quote's start › Quote58](../../spec/quotes.md#quote58)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para

> ┃[!note] Title
> body
```

</td><td>

<!--obsidian-outliner-->
```buffer
para

>┃[!note] Title
> body
```

</td><td>

<!--ourus-->
```buffer
para

> ┃Title
> body
```

</td></tr>
</table>

#### 331. [Backspace at a quote's start › Quote59](../../spec/quotes.md#quote59)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - ┃
```

</td><td>

<!--obsidian-outliner-->
```buffer
> -┃
```

</td><td>

<!--ourus-->
```buffer
┃
```

</td></tr>
</table>

#### 332. [Joining into a callout's title › Quote60](../../spec/quotes.md#quote60)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> [!note] Ti
> ┃tle
>
> body
```

</td><td>

<!--obsidian-outliner-->
```buffer
> [!note] Ti
>┃tle
>
> body
```

</td><td>

<!--ourus-->
```buffer
> [!note] Ti┃tle
>
> body
```

</td></tr>
</table>

#### 333. [Joining into a callout's title › Quote61](../../spec/quotes.md#quote61)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> [!note] Title┃
> body
```

</td><td>

<!--obsidian-outliner-->
```buffer
> [!note] Title┃> body
```

</td><td>

<!--ourus-->
```buffer
> [!note] Title┃body
```

</td></tr>
</table>

#### 334. [Joining into a callout's title › Quote62](../../spec/quotes.md#quote62)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> [!note] Title
> - ┃a
```

</td><td>

<!--obsidian-outliner-->
```buffer
> [!note] Title
> -┃a
```

</td><td>

<!--ourus-->
```buffer
> [!note] Title┃a
```

</td></tr>
</table>

#### 335. [Quote63](../../spec/quotes.md#quote63)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

<!--obsidian-outliner-->
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

#### 336. [Quote64](../../spec/quotes.md#quote64)

> indent

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> # H
> - a
> - b┃
```

</td><td>

<!--obsidian-outliner-->
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

#### 337. [Indenting a paragraph into a quote › Quote65](../../spec/quotes.md#quote65)

> indent

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> q

para┃
```

</td><td>

<!--obsidian-outliner-->
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

#### 338. [Indenting a paragraph into a quote › Quote66](../../spec/quotes.md#quote66)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> q
>
> para┃
```

</td><td>

<!--obsidian-outliner-->
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

#### 339. [Quote67](../../spec/quotes.md#quote67)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> >     code
> a┃
```

</td><td>

<!--obsidian-outliner-->
```buffer
> >     code
> a┃
```

</td><td>

<!--ourus-->
```buffer
> a┃
> >     code
```

</td></tr>
</table>

#### 340. [Quote68](../../spec/quotes.md#quote68)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - x
> - y

> q┃
```

</td><td>

<!--obsidian-outliner-->
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

#### 341. [Quote71](../../spec/quotes.md#quote71)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> [!note] T
> - a┃

- b
```

</td><td>

<!--obsidian-outliner-->
```buffer
> [!note] T
> - a┃

- b
```

</td><td>

<!--ourus-->
```buffer
> [!note] T

- b
  - a┃
```

</td></tr>
</table>

#### 342. [Quote72](../../spec/quotes.md#quote72)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - x
> - a┃
> - b
```

</td><td>

<!--obsidian-outliner-->
```buffer
> - x
> - a┃
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

#### 343. [A paragraph outdented out of a nested quote › Quote69](../../spec/quotes.md#quote69)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a
> > q┃
```

</td><td>

<!--obsidian-outliner-->
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

#### 344. [A paragraph outdented out of a nested quote › Quote70](../../spec/quotes.md#quote70)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> > q┃
> - a
```

</td><td>

<!--obsidian-outliner-->
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

#### 345. [Outliner flows › Scenario4](../../spec/scenarios.md#scenario4)

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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
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

> cursorLineDown cursorLineDown "b"

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
- a
  - 
b┃
```

</td><td>

<!--ourus-->
```buffer
- a

  - b┃
```

</td></tr>
</table>

#### 346. [Outliner flows › Scenario6](../../spec/scenarios.md#scenario6)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
Groceries┃
```

</td></tr>
</table>

> enter

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
Groceries
┃
```

</td><td>

<!--ourus-->
```buffer
Groceries

┃
```

</td></tr>
</table>

> "- milk"

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
Groceries
- milk┃
```

</td><td>

<!--ourus-->
```buffer
Groceries

- milk┃
```

</td></tr>
</table>

> enter "eggs"

> enter indent "brown"

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
Groceries
- milk
- eggs
  - brown┃
```

</td><td>

<!--ourus-->
```buffer
Groceries

- milk
- eggs
  - brown┃
```

</td></tr>
</table>

> enter enter

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
Groceries
- milk
- eggs
  - brown
- ┃
```

</td><td>

<!--ourus-->
```buffer
Groceries

- milk
- eggs
  - brown
- ┃
```

</td></tr>
</table>

> enter "Done."

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
Groceries
- milk
- eggs
  - brown
Done.┃
```

</td><td>

<!--ourus-->
```buffer
Groceries

- milk
- eggs
  - brown

Done.┃
```

</td></tr>
</table>

#### 347. [Outliner flows › Scenario7](../../spec/scenarios.md#scenario7)

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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
- 
- today:┃buy milk  and eggs
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
- 
- today:buy milk  and eggs
- call An┃
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
- 
- today:buy milk  and eggs┃call An
```

</td><td>

<!--ourus-->
```buffer
- today:
- buy milk and eggs┃call A
```

</td></tr>
</table>

#### 348. [Outliner flows › Scenario11](../../spec/scenarios.md#scenario11)

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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
- a
  ┃more
- b
```

</td><td>

<!--ourus-->
```buffer
- amore┃b
```

</td></tr>
</table>

#### 349. [Outliner flows › Scenario15](../../spec/scenarios.md#scenario15)

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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
- [ ] milk
- [ ] bread
  - [ ]two loaves┃
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
- [ ] milk
- [ ] bread
  - [ ]two loaves
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
- [ ] milk
- [ ] bread
  - [ ]two loaves
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
- [ ] milk
- [ ] bread
  - [ ]two loaves
Shop closes at six.┃
```

</td><td>

<!--ourus-->
```buffer
- [ ] milk
- [ ] bread
  - two loaves

Shop closes at six.┃
```

</td></tr>
</table>

#### 350. [Outliner flows › Scenario16](../../spec/scenarios.md#scenario16)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
# Work
- email

# Home
- [x] ┃review
- water
```

</td></tr>
</table>

> moveSubtreeUp

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
# Work
- email

# Home
- [x] ┃review
- water
```

</td><td>

<!--ourus-->
```buffer
# Work
- email
- [x] ┃review

# Home
- water
```

</td></tr>
</table>

> "today "

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
# Work
- email

# Home
- [x] today ┃review
- water
```

</td><td>

<!--ourus-->
```buffer
# Work
- email
- [x] today ┃review

# Home
- water
```

</td></tr>
</table>

> undo undo

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
# Work
- email

# Home
- [x] ┃review
- water
```

</td></tr>
</table>

#### 351. [Outliner flows › Scenario18](../../spec/scenarios.md#scenario18)

> pasteStructured "!"

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

````clipboard
```
code
```
````

</td><td>

```buffer
Notes
- example┃
- next
```

</td><td>

<!--obsidian-outliner-->
````buffer
Notes
- example```
code
```
!┃
- next
````

</td><td>

<!--ourus-->
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

#### 352. [Notes and sections › Scenario19](../../spec/scenarios.md#scenario19)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
# Notes┃
```

</td></tr>
</table>

> enter "first idea"

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
# Notes
first idea┃
```

</td></tr>
</table>

> enter "second"

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
# Notes
first idea
second┃
```

</td><td>

<!--ourus-->
```buffer
# Notes
first idea

second┃
```

</td></tr>
</table>

> moveSubtreeUp

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
# Notes
first idea
second┃
```

</td><td>

<!--ourus-->
```buffer
# Notes
second┃

first idea
```

</td></tr>
</table>

#### 353. [Notes and sections › Scenario20](../../spec/scenarios.md#scenario20)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
# Trip┃
```

</td></tr>
</table>

> enter "Pack light." enter "Book the train."

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
# Trip
Pack light.
Book the train.┃
```

</td><td>

<!--ourus-->
```buffer
# Trip
Pack light.

Book the train.┃
```

</td></tr>
</table>

> shiftEnter "Seat 42."

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
# Trip
Pack light.
Book the train.
Seat 42.┃
```

</td><td>

<!--ourus-->
```buffer
# Trip
Pack light.

Book the train.
Seat 42.┃
```

</td></tr>
</table>

> moveSubtreeUp

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
# Trip
Pack light.
Book the train.
Seat 42.┃
```

</td><td>

<!--ourus-->
```buffer
# Trip
Book the train.
Seat 42.┃

Pack light.
```

</td></tr>
</table>

> undo

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
# Trip
Pack light.┃
```

</td><td>

<!--ourus-->
```buffer
# Trip
Pack light.

Book the train.
Seat 42.┃
```

</td></tr>
</table>

#### 354. [Notes and sections › Scenario21](../../spec/scenarios.md#scenario21)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
one┃two
```

</td></tr>
</table>

> enter

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
one
┃two
```

</td><td>

<!--ourus-->
```buffer
one

┃two
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
one┃two
```

</td><td>

<!--ourus-->
```buffer
one
┃two
```

</td></tr>
</table>

> cursorLineUp cursorLineBoundaryForward

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
onetwo
```

</td><td>

<!--ourus-->
```buffer
one┃
two
```

</td></tr>
</table>

> deleteContentForward

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
onetwo
```

</td><td>

<!--ourus-->
```buffer
one┃two
```

</td></tr>
</table>

#### 355. [Notes and sections › Scenario22](../../spec/scenarios.md#scenario22)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
# Work┃

- email

# Home

- plants
```

</td></tr>
</table>

> moveSubtreeDown

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
# Work┃

- email

# Home

- plants
```

</td><td>

<!--ourus-->
```buffer
# Home

- plants

# Work┃

- email
```

</td></tr>
</table>

> moveSubtreeUp

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
# Work┃

- email

# Home

- plants
```

</td></tr>
</table>

#### 356. [Notes and sections › Scenario23](../../spec/scenarios.md#scenario23)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
# Plan┃2. draft
```

</td></tr>
</table>

> enter "revise "

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
# Plan
2. revise ┃draft
```

</td><td>

<!--ourus-->
```buffer
# Plan
revise ┃2\. draft
```

</td></tr>
</table>

> shiftEnter

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
# Plan
2. revise 
   ┃draft
```

</td><td>

<!--ourus-->
```buffer
# Plan
revise
┃2\. draft
```

</td></tr>
</table>

> undo undo undo

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
# Plan┃2. draft
```

</td></tr>
</table>

#### 357. [ShiftEnter1](../../spec/shift-enter.md#shiftenter1)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one two┃ three
```

</td><td>

<!--obsidian-outliner-->
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

#### 358. [ShiftEnter2](../../spec/shift-enter.md#shiftenter2)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a
   - b┃ c
```

</td><td>

<!--obsidian-outliner-->
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

#### 359. [ShiftEnter3](../../spec/shift-enter.md#shiftenter3)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- x
→- a┃ b
```

</td><td>

<!--obsidian-outliner-->
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

#### 360. [ShiftEnter5](../../spec/shift-enter.md#shiftenter5)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc ┃- def
```

</td><td>

<!--obsidian-outliner-->
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

#### 361. [ShiftEnter6](../../spec/shift-enter.md#shiftenter6)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc ┃1. def
```

</td><td>

<!--obsidian-outliner-->
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

#### 362. [ShiftEnter7](../../spec/shift-enter.md#shiftenter7)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Title ┃===
```

</td><td>

<!--obsidian-outliner-->
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

#### 363. [ShiftEnter8](../../spec/shift-enter.md#shiftenter8)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Title ┃--
```

</td><td>

<!--obsidian-outliner-->
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

#### 364. [ShiftEnter9](../../spec/shift-enter.md#shiftenter9)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one ┃<div>
```

</td><td>

<!--obsidian-outliner-->
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

#### 365. [ShiftEnter13](../../spec/shift-enter.md#shiftenter13)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃one
```

</td><td>

<!--obsidian-outliner-->
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

#### 366. [ShiftEnter14](../../spec/shift-enter.md#shiftenter14)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Title┃ more
```

</td><td>

<!--obsidian-outliner-->
```buffer
# Title
┃ more
```

</td><td>

<!--ourus-->
```buffer
# Title┃ more
```

</td></tr>
</table>

#### 367. [ShiftEnter18](../../spec/shift-enter.md#shiftenter18)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. abc ┃2. x
```

</td><td>

<!--obsidian-outliner-->
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

#### 368. [ShiftEnter19](../../spec/shift-enter.md#shiftenter19)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
a | b ┃|---|---|
```

</td><td>

<!--obsidian-outliner-->
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

#### 369. [ShiftEnter20](../../spec/shift-enter.md#shiftenter20)

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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
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

> deleteContentBackward

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
- abc
- ┃def
```

</td><td>

<!--ourus-->
```buffer
- abc┃- def
```

</td></tr>
</table>

#### 370. [ShiftEnter21](../../spec/shift-enter.md#shiftenter21)

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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
- one two
 ┃three
```

</td><td>

<!--ourus-->
```buffer
- one two┃three
```

</td></tr>
</table>

#### 371. [TaskEnter1](../../spec/tasks.md#taskenter1)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- [ ] ┃
```

</td><td>

<!--obsidian-outliner-->
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

#### 372. [TaskEnter5](../../spec/tasks.md#taskenter5)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b
  - [ ] ┃
  - c
```

</td><td>

<!--obsidian-outliner-->
```buffer
- a
  - b
  - c
- [ ] ┃
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

#### 373. [TaskEnter6](../../spec/tasks.md#taskenter6)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - [ ] ┃
  - b
```

</td><td>

<!--obsidian-outliner-->
```buffer
- a
  - b
- [ ] ┃
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

#### 374. [TaskEnter7](../../spec/tasks.md#taskenter7)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [x] a┃ b
  - c
```

</td><td>

<!--obsidian-outliner-->
```buffer
- [x] a
- [ ] ┃ b
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

#### 375. [TaskBackspace2](../../spec/tasks.md#taskbackspace2)

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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
- a
- [ ┃
```

</td><td>

<!--ourus-->
```buffer
- a┃
```

</td></tr>
</table>

#### 376. [TaskBackspace3](../../spec/tasks.md#taskbackspace3)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- [x] ┃b
```

</td><td>

<!--obsidian-outliner-->
```buffer
- a
- [x]┃b
```

</td><td>

<!--ourus-->
```buffer
- a
- ┃b
```

</td></tr>
</table>

#### 377. [TaskDelete1](../../spec/tasks.md#taskdelete1)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- [ ] b
```

</td><td>

<!--obsidian-outliner-->
```buffer
- a┃[ ] b
```

</td><td>

<!--ourus-->
```buffer
- a┃b
```

</td></tr>
</table>

#### 378. [TaskDelete3](../../spec/tasks.md#taskdelete3)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- [ ] 
```

</td><td>

<!--obsidian-outliner-->
```buffer
- a┃[ ] 
```

</td><td>

<!--ourus-->
```buffer
- a┃
```

</td></tr>
</table>

#### 379. [Undo3](../../spec/undo.md#undo3)

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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
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

#### 380. [Undo4](../../spec/undo.md#undo4)

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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
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

#### 381. [Undo5](../../spec/undo.md#undo5)

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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
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

### Whitespace (4)

#### 1. [ShiftEnter10](../../spec/shift-enter.md#shiftenter10)

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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
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

#### 2. [ShiftEnter11](../../spec/shift-enter.md#shiftenter11)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  ┃
- two
```

</td><td>

<!--obsidian-outliner-->
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

#### 3. [ShiftEnter15](../../spec/shift-enter.md#shiftenter15)

> shiftEnter shiftEnter "p"

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one┃
```

</td><td>

<!--obsidian-outliner-->
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

#### 4. [TaskEnter3](../../spec/tasks.md#taskenter3)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] abc ┃# x
```

</td><td>

<!--obsidian-outliner-->
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

### Caret (18)

#### 1. [CursorUp1](../../spec/cursor.md#cursorup1)

> cursorLineUp

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
ab┃
```

</td><td>

<!--obsidian-outliner-->
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
## Title
- ┃a
```

</td><td>

<!--obsidian-outliner-->
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

#### 3. [CursorDown5](../../spec/cursor.md#cursordown5)

> cursorLineDown

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- [ ] task
```

</td><td>

<!--obsidian-outliner-->
```buffer
- a
- [ ] t┃ask
```

</td><td>

<!--ourus-->
```buffer
- a
- [ ] ┃task
```

</td></tr>
</table>

#### 4. [CursorHome2](../../spec/cursor.md#cursorhome2)

> cursorLineBoundaryBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃one two
```

</td><td>

<!--obsidian-outliner-->
```buffer
- ┃one two
```

</td><td>

<!--ourus-->
```buffer
┃- one two
```

</td></tr>
</table>

#### 5. [CursorHome10](../../spec/cursor.md#cursorhome10)

> cursorLineBoundaryBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
## Title┃
```

</td><td>

<!--obsidian-outliner-->
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

#### 6. [CursorHome13](../../spec/cursor.md#cursorhome13)

> cursorLineBoundaryBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  ┃two
```

</td><td>

<!--obsidian-outliner-->
```buffer
- one
  ┃two
```

</td><td>

<!--ourus-->
```buffer
- one
┃  two
```

</td></tr>
</table>

#### 7. [CursorHome17](../../spec/cursor.md#cursorhome17)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
> [!note] Ti┃tle
```

</td></tr>
</table>

> cursorLineBoundaryBackward

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
```buffer
> ┃[!note] Title
```

</td><td>

<!--ourus-->
```buffer
> [!note] ┃Title
```

</td></tr>
</table>

> cursorLineBoundaryBackward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
┃> [!note] Title
```

</td></tr>
</table>

#### 8. [CursorDocStart1](../../spec/cursor.md#cursordocstart1)

> cursorDocStart

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃b
- c
```

</td><td>

<!--obsidian-outliner-->
```buffer
- ┃ab
- c
```

</td><td>

<!--ourus-->
```buffer
┃- ab
- c
```

</td></tr>
</table>

#### 9. [Enter26](../../spec/enter.md#enter26)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃b
```

</td><td>

<!--obsidian-outliner-->
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b
  - ┃c
```

</td><td>

<!--obsidian-outliner-->
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃a
  - b
```

</td><td>

<!--obsidian-outliner-->
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

#### 12. [Fence13](../../spec/fences.md#fence13)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ```
  code
  ┃```
````

</td><td>

<!--obsidian-outliner-->
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
  ┃
  ```
````

</td></tr>
</table>

#### 13. [Fence15](../../spec/fences.md#fence15)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- ┃```
  code
  ```
````

</td><td>

<!--obsidian-outliner-->
````buffer
- 
- ┃```
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

#### 14. [Fence29](../../spec/fences.md#fence29)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

````buffer
- a
  ```
  code
  ┃```
````

</td></tr>
</table>

> enter

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
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
  ┃
  ```
````

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-outliner-->
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
  code┃
  ```
````

</td></tr>
</table>

#### 15. [Fence41](../../spec/fences.md#fence41)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ```
  code
  ┃```
````

</td><td>

<!--obsidian-outliner-->
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
  ┃
  ```
````

</td></tr>
</table>

#### 16. [Abandoning an empty place › Enter, Shift-Tab, then leave › Outdented empty ordered item stays](../../spec/obsidian-true-outliner.md#outdented-empty-ordered-item-stays)

> enter outdent cursorDocStart

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. p
   1. a┃
2. q
```

</td><td>

<!--obsidian-outliner-->
```buffer
1. ┃p
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

#### 17. [Abandoning an empty place › Enter, Shift-Tab, then leave › Second Enter outdents to a kept item](../../spec/obsidian-true-outliner.md#second-enter-outdents-to-a-kept-item)

> enter enter cursorDocStart

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b┃
```

</td><td>

<!--obsidian-outliner-->
```buffer
- ┃a
  - b
- 
```

</td><td>

<!--ourus-->
```buffer
┃- a
  - b
- 
```

</td></tr>
</table>

#### 18. [TaskEnter4](../../spec/tasks.md#taskenter4)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] ┃abc
```

</td><td>

<!--obsidian-outliner-->
```buffer
- [ ] 
- [ ] ┃abc
```

</td><td>

<!--ourus-->
```buffer
- [ ] ┃
- [ ] abc
```

</td></tr>
</table>

### Agree (183)

1. [Backspace1](../../spec/backspace.md#backspace1)
2. [Backspace3](../../spec/backspace.md#backspace3)
3. [Backspace5](../../spec/backspace.md#backspace5)
4. [Backspace7](../../spec/backspace.md#backspace7)
5. [Backspace8](../../spec/backspace.md#backspace8)
6. [Backspace9](../../spec/backspace.md#backspace9)
7. [Backspace12](../../spec/backspace.md#backspace12)
8. [Backspace12c](../../spec/backspace.md#backspace12c)
9. [Backspace13](../../spec/backspace.md#backspace13)
10. [Backspace17d](../../spec/backspace.md#backspace17d)
11. [Backspace26](../../spec/backspace.md#backspace26)
12. [Backspace29](../../spec/backspace.md#backspace29)
13. [Backspace30](../../spec/backspace.md#backspace30)
14. [Backspace31](../../spec/backspace.md#backspace31)
15. [Backspace32](../../spec/backspace.md#backspace32)
16. [CursorLeft1](../../spec/cursor.md#cursorleft1)
17. [CursorLeft3](../../spec/cursor.md#cursorleft3)
18. [CursorRight1](../../spec/cursor.md#cursorright1)
19. [CursorRight2](../../spec/cursor.md#cursorright2)
20. [CursorUp3](../../spec/cursor.md#cursorup3)
21. [CursorDown1](../../spec/cursor.md#cursordown1)
22. [CursorDown2](../../spec/cursor.md#cursordown2)
23. [CursorDown3](../../spec/cursor.md#cursordown3)
24. [CursorDown4](../../spec/cursor.md#cursordown4)
25. [CursorHome1](../../spec/cursor.md#cursorhome1)
26. [CursorHome5](../../spec/cursor.md#cursorhome5)
27. [CursorHome6](../../spec/cursor.md#cursorhome6)
28. [CursorHome7](../../spec/cursor.md#cursorhome7)
29. [CursorHome8](../../spec/cursor.md#cursorhome8)
30. [CursorHome9](../../spec/cursor.md#cursorhome9)
31. [CursorHome11](../../spec/cursor.md#cursorhome11)
32. [CursorHome12](../../spec/cursor.md#cursorhome12)
33. [CursorHome14](../../spec/cursor.md#cursorhome14)
34. [CursorHome16](../../spec/cursor.md#cursorhome16)
35. [CursorEnd1](../../spec/cursor.md#cursorend1)
36. [CursorDocEndLeft1](../../spec/cursor.md#cursordocendleft1)
37. [SelectLeft1](../../spec/cursor.md#selectleft1)
38. [SelectRightEnd1](../../spec/cursor.md#selectrightend1)
39. [SelectHome1](../../spec/cursor.md#selecthome1)
40. [Delete1](../../spec/del.md#delete1)
41. [Delete2](../../spec/del.md#delete2)
42. [Delete3](../../spec/del.md#delete3)
43. [Delete6](../../spec/del.md#delete6)
44. [Delete7](../../spec/del.md#delete7)
45. [Delete8](../../spec/del.md#delete8)
46. [Delete12](../../spec/del.md#delete12)
47. [Delete13g](../../spec/del.md#delete13g)
48. [Delete15](../../spec/del.md#delete15)
49. [Delete18](../../spec/del.md#delete18)
50. [Delete18b](../../spec/del.md#delete18b)
51. [Delete20](../../spec/del.md#delete20)
52. [Delete21](../../spec/del.md#delete21)
53. [Delete22](../../spec/del.md#delete22)
54. [Enter2](../../spec/enter.md#enter2)
55. [Enter3d](../../spec/enter.md#enter3d)
56. [Enter4](../../spec/enter.md#enter4)
57. [Enter5](../../spec/enter.md#enter5)
58. [Enter15b](../../spec/enter.md#enter15b)
59. [Enter29b](../../spec/enter.md#enter29b)
60. [Enter30](../../spec/enter.md#enter30)
61. [Enter32b](../../spec/enter.md#enter32b)
62. [Enter33b](../../spec/enter.md#enter33b)
63. [Enter38](../../spec/enter.md#enter38)
64. [Enter39](../../spec/enter.md#enter39)
65. [Fence1](../../spec/fences.md#fence1)
66. [Fence2](../../spec/fences.md#fence2)
67. [Fence3](../../spec/fences.md#fence3)
68. [Fence4](../../spec/fences.md#fence4)
69. [Fence5](../../spec/fences.md#fence5)
70. [Fence6](../../spec/fences.md#fence6)
71. [Fence7](../../spec/fences.md#fence7)
72. [Fence7b](../../spec/fences.md#fence7b)
73. [Fence7c](../../spec/fences.md#fence7c)
74. [Fence8](../../spec/fences.md#fence8)
75. [Fence16](../../spec/fences.md#fence16)
76. [Fence18](../../spec/fences.md#fence18)
77. [Fence27](../../spec/fences.md#fence27)
78. [Fence28](../../spec/fences.md#fence28)
79. [Fence30](../../spec/fences.md#fence30)
80. [Fence32](../../spec/fences.md#fence32)
81. [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap8](../../spec/gaps.md#gap8)
82. [New text and gaps › Gap12](../../spec/gaps.md#gap12)
83. [Indent1](../../spec/indent.md#indent1)
84. [Indent2](../../spec/indent.md#indent2)
85. [Indent5](../../spec/indent.md#indent5)
86. [Indent6](../../spec/indent.md#indent6)
87. [Indent7](../../spec/indent.md#indent7)
88. [Indent8](../../spec/indent.md#indent8)
89. [Indent9](../../spec/indent.md#indent9)
90. [Indent10](../../spec/indent.md#indent10)
91. [Indent11](../../spec/indent.md#indent11)
92. [Indent14](../../spec/indent.md#indent14)
93. [Indent19](../../spec/indent.md#indent19)
94. [Indent20](../../spec/indent.md#indent20)
95. [Indent26](../../spec/indent.md#indent26)
96. [Indent27](../../spec/indent.md#indent27)
97. [MoveDown3](../../spec/move-subtree-down.md#movedown3)
98. [MoveDown6](../../spec/move-subtree-down.md#movedown6)
99. [MoveDown7](../../spec/move-subtree-down.md#movedown7)
100. [MoveDown9](../../spec/move-subtree-down.md#movedown9)
101. [MoveDown10](../../spec/move-subtree-down.md#movedown10)
102. [MoveDown15](../../spec/move-subtree-down.md#movedown15)
103. [MoveDown17](../../spec/move-subtree-down.md#movedown17)
104. [MoveDown19](../../spec/move-subtree-down.md#movedown19)
105. [MoveDown22](../../spec/move-subtree-down.md#movedown22)
106. [MoveDown25](../../spec/move-subtree-down.md#movedown25)
107. [MoveUp1](../../spec/move-subtree-up.md#moveup1)
108. [MoveUp2](../../spec/move-subtree-up.md#moveup2)
109. [MoveUp5](../../spec/move-subtree-up.md#moveup5)
110. [MoveUp6](../../spec/move-subtree-up.md#moveup6)
111. [MoveUp8](../../spec/move-subtree-up.md#moveup8)
112. [MoveUp9](../../spec/move-subtree-up.md#moveup9)
113. [MoveUp14](../../spec/move-subtree-up.md#moveup14)
114. [MoveUp28](../../spec/move-subtree-up.md#moveup28)
115. [MoveUp32](../../spec/move-subtree-up.md#moveup32)
116. [MoveUp33](../../spec/move-subtree-up.md#moveup33)
117. [Enter › E7, E8 › End of parent opens empty first child](../../spec/obsidian-true-outliner.md#end-of-parent-opens-empty-first-child)
118. [Enter › E15](../../spec/obsidian-true-outliner.md#e15)
119. [Enter › E19, E21 › End of lone heading starts a paragraph](../../spec/obsidian-true-outliner.md#end-of-lone-heading-starts-a-paragraph)
120. [Enter › E19, E21 › Empty paragraph before a section list](../../spec/obsidian-true-outliner.md#empty-paragraph-before-a-section-list)
121. [Enter › E32 › Checked task gives unchecked new item](../../spec/obsidian-true-outliner.md#checked-task-gives-unchecked-new-item)
122. [Enter › E33](../../spec/obsidian-true-outliner.md#e33)
123. [Enter › E13, E16 › Rest of title becomes first paragraph](../../spec/obsidian-true-outliner.md#rest-of-title-becomes-first-paragraph)
124. [Enter › E13, E16 › Split title above a subheading](../../spec/obsidian-true-outliner.md#split-title-above-a-subheading)
125. [Shift-Enter › S11 › Place inside a multi-line item](../../spec/obsidian-true-outliner.md#place-inside-a-multi-line-item)
126. [Backspace › #269 › Emptied middle item removed and renumbered](../../spec/obsidian-true-outliner.md#emptied-middle-item-removed-and-renumbered)
127. [Backspace › #153 › Undoing a fresh line break](../../spec/obsidian-true-outliner.md#undoing-a-fresh-line-break)
128. [Backspace › delete-to-content-start](../../spec/obsidian-true-outliner.md#delete-to-content-start)
129. [Backspace › Joining across ordered runs](../../spec/obsidian-true-outliner.md#joining-across-ordered-runs)
130. [Backspace › Joining away the head of a list › Next item becomes the new 1.](../../spec/obsidian-true-outliner.md#next-item-becomes-the-new-1)
131. [Indentation › #255 › Outdented child leaves quote above alone](../../spec/obsidian-true-outliner.md#outdented-child-leaves-quote-above-alone)
132. [Indentation › indent-unit-on-every-line](../../spec/obsidian-true-outliner.md#indent-unit-on-every-line)
133. [Indentation › seams-across-a-re-indent › Indented item keeps its quote](../../spec/obsidian-true-outliner.md#indented-item-keeps-its-quote)
134. [Indentation › seams-across-a-re-indent › Outdented item keeps its quote](../../spec/obsidian-true-outliner.md#outdented-item-keeps-its-quote)
135. [Moving › lone-block-id › Block id moves with its item](../../spec/obsidian-true-outliner.md#block-id-moves-with-its-item)
136. [Ordered lists › Outdenting the head of a nested list](../../spec/obsidian-true-outliner.md#outdenting-the-head-of-a-nested-list)
137. [Abandoning an empty place › Shift-Enter, Tab, then leave › Backspace returns to the start](../../spec/obsidian-true-outliner.md#backspace-returns-to-the-start)
138. [Abandoning an empty place › Shift-Enter, Tab, then leave › Shift-Tab then Backspace returns to start](../../spec/obsidian-true-outliner.md#shift-tab-then-backspace-returns-to-start)
139. [Abandoning an empty place › Enter, then Shift-Enter and Backspace](../../spec/obsidian-true-outliner.md#enter-then-shift-enter-and-backspace)
140. [Outdent1](../../spec/outdent.md#outdent1)
141. [Outdent2](../../spec/outdent.md#outdent2)
142. [Outdent3](../../spec/outdent.md#outdent3)
143. [Outdent5](../../spec/outdent.md#outdent5)
144. [Outdent6](../../spec/outdent.md#outdent6)
145. [Outdent9](../../spec/outdent.md#outdent9)
146. [Outdent10](../../spec/outdent.md#outdent10)
147. [Logical outdent › LogicalOutdent1](../../spec/outdent.md#logicaloutdent1)
148. [Paste24](../../spec/paste.md#paste24)
149. [Paste31](../../spec/paste.md#paste31)
150. [Placeholder6](../../spec/placeholders.md#placeholder6)
151. [Placeholder8](../../spec/placeholders.md#placeholder8)
152. [Placeholder10](../../spec/placeholders.md#placeholder10)
153. [Placeholder11](../../spec/placeholders.md#placeholder11)
154. [Placeholder12](../../spec/placeholders.md#placeholder12)
155. [Indent inside a quote › Quote4](../../spec/quotes.md#quote4)
156. [Quote10](../../spec/quotes.md#quote10)
157. [A quote and a heading don't swap › Quote27](../../spec/quotes.md#quote27)
158. [Enter in a quote › Quote29](../../spec/quotes.md#quote29)
159. [Enter in a quote › Quote39](../../spec/quotes.md#quote39)
160. [Shift-Enter in a quote › Quote44](../../spec/quotes.md#quote44)
161. [Shift-Enter in a quote › Quote45](../../spec/quotes.md#quote45)
162. [Shift-Enter in a quote › Quote46](../../spec/quotes.md#quote46)
163. [Outliner flows › Scenario1](../../spec/scenarios.md#scenario1)
164. [Outliner flows › Scenario2](../../spec/scenarios.md#scenario2)
165. [Outliner flows › Scenario3](../../spec/scenarios.md#scenario3)
166. [Outliner flows › Scenario5](../../spec/scenarios.md#scenario5)
167. [Outliner flows › Scenario8](../../spec/scenarios.md#scenario8)
168. [Outliner flows › Scenario9](../../spec/scenarios.md#scenario9)
169. [Outliner flows › Scenario12](../../spec/scenarios.md#scenario12)
170. [Outliner flows › Scenario13](../../spec/scenarios.md#scenario13)
171. [Outliner flows › Scenario14](../../spec/scenarios.md#scenario14)
172. [Notes and sections › Scenario24](../../spec/scenarios.md#scenario24)
173. [ShiftEnter4](../../spec/shift-enter.md#shiftenter4)
174. [ShiftEnter12](../../spec/shift-enter.md#shiftenter12)
175. [ShiftEnter17](../../spec/shift-enter.md#shiftenter17)
176. [TaskEnter2](../../spec/tasks.md#taskenter2)
177. [TaskBackspace5](../../spec/tasks.md#taskbackspace5)
178. [TaskDelete2](../../spec/tasks.md#taskdelete2)
179. [Typing1](../../spec/typing.md#typing1)
180. [Typing2](../../spec/typing.md#typing2)
181. [Typing3](../../spec/typing.md#typing3)
182. [Undo1](../../spec/undo.md#undo1)
183. [Undo2](../../spec/undo.md#undo2)

## Skipped

### a caret before an item's text (Outliner keeps it on the text) (23)

1. [backspace.md › Backspace2](../../spec/backspace.md#backspace2)
2. [cursor.md › CursorHome3](../../spec/cursor.md#cursorhome3)
3. [cursor.md › CursorHome4](../../spec/cursor.md#cursorhome4)
4. [cursor.md › CursorHome15](../../spec/cursor.md#cursorhome15)
5. [del.md › Delete16](../../spec/del.md#delete16)
6. [del.md › Delete16d](../../spec/del.md#delete16d)
7. [del.md › Delete16e](../../spec/del.md#delete16e)
8. [del.md › Delete16f](../../spec/del.md#delete16f)
9. [del.md › Delete16g](../../spec/del.md#delete16g)
10. [del.md › Delete19](../../spec/del.md#delete19)
11. [del.md › Delete23](../../spec/del.md#delete23)
12. [del.md › Delete24](../../spec/del.md#delete24)
13. [del.md › Delete25](../../spec/del.md#delete25)
14. [enter.md › Enter34](../../spec/enter.md#enter34)
15. [indent.md › Indent28](../../spec/indent.md#indent28)
16. [move-subtree-down.md › MoveDown32](../../spec/move-subtree-down.md#movedown32)
17. [move-subtree-up.md › MoveUp34](../../spec/move-subtree-up.md#moveup34)
18. [obsidian-true-outliner.md › Shift-Enter › S5](../../spec/obsidian-true-outliner.md#s5)
19. [obsidian-true-outliner.md › Backspace › Joining a task › Backspace before the checkbox](../../spec/obsidian-true-outliner.md#backspace-before-the-checkbox)
20. [outdent.md › Outdent14](../../spec/outdent.md#outdent14)
21. [shift-enter.md › ShiftEnter22](../../spec/shift-enter.md#shiftenter22)
22. [tasks.md › TaskBackspace1](../../spec/tasks.md#taskbackspace1)
23. [tasks.md › TaskBackspace6](../../spec/tasks.md#taskbackspace6)

### action deleteSubtree (7)

1. [delete-subtree.md › DeleteSubtree1](../../spec/delete-subtree.md#deletesubtree1)
2. [delete-subtree.md › DeleteSubtree2](../../spec/delete-subtree.md#deletesubtree2)
3. [delete-subtree.md › DeleteSubtree3](../../spec/delete-subtree.md#deletesubtree3)
4. [delete-subtree.md › DeleteSubtree4](../../spec/delete-subtree.md#deletesubtree4)
5. [delete-subtree.md › DeleteSubtree5](../../spec/delete-subtree.md#deletesubtree5)
6. [delete-subtree.md › DeleteSubtree6](../../spec/delete-subtree.md#deletesubtree6)
7. [scenarios.md › Outliner flows › Scenario10](../../spec/scenarios.md#scenario10)

### CR line endings (5)

1. [cursor.md › CursorLeft2](../../spec/cursor.md#cursorleft2)
2. [enter.md › Enter17](../../spec/enter.md#enter17)
3. [enter.md › Enter18](../../spec/enter.md#enter18)
4. [indent.md › Indent17](../../spec/indent.md#indent17)
5. [shift-enter.md › ShiftEnter16](../../spec/shift-enter.md#shiftenter16)

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

### option enterMidItem: child (4)

1. [enter.md › Enter3b](../../spec/enter.md#enter3b)
2. [obsidian-true-outliner.md › Enter › E7, E8 › Split item becomes first tab-indented child](../../spec/obsidian-true-outliner.md#split-item-becomes-first-tab-indented-child)
3. [obsidian-true-outliner.md › Enter › E11](../../spec/obsidian-true-outliner.md#e11)
4. [paste.md › Paste43](../../spec/paste.md#paste43)

### option pasteStructuredLines: items (4)

1. [paste.md › Paste8](../../spec/paste.md#paste8)
2. [paste.md › Paste8b](../../spec/paste.md#paste8b)
3. [paste.md › Paste39](../../spec/paste.md#paste39)
4. [scenarios.md › Outliner flows › Scenario17](../../spec/scenarios.md#scenario17)

### action duplicateSubtree (3)

1. [duplicate-subtree.md › DuplicateSubtree1](../../spec/duplicate-subtree.md#duplicatesubtree1)
2. [duplicate-subtree.md › DuplicateSubtree2](../../spec/duplicate-subtree.md#duplicatesubtree2)
3. [duplicate-subtree.md › DuplicateSubtree3](../../spec/duplicate-subtree.md#duplicatesubtree3)

### option backspaceAtTopItem: refuse (2)

1. [backspace.md › Backspace34](../../spec/backspace.md#backspace34)
2. [quotes.md › Backspace at a quote's start › Quote55](../../spec/quotes.md#quote55)

### option handleFenceContents: false (2)

1. [fences.md › Fence10](../../spec/fences.md#fence10)
2. [fences.md › Fence11](../../spec/fences.md#fence11)

### option taskEditing: block (2)

1. [tasks.md › TaskBackspace4](../../spec/tasks.md#taskbackspace4)
2. [tasks.md › TaskBackspace7](../../spec/tasks.md#taskbackspace7)

### a caret in the frontmatter (Live Preview shows it as properties) (1)

1. [gaps.md › Keys on a blank line › Gap19](../../spec/gaps.md#gap19)

### a caret inside two spaces of indentation (1)

1. [gaps.md › Keys on a blank line › Gap18](../../spec/gaps.md#gap18)

### nothing to compare (1)

1. [fences.md › Fence21](../../spec/fences.md#fence21)

### option bullet: + (1)

1. [indent.md › Indent18](../../spec/indent.md#indent18)

### option pasteStructuredMidText: after (1)

1. [paste.md › Paste38](../../spec/paste.md#paste38)
