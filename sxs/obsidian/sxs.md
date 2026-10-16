---
type: "SxS"
app: "obsidian"
version: "1.14.4 (installer 1.14.4)"
url: "app://obsidian.md/"
model: "text"
command: "node sxs/run.ts obsidian"
elapsed_s: 102
---

# Obsidian (Source mode) vs ourus

Spec test suite replayed in Obsidian (Source mode) and compared against ourus.

Regenerated from an earlier run (`--regenerate-report`): what Obsidian (Source mode) did then, judged against the spec as it is now. It played every example as it is now.

Model: [text](../lib/text.ts) (buffers loaded and compared as written, caret included)

## Summary

|  | agree | caret | whitespace | disagree | error | skipped | total |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **total** | **134 (20%)** | **21 (3.2%)** | **5 (0.76%)** | **442 (68%)** | **0 (0%)** | **52 (8%)** | **654** |

Per-file:

|  | agree | caret | whitespace | disagree | error | skipped | total |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [backspace.md](../../spec/backspace.md) | 6 |  |  | 43 |  | 3 | **52** |
| [cursor.md](../../spec/cursor.md) | 25 | 10 |  |  |  | 1 | **36** |
| [del.md](../../spec/del.md) | 11 | 1 |  | 27 |  | 5 | **44** |
| [delete-subtree.md](../../spec/delete-subtree.md) |  |  |  |  |  | 6 | **6** |
| [duplicate-subtree.md](../../spec/duplicate-subtree.md) |  |  |  |  |  | 3 | **3** |
| [enter.md](../../spec/enter.md) | 8 | 3 |  | 37 |  | 4 | **52** |
| [fences.md](../../spec/fences.md) | 10 | 2 | 1 | 28 |  | 3 | **44** |
| [gaps.md](../../spec/gaps.md) | 3 |  |  | 15 |  | 1 | **19** |
| [indent.md](../../spec/indent.md) | 7 | 1 |  | 19 |  | 2 | **29** |
| [move-subtree-down.md](../../spec/move-subtree-down.md) | 4 | 1 |  | 27 |  |  | **32** |
| [move-subtree-up.md](../../spec/move-subtree-up.md) | 8 | 1 |  | 26 |  |  | **35** |
| [obsidian-true-outliner.md](../../spec/obsidian-true-outliner.md) | 12 |  |  | 52 |  | 3 | **67** |
| [outdent.md](../../spec/outdent.md) | 6 | 1 |  | 12 |  | 5 | **24** |
| [paste.md](../../spec/paste.md) | 2 |  |  | 41 |  | 5 | **48** |
| [placeholders.md](../../spec/placeholders.md) | 5 |  |  | 11 |  |  | **16** |
| [quotes.md](../../spec/quotes.md) | 12 |  |  | 58 |  | 4 | **74** |
| [scenarios.md](../../spec/scenarios.md) | 4 |  |  | 18 |  | 2 | **24** |
| [shift-enter.md](../../spec/shift-enter.md) | 3 |  | 3 | 15 |  | 2 | **23** |
| [tasks.md](../../spec/tasks.md) | 3 | 1 | 1 | 10 |  | 2 | **17** |
| [typing.md](../../spec/typing.md) | 3 |  |  |  |  | 1 | **4** |
| [undo.md](../../spec/undo.md) | 2 |  |  | 3 |  |  | **5** |
| **total** | **134 (20%)** | **21 (3.2%)** | **5 (0.76%)** | **442 (68%)** | **0 (0%)** | **52 (8%)** | **654** |

## Examples

### Disagree (442)

#### 1. [Backspace1](../../spec/backspace.md#backspace1)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
- ┃two
```

</td><td>

<!--obsidian-->
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
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
┃- two
```

</td><td>

<!--obsidian-->
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
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃b
```

</td><td>

<!--obsidian-->
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
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Title #
- ┃more
```

</td><td>

<!--obsidian-->
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
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- 
- ┃b
```

</td><td>

<!--obsidian-->
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
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b
- ┃
```

</td><td>

<!--obsidian-->
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
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃b
  - c
```

</td><td>

<!--obsidian-->
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
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  ┃two
```

</td><td>

<!--obsidian-->
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
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

┃
```

</td><td>

<!--obsidian-->
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
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

┃b
```

</td><td>

<!--obsidian-->
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

#### 11. [Backspace12b](../../spec/backspace.md#backspace12b)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

#### 12. [Backspace14](../../spec/backspace.md#backspace14)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

#### 13. [Backspace15](../../spec/backspace.md#backspace15)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para

- ┃a
```

</td><td>

<!--obsidian-->
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

#### 14. [Backspace16](../../spec/backspace.md#backspace16)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
```
x
```
- ┃a
````

</td><td>

<!--obsidian-->
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

#### 15. [Backspace17](../../spec/backspace.md#backspace17)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
- b
- c
```

</td><td>

<!--obsidian-->
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

#### 16. [Backspace17b](../../spec/backspace.md#backspace17b)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
  - a
    - b
```

</td><td>

<!--obsidian-->
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

#### 17. [Backspace17c](../../spec/backspace.md#backspace17c)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

#### 18. [Backspace17d](../../spec/backspace.md#backspace17d)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- x
- ┃
  - a
    - b
```

</td><td>

<!--obsidian-->
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

#### 19. [Backspace17e](../../spec/backspace.md#backspace17e)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

<!--obsidian-->
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

#### 20. [Backspace18](../../spec/backspace.md#backspace18)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para

# ┃Hello

body
```

</td><td>

<!--obsidian-->
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

#### 21. [Backspace18c](../../spec/backspace.md#backspace18c)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
┃Title
===

text
```

</td><td>

<!--obsidian-->
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

#### 22. [Backspace18d](../../spec/backspace.md#backspace18d)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
a
# ┃H1
text
```

</td><td>

<!--obsidian-->
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

#### 23. [Backspace18e](../../spec/backspace.md#backspace18e)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- # ┃H
```

</td><td>

<!--obsidian-->
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

#### 24. [Backspace19](../../spec/backspace.md#backspace19)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

  ┃bc
```

</td><td>

<!--obsidian-->
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

#### 25. [Backspace20](../../spec/backspace.md#backspace20)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

┃

- b
```

</td><td>

<!--obsidian-->
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

#### 26. [Backspace21](../../spec/backspace.md#backspace21)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

- ┃b
```

</td><td>

<!--obsidian-->
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

#### 27. [Backspace21b](../../spec/backspace.md#backspace21b)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

#### 28. [Backspace22](../../spec/backspace.md#backspace22)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Title

┃more
```

</td><td>

<!--obsidian-->
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

#### 29. [Backspace23](../../spec/backspace.md#backspace23)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Title

┃more
lines
```

</td><td>

<!--obsidian-->
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

#### 30. [Backspace24](../../spec/backspace.md#backspace24)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
```
x
```

┃para
````

</td><td>

<!--obsidian-->
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

#### 31. [Backspace25](../../spec/backspace.md#backspace25)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- 

┃para
```

</td><td>

<!--obsidian-->
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

#### 32. [Backspace27](../../spec/backspace.md#backspace27)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> q

┃b
```

</td><td>

<!--obsidian-->
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

#### 33. [Backspace28](../../spec/backspace.md#backspace28)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
```
x
```
- ┃
````

</td><td>

<!--obsidian-->
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

#### 34. [Backspace29](../../spec/backspace.md#backspace29)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a
2. ┃
3. c
```

</td><td>

<!--obsidian-->
```buffer
1. a
2.┃
2. c
```

</td><td>

<!--ourus-->
```buffer
1. a┃
2. c
```

</td></tr>
</table>

#### 35. [Backspace30](../../spec/backspace.md#backspace30)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃
```

</td><td>

<!--obsidian-->
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

#### 36. [Backspace33](../../spec/backspace.md#backspace33)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃a
- b
```

</td><td>

<!--obsidian-->
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

#### 37. [Backspace35](../../spec/backspace.md#backspace35)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
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

<!--obsidian-->
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

#### 38. [Cmd-Backspace › SoftBackspace1](../../spec/backspace.md#softbackspace1)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

#### 39. [Cmd-Backspace › SoftBackspace2](../../spec/backspace.md#softbackspace2)

> deleteSoftLineBackward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
abc ┃[a]: tail
```

</td><td>

<!--obsidian-->
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

#### 40. [Cmd-Backspace › SoftBackspace3](../../spec/backspace.md#softbackspace3)

> deleteSoftLineBackward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
abc ┃- x tail
===
```

</td><td>

<!--obsidian-->
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

#### 41. [Cmd-Backspace › SoftBackspace4](../../spec/backspace.md#softbackspace4)

> deleteSoftLineBackward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# abc ┃title #
```

</td><td>

<!--obsidian-->
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

#### 42. [Cmd-Backspace › SoftBackspace5](../../spec/backspace.md#softbackspace5)

> deleteSoftLineBackward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
first
abc ┃- x
===
```

</td><td>

<!--obsidian-->
```buffer
first
┃- x
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

#### 43. [Cmd-Backspace › SoftBackspace6](../../spec/backspace.md#softbackspace6)

> deleteSoftLineBackward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
title
=┃==
```

</td><td>

<!--obsidian-->
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

#### 44. [Delete1](../../spec/del.md#delete1)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc┃
  - def
```

</td><td>

<!--obsidian-->
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

#### 45. [Delete2](../../spec/del.md#delete2)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one┃
- two
```

</td><td>

<!--obsidian-->
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

#### 46. [Delete3](../../spec/del.md#delete3)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one┃
  two
```

</td><td>

<!--obsidian-->
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

#### 47. [Delete4](../../spec/del.md#delete4)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Title┃ #
- more
```

</td><td>

<!--obsidian-->
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

#### 48. [Delete4b](../../spec/del.md#delete4b)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Title #┃
- more
```

</td><td>

<!--obsidian-->
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

#### 49. [Delete5](../../spec/del.md#delete5)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
  - a
    - b
  - c
- d
```

</td><td>

<!--obsidian-->
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

#### 50. [Delete5b](../../spec/del.md#delete5b)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

#### 51. [Delete5c](../../spec/del.md#delete5c)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- x
- ┃
  - a
    - b
```

</td><td>

<!--obsidian-->
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

#### 52. [Delete5d](../../spec/del.md#delete5d)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃ 
  - a
    - b
```

</td><td>

<!--obsidian-->
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

#### 53. [Delete6](../../spec/del.md#delete6)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃
- b
```

</td><td>

<!--obsidian-->
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

#### 54. [Delete7](../../spec/del.md#delete7)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
  - c
```

</td><td>

<!--obsidian-->
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

#### 55. [Delete9](../../spec/del.md#delete9)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

#### 56. [Delete10](../../spec/del.md#delete10)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
> q
```

</td><td>

<!--obsidian-->
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

#### 57. [Delete11](../../spec/del.md#delete11)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# H┃
    code
```

</td><td>

<!--obsidian-->
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

#### 58. [Delete12](../../spec/del.md#delete12)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b┃
- c
→- d
```

</td><td>

<!--obsidian-->
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

#### 59. [Delete13](../../spec/del.md#delete13)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
a┃

# H1
```

</td><td>

<!--obsidian-->
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

#### 60. [Delete13c](../../spec/del.md#delete13c)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
a┃

# H1
text
```

</td><td>

<!--obsidian-->
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

#### 61. [Delete13e](../../spec/del.md#delete13e)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
a┃

Title
=====
```

</td><td>

<!--obsidian-->
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

#### 62. [Delete13g](../../spec/del.md#delete13g)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- # H
```

</td><td>

<!--obsidian-->
```buffer
- a┃- # H
```

</td><td>

<!--ourus-->
```buffer
- a┃# H
```

</td></tr>
</table>

#### 63. [Delete14](../../spec/del.md#delete14)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
a┃

# H1

body
```

</td><td>

<!--obsidian-->
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

#### 64. [Delete16d](../../spec/del.md#delete16d)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
-┃ b
  - c
```

</td><td>

<!--obsidian-->
```buffer
- a
-┃b
  - c
```

</td><td>

<!--ourus-->
```buffer
- a

-┃b
- c
```

</td></tr>
</table>

#### 65. [Delete16e](../../spec/del.md#delete16e)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
-┃ a
→- b
```

</td><td>

<!--obsidian-->
```buffer
-┃a
→- b
```

</td><td>

<!--ourus-->
```buffer
-┃a
- b
```

</td></tr>
</table>

#### 66. [Delete17](../../spec/del.md#delete17)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Shopping:┃

- milk
- eggs
```

</td><td>

<!--obsidian-->
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

#### 67. [Delete17b](../../spec/del.md#delete17b)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

#### 68. [Delete18c](../../spec/del.md#delete18c)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
a┃


b
```

</td><td>

<!--obsidian-->
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

#### 69. [Delete19](../../spec/del.md#delete19)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃[ ] task
```

</td><td>

<!--obsidian-->
```buffer
- ┃ ] task
```

</td><td>

<!--ourus-->
```buffer
- ┃task
```

</td></tr>
</table>

#### 70. [Delete20](../../spec/del.md#delete20)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- 
- b
```

</td><td>

<!--obsidian-->
```buffer
- a┃- 
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

#### 71. [Enter3c](../../spec/enter.md#enter3c)

> enter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
9. a┃ b
   - c
10. d
```

</td><td>

<!--obsidian-->
```buffer
9. a
10. ┃b
   - c
10. d
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

#### 72. [Enter3d](../../spec/enter.md#enter3d)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

#### 73. [Enter4](../../spec/enter.md#enter4)

> enter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - b
```

</td><td>

<!--obsidian-->
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
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃
```

</td><td>

<!--obsidian-->
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
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃
- b
```

</td><td>

<!--obsidian-->
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

#### 76. [Enter7b](../../spec/enter.md#enter7b)

> enter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃
- b
```

</td><td>

<!--obsidian-->
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

#### 77. [Enter8](../../spec/enter.md#enter8)

> enter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc ┃- def
```

</td><td>

<!--obsidian-->
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

#### 78. [Enter9](../../spec/enter.md#enter9)

> enter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc ┃# def
```

</td><td>

<!--obsidian-->
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

#### 79. [Enter10](../../spec/enter.md#enter10)

> enter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc ┃<div>
```

</td><td>

<!--obsidian-->
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

#### 80. [Enter11](../../spec/enter.md#enter11)

> enter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
see ┃[a]: /url
```

</td><td>

<!--obsidian-->
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

#### 81. [Enter12](../../spec/enter.md#enter12)

> enter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
some┃ text
```

</td><td>

<!--obsidian-->
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

#### 82. [Enter14](../../spec/enter.md#enter14)

> enter enter enter "p"

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b┃
```

</td><td>

<!--obsidian-->
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

#### 83. [Enter15](../../spec/enter.md#enter15)

> enter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

- ┃

- b
```

</td><td>

<!--obsidian-->
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

#### 84. [Enter16](../../spec/enter.md#enter16)

> enter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
lazy
```

</td><td>

<!--obsidian-->
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

#### 85. [Enter21](../../spec/enter.md#enter21)

> enter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
  - a
```

</td><td>

<!--obsidian-->
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

#### 86. [Enter22](../../spec/enter.md#enter22)

> enter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para ┃- x
- a
```

</td><td>

<!--obsidian-->
```buffer
para 
┃- x
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

#### 87. [Enter23](../../spec/enter.md#enter23)

> enter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
### H┃2
    - a
```

</td><td>

<!--obsidian-->
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

#### 88. [Enter25](../../spec/enter.md#enter25)

> enter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
8. z┃
9. a
   - child
10. b
```

</td><td>

<!--obsidian-->
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

#### 89. [Enter26b](../../spec/enter.md#enter26b)

> enter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃b
```

</td><td>

<!--obsidian-->
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

#### 90. [Enter27](../../spec/enter.md#enter27)

> enter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b
  - ┃
  - c
```

</td><td>

<!--obsidian-->
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

#### 91. [Enter28](../../spec/enter.md#enter28)

> enter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃
  - c
```

</td><td>

<!--obsidian-->
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

#### 92. [Enter32](../../spec/enter.md#enter32)

> enter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para

# ┃Title

body
```

</td><td>

<!--obsidian-->
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

#### 93. [Enter33](../../spec/enter.md#enter33)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

#### 94. [Enter34](../../spec/enter.md#enter34)

> enter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
-┃ alpha
```

</td><td>

<!--obsidian-->
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

#### 95. [Enter35](../../spec/enter.md#enter35)

> enter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. abc ┃2. def
```

</td><td>

<!--obsidian-->
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

#### 96. [Enter36](../../spec/enter.md#enter36)

> enter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

- b┃
```

</td><td>

<!--obsidian-->
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

#### 97. [Enter36b](../../spec/enter.md#enter36b)

> enter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a
>
> - b┃
```

</td><td>

<!--obsidian-->
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

#### 98. [Enter37](../../spec/enter.md#enter37)

> enter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a
   text
   ┃
```

</td><td>

<!--obsidian-->
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

#### 99. [Enter38](../../spec/enter.md#enter38)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
```buffer
- one
-┃two
- next
```

</td><td>

<!--ourus-->
```buffer
- one┃two
- next
```

</td></tr>
</table>

#### 100. [Enter39](../../spec/enter.md#enter39)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
```buffer
- ab
-┃
- c
```

</td><td>

<!--ourus-->
```buffer
- ab┃
- c
```

</td></tr>
</table>

#### 101. [Enter40](../../spec/enter.md#enter40)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

#### 102. [Enter41](../../spec/enter.md#enter41)

> enter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Title ┃- x
- y
```

</td><td>

<!--obsidian-->
```buffer
# Title 
┃- x
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

#### 103. [Enter42](../../spec/enter.md#enter42)

> enter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
title ┃- x
===
```

</td><td>

<!--obsidian-->
```buffer
title 
┃- x
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

#### 104. [Enter43](../../spec/enter.md#enter43)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

> deleteContentBackward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- abc┃- def
```

</td></tr>
</table>

#### 105. [Enter44](../../spec/enter.md#enter44)

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
- ┃three
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
```buffer
- one two
-┃three
```

</td><td>

<!--ourus-->
```buffer
- one two┃three
```

</td></tr>
</table>

#### 106. [Enter45](../../spec/enter.md#enter45)

> enter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para
# ┃Title
```

</td><td>

<!--obsidian-->
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

#### 107. [Enter46](../../spec/enter.md#enter46)

> enter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> ┃quote
```

</td><td>

<!--obsidian-->
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

#### 108. [Fence7](../../spec/fences.md#fence7)

> enter "b"

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ```
  code
  ```┃
````

</td><td>

<!--obsidian-->
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

#### 109. [Fence7c](../../spec/fences.md#fence7c)

> enter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ```
  code
  ```┃
  - c
````

</td><td>

<!--obsidian-->
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

#### 110. [Fence9](../../spec/fences.md#fence9)

> enter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
`┃``
code
```
````

</td><td>

<!--obsidian-->
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

#### 111. [Fence14](../../spec/fences.md#fence14)

> enter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
```
code
``┃`
````

</td><td>

<!--obsidian-->
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

#### 112. [Fence15](../../spec/fences.md#fence15)

> enter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- ┃```
  code
  ```
````

</td><td>

<!--obsidian-->
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

#### 113. [Fence16](../../spec/fences.md#fence16)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ```
  one
  ┃two
  ```
````

</td><td>

<!--obsidian-->
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

#### 114. [Fence17](../../spec/fences.md#fence17)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ```
  ┃one
  ```
````

</td><td>

<!--obsidian-->
````buffer
- a
  ```
┃one
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

#### 115. [Fence18](../../spec/fences.md#fence18)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ```
  one┃
  two
  ```
````

</td><td>

<!--obsidian-->
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

#### 116. [Fence19](../../spec/fences.md#fence19)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ```
  one┃
  ```
````

</td><td>

<!--obsidian-->
````buffer
- a
  ```
  one┃→```
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

#### 117. [Fence20](../../spec/fences.md#fence20)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
> ```
> one
> ┃two
> ```
````

</td><td>

<!--obsidian-->
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

#### 118. [Fence22](../../spec/fences.md#fence22)

> shiftEnter enter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  - b
    ```
    x
    ```┃
````

</td><td>

<!--obsidian-->
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

#### 119. [Fence23](../../spec/fences.md#fence23)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ```
  one
  ┃```
````

</td><td>

<!--obsidian-->
````buffer
- a
  ```
  one
┃```
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

#### 120. [Fence24](../../spec/fences.md#fence24)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ```js┃
  one
  ```
````

</td><td>

<!--obsidian-->
````buffer
- a
  ```js┃→one
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

#### 121. [Fence25](../../spec/fences.md#fence25)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ┃```
  one
  ```
````

</td><td>

<!--obsidian-->
````buffer
- a
┃```
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

#### 122. [Fence26](../../spec/fences.md#fence26)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
- ┃```
  one
  ```
````

</td><td>

<!--obsidian-->
````buffer
- a
-┃```
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

#### 123. [Fence27](../../spec/fences.md#fence27)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

````buffer
- a
  ```js┃
  code
  ```
````

</td></tr>
</table>

> enter

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

````buffer
- a
  ```js
  ┃
  code
  ```
````

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
````buffer
- a
  ```js
┃
  code
  ```
````

</td><td>

<!--ourus-->
````buffer
- a
  ```js┃
  code
  ```
````

</td></tr>
</table>

#### 124. [Fence29](../../spec/fences.md#fence29)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

#### 125. [Fence30](../../spec/fences.md#fence30)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ```
  code
  ┃
  ```
````

</td><td>

<!--obsidian-->
````buffer
- a
  ```
  code
  ┃  ```
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

#### 126. [Fence31](../../spec/fences.md#fence31)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

> deleteContentBackward

<table>
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

#### 127. [Fence32](../../spec/fences.md#fence32)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

````buffer
- a
  ```
  code
  ```┃
````

</td></tr>
</table>

> shiftEnter

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

````buffer
- a
  ```
  code
  ```
  ┃
````

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
````buffer
- a
  ```
  code
  ```
┃
````

</td><td>

<!--ourus-->
````buffer
- a
  ```
  code
  ```┃
````

</td></tr>
</table>

#### 128. [Fence33](../../spec/fences.md#fence33)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
para
┃```
x
```
````

</td><td>

<!--obsidian-->
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

#### 129. [Fence34](../../spec/fences.md#fence34)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a┃
- ```
  one
  ```
````

</td><td>

<!--obsidian-->
````buffer
- a┃- ```
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

#### 130. [Fence35](../../spec/fences.md#fence35)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ```
  one
  ```┃
- b
````

</td><td>

<!--obsidian-->
````buffer
- a
  ```
  one
  ```┃- b
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

#### 131. [Fence36](../../spec/fences.md#fence36)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
```
``
┃`
body
```
````

</td><td>

<!--obsidian-->
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

#### 132. [Fence37](../../spec/fences.md#fence37)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
```
``┃
`
body
```
````

</td><td>

<!--obsidian-->
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

#### 133. [Fence38](../../spec/fences.md#fence38)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
```
x┃```
body
```
````

</td><td>

<!--obsidian-->
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

#### 134. [Fence39](../../spec/fences.md#fence39)

> enter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
```
```┃x
body
```
````

</td><td>

<!--obsidian-->
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

#### 135. [Fence40](../../spec/fences.md#fence40)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> ~~~
> ~~┃
> ~
> body
> ~~~
```

</td><td>

<!--obsidian-->
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

#### 136. [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap1](../../spec/gaps.md#gap1)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
a

b┃

c
```

</td><td>

<!--obsidian-->
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

#### 137. [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap2](../../spec/gaps.md#gap2)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
a┃

b

c
```

</td><td>

<!--obsidian-->
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

#### 138. [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap3](../../spec/gaps.md#gap3)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# A
text

# B┃
more

# C
```

</td><td>

<!--obsidian-->
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

#### 139. [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap4](../../spec/gaps.md#gap4)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

- b┃
- c
```

</td><td>

<!--obsidian-->
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

#### 140. [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap5](../../spec/gaps.md#gap5)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - a1

- b┃
- c
```

</td><td>

<!--obsidian-->
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

#### 141. [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap6](../../spec/gaps.md#gap6)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
## A┃
a
## B
b
## C
```

</td><td>

<!--obsidian-->
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

#### 142. [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap7](../../spec/gaps.md#gap7)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
x┃
```
code
```

q
````

</td><td>

<!--obsidian-->
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

#### 143. [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap9](../../spec/gaps.md#gap9)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- p
  - x

  - y┃

- q
```

</td><td>

<!--obsidian-->
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

#### 144. [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap10](../../spec/gaps.md#gap10)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
a

b┃

```

</td><td>

<!--obsidian-->
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

#### 145. [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap11](../../spec/gaps.md#gap11)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer

a┃

b

c
```

</td><td>

<!--obsidian-->
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

#### 146. [New text and gaps › Gap13](../../spec/gaps.md#gap13)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
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

<!--obsidian-->
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

#### 147. [Keys on a blank line › Gap14](../../spec/gaps.md#gap14)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
a

b
┃

c
```

</td><td>

<!--obsidian-->
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

#### 148. [Keys on a blank line › Gap15](../../spec/gaps.md#gap15)

> indent

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b
┃
- c
```

</td><td>

<!--obsidian-->
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

#### 149. [Keys on a blank line › Gap16](../../spec/gaps.md#gap16)

> outdent

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b
┃
- c
```

</td><td>

<!--obsidian-->
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

#### 150. [Keys on a blank line › Gap17](../../spec/gaps.md#gap17)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
┃
  b
- c
```

</td><td>

<!--obsidian-->
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

#### 151. [Indent2](../../spec/indent.md#indent2)

> indent

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b┃
  - c
    more c
```

</td><td>

<!--obsidian-->
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

#### 152. [Indent3](../../spec/indent.md#indent3)

> indent

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
    * x
- b┃
```

</td><td>

<!--obsidian-->
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

#### 153. [Indent4](../../spec/indent.md#indent4)

> indent

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a
2. b┃
3. c
```

</td><td>

<!--obsidian-->
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

#### 154. [Indent5](../../spec/indent.md#indent5)

> indent

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a
   1. x
2. b┃
```

</td><td>

<!--obsidian-->
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

#### 155. [Indent10](../../spec/indent.md#indent10)

> indent

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

<!--obsidian-->
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

#### 156. [Indent11](../../spec/indent.md#indent11)

> indent

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Intro

- a┃
```

</td><td>

<!--obsidian-->
```buffer
Intro

  - a┃
```

</td><td>

<!--ourus-->
```buffer
Intro

- a┃
```

</td></tr>
</table>

#### 157. [Indent12](../../spec/indent.md#indent12)

> indent

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# A
## B┃
### C
```

</td><td>

<!--obsidian-->
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

#### 158. [Indent13](../../spec/indent.md#indent13)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

#### 159. [Indent15](../../spec/indent.md#indent15)

> indent

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a
   - x
   - y┃
5. b
9. c
```

</td><td>

<!--obsidian-->
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

#### 160. [Indent16](../../spec/indent.md#indent16)

> indent

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Title┃
=====

## Sub
```

</td><td>

<!--obsidian-->
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

#### 161. [Indent19](../../spec/indent.md#indent19)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

> outdent

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

#### 162. [Indent20](../../spec/indent.md#indent20)

> indent

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
- b┃
  ```
    x
  ```
````

</td><td>

<!--obsidian-->
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

#### 163. [Indent21](../../spec/indent.md#indent21)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

#### 164. [Indent22](../../spec/indent.md#indent22)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

#### 165. [Indent23](../../spec/indent.md#indent23)

> indent

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# A
## B
## C┃
### D
```

</td><td>

<!--obsidian-->
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

#### 166. [Indent24](../../spec/indent.md#indent24)

> indent

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# A
###### B┃
```

</td><td>

<!--obsidian-->
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

#### 167. [Indent25](../../spec/indent.md#indent25)

> indent

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Title┃
-----

### Sub
```

</td><td>

<!--obsidian-->
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

#### 168. [Indent26](../../spec/indent.md#indent26)

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

> indent

<table>
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
```buffer
- a
  - b┃
  - c
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

> outdent

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

#### 169. [Indent29](../../spec/indent.md#indent29)

> indent

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

para┃
```

</td><td>

<!--obsidian-->
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

#### 170. [MoveDown1](../../spec/move-subtree-down.md#movedown1)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - a1

- b
```

</td><td>

<!--obsidian-->
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

#### 171. [MoveDown2](../../spec/move-subtree-down.md#movedown2)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# H
- a┃

para
```

</td><td>

<!--obsidian-->
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

#### 172. [MoveDown3](../../spec/move-subtree-down.md#movedown3)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b┃
```

</td><td>

<!--obsidian-->
```buffer
- a

- b┃
```

</td><td>

<!--ourus-->
```buffer
- a
- b┃
```

</td></tr>
</table>

#### 173. [MoveDown4](../../spec/move-subtree-down.md#movedown4)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

#### 174. [MoveDown5](../../spec/move-subtree-down.md#movedown5)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
one┃

two
```

</td><td>

<!--obsidian-->
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

#### 175. [MoveDown6](../../spec/move-subtree-down.md#movedown6)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b┃
```

</td><td>

<!--obsidian-->
```buffer
- a

  - b┃
```

</td><td>

<!--ourus-->
```buffer
- a
  - b┃
```

</td></tr>
</table>

#### 176. [MoveDown7](../../spec/move-subtree-down.md#movedown7)

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

> moveSubtreeDown

<table>
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

> moveSubtreeDown

<table>
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

#### 177. [MoveDown8](../../spec/move-subtree-down.md#movedown8)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b┃

para

- c
```

</td><td>

<!--obsidian-->
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

#### 178. [MoveDown9](../../spec/move-subtree-down.md#movedown9)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

> moveSubtreeUp

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

#### 179. [MoveDown10](../../spec/move-subtree-down.md#movedown10)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

> moveSubtreeDown

<table>
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

#### 180. [MoveDown13](../../spec/move-subtree-down.md#movedown13)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

#### 181. [MoveDown16](../../spec/move-subtree-down.md#movedown16)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# A┃
- x
# B
- y
```

</td><td>

<!--obsidian-->
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

#### 182. [MoveDown17](../../spec/move-subtree-down.md#movedown17)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
## ┃H
# H
- a
```

</td><td>

<!--obsidian-->
```buffer
# H
## ┃H
- a
```

</td><td>

<!--ourus-->
```buffer
## ┃H
# H
- a
```

</td></tr>
</table>

#### 183. [MoveDown18](../../spec/move-subtree-down.md#movedown18)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Work
- email
- ┃review

# Home
- water
```

</td><td>

<!--obsidian-->
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

#### 184. [MoveDown19](../../spec/move-subtree-down.md#movedown19)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# A
## s┃

# B
- x
```

</td><td>

<!--obsidian-->
```buffer
# A

## s┃
# B
- x
```

</td><td>

<!--ourus-->
```buffer
# A
## s┃

# B
- x
```

</td></tr>
</table>

#### 185. [MoveDown20](../../spec/move-subtree-down.md#movedown20)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Todo
- one
- two┃

## Later
- three
```

</td><td>

<!--obsidian-->
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

#### 186. [MoveDown21](../../spec/move-subtree-down.md#movedown21)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
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

<!--obsidian-->
````buffer
  ```
- a┃
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

#### 187. [MoveDown22](../../spec/move-subtree-down.md#movedown22)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a┃
2. b
```

</td><td>

<!--obsidian-->
```buffer
2. b
3. a┃
```

</td><td>

<!--ourus-->
```buffer
1. b
2. a┃
```

</td></tr>
</table>

#### 188. [MoveDown23](../../spec/move-subtree-down.md#movedown23)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
9. a┃
   - x
10. b
```

</td><td>

<!--obsidian-->
```buffer
   - x
9. a┃
10. b
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

#### 189. [MoveDown24](../../spec/move-subtree-down.md#movedown24)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para┃
- a

last
```

</td><td>

<!--obsidian-->
```buffer
- a
para┃

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

#### 190. [MoveDown25](../../spec/move-subtree-down.md#movedown25)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# A
para┃

# B
- x
```

</td><td>

<!--obsidian-->
```buffer
# A

para┃
# B
- x
```

</td><td>

<!--ourus-->
```buffer
# A
para┃

# B
- x
```

</td></tr>
</table>

#### 191. [MoveDown26](../../spec/move-subtree-down.md#movedown26)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Work
- review┃

# Home
para
```

</td><td>

<!--obsidian-->
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

#### 192. [MoveDown27](../../spec/move-subtree-down.md#movedown27)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# A
## s┃

# B
## t
```

</td><td>

<!--obsidian-->
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

#### 193. [MoveDown28](../../spec/move-subtree-down.md#movedown28)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# A
## sub
- s1

┃para

# B
```

</td><td>

<!--obsidian-->
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

#### 194. [MoveDown29](../../spec/move-subtree-down.md#movedown29)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
pa┃ra
1. a
- b

next
```

</td><td>

<!--obsidian-->
```buffer
1. a
pa┃ra
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

#### 195. [MoveDown30](../../spec/move-subtree-down.md#movedown30)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
9. a┃
10. b
    - x
```

</td><td>

<!--obsidian-->
```buffer
10. b
11. a┃
    - x
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

#### 196. [MoveDown31](../../spec/move-subtree-down.md#movedown31)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para┃

---
```

</td><td>

<!--obsidian-->
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

#### 197. [MoveUp1](../../spec/move-subtree-up.md#moveup1)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

> moveSubtreeDown

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

#### 198. [MoveUp3](../../spec/move-subtree-up.md#moveup3)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# A

text a

# B┃

text b
```

</td><td>

<!--obsidian-->
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

#### 199. [MoveUp4](../../spec/move-subtree-up.md#moveup4)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
one

two┃
```

</td><td>

<!--obsidian-->
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

#### 200. [MoveUp5](../../spec/move-subtree-up.md#moveup5)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b┃
```

</td><td>

<!--obsidian-->
```buffer
  - b┃
- a
```

</td><td>

<!--ourus-->
```buffer
- a
  - b┃
```

</td></tr>
</table>

#### 201. [MoveUp7](../../spec/move-subtree-up.md#moveup7)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

para

- b┃
- c
```

</td><td>

<!--obsidian-->
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

#### 202. [MoveUp8](../../spec/move-subtree-up.md#moveup8)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

> moveSubtreeDown

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

#### 203. [MoveUp9](../../spec/move-subtree-up.md#moveup9)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
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

<!--obsidian-->
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

#### 204. [MoveUp12](../../spec/move-subtree-up.md#moveup12)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
intro

- b┃
  - b1
```

</td><td>

<!--obsidian-->
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

#### 205. [MoveUp13](../../spec/move-subtree-up.md#moveup13)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
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

<!--obsidian-->
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

#### 206. [MoveUp15](../../spec/move-subtree-up.md#moveup15)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
9. a
   - x
10. b┃
```

</td><td>

<!--obsidian-->
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

#### 207. [MoveUp16](../../spec/move-subtree-up.md#moveup16)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# A
## a1
# B┃
## b1
```

</td><td>

<!--obsidian-->
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

#### 208. [MoveUp17](../../spec/move-subtree-up.md#moveup17)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
first

para┃
- a
```

</td><td>

<!--obsidian-->
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

#### 209. [MoveUp18](../../spec/move-subtree-up.md#moveup18)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
→- a
┃para
```

</td><td>

<!--obsidian-->
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

#### 210. [MoveUp19](../../spec/move-subtree-up.md#moveup19)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
---
para┃
```

</td><td>

<!--obsidian-->
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

#### 211. [MoveUp20](../../spec/move-subtree-up.md#moveup20)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
[a]: /u
para┃
```

</td><td>

<!--obsidian-->
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

#### 212. [MoveUp21](../../spec/move-subtree-up.md#moveup21)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para
- a┃
- b
```

</td><td>

<!--obsidian-->
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

#### 213. [MoveUp22](../../spec/move-subtree-up.md#moveup22)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Work
- email

# Home
- ┃review
- water
```

</td><td>

<!--obsidian-->
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

#### 214. [MoveUp23](../../spec/move-subtree-up.md#moveup23)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# A
## sub
- s1

# B
┃para
```

</td><td>

<!--obsidian-->
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

#### 215. [MoveUp24](../../spec/move-subtree-up.md#moveup24)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Todo
- one

## Later
- ┃two
- three
```

</td><td>

<!--obsidian-->
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

#### 216. [MoveUp25](../../spec/move-subtree-up.md#moveup25)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

- b┃
  - b1
```

</td><td>

<!--obsidian-->
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

#### 217. [MoveUp26](../../spec/move-subtree-up.md#moveup26)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
```buffer
# A
- x

## s┃
# B
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

#### 218. [MoveUp27](../../spec/move-subtree-up.md#moveup27)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
```buffer
# Work
para

- ┃review
# Home
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

#### 219. [MoveUp28](../../spec/move-subtree-up.md#moveup28)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
## X
# A┃
- a
```

</td><td>

<!--obsidian-->
```buffer
# A┃
## X
- a
```

</td><td>

<!--ourus-->
```buffer
## X
# A┃
- a
```

</td></tr>
</table>

#### 220. [MoveUp30](../../spec/move-subtree-up.md#moveup30)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
[a]: /u
    ┃code
```

</td><td>

<!--obsidian-->
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

#### 221. [MoveUp33](../../spec/move-subtree-up.md#moveup33)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# H
- a
## ┃H
```

</td><td>

<!--obsidian-->
```buffer
# H
## ┃H
- a
```

</td><td>

<!--ourus-->
```buffer
# H
- a
## ┃H
```

</td></tr>
</table>

#### 222. [MoveUp35](../../spec/move-subtree-up.md#moveup35)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
```buffer
> q┃
para
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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

#### 223. [Enter › #228 › Renumbering stops at a delimiter change](../../spec/obsidian-true-outliner.md#renumbering-stops-at-a-delimiter-change)

> enter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a┃
1) b
2) c
```

</td><td>

<!--obsidian-->
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

#### 224. [Enter › E4](../../spec/obsidian-true-outliner.md#e4)

> enter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- first
  second┃ line
```

</td><td>

<!--obsidian-->
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

#### 225. [Enter › E7, E8 › End of parent opens empty first child](../../spec/obsidian-true-outliner.md#end-of-parent-opens-empty-first-child)

> enter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- alpha┃
→- child
```

</td><td>

<!--obsidian-->
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

#### 226. [Enter › E9](../../spec/obsidian-true-outliner.md#e9)

> enter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
one┃ two
- child
```

</td><td>

<!--obsidian-->
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

#### 227. [Enter › E10](../../spec/obsidian-true-outliner.md#e10)

> enter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- item┃

  para
```

</td><td>

<!--obsidian-->
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

#### 228. [Enter › E17](../../spec/obsidian-true-outliner.md#e17)

> enter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Hello┃ world
====
```

</td><td>

<!--obsidian-->
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

#### 229. [Enter › E18](../../spec/obsidian-true-outliner.md#e18)

> enter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Hello world
==┃==
```

</td><td>

<!--obsidian-->
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

#### 230. [Enter › E33](../../spec/obsidian-true-outliner.md#e33)

> enter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- al«pha be»ta
```

</td><td>

<!--obsidian-->
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

#### 231. [Enter › #267, E5](../../spec/obsidian-true-outliner.md#267-e5)

> enter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# H
para┃ text
> q
```

</td><td>

<!--obsidian-->
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

#### 232. [Enter › E14, E20 › Split title above an existing paragraph](../../spec/obsidian-true-outliner.md#split-title-above-an-existing-paragraph)

> enter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Head┃line
Body.
```

</td><td>

<!--obsidian-->
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

#### 233. [Enter › E14, E20 › End of heading above a paragraph](../../spec/obsidian-true-outliner.md#end-of-heading-above-a-paragraph)

> enter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Head┃
Body.
```

</td><td>

<!--obsidian-->
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

#### 234. [Shift-Enter › S4](../../spec/obsidian-true-outliner.md#s4)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
one┃ two
```

</td><td>

<!--obsidian-->
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

#### 235. [Shift-Enter › S7, S8 › Line break in setext title refused](../../spec/obsidian-true-outliner.md#line-break-in-setext-title-refused)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Hello┃ world
====
```

</td><td>

<!--obsidian-->
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

#### 236. [Shift-Enter › S7, S8 › Line break in setext underline refused](../../spec/obsidian-true-outliner.md#line-break-in-setext-underline-refused)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Hello world
==┃==
```

</td><td>

<!--obsidian-->
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

#### 237. [Shift-Enter › S9](../../spec/obsidian-true-outliner.md#s9)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- item

  para┃ text
```

</td><td>

<!--obsidian-->
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

#### 238. [Shift-Enter › S11 › Leaving the place removes it](../../spec/obsidian-true-outliner.md#leaving-the-place-removes-it)

> shiftEnter cursorDocStart

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
foo┃
bar
```

</td><td>

<!--obsidian-->
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

#### 239. [Shift-Enter › S13](../../spec/obsidian-true-outliner.md#s13)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a«lpha» beta
```

</td><td>

<!--obsidian-->
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

#### 240. [Backspace › #269 › Emptied middle item removed and renumbered](../../spec/obsidian-true-outliner.md#emptied-middle-item-removed-and-renumbered)

> deleteContentBackward deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. p
2. a┃
3. q
```

</td><td>

<!--obsidian-->
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

#### 241. [Backspace › #153 › Undoing a fresh line break](../../spec/obsidian-true-outliner.md#undoing-a-fresh-line-break)

> shiftEnter deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - kid
- foo┃
```

</td><td>

<!--obsidian-->
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

#### 242. [Backspace › Joining a task › Backspace before the checkbox](../../spec/obsidian-true-outliner.md#backspace-before-the-checkbox)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃[ ] b
```

</td><td>

<!--obsidian-->
```buffer
- a
-┃[ ] b
```

</td><td>

<!--ourus-->
```buffer
- a┃b
```

</td></tr>
</table>

#### 243. [Backspace › Joining an item with children › Children move to the joined node](../../spec/obsidian-true-outliner.md#children-move-to-the-joined-node)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃b
    - c
```

</td><td>

<!--obsidian-->
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

#### 244. [Backspace › Joining an item with children › Delete forward absorbs child with grandchildren](../../spec/obsidian-true-outliner.md#delete-forward-absorbs-child-with-grandchildren)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - b
    - c
```

</td><td>

<!--obsidian-->
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

#### 245. [Backspace › Joining across ordered runs](../../spec/obsidian-true-outliner.md#joining-across-ordered-runs)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a
2. b
- ┃x
3. c
```

</td><td>

<!--obsidian-->
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

#### 246. [Backspace › Joining away the head of a list › Next item becomes the new 1.](../../spec/obsidian-true-outliner.md#next-item-becomes-the-new-1)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- p
  1. ┃a
  2. b
```

</td><td>

<!--obsidian-->
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

#### 247. [Backspace › Joining away the head of a list › List starting at 3 keeps its start](../../spec/obsidian-true-outliner.md#list-starting-at-3-keeps-its-start)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
3. a
4. ┃b
5. c
```

</td><td>

<!--obsidian-->
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

#### 248. [Indentation › list-marker-content-column](../../spec/obsidian-true-outliner.md#list-marker-content-column)

> indent

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
-  parent
-  kid┃
```

</td><td>

<!--obsidian-->
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

#### 249. [Indentation › indent-unit-on-every-line](../../spec/obsidian-true-outliner.md#indent-unit-on-every-line)

> indent

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
→- x
- b┃
  cont
```

</td><td>

<!--obsidian-->
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

#### 250. [Indentation › seams-across-a-re-indent › Indented item keeps its quote](../../spec/obsidian-true-outliner.md#indented-item-keeps-its-quote)

> indent

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b┃
  > q
```

</td><td>

<!--obsidian-->
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

#### 251. [Indentation › seams-across-a-re-indent › Outdented item keeps its quote](../../spec/obsidian-true-outliner.md#outdented-item-keeps-its-quote)

> outdent

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b┃
    > q
```

</td><td>

<!--obsidian-->
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

#### 252. [Indentation › seams-across-a-re-indent › Indented item keeps its thematic break](../../spec/obsidian-true-outliner.md#indented-item-keeps-its-thematic-break)

> indent

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b┃

  ---
```

</td><td>

<!--obsidian-->
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

#### 253. [Indentation › seams-across-a-re-indent › Outdented item keeps its code block](../../spec/obsidian-true-outliner.md#outdented-item-keeps-its-code-block)

> outdent

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b┃

        code
```

</td><td>

<!--obsidian-->
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

#### 254. [Indentation › destination-list-style](../../spec/obsidian-true-outliner.md#destination-list-style)

> indent

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
* a
  * x
- b┃
```

</td><td>

<!--obsidian-->
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

#### 255. [Moving › lone-block-id › Block id moves with its item](../../spec/obsidian-true-outliner.md#block-id-moves-with-its-item)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b┃
  ^id
```

</td><td>

<!--obsidian-->
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

#### 256. [Moving › lone-block-id › Block id moves with its paragraph](../../spec/obsidian-true-outliner.md#block-id-moves-with-its-paragraph)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para one
^blk

para┃ two
```

</td><td>

<!--obsidian-->
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

#### 257. [Moving › lazy-continuation-at-seams › Blank line added below a quote](../../spec/obsidian-true-outliner.md#blank-line-added-below-a-quote)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para┃
> q
```

</td><td>

<!--obsidian-->
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

#### 258. [Moving › lazy-continuation-at-seams › No blank line needed after a fence](../../spec/obsidian-true-outliner.md#no-blank-line-needed-after-a-fence)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
para┃
```
code
```
````

</td><td>

<!--obsidian-->
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

#### 259. [Moving › lazy-continuation-at-seams › No blank line needed before a fence](../../spec/obsidian-true-outliner.md#no-blank-line-needed-before-a-fence)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
```
code┃
```
para
````

</td><td>

<!--obsidian-->
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

#### 260. [Abandoning an empty place › Shift-Enter, Tab, then leave › Carried place removed on leaving](../../spec/obsidian-true-outliner.md#carried-place-removed-on-leaving)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

#### 261. [Abandoning an empty place › Shift-Enter, Tab, then leave › Doubly indented place removed on leaving](../../spec/obsidian-true-outliner.md#doubly-indented-place-removed-on-leaving)

> shiftEnter indent indent cursorDocStart

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - kid
  - sib
- foo┃
```

</td><td>

<!--obsidian-->
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

#### 262. [Abandoning an empty place › Shift-Enter, Tab, then leave › Backspace returns to the start](../../spec/obsidian-true-outliner.md#backspace-returns-to-the-start)

> shiftEnter indent deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - kid
- foo┃
```

</td><td>

<!--obsidian-->
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

#### 263. [Abandoning an empty place › Shift-Enter, Tab, then leave › Shift-Tab then Backspace returns to start](../../spec/obsidian-true-outliner.md#shift-tab-then-backspace-returns-to-start)

> shiftEnter outdent deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b┃
- c
```

</td><td>

<!--obsidian-->
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

#### 264. [Abandoning an empty place › Shift-Enter, Tab, then Enter](../../spec/obsidian-true-outliner.md#shift-enter-tab-then-enter)

> shiftEnter indent enter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - kid
- foo┃
- bar
```

</td><td>

<!--obsidian-->
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

#### 265. [Abandoning an empty place › Enter, then Shift-Enter and Backspace](../../spec/obsidian-true-outliner.md#enter-then-shift-enter-and-backspace)

> enter shiftEnter deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- foo┃
```

</td><td>

<!--obsidian-->
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

#### 266. [Abandoning an empty place › Enter, Tab, then leave › An empty ordered child kept with a blank line](../../spec/obsidian-true-outliner.md#an-empty-ordered-child-kept-with-a-blank-line)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

#### 267. [Abandoning an empty place › Enter, Tab, then leave › Blank line after the list stays](../../spec/obsidian-true-outliner.md#blank-line-after-the-list-stays)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

#### 268. [Abandoning an empty place › Enter, Shift-Tab, then leave › Outdented empty ordered item stays](../../spec/obsidian-true-outliner.md#outdented-empty-ordered-item-stays)

> enter outdent cursorDocStart

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. p
   1. a┃
2. q
```

</td><td>

<!--obsidian-->
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

#### 269. [Abandoning an empty place › Enter twice, then leave › Empty paragraph and blank lines removed](../../spec/obsidian-true-outliner.md#empty-paragraph-and-blank-lines-removed)

> enter enter cursorDocStart

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

<!--obsidian-->
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

#### 270. [Abandoning an empty place › Enter twice, then leave › Indented list under paragraph restored](../../spec/obsidian-true-outliner.md#indented-list-under-paragraph-restored)

> enter enter cursorDocStart

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para
  - a┃
  - b
```

</td><td>

<!--obsidian-->
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

#### 271. [Paste › #216 › Pasted list takes space indent unit](../../spec/obsidian-true-outliner.md#pasted-list-takes-space-indent-unit)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
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

<!--obsidian-->
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

#### 272. [Paste › #216 › Pasted list takes tab indent unit](../../spec/obsidian-true-outliner.md#pasted-list-takes-tab-indent-unit)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
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

<!--obsidian-->
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

#### 273. [Paste › #264 › Pasted quote set off from paragraph](../../spec/obsidian-true-outliner.md#pasted-quote-set-off-from-paragraph)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
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

<!--obsidian-->
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

#### 274. [Paste › #197 › Pasted list and block become children](../../spec/obsidian-true-outliner.md#pasted-list-and-block-become-children)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
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

<!--obsidian-->
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

#### 275. [Outdent4](../../spec/outdent.md#outdent4)

> outdent

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
## A┃
### B
```

</td><td>

<!--obsidian-->
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

#### 276. [Outdent7](../../spec/outdent.md#outdent7)

> outdent

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃x
  - 
```

</td><td>

<!--obsidian-->
```buffer
- a
- ┃x
  - 
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

#### 277. [Outdent8](../../spec/outdent.md#outdent8)

> outdent

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para
- «a
  - b
- c»
```

</td><td>

<!--obsidian-->
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

#### 278. [Outdent9](../../spec/outdent.md#outdent9)

> outdent

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a
   1. b┃
2. c
```

</td><td>

<!--obsidian-->
```buffer
1. a
 2. b┃
3. c
```

</td><td>

<!--ourus-->
```buffer
1. a
2. b┃
3. c
```

</td></tr>
</table>

#### 279. [Outdent11](../../spec/outdent.md#outdent11)

> outdent

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# T
## A┃
## B
```

</td><td>

<!--obsidian-->
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

#### 280. [Outdent12](../../spec/outdent.md#outdent12)

> outdent

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- «a
- b»
```

</td><td>

<!--obsidian-->
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

#### 281. [Outdent13](../../spec/outdent.md#outdent13)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
```buffer
- a
- b┃
    - c
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

> indent

<table>
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
```buffer
- a
  - b┃
    - c
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

#### 282. [Outdent15](../../spec/outdent.md#outdent15)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
```buffer
para
  - b┃
```

</td><td>

<!--ourus-->
```buffer
para
- b┃
```

</td></tr>
</table>

#### 283. [Direct outdent › DirectOutdent1](../../spec/outdent.md#directoutdent1)

> outdent

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b┃
    - b1
  - c
- d
```

</td><td>

<!--obsidian-->
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

#### 284. [Direct outdent › DirectOutdent2](../../spec/outdent.md#directoutdent2)

> outdent

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

<!--obsidian-->
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

#### 285. [Direct outdent › DirectOutdent3](../../spec/outdent.md#directoutdent3)

> outdent

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - a1
- b
```

</td><td>

<!--obsidian-->
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

#### 286. [Direct outdent › DirectOutdent4](../../spec/outdent.md#directoutdent4)

> outdent

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para
- a┃
- b
```

</td><td>

<!--obsidian-->
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

#### 287. [Paste1](../../spec/paste.md#paste1)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
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

<!--obsidian-->
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

#### 288. [Paste2](../../spec/paste.md#paste2)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
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

<!--obsidian-->
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

#### 289. [Paste3](../../spec/paste.md#paste3)

> pastePlain

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
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

<!--obsidian-->
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

#### 290. [Paste4](../../spec/paste.md#paste4)

> pastePlain

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
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

<!--obsidian-->
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

#### 291. [Paste5](../../spec/paste.md#paste5)

> pastePlain

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
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

<!--obsidian-->
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

#### 292. [Paste6](../../spec/paste.md#paste6)

> pastePlain

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
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

<!--obsidian-->
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

#### 293. [Paste7](../../spec/paste.md#paste7)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
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

<!--obsidian-->
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

#### 294. [Paste9](../../spec/paste.md#paste9)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
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

<!--obsidian-->
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

#### 295. [Paste10](../../spec/paste.md#paste10)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
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

<!--obsidian-->
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

#### 296. [Paste11](../../spec/paste.md#paste11)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
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

<!--obsidian-->
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

#### 297. [Paste12](../../spec/paste.md#paste12)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
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

<!--obsidian-->
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

#### 298. [Paste13](../../spec/paste.md#paste13)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
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

<!--obsidian-->
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

#### 299. [Paste14](../../spec/paste.md#paste14)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
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

<!--obsidian-->
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

#### 300. [Paste15](../../spec/paste.md#paste15)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
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

<!--obsidian-->
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

#### 301. [Paste16](../../spec/paste.md#paste16)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
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

<!--obsidian-->
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

#### 302. [Paste17](../../spec/paste.md#paste17)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
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

<!--obsidian-->
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

#### 303. [Paste18](../../spec/paste.md#paste18)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
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

<!--obsidian-->
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

#### 304. [Paste19](../../spec/paste.md#paste19)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
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

<!--obsidian-->
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

#### 305. [Paste20](../../spec/paste.md#paste20)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
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

<!--obsidian-->
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

#### 306. [Paste21](../../spec/paste.md#paste21)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
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

<!--obsidian-->
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

#### 307. [Paste22](../../spec/paste.md#paste22)

> pastePlain

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
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

<!--obsidian-->
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

#### 308. [Paste23](../../spec/paste.md#paste23)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
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

<!--obsidian-->
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

#### 309. [Paste25](../../spec/paste.md#paste25)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
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

<!--obsidian-->
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

#### 310. [Paste26](../../spec/paste.md#paste26)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
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

<!--obsidian-->
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

#### 311. [Paste27](../../spec/paste.md#paste27)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
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

<!--obsidian-->
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

#### 312. [Paste28](../../spec/paste.md#paste28)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
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

<!--obsidian-->
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

#### 313. [Paste29](../../spec/paste.md#paste29)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
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

<!--obsidian-->
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

#### 314. [Paste30](../../spec/paste.md#paste30)

> pastePlain

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
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

<!--obsidian-->
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

#### 315. [Paste32](../../spec/paste.md#paste32)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
# h
```

</td><td>

```buffer
para┃
```

</td><td>

<!--obsidian-->
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

#### 316. [Paste33](../../spec/paste.md#paste33)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
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

<!--obsidian-->
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

#### 317. [Paste34](../../spec/paste.md#paste34)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
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

<!--obsidian-->
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

#### 318. [Paste35](../../spec/paste.md#paste35)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
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

<!--obsidian-->
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

#### 319. [Paste36](../../spec/paste.md#paste36)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
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

<!--obsidian-->
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

#### 320. [Paste37](../../spec/paste.md#paste37)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
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

<!--obsidian-->
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

#### 321. [Paste40](../../spec/paste.md#paste40)

> pastePlain

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
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

<!--obsidian-->
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

#### 322. [Paste41](../../spec/paste.md#paste41)

> pastePlain

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
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

<!--obsidian-->
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

#### 323. [Paste42](../../spec/paste.md#paste42)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
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

<!--obsidian-->
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

#### 324. [Paste44](../../spec/paste.md#paste44)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
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

<!--obsidian-->
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

#### 325. [Paste45](../../spec/paste.md#paste45)

> pastePlain

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
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

<!--obsidian-->
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

#### 326. [Paste46](../../spec/paste.md#paste46)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
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

<!--obsidian-->
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

#### 327. [Paste47](../../spec/paste.md#paste47)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
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

<!--obsidian-->
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

#### 328. [Placeholder1](../../spec/placeholders.md#placeholder1)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

#### 329. [Placeholder2](../../spec/placeholders.md#placeholder2)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

#### 330. [Placeholder3](../../spec/placeholders.md#placeholder3)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

#### 331. [Placeholder4](../../spec/placeholders.md#placeholder4)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

#### 332. [Placeholder5](../../spec/placeholders.md#placeholder5)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

#### 333. [Placeholder7](../../spec/placeholders.md#placeholder7)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

#### 334. [Placeholder9](../../spec/placeholders.md#placeholder9)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

#### 335. [Placeholder13](../../spec/placeholders.md#placeholder13)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

#### 336. [Placeholder14](../../spec/placeholders.md#placeholder14)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

#### 337. [Placeholder15](../../spec/placeholders.md#placeholder15)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

#### 338. [Placeholder16](../../spec/placeholders.md#placeholder16)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

#### 339. [Quote1](../../spec/quotes.md#quote1)

> indent

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- > - a
  > - b┃
```

</td><td>

<!--obsidian-->
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

#### 340. [Indent inside a quote › Quote2](../../spec/quotes.md#quote2)

> indent

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a
> - b┃
```

</td><td>

<!--obsidian-->
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

#### 341. [Indent inside a quote › Quote3](../../spec/quotes.md#quote3)

> indent

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
>- a
>- b┃
```

</td><td>

<!--obsidian-->
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

#### 342. [Indent inside a quote › Quote5](../../spec/quotes.md#quote5)

> indent

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- x
  > - a
  > - b┃
```

</td><td>

<!--obsidian-->
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

#### 343. [Indent inside a quote › Quote6](../../spec/quotes.md#quote6)

> indent

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> > - a
> > - b┃
```

</td><td>

<!--obsidian-->
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

#### 344. [Indent inside a quote › Quote7](../../spec/quotes.md#quote7)

> indent

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> [!note] Title
> - a
> - b┃
```

</td><td>

<!--obsidian-->
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

#### 345. [Indent inside a quote › Quote8](../../spec/quotes.md#quote8)

> indent

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a
> - b┃
c
```

</td><td>

<!--obsidian-->
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

#### 346. [Indent inside a quote › Quote9](../../spec/quotes.md#quote9)

> indent

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> a
>
> b┃
```

</td><td>

<!--obsidian-->
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

#### 347. [Outdent out of a quote › Quote11](../../spec/quotes.md#quote11)

> outdent

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a
> - b┃
```

</td><td>

<!--obsidian-->
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

#### 348. [Outdent out of a quote › Quote12](../../spec/quotes.md#quote12)

> outdent

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a┃
>   - c
> - b
```

</td><td>

<!--obsidian-->
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

#### 349. [Outdent out of a quote › Quote13](../../spec/quotes.md#quote13)

> outdent

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> [!note] T
> - a┃
```

</td><td>

<!--obsidian-->
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

#### 350. [Outdent out of a quote › Quote14](../../spec/quotes.md#quote14)

> outdent

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a
> - b┃
c
```

</td><td>

<!--obsidian-->
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

#### 351. [Outdent out of a quote › Quote15](../../spec/quotes.md#quote15)

> outdent

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- x
  > - a
  > - b┃
```

</td><td>

<!--obsidian-->
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

#### 352. [Outdent out of a quote › Quote16](../../spec/quotes.md#quote16)

> outdent

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a
> - b┃
>
>   c
```

</td><td>

<!--obsidian-->
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

#### 353. [Indent into a quote › Quote17](../../spec/quotes.md#quote17)

> indent

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a
- b┃
```

</td><td>

<!--obsidian-->
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

#### 354. [Indent into a quote › Quote18](../../spec/quotes.md#quote18)

> indent

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a

- b┃
  - c

  d
```

</td><td>

<!--obsidian-->
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

#### 355. [Indent into a quote › Quote19](../../spec/quotes.md#quote19)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

#### 356. [Moving between quotes › Quote21](../../spec/quotes.md#quote21)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - x
- a┃

> - b
```

</td><td>

<!--obsidian-->
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

#### 357. [Moving between quotes › Quote22](../../spec/quotes.md#quote22)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

#### 358. [Moving between quotes › Quote23](../../spec/quotes.md#quote23)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
```buffer
> - a┃
- c
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

#### 359. [Moving inside a quote › Quote25](../../spec/quotes.md#quote25)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a
>
> - b┃
```

</td><td>

<!--obsidian-->
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

#### 360. [A quote and a heading don't swap › Quote27](../../spec/quotes.md#quote27)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> q
# H┃
```

</td><td>

<!--obsidian-->
```buffer
# H┃
> q
```

</td><td>

<!--ourus-->
```buffer
> q
# H┃
```

</td></tr>
</table>

#### 361. [Enter in a quote › Quote31](../../spec/quotes.md#quote31)

> enter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a
b┃
```

</td><td>

<!--obsidian-->
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

#### 362. [Enter in a quote › Quote32](../../spec/quotes.md#quote32)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

#### 363. [Enter in a quote › Quote33](../../spec/quotes.md#quote33)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

#### 364. [Enter in a quote › Quote34](../../spec/quotes.md#quote34)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

#### 365. [Enter in a quote › Quote35](../../spec/quotes.md#quote35)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

#### 366. [Enter in a quote › Quote36](../../spec/quotes.md#quote36)

> enter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> ab┃cd
```

</td><td>

<!--obsidian-->
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

#### 367. [Enter in a quote › Quote37](../../spec/quotes.md#quote37)

> enter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> a
>
> ┃b
```

</td><td>

<!--obsidian-->
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

#### 368. [Enter in a quote › Quote38](../../spec/quotes.md#quote38)

> enter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> [!note] Ti┃tle
> body
```

</td><td>

<!--obsidian-->
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

#### 369. [Enter in a quote › Quote40](../../spec/quotes.md#quote40)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

#### 370. [Enter in a quote › Quote41](../../spec/quotes.md#quote41)

> enter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> [!tip] Title┃- x
> - y
```

</td><td>

<!--obsidian-->
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

#### 371. [Enter in a quote › Quote42](../../spec/quotes.md#quote42)

> enter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> para ┃- x
> - a
```

</td><td>

<!--obsidian-->
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

#### 372. [Enter in a quote › Quote43](../../spec/quotes.md#quote43)

> enter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> [!ti┃p] Title
```

</td><td>

<!--obsidian-->
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

#### 373. [Shift-Enter in a quote › Quote47](../../spec/quotes.md#quote47)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> [!tip] Ti┃tle
> body
```

</td><td>

<!--obsidian-->
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

#### 374. [Joining in a quote › Quote48](../../spec/quotes.md#quote48)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a
> - ┃b
```

</td><td>

<!--obsidian-->
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

#### 375. [Joining in a quote › Quote49](../../spec/quotes.md#quote49)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> a
> - ┃b
```

</td><td>

<!--obsidian-->
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

#### 376. [Joining in a quote › Quote50](../../spec/quotes.md#quote50)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> a┃
> - b
```

</td><td>

<!--obsidian-->
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

#### 377. [Joining in a quote › Quote51](../../spec/quotes.md#quote51)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> a┃
>
> b
```

</td><td>

<!--obsidian-->
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

#### 378. [Joining across a quote's edge › Quote52](../../spec/quotes.md#quote52)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a
- ┃b
  - c
```

</td><td>

<!--obsidian-->
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

#### 379. [Backspace at a quote's start › Quote53](../../spec/quotes.md#quote53)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

> ┃q
```

</td><td>

<!--obsidian-->
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

#### 380. [Backspace at a quote's start › Quote54](../../spec/quotes.md#quote54)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

#### 381. [Backspace at a quote's start › Quote56](../../spec/quotes.md#quote56)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

> ┃q
>
> r
```

</td><td>

<!--obsidian-->
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

#### 382. [Backspace at a quote's start › Quote57](../../spec/quotes.md#quote57)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para

> [!note] ┃Title
> body
```

</td><td>

<!--obsidian-->
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

#### 383. [Backspace at a quote's start › Quote58](../../spec/quotes.md#quote58)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para

> ┃[!note] Title
> body
```

</td><td>

<!--obsidian-->
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

#### 384. [Backspace at a quote's start › Quote59](../../spec/quotes.md#quote59)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - ┃
```

</td><td>

<!--obsidian-->
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

#### 385. [Joining into a callout's title › Quote60](../../spec/quotes.md#quote60)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> [!note] Ti
> ┃tle
>
> body
```

</td><td>

<!--obsidian-->
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

#### 386. [Joining into a callout's title › Quote61](../../spec/quotes.md#quote61)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> [!note] Title┃
> body
```

</td><td>

<!--obsidian-->
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

#### 387. [Joining into a callout's title › Quote62](../../spec/quotes.md#quote62)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> [!note] Title
> - ┃a
```

</td><td>

<!--obsidian-->
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

#### 388. [Quote63](../../spec/quotes.md#quote63)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
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

<!--obsidian-->
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

#### 389. [Quote64](../../spec/quotes.md#quote64)

> indent

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> # H
> - a
> - b┃
```

</td><td>

<!--obsidian-->
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

#### 390. [Indenting a paragraph into a quote › Quote65](../../spec/quotes.md#quote65)

> indent

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> q

para┃
```

</td><td>

<!--obsidian-->
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

#### 391. [Indenting a paragraph into a quote › Quote66](../../spec/quotes.md#quote66)

> outdent

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> q
>
> para┃
```

</td><td>

<!--obsidian-->
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

#### 392. [Quote68](../../spec/quotes.md#quote68)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - x
> - y

> q┃
```

</td><td>

<!--obsidian-->
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

#### 393. [Quote71](../../spec/quotes.md#quote71)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> [!note] T
> - a┃

- b
```

</td><td>

<!--obsidian-->
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

#### 394. [Quote72](../../spec/quotes.md#quote72)

> outdent

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - x
> - a┃
> - b
```

</td><td>

<!--obsidian-->
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

#### 395. [A paragraph outdented out of a nested quote › Quote69](../../spec/quotes.md#quote69)

> outdent

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a
> > q┃
```

</td><td>

<!--obsidian-->
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

#### 396. [A paragraph outdented out of a nested quote › Quote70](../../spec/quotes.md#quote70)

> outdent

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> > q┃
> - a
```

</td><td>

<!--obsidian-->
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

#### 397. [Outliner flows › Scenario3](../../spec/scenarios.md#scenario3)

> enter indent deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
```

</td><td>

<!--obsidian-->
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

#### 398. [Outliner flows › Scenario4](../../spec/scenarios.md#scenario4)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

#### 399. [Outliner flows › Scenario5](../../spec/scenarios.md#scenario5)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a┃
```

</td></tr>
</table>

> enter indent "b" enter "c" enter outdent "d"

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

> cursorDocStart cursorLineBoundaryForward moveSubtreeDown

<table>
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
```buffer
  - b
- a┃
  - c
- d
```

</td><td>

<!--ourus-->
```buffer
- d
- a┃
  - b
  - c
```

</td></tr>
</table>

> undo

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

#### 400. [Outliner flows › Scenario6](../../spec/scenarios.md#scenario6)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

#### 401. [Outliner flows › Scenario7](../../spec/scenarios.md#scenario7)

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
- ┃and eggs
- call Ann
```

</td></tr>
</table>

> deleteContentBackward " "

<table>
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
```buffer
- buy milk
- ┃and eggs
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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
```buffer
- buy milk
┃- and eggs
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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
```buffer
- buy milk

today:┃- and eggs
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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
```buffer
- buy milk

today:- and eggs
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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
```buffer
- buy milk

today:- and eggs┃- call An
```

</td><td>

<!--ourus-->
```buffer
- today:
- buy milk and eggs┃call A
```

</td></tr>
</table>

#### 402. [Outliner flows › Scenario8](../../spec/scenarios.md#scenario8)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
```buffer
- Work┃
- Inbox
  - email
- Home
  - plants
```

</td><td>

<!--ourus-->
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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
```buffer
- Inbox
  - email
- Work┃
- Home
  - plants
```

</td><td>

<!--ourus-->
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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
```buffer
- Inbox
  - Work┃
  - email
- Home
  - plants
```

</td><td>

<!--ourus-->
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

#### 403. [Outliner flows › Scenario9](../../spec/scenarios.md#scenario9)

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
<tr><th>buffer</th></tr>
<tr valign="top"><td>

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
<tr><th>buffer</th></tr>
<tr valign="top"><td>

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
```buffer
  - call Ann
- Inbox┃
- Errands
  - post a letter
  - buy milk
```

</td><td>

<!--ourus-->
```buffer
- Errands
  - post a letter
  - buy milk
- Inbox┃
  - call Ann
```

</td></tr>
</table>

#### 404. [Outliner flows › Scenario11](../../spec/scenarios.md#scenario11)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
```buffer
- a
┃more
- b
```

</td><td>

<!--ourus-->
```buffer
- a┃more
- b
```

</td></tr>
</table>

> cursorLineBoundaryForward deleteContentForward

<table>
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
```buffer
- a
more┃- b
```

</td><td>

<!--ourus-->
```buffer
- amore┃b
```

</td></tr>
</table>

> undo

<table>
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
```buffer
- a
more┃
- b
```

</td><td>

<!--ourus-->
```buffer
- amore┃
- b
```

</td></tr>
</table>

> redo

<table>
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

#### 405. [Outliner flows › Scenario12](../../spec/scenarios.md#scenario12)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
```buffer
- a
- ┃
  - b
- c
  - d
```

</td><td>

<!--ourus-->
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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
```buffer
- a
- x┃
  - b
- c
  - d
```

</td><td>

<!--ourus-->
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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
```buffer
- a
-┃x
  - b
- c
  - d
```

</td><td>

<!--ourus-->
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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
```buffer
- a┃-x
  - b
- c
  - d
```

</td><td>

<!--ourus-->
```buffer
- ax┃b
- c
  - d
```

</td></tr>
</table>

#### 406. [Outliner flows › Scenario13](../../spec/scenarios.md#scenario13)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
1. one
2. two┃
3. three
```

</td></tr>
</table>

> moveSubtreeUp

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
1. two┃
2. one
3. three
```

</td></tr>
</table>

> moveSubtreeDown moveSubtreeDown

<table>
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
```buffer
2. one
3. three
4. two┃
```

</td><td>

<!--ourus-->
```buffer
1. one
2. three
3. two┃
```

</td></tr>
</table>

#### 407. [Outliner flows › Scenario15](../../spec/scenarios.md#scenario15)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

#### 408. [Outliner flows › Scenario16](../../spec/scenarios.md#scenario16)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
```buffer
# Work
- email

- [x] ┃review
# Home
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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
```buffer
# Work
- email

- [x] today ┃review
# Home
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

#### 409. [Outliner flows › Scenario18](../../spec/scenarios.md#scenario18)

> pasteStructured "!"

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
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

<!--obsidian-->
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

#### 410. [Notes and sections › Scenario19](../../spec/scenarios.md#scenario19)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
```buffer
# Notes
second┃
first idea
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

#### 411. [Notes and sections › Scenario20](../../spec/scenarios.md#scenario20)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
```buffer
# Trip
Pack light.
Seat 42.┃
Book the train.
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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

#### 412. [Notes and sections › Scenario21](../../spec/scenarios.md#scenario21)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

#### 413. [Notes and sections › Scenario22](../../spec/scenarios.md#scenario22)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

#### 414. [Notes and sections › Scenario23](../../spec/scenarios.md#scenario23)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
```buffer
# Plan
revise ┃2. draft
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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
```buffer
# Plan
revise 
┃2. draft
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

#### 415. [ShiftEnter1](../../spec/shift-enter.md#shiftenter1)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one two┃ three
```

</td><td>

<!--obsidian-->
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

#### 416. [ShiftEnter2](../../spec/shift-enter.md#shiftenter2)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a
   - b┃ c
```

</td><td>

<!--obsidian-->
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

#### 417. [ShiftEnter3](../../spec/shift-enter.md#shiftenter3)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- x
→- a┃ b
```

</td><td>

<!--obsidian-->
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

#### 418. [ShiftEnter5](../../spec/shift-enter.md#shiftenter5)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc ┃- def
```

</td><td>

<!--obsidian-->
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

#### 419. [ShiftEnter6](../../spec/shift-enter.md#shiftenter6)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc ┃1. def
```

</td><td>

<!--obsidian-->
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

#### 420. [ShiftEnter7](../../spec/shift-enter.md#shiftenter7)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Title ┃===
```

</td><td>

<!--obsidian-->
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

#### 421. [ShiftEnter8](../../spec/shift-enter.md#shiftenter8)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Title ┃--
```

</td><td>

<!--obsidian-->
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

#### 422. [ShiftEnter9](../../spec/shift-enter.md#shiftenter9)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one ┃<div>
```

</td><td>

<!--obsidian-->
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

#### 423. [ShiftEnter13](../../spec/shift-enter.md#shiftenter13)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃one
```

</td><td>

<!--obsidian-->
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

#### 424. [ShiftEnter14](../../spec/shift-enter.md#shiftenter14)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Title┃ more
```

</td><td>

<!--obsidian-->
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

#### 425. [ShiftEnter17](../../spec/shift-enter.md#shiftenter17)

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
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- one
  ┃two
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

#### 426. [ShiftEnter18](../../spec/shift-enter.md#shiftenter18)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. abc ┃2. x
```

</td><td>

<!--obsidian-->
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

#### 427. [ShiftEnter19](../../spec/shift-enter.md#shiftenter19)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
a | b ┃|---|---|
```

</td><td>

<!--obsidian-->
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

#### 428. [ShiftEnter20](../../spec/shift-enter.md#shiftenter20)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
```buffer
- abc
┃- def
```

</td><td>

<!--ourus-->
```buffer
- abc┃- def
```

</td></tr>
</table>

#### 429. [ShiftEnter21](../../spec/shift-enter.md#shiftenter21)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
```buffer
- one two
┃ three
```

</td><td>

<!--ourus-->
```buffer
- one two┃three
```

</td></tr>
</table>

#### 430. [TaskEnter1](../../spec/tasks.md#taskenter1)

> enter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- [ ] ┃
```

</td><td>

<!--obsidian-->
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

#### 431. [TaskEnter5](../../spec/tasks.md#taskenter5)

> enter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b
  - [ ] ┃
  - c
```

</td><td>

<!--obsidian-->
```buffer
- a
  - b
- [ ] ┃
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

#### 432. [TaskEnter6](../../spec/tasks.md#taskenter6)

> enter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - [ ] ┃
  - b
```

</td><td>

<!--obsidian-->
```buffer
- a
- [ ] ┃
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

#### 433. [TaskBackspace1](../../spec/tasks.md#taskbackspace1)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- 
  - ┃[ ] task
    - child
```

</td><td>

<!--obsidian-->
```buffer
- a
- 
  -┃[ ] task
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

#### 434. [TaskBackspace2](../../spec/tasks.md#taskbackspace2)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

#### 435. [TaskBackspace3](../../spec/tasks.md#taskbackspace3)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- [x] ┃b
```

</td><td>

<!--obsidian-->
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

#### 436. [TaskBackspace6](../../spec/tasks.md#taskbackspace6)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] 
- ┃[x] a
```

</td><td>

<!--obsidian-->
```buffer
- [ ] 
-┃[x] a
```

</td><td>

<!--ourus-->
```buffer
- [x] ┃a
```

</td></tr>
</table>

#### 437. [TaskDelete1](../../spec/tasks.md#taskdelete1)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- [ ] b
```

</td><td>

<!--obsidian-->
```buffer
- a┃- [ ] b
```

</td><td>

<!--ourus-->
```buffer
- a┃b
```

</td></tr>
</table>

#### 438. [TaskDelete2](../../spec/tasks.md#taskdelete2)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
- [x] a
```

</td><td>

<!--obsidian-->
```buffer
- ┃- [x] a
```

</td><td>

<!--ourus-->
```buffer
- [x] ┃a
```

</td></tr>
</table>

#### 439. [TaskDelete3](../../spec/tasks.md#taskdelete3)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- [ ] 
```

</td><td>

<!--obsidian-->
```buffer
- a┃- [ ] 
```

</td><td>

<!--ourus-->
```buffer
- a┃
```

</td></tr>
</table>

#### 440. [Undo3](../../spec/undo.md#undo3)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

#### 441. [Undo4](../../spec/undo.md#undo4)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

#### 442. [Undo5](../../spec/undo.md#undo5)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

### Whitespace (5)

#### 1. [Fence12](../../spec/fences.md#fence12)

> enter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ┃```
  code
  ```
````

</td><td>

<!--obsidian-->
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

#### 2. [ShiftEnter10](../../spec/shift-enter.md#shiftenter10)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

#### 3. [ShiftEnter11](../../spec/shift-enter.md#shiftenter11)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  ┃
- two
```

</td><td>

<!--obsidian-->
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

#### 4. [ShiftEnter15](../../spec/shift-enter.md#shiftenter15)

> shiftEnter shiftEnter "p"

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one┃
```

</td><td>

<!--obsidian-->
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

#### 5. [TaskEnter3](../../spec/tasks.md#taskenter3)

> enter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] abc ┃# x
```

</td><td>

<!--obsidian-->
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

### Caret (21)

#### 1. [CursorUp1](../../spec/cursor.md#cursorup1)

> cursorLineUp

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
ab┃
```

</td><td>

<!--obsidian-->
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
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
## Title
- ┃a
```

</td><td>

<!--obsidian-->
```buffer
#┃# Title
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
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
    - b
- c┃
```

</td><td>

<!--obsidian-->
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
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃a
  - b
```

</td><td>

<!--obsidian-->
```buffer
- a
┃  - b
```

</td><td>

<!--ourus-->
```buffer
- a
  - ┃b
```

</td></tr>
</table>

#### 5. [CursorDown5](../../spec/cursor.md#cursordown5)

> cursorLineDown

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- [ ] task
```

</td><td>

<!--obsidian-->
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

#### 6. [CursorHome3](../../spec/cursor.md#cursorhome3)

> cursorLineBoundaryBackward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
┃- one two
```

</td><td>

<!--obsidian-->
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
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
-┃ one
```

</td><td>

<!--obsidian-->
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
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
## Title┃
```

</td><td>

<!--obsidian-->
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

#### 9. [CursorHome15](../../spec/cursor.md#cursorhome15)

> cursorLineBoundaryBackward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
┃- [ ] 
```

</td><td>

<!--obsidian-->
```buffer
┃- [ ] 
```

</td><td>

<!--ourus-->
```buffer
- [ ] ┃
```

</td></tr>
</table>

#### 10. [CursorHome17](../../spec/cursor.md#cursorhome17)

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
<tr><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--obsidian-->
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

#### 11. [Delete16g](../../spec/del.md#delete16g)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
-┃  a
```

</td><td>

<!--obsidian-->
```buffer
-┃ a
```

</td><td>

<!--ourus-->
```buffer
- ┃a
```

</td></tr>
</table>

#### 12. [Enter26](../../spec/enter.md#enter26)

> enter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃b
```

</td><td>

<!--obsidian-->
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

#### 13. [Enter29](../../spec/enter.md#enter29)

> enter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b
  - ┃c
```

</td><td>

<!--obsidian-->
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

#### 14. [Enter31](../../spec/enter.md#enter31)

> enter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃a
  - b
```

</td><td>

<!--obsidian-->
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

#### 15. [Fence13](../../spec/fences.md#fence13)

> enter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ```
  code
  ┃```
````

</td><td>

<!--obsidian-->
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

#### 16. [Fence41](../../spec/fences.md#fence41)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ```
  code
  ┃```
````

</td><td>

<!--obsidian-->
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

#### 17. [Indent28](../../spec/indent.md#indent28)

> indent

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
┃- b
```

</td><td>

<!--obsidian-->
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

#### 18. [MoveDown32](../../spec/move-subtree-down.md#movedown32)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
┃- a
- b
```

</td><td>

<!--obsidian-->
```buffer
- b
┃- a
```

</td><td>

<!--ourus-->
```buffer
- b
- ┃a
```

</td></tr>
</table>

#### 19. [MoveUp34](../../spec/move-subtree-up.md#moveup34)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
┃- b
```

</td><td>

<!--obsidian-->
```buffer
┃- b
- a
```

</td><td>

<!--ourus-->
```buffer
- ┃b
- a
```

</td></tr>
</table>

#### 20. [Outdent14](../../spec/outdent.md#outdent14)

> outdent

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  ┃- b
```

</td><td>

<!--obsidian-->
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

#### 21. [TaskEnter4](../../spec/tasks.md#taskenter4)

> enter

<table>
<tr><th>buffer</th><th>obsidian</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] ┃abc
```

</td><td>

<!--obsidian-->
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

### Agree (134)

1. [Backspace12](../../spec/backspace.md#backspace12)
2. [Backspace12c](../../spec/backspace.md#backspace12c)
3. [Backspace13](../../spec/backspace.md#backspace13)
4. [Backspace26](../../spec/backspace.md#backspace26)
5. [Backspace31](../../spec/backspace.md#backspace31)
6. [Backspace32](../../spec/backspace.md#backspace32)
7. [CursorLeft1](../../spec/cursor.md#cursorleft1)
8. [CursorLeft3](../../spec/cursor.md#cursorleft3)
9. [CursorRight1](../../spec/cursor.md#cursorright1)
10. [CursorRight2](../../spec/cursor.md#cursorright2)
11. [CursorDown1](../../spec/cursor.md#cursordown1)
12. [CursorDown2](../../spec/cursor.md#cursordown2)
13. [CursorDown4](../../spec/cursor.md#cursordown4)
14. [CursorHome1](../../spec/cursor.md#cursorhome1)
15. [CursorHome2](../../spec/cursor.md#cursorhome2)
16. [CursorHome5](../../spec/cursor.md#cursorhome5)
17. [CursorHome6](../../spec/cursor.md#cursorhome6)
18. [CursorHome7](../../spec/cursor.md#cursorhome7)
19. [CursorHome8](../../spec/cursor.md#cursorhome8)
20. [CursorHome9](../../spec/cursor.md#cursorhome9)
21. [CursorHome11](../../spec/cursor.md#cursorhome11)
22. [CursorHome12](../../spec/cursor.md#cursorhome12)
23. [CursorHome13](../../spec/cursor.md#cursorhome13)
24. [CursorHome14](../../spec/cursor.md#cursorhome14)
25. [CursorHome16](../../spec/cursor.md#cursorhome16)
26. [CursorEnd1](../../spec/cursor.md#cursorend1)
27. [CursorDocStart1](../../spec/cursor.md#cursordocstart1)
28. [CursorDocEndLeft1](../../spec/cursor.md#cursordocendleft1)
29. [SelectLeft1](../../spec/cursor.md#selectleft1)
30. [SelectRightEnd1](../../spec/cursor.md#selectrightend1)
31. [SelectHome1](../../spec/cursor.md#selecthome1)
32. [Delete8](../../spec/del.md#delete8)
33. [Delete15](../../spec/del.md#delete15)
34. [Delete16](../../spec/del.md#delete16)
35. [Delete16f](../../spec/del.md#delete16f)
36. [Delete18](../../spec/del.md#delete18)
37. [Delete18b](../../spec/del.md#delete18b)
38. [Delete21](../../spec/del.md#delete21)
39. [Delete22](../../spec/del.md#delete22)
40. [Delete23](../../spec/del.md#delete23)
41. [Delete24](../../spec/del.md#delete24)
42. [Delete25](../../spec/del.md#delete25)
43. [Enter1](../../spec/enter.md#enter1)
44. [Enter2](../../spec/enter.md#enter2)
45. [Enter3](../../spec/enter.md#enter3)
46. [Enter5](../../spec/enter.md#enter5)
47. [Enter15b](../../spec/enter.md#enter15b)
48. [Enter29b](../../spec/enter.md#enter29b)
49. [Enter32b](../../spec/enter.md#enter32b)
50. [Enter33b](../../spec/enter.md#enter33b)
51. [Fence1](../../spec/fences.md#fence1)
52. [Fence2](../../spec/fences.md#fence2)
53. [Fence3](../../spec/fences.md#fence3)
54. [Fence4](../../spec/fences.md#fence4)
55. [Fence5](../../spec/fences.md#fence5)
56. [Fence6](../../spec/fences.md#fence6)
57. [Fence7b](../../spec/fences.md#fence7b)
58. [Fence7d](../../spec/fences.md#fence7d)
59. [Fence8](../../spec/fences.md#fence8)
60. [Fence28](../../spec/fences.md#fence28)
61. [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap8](../../spec/gaps.md#gap8)
62. [New text and gaps › Gap12](../../spec/gaps.md#gap12)
63. [Keys on a blank line › Gap19](../../spec/gaps.md#gap19)
64. [Indent1](../../spec/indent.md#indent1)
65. [Indent6](../../spec/indent.md#indent6)
66. [Indent7](../../spec/indent.md#indent7)
67. [Indent8](../../spec/indent.md#indent8)
68. [Indent9](../../spec/indent.md#indent9)
69. [Indent14](../../spec/indent.md#indent14)
70. [Indent27](../../spec/indent.md#indent27)
71. [MoveDown11](../../spec/move-subtree-down.md#movedown11)
72. [MoveDown12](../../spec/move-subtree-down.md#movedown12)
73. [MoveDown14](../../spec/move-subtree-down.md#movedown14)
74. [MoveDown15](../../spec/move-subtree-down.md#movedown15)
75. [MoveUp2](../../spec/move-subtree-up.md#moveup2)
76. [MoveUp6](../../spec/move-subtree-up.md#moveup6)
77. [MoveUp10](../../spec/move-subtree-up.md#moveup10)
78. [MoveUp11](../../spec/move-subtree-up.md#moveup11)
79. [MoveUp14](../../spec/move-subtree-up.md#moveup14)
80. [MoveUp29](../../spec/move-subtree-up.md#moveup29)
81. [MoveUp31](../../spec/move-subtree-up.md#moveup31)
82. [MoveUp32](../../spec/move-subtree-up.md#moveup32)
83. [Enter › E15](../../spec/obsidian-true-outliner.md#e15)
84. [Enter › E19, E21 › End of lone heading starts a paragraph](../../spec/obsidian-true-outliner.md#end-of-lone-heading-starts-a-paragraph)
85. [Enter › E19, E21 › Empty paragraph before a section list](../../spec/obsidian-true-outliner.md#empty-paragraph-before-a-section-list)
86. [Enter › E32 › Task checkbox carries over unchecked](../../spec/obsidian-true-outliner.md#task-checkbox-carries-over-unchecked)
87. [Enter › E32 › Checked task gives unchecked new item](../../spec/obsidian-true-outliner.md#checked-task-gives-unchecked-new-item)
88. [Enter › E13, E16 › Rest of title becomes first paragraph](../../spec/obsidian-true-outliner.md#rest-of-title-becomes-first-paragraph)
89. [Enter › E13, E16 › Split title above a subheading](../../spec/obsidian-true-outliner.md#split-title-above-a-subheading)
90. [Shift-Enter › S5](../../spec/obsidian-true-outliner.md#s5)
91. [Shift-Enter › S11 › Place inside a multi-line item](../../spec/obsidian-true-outliner.md#place-inside-a-multi-line-item)
92. [Backspace › delete-to-content-start](../../spec/obsidian-true-outliner.md#delete-to-content-start)
93. [Indentation › #255 › Outdented child leaves quote above alone](../../spec/obsidian-true-outliner.md#outdented-child-leaves-quote-above-alone)
94. [Abandoning an empty place › Enter, Shift-Tab, then leave › Second Enter outdents to a kept item](../../spec/obsidian-true-outliner.md#second-enter-outdents-to-a-kept-item)
95. [Outdent1](../../spec/outdent.md#outdent1)
96. [Outdent2](../../spec/outdent.md#outdent2)
97. [Outdent3](../../spec/outdent.md#outdent3)
98. [Outdent5](../../spec/outdent.md#outdent5)
99. [Outdent6](../../spec/outdent.md#outdent6)
100. [Outdent10](../../spec/outdent.md#outdent10)
101. [Paste24](../../spec/paste.md#paste24)
102. [Paste31](../../spec/paste.md#paste31)
103. [Placeholder6](../../spec/placeholders.md#placeholder6)
104. [Placeholder8](../../spec/placeholders.md#placeholder8)
105. [Placeholder10](../../spec/placeholders.md#placeholder10)
106. [Placeholder11](../../spec/placeholders.md#placeholder11)
107. [Placeholder12](../../spec/placeholders.md#placeholder12)
108. [Indent inside a quote › Quote4](../../spec/quotes.md#quote4)
109. [Quote10](../../spec/quotes.md#quote10)
110. [Moving inside a quote › Quote24](../../spec/quotes.md#quote24)
111. [Moving inside a quote › Quote26](../../spec/quotes.md#quote26)
112. [A quote and a heading don't swap › Quote28](../../spec/quotes.md#quote28)
113. [Enter in a quote › Quote29](../../spec/quotes.md#quote29)
114. [Enter in a quote › Quote30](../../spec/quotes.md#quote30)
115. [Enter in a quote › Quote39](../../spec/quotes.md#quote39)
116. [Shift-Enter in a quote › Quote44](../../spec/quotes.md#quote44)
117. [Shift-Enter in a quote › Quote45](../../spec/quotes.md#quote45)
118. [Shift-Enter in a quote › Quote46](../../spec/quotes.md#quote46)
119. [Quote67](../../spec/quotes.md#quote67)
120. [Outliner flows › Scenario1](../../spec/scenarios.md#scenario1)
121. [Outliner flows › Scenario2](../../spec/scenarios.md#scenario2)
122. [Outliner flows › Scenario14](../../spec/scenarios.md#scenario14)
123. [Notes and sections › Scenario24](../../spec/scenarios.md#scenario24)
124. [ShiftEnter4](../../spec/shift-enter.md#shiftenter4)
125. [ShiftEnter12](../../spec/shift-enter.md#shiftenter12)
126. [ShiftEnter22](../../spec/shift-enter.md#shiftenter22)
127. [TaskEnter2](../../spec/tasks.md#taskenter2)
128. [TaskEnter7](../../spec/tasks.md#taskenter7)
129. [TaskBackspace5](../../spec/tasks.md#taskbackspace5)
130. [Typing1](../../spec/typing.md#typing1)
131. [Typing2](../../spec/typing.md#typing2)
132. [Typing3](../../spec/typing.md#typing3)
133. [Undo1](../../spec/undo.md#undo1)
134. [Undo2](../../spec/undo.md#undo2)

## Skipped

### option outdent: logical (9)

1. [enter.md › Enter30](../../spec/enter.md#enter30)
2. [obsidian-true-outliner.md › Ordered lists › Outdenting the head of a nested list](../../spec/obsidian-true-outliner.md#outdenting-the-head-of-a-nested-list)
3. [outdent.md › Logical outdent › LogicalOutdent1](../../spec/outdent.md#logicaloutdent1)
4. [outdent.md › Logical outdent › LogicalOutdent2](../../spec/outdent.md#logicaloutdent2)
5. [outdent.md › Logical outdent › LogicalOutdent3](../../spec/outdent.md#logicaloutdent3)
6. [outdent.md › Logical outdent › LogicalOutdent4](../../spec/outdent.md#logicaloutdent4)
7. [outdent.md › Logical outdent › LogicalOutdent5](../../spec/outdent.md#logicaloutdent5)
8. [quotes.md › Outdent out of a quote › Quote12b](../../spec/quotes.md#quote12b)
9. [quotes.md › Moving between quotes › Quote20](../../spec/quotes.md#quote20)

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

### a caret inside two spaces of indentation (1)

1. [gaps.md › Keys on a blank line › Gap18](../../spec/gaps.md#gap18)

### nothing to compare (1)

1. [fences.md › Fence21](../../spec/fences.md#fence21)

### option bullet: + (1)

1. [indent.md › Indent18](../../spec/indent.md#indent18)

### option pasteStructuredMidText: after (1)

1. [paste.md › Paste38](../../spec/paste.md#paste38)
