---
type: "SxS"
app: "silverbullet"
version: "2.12.0-50-gb2726cd8-2026-10-13T06-53-29Z"
url: "https://demo.silverbullet.md/personal/"
model: "text"
command: "node sxs/run.ts silverbullet"
elapsed_s: 41
---

# SilverBullet vs ourus

Spec test suite replayed in SilverBullet and compared against ourus.

Regenerated from an earlier run (`--regenerate-report`): what SilverBullet did then, judged against the spec as it is now. It played every example as it is now.

Model: [text](../lib/text.ts) (buffers loaded and compared as written, caret included)

## Summary

|  | agree | caret | whitespace | disagree | error | skipped | total |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **total** | **157 (24%)** | **29 (4.4%)** | **10 (1.5%)** | **400 (61%)** | **0 (0%)** | **58 (8.9%)** | **654** |

Per-file:

|  | agree | caret | whitespace | disagree | error | skipped | total |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [backspace.md](../../spec/backspace.md) | 8 |  |  | 40 |  | 4 | **52** |
| [cursor.md](../../spec/cursor.md) | 16 | 19 |  |  |  | 1 | **36** |
| [del.md](../../spec/del.md) | 11 | 1 |  | 26 |  | 6 | **44** |
| [delete-subtree.md](../../spec/delete-subtree.md) |  |  |  |  |  | 6 | **6** |
| [duplicate-subtree.md](../../spec/duplicate-subtree.md) |  |  |  |  |  | 3 | **3** |
| [enter.md](../../spec/enter.md) | 4 |  | 4 | 38 |  | 6 | **52** |
| [fences.md](../../spec/fences.md) | 8 | 2 | 3 | 28 |  | 3 | **44** |
| [gaps.md](../../spec/gaps.md) | 11 | 1 |  | 7 |  |  | **19** |
| [indent.md](../../spec/indent.md) | 15 | 1 |  | 11 |  | 2 | **29** |
| [move-subtree-down.md](../../spec/move-subtree-down.md) | 12 | 2 |  | 18 |  |  | **32** |
| [move-subtree-up.md](../../spec/move-subtree-up.md) | 12 | 2 |  | 21 |  |  | **35** |
| [obsidian-true-outliner.md](../../spec/obsidian-true-outliner.md) | 19 |  |  | 43 |  | 5 | **67** |
| [outdent.md](../../spec/outdent.md) | 8 | 1 |  | 10 |  | 5 | **24** |
| [paste.md](../../spec/paste.md) | 2 |  |  | 41 |  | 5 | **48** |
| [placeholders.md](../../spec/placeholders.md) | 5 |  |  | 11 |  |  | **16** |
| [quotes.md](../../spec/quotes.md) | 9 |  |  | 61 |  | 4 | **74** |
| [scenarios.md](../../spec/scenarios.md) | 7 |  |  | 15 |  | 2 | **24** |
| [shift-enter.md](../../spec/shift-enter.md) | 2 |  | 2 | 17 |  | 2 | **23** |
| [tasks.md](../../spec/tasks.md) | 1 |  | 1 | 12 |  | 3 | **17** |
| [typing.md](../../spec/typing.md) | 3 |  |  |  |  | 1 | **4** |
| [undo.md](../../spec/undo.md) | 4 |  |  | 1 |  |  | **5** |
| **total** | **157 (24%)** | **29 (4.4%)** | **10 (1.5%)** | **400 (61%)** | **0 (0%)** | **58 (8.9%)** | **654** |

## Examples

### Disagree (400)

#### 1. [Backspace1](../../spec/backspace.md#backspace1)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
- ┃two
```

</td><td>

<!--silverbullet-->
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

#### 2. [Backspace2](../../spec/backspace.md#backspace2)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
┃- two
```

</td><td>

<!--silverbullet-->
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
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃b
```

</td><td>

<!--silverbullet-->
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

#### 4. [Backspace4](../../spec/backspace.md#backspace4)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Title #
- ┃more
```

</td><td>

<!--silverbullet-->
```buffer
# Title #
┃more
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
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- 
- ┃b
```

</td><td>

<!--silverbullet-->
```buffer
- 
  ┃b
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
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b
- ┃
```

</td><td>

<!--silverbullet-->
```buffer
- a
  - b
  ┃
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
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃b
  - c
```

</td><td>

<!--silverbullet-->
```buffer
- a
  ┃b
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
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  ┃two
```

</td><td>

<!--silverbullet-->
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
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

┃
```

</td><td>

<!--silverbullet-->
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
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

┃b
```

</td><td>

<!--silverbullet-->
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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para

- ┃a
```

</td><td>

<!--silverbullet-->
```buffer
para

┃a
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
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
```
x
```
- ┃a
````

</td><td>

<!--silverbullet-->
````buffer
```
x
```
┃a
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
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
- b
- c
```

</td><td>

<!--silverbullet-->
```buffer
┃
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
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
  - a
    - b
```

</td><td>

<!--silverbullet-->
```buffer
┃
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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
```buffer
- a
  ┃
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
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- x
- ┃
  - a
    - b
```

</td><td>

<!--silverbullet-->
```buffer
- x
  ┃
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

#### 19. [Backspace18](../../spec/backspace.md#backspace18)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para

# ┃Hello

body
```

</td><td>

<!--silverbullet-->
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

#### 20. [Backspace18c](../../spec/backspace.md#backspace18c)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
┃Title
===

text
```

</td><td>

<!--silverbullet-->
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

#### 21. [Backspace18d](../../spec/backspace.md#backspace18d)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
a
# ┃H1
text
```

</td><td>

<!--silverbullet-->
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

#### 22. [Backspace18e](../../spec/backspace.md#backspace18e)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- # ┃H
```

</td><td>

<!--silverbullet-->
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

#### 23. [Backspace19](../../spec/backspace.md#backspace19)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

  ┃bc
```

</td><td>

<!--silverbullet-->
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

#### 24. [Backspace20](../../spec/backspace.md#backspace20)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

┃

- b
```

</td><td>

<!--silverbullet-->
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

#### 25. [Backspace21](../../spec/backspace.md#backspace21)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

- ┃b
```

</td><td>

<!--silverbullet-->
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

#### 26. [Backspace22](../../spec/backspace.md#backspace22)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Title

┃more
```

</td><td>

<!--silverbullet-->
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

#### 27. [Backspace23](../../spec/backspace.md#backspace23)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Title

┃more
lines
```

</td><td>

<!--silverbullet-->
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

#### 28. [Backspace24](../../spec/backspace.md#backspace24)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
```
x
```

┃para
````

</td><td>

<!--silverbullet-->
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

#### 29. [Backspace25](../../spec/backspace.md#backspace25)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- 

┃para
```

</td><td>

<!--silverbullet-->
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

#### 30. [Backspace27](../../spec/backspace.md#backspace27)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> q

┃b
```

</td><td>

<!--silverbullet-->
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

#### 31. [Backspace28](../../spec/backspace.md#backspace28)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
```
x
```
- ┃
````

</td><td>

<!--silverbullet-->
````buffer
```
x
```
┃
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

#### 32. [Backspace29](../../spec/backspace.md#backspace29)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a
2. ┃
3. c
```

</td><td>

<!--silverbullet-->
```buffer
1. a
   ┃
3. c
```

</td><td>

<!--ourus-->
```buffer
1. a┃
2. c
```

</td></tr>
</table>

#### 33. [Backspace30](../../spec/backspace.md#backspace30)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃
```

</td><td>

<!--silverbullet-->
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

#### 34. [Backspace35](../../spec/backspace.md#backspace35)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
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

<!--silverbullet-->
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

#### 35. [Cmd-Backspace › SoftBackspace1](../../spec/backspace.md#softbackspace1)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
```buffer
┃def
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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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

#### 36. [Cmd-Backspace › SoftBackspace2](../../spec/backspace.md#softbackspace2)

> deleteSoftLineBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
abc ┃[a]: tail
```

</td><td>

<!--silverbullet-->
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

#### 37. [Cmd-Backspace › SoftBackspace3](../../spec/backspace.md#softbackspace3)

> deleteSoftLineBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
abc ┃- x tail
===
```

</td><td>

<!--silverbullet-->
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

#### 38. [Cmd-Backspace › SoftBackspace4](../../spec/backspace.md#softbackspace4)

> deleteSoftLineBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# abc ┃title #
```

</td><td>

<!--silverbullet-->
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

#### 39. [Cmd-Backspace › SoftBackspace5](../../spec/backspace.md#softbackspace5)

> deleteSoftLineBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
first
abc ┃- x
===
```

</td><td>

<!--silverbullet-->
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

#### 40. [Cmd-Backspace › SoftBackspace6](../../spec/backspace.md#softbackspace6)

> deleteSoftLineBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
title
=┃==
```

</td><td>

<!--silverbullet-->
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

#### 41. [Delete1](../../spec/del.md#delete1)

> deleteContentForward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc┃
  - def
```

</td><td>

<!--silverbullet-->
```buffer
- abc┃  - def
```

</td><td>

<!--ourus-->
```buffer
- abc┃def
```

</td></tr>
</table>

#### 42. [Delete2](../../spec/del.md#delete2)

> deleteContentForward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one┃
- two
```

</td><td>

<!--silverbullet-->
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

#### 43. [Delete3](../../spec/del.md#delete3)

> deleteContentForward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one┃
  two
```

</td><td>

<!--silverbullet-->
```buffer
- one┃  two
```

</td><td>

<!--ourus-->
```buffer
- one┃two
```

</td></tr>
</table>

#### 44. [Delete4](../../spec/del.md#delete4)

> deleteContentForward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Title┃ #
- more
```

</td><td>

<!--silverbullet-->
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

#### 45. [Delete4b](../../spec/del.md#delete4b)

> deleteContentForward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Title #┃
- more
```

</td><td>

<!--silverbullet-->
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

#### 46. [Delete5](../../spec/del.md#delete5)

> deleteContentForward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
  - a
    - b
  - c
- d
```

</td><td>

<!--silverbullet-->
```buffer
- ┃  - a
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

#### 47. [Delete5b](../../spec/del.md#delete5b)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
```buffer
- a
  - ┃    - b
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

#### 48. [Delete5c](../../spec/del.md#delete5c)

> deleteContentForward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- x
- ┃
  - a
    - b
```

</td><td>

<!--silverbullet-->
```buffer
- x
- ┃  - a
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

#### 49. [Delete5d](../../spec/del.md#delete5d)

> deleteContentForward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃ 
  - a
    - b
```

</td><td>

<!--silverbullet-->
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

#### 50. [Delete6](../../spec/del.md#delete6)

> deleteContentForward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃
- b
```

</td><td>

<!--silverbullet-->
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

#### 51. [Delete7](../../spec/del.md#delete7)

> deleteContentForward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
  - c
```

</td><td>

<!--silverbullet-->
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

#### 52. [Delete9](../../spec/del.md#delete9)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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

#### 53. [Delete10](../../spec/del.md#delete10)

> deleteContentForward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
> q
```

</td><td>

<!--silverbullet-->
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

#### 54. [Delete11](../../spec/del.md#delete11)

> deleteContentForward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# H┃
    code
```

</td><td>

<!--silverbullet-->
```buffer
# H┃    code
```

</td><td>

<!--ourus-->
```buffer
# H┃
    code
```

</td></tr>
</table>

#### 55. [Delete12](../../spec/del.md#delete12)

> deleteContentForward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b┃
- c
→- d
```

</td><td>

<!--silverbullet-->
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

#### 56. [Delete13](../../spec/del.md#delete13)

> deleteContentForward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
a┃

# H1
```

</td><td>

<!--silverbullet-->
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

#### 57. [Delete13c](../../spec/del.md#delete13c)

> deleteContentForward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
a┃

# H1
text
```

</td><td>

<!--silverbullet-->
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

#### 58. [Delete13e](../../spec/del.md#delete13e)

> deleteContentForward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
a┃

Title
=====
```

</td><td>

<!--silverbullet-->
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

#### 59. [Delete13g](../../spec/del.md#delete13g)

> deleteContentForward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- # H
```

</td><td>

<!--silverbullet-->
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

#### 60. [Delete14](../../spec/del.md#delete14)

> deleteContentForward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
a┃

# H1

body
```

</td><td>

<!--silverbullet-->
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

#### 61. [Delete16d](../../spec/del.md#delete16d)

> deleteContentForward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
-┃ b
  - c
```

</td><td>

<!--silverbullet-->
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

#### 62. [Delete16e](../../spec/del.md#delete16e)

> deleteContentForward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
-┃ a
→- b
```

</td><td>

<!--silverbullet-->
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

#### 63. [Delete17](../../spec/del.md#delete17)

> deleteContentForward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Shopping:┃

- milk
- eggs
```

</td><td>

<!--silverbullet-->
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

#### 64. [Delete18c](../../spec/del.md#delete18c)

> deleteContentForward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
a┃


b
```

</td><td>

<!--silverbullet-->
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

#### 65. [Delete19](../../spec/del.md#delete19)

> deleteContentForward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃[ ] task
```

</td><td>

<!--silverbullet-->
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

#### 66. [Delete20](../../spec/del.md#delete20)

> deleteContentForward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- 
- b
```

</td><td>

<!--silverbullet-->
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

#### 67. [Enter1](../../spec/enter.md#enter1)

> enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one two┃ three
- next
```

</td><td>

<!--silverbullet-->
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

#### 68. [Enter3](../../spec/enter.md#enter3)

> enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃ b
  - c
```

</td><td>

<!--silverbullet-->
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

#### 69. [Enter3c](../../spec/enter.md#enter3c)

> enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
9. a┃ b
   - c
10. d
```

</td><td>

<!--silverbullet-->
```buffer
9. a
10. ┃ b
   - c
11. d
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

#### 70. [Enter3d](../../spec/enter.md#enter3d)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
```buffer
- a
  ┃b
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

#### 71. [Enter4](../../spec/enter.md#enter4)

> enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - b
```

</td><td>

<!--silverbullet-->
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

#### 72. [Enter6](../../spec/enter.md#enter6)

> enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃
```

</td><td>

<!--silverbullet-->
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

#### 73. [Enter7](../../spec/enter.md#enter7)

> enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃
- b
```

</td><td>

<!--silverbullet-->
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

#### 74. [Enter8](../../spec/enter.md#enter8)

> enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc ┃- def
```

</td><td>

<!--silverbullet-->
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

#### 75. [Enter9](../../spec/enter.md#enter9)

> enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc ┃# def
```

</td><td>

<!--silverbullet-->
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

#### 76. [Enter10](../../spec/enter.md#enter10)

> enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc ┃<div>
```

</td><td>

<!--silverbullet-->
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

#### 77. [Enter11](../../spec/enter.md#enter11)

> enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
see ┃[a]: /url
```

</td><td>

<!--silverbullet-->
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

#### 78. [Enter12](../../spec/enter.md#enter12)

> enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
some┃ text
```

</td><td>

<!--silverbullet-->
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

#### 79. [Enter14](../../spec/enter.md#enter14)

> enter enter enter "p"

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b┃
```

</td><td>

<!--silverbullet-->
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

#### 80. [Enter15](../../spec/enter.md#enter15)

> enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

- ┃

- b
```

</td><td>

<!--silverbullet-->
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

#### 81. [Enter16](../../spec/enter.md#enter16)

> enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
lazy
```

</td><td>

<!--silverbullet-->
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

#### 82. [Enter21](../../spec/enter.md#enter21)

> enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
  - a
```

</td><td>

<!--silverbullet-->
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

#### 83. [Enter22](../../spec/enter.md#enter22)

> enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para ┃- x
- a
```

</td><td>

<!--silverbullet-->
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

#### 84. [Enter23](../../spec/enter.md#enter23)

> enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
### H┃2
    - a
```

</td><td>

<!--silverbullet-->
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

#### 85. [Enter25](../../spec/enter.md#enter25)

> enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
8. z┃
9. a
   - child
10. b
```

</td><td>

<!--silverbullet-->
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

#### 86. [Enter26b](../../spec/enter.md#enter26b)

> enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃b
```

</td><td>

<!--silverbullet-->
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

#### 87. [Enter27](../../spec/enter.md#enter27)

> enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b
  - ┃
  - c
```

</td><td>

<!--silverbullet-->
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
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃
  - c
```

</td><td>

<!--silverbullet-->
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

#### 89. [Enter32](../../spec/enter.md#enter32)

> enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para

# ┃Title

body
```

</td><td>

<!--silverbullet-->
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

#### 90. [Enter33](../../spec/enter.md#enter33)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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

#### 91. [Enter34](../../spec/enter.md#enter34)

> enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
-┃ alpha
```

</td><td>

<!--silverbullet-->
```buffer
-
- ┃ alpha
```

</td><td>

<!--ourus-->
```buffer
- ┃
- alpha
```

</td></tr>
</table>

#### 92. [Enter35](../../spec/enter.md#enter35)

> enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. abc ┃2. def
```

</td><td>

<!--silverbullet-->
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

#### 93. [Enter36](../../spec/enter.md#enter36)

> enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

- b┃
```

</td><td>

<!--silverbullet-->
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

#### 94. [Enter36b](../../spec/enter.md#enter36b)

> enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a
>
> - b┃
```

</td><td>

<!--silverbullet-->
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

#### 95. [Enter37](../../spec/enter.md#enter37)

> enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a
   text
   ┃
```

</td><td>

<!--silverbullet-->
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

#### 96. [Enter38](../../spec/enter.md#enter38)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
```buffer
- one
  ┃two
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

#### 97. [Enter39](../../spec/enter.md#enter39)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
```buffer
- ab
  ┃
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

#### 98. [Enter40](../../spec/enter.md#enter40)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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

#### 99. [Enter41](../../spec/enter.md#enter41)

> enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Title ┃- x
- y
```

</td><td>

<!--silverbullet-->
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

#### 100. [Enter42](../../spec/enter.md#enter42)

> enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
title ┃- x
===
```

</td><td>

<!--silverbullet-->
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

#### 101. [Enter43](../../spec/enter.md#enter43)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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

#### 102. [Enter44](../../spec/enter.md#enter44)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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

#### 103. [Enter45](../../spec/enter.md#enter45)

> enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para
# ┃Title
```

</td><td>

<!--silverbullet-->
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

#### 104. [Enter46](../../spec/enter.md#enter46)

> enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> ┃quote
```

</td><td>

<!--silverbullet-->
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

#### 105. [Fence4](../../spec/fences.md#fence4)

> enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
> ```
> code┃
> ```
````

</td><td>

<!--silverbullet-->
````buffer
> ```
> code
┃
> ```
````

</td><td>

<!--ourus-->
````buffer
> ```
> code
> ┃
> ```
````

</td></tr>
</table>

#### 106. [Fence7](../../spec/fences.md#fence7)

> enter "b"

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ```
  code
  ```┃
````

</td><td>

<!--silverbullet-->
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

#### 107. [Fence7b](../../spec/fences.md#fence7b)

> shiftEnter "x"

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ```
  code
  ```┃
````

</td><td>

<!--silverbullet-->
````buffer
- a
  ```
  code
  ```
x┃
````

</td><td>

<!--ourus-->
````buffer
- a
  ```
  code
  ```
  x┃
````

</td></tr>
</table>

#### 108. [Fence7c](../../spec/fences.md#fence7c)

> enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ```
  code
  ```┃
  - c
````

</td><td>

<!--silverbullet-->
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

#### 109. [Fence9](../../spec/fences.md#fence9)

> enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
`┃``
code
```
````

</td><td>

<!--silverbullet-->
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

#### 110. [Fence14](../../spec/fences.md#fence14)

> enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
```
code
``┃`
````

</td><td>

<!--silverbullet-->
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

#### 111. [Fence16](../../spec/fences.md#fence16)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ```
  one
  ┃two
  ```
````

</td><td>

<!--silverbullet-->
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

#### 112. [Fence17](../../spec/fences.md#fence17)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ```
  ┃one
  ```
````

</td><td>

<!--silverbullet-->
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

#### 113. [Fence18](../../spec/fences.md#fence18)

> deleteContentForward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ```
  one┃
  two
  ```
````

</td><td>

<!--silverbullet-->
````buffer
- a
  ```
  one┃  two
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

#### 114. [Fence19](../../spec/fences.md#fence19)

> deleteContentForward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ```
  one┃
  ```
````

</td><td>

<!--silverbullet-->
````buffer
- a
  ```
  one┃  ```
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

#### 115. [Fence20](../../spec/fences.md#fence20)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
> ```
> one
> ┃two
> ```
````

</td><td>

<!--silverbullet-->
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

#### 116. [Fence22](../../spec/fences.md#fence22)

> shiftEnter enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  - b
    ```
    x
    ```┃
````

</td><td>

<!--silverbullet-->
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

#### 117. [Fence23](../../spec/fences.md#fence23)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ```
  one
  ┃```
````

</td><td>

<!--silverbullet-->
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

#### 118. [Fence24](../../spec/fences.md#fence24)

> deleteContentForward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ```js┃
  one
  ```
````

</td><td>

<!--silverbullet-->
````buffer
- a
  ```js┃  one
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

#### 119. [Fence25](../../spec/fences.md#fence25)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ┃```
  one
  ```
````

</td><td>

<!--silverbullet-->
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

#### 120. [Fence27](../../spec/fences.md#fence27)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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

#### 121. [Fence29](../../spec/fences.md#fence29)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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

#### 122. [Fence30](../../spec/fences.md#fence30)

> deleteContentForward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ```
  code
  ┃
  ```
````

</td><td>

<!--silverbullet-->
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

#### 123. [Fence31](../../spec/fences.md#fence31)

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

> deleteContentBackward

<table>
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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

#### 124. [Fence33](../../spec/fences.md#fence33)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
para
┃```
x
```
````

</td><td>

<!--silverbullet-->
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

#### 125. [Fence34](../../spec/fences.md#fence34)

> deleteContentForward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a┃
- ```
  one
  ```
````

</td><td>

<!--silverbullet-->
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

#### 126. [Fence35](../../spec/fences.md#fence35)

> deleteContentForward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ```
  one
  ```┃
- b
````

</td><td>

<!--silverbullet-->
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

#### 127. [Fence36](../../spec/fences.md#fence36)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
```
``
┃`
body
```
````

</td><td>

<!--silverbullet-->
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

#### 128. [Fence37](../../spec/fences.md#fence37)

> deleteContentForward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
```
``┃
`
body
```
````

</td><td>

<!--silverbullet-->
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

#### 129. [Fence38](../../spec/fences.md#fence38)

> shiftEnter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
```
x┃```
body
```
````

</td><td>

<!--silverbullet-->
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

#### 130. [Fence39](../../spec/fences.md#fence39)

> enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
```
```┃x
body
```
````

</td><td>

<!--silverbullet-->
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

#### 131. [Fence40](../../spec/fences.md#fence40)

> deleteContentForward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> ~~~
> ~~┃
> ~
> body
> ~~~
```

</td><td>

<!--silverbullet-->
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

#### 132. [Fence41](../../spec/fences.md#fence41)

> shiftEnter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ```
  code
  ┃```
````

</td><td>

<!--silverbullet-->
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

#### 133. [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap4](../../spec/gaps.md#gap4)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

- b┃
- c
```

</td><td>

<!--silverbullet-->
```buffer
- b┃

- a
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

#### 134. [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap5](../../spec/gaps.md#gap5)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - a1

- b┃
- c
```

</td><td>

<!--silverbullet-->
```buffer
- b┃

- a
  - a1
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

#### 135. [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap7](../../spec/gaps.md#gap7)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
x┃
```
code
```

q
````

</td><td>

<!--silverbullet-->
````buffer
```
code
```
x┃

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

#### 136. [New text and gaps › Gap13](../../spec/gaps.md#gap13)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
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

<!--silverbullet-->
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

#### 137. [Keys on a blank line › Gap14](../../spec/gaps.md#gap14)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
a

b
┃

c
```

</td><td>

<!--silverbullet-->
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

#### 138. [Keys on a blank line › Gap15](../../spec/gaps.md#gap15)

> indent

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b
┃
- c
```

</td><td>

<!--silverbullet-->
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

#### 139. [Keys on a blank line › Gap16](../../spec/gaps.md#gap16)

> outdent

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b
┃
- c
```

</td><td>

<!--silverbullet-->
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

#### 140. [Indent3](../../spec/indent.md#indent3)

> indent

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
    * x
- b┃
```

</td><td>

<!--silverbullet-->
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

#### 141. [Indent4](../../spec/indent.md#indent4)

> indent

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a
2. b┃
3. c
```

</td><td>

<!--silverbullet-->
```buffer
1. a
   2. b┃
3. c
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

#### 142. [Indent6](../../spec/indent.md#indent6)

> indent

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
→- b
- c┃
```

</td><td>

<!--silverbullet-->
```buffer
- a
→- b
  - c┃
```

</td><td>

<!--ourus-->
```buffer
- a
→- b
→- c┃
```

</td></tr>
</table>

#### 143. [Indent7](../../spec/indent.md#indent7)

> indent

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b┃
- c
→- d
```

</td><td>

<!--silverbullet-->
```buffer
- a
  - b┃
- c
→- d
```

</td><td>

<!--ourus-->
```buffer
- a
→- b┃
- c
→- d
```

</td></tr>
</table>

#### 144. [Indent9](../../spec/indent.md#indent9)

> indent

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- «b
- c»
- d
```

</td><td>

<!--silverbullet-->
```buffer
- a
  - ┃b
- c
- d
```

</td><td>

<!--ourus-->
```buffer
- a
  - «b
  - c»
- d
```

</td></tr>
</table>

#### 145. [Indent16](../../spec/indent.md#indent16)

> indent

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Title┃
=====

## Sub
```

</td><td>

<!--silverbullet-->
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

#### 146. [Indent21](../../spec/indent.md#indent21)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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

#### 147. [Indent22](../../spec/indent.md#indent22)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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

#### 148. [Indent25](../../spec/indent.md#indent25)

> indent

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Title┃
-----

### Sub
```

</td><td>

<!--silverbullet-->
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

#### 149. [Indent27](../../spec/indent.md#indent27)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
- «b
- c»
- d
```

</td></tr>
</table>

> indent

<table>
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
```buffer
- a
  - ┃b
- c
- d
```

</td><td>

<!--ourus-->
```buffer
- a
  - «b
  - c»
- d
```

</td></tr>
</table>

> outdent

<table>
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
```buffer
- a
- ┃b
- c
- d
```

</td><td>

<!--ourus-->
```buffer
- a
- «b
- c»
- d
```

</td></tr>
</table>

#### 150. [Indent29](../../spec/indent.md#indent29)

> indent

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

para┃
```

</td><td>

<!--silverbullet-->
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

#### 151. [MoveDown2](../../spec/move-subtree-down.md#movedown2)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# H
- a┃

para
```

</td><td>

<!--silverbullet-->
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

#### 152. [MoveDown7](../../spec/move-subtree-down.md#movedown7)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
```buffer
- a
→- b┃
→→- b1
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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
```buffer
- a
→- b┃
→→- b1
- c
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

#### 153. [MoveDown8](../../spec/move-subtree-down.md#movedown8)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b┃

para

- c
```

</td><td>

<!--silverbullet-->
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

#### 154. [MoveDown9](../../spec/move-subtree-down.md#movedown9)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
```buffer
- a
  - c┃
    - c1
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

#### 155. [MoveDown10](../../spec/move-subtree-down.md#movedown10)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
```buffer
- a
  - b
  - c┃
    - c1
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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
```buffer
- a
  - b
  - c┃
    - c1
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
  - d1
    - d11
  - c┃
    - c1
```

</td></tr>
</table>

#### 156. [MoveDown11](../../spec/move-subtree-down.md#movedown11)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- «b
  - b1
- c»
- d
```

</td><td>

<!--silverbullet-->
```buffer
- a
- c
- ┃b
  - b1
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

#### 157. [MoveDown12](../../spec/move-subtree-down.md#movedown12)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
```buffer
- a
  - b
  - d
  - ┃c
    - c1
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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
```buffer
- a
  - b
  - d
  - ┃c
    - c1
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

#### 158. [MoveDown13](../../spec/move-subtree-down.md#movedown13)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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

#### 159. [MoveDown18](../../spec/move-subtree-down.md#movedown18)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Work
- email
- ┃review

# Home
- water
```

</td><td>

<!--silverbullet-->
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

#### 160. [MoveDown20](../../spec/move-subtree-down.md#movedown20)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Todo
- one
- two┃

## Later
- three
```

</td><td>

<!--silverbullet-->
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

#### 161. [MoveDown23](../../spec/move-subtree-down.md#movedown23)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
9. a┃
   - x
10. b
```

</td><td>

<!--silverbullet-->
```buffer
1. b
2. a
┃   - x
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

#### 162. [MoveDown24](../../spec/move-subtree-down.md#movedown24)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para┃
- a

last
```

</td><td>

<!--silverbullet-->
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

#### 163. [MoveDown25](../../spec/move-subtree-down.md#movedown25)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# A
para┃

# B
- x
```

</td><td>

<!--silverbullet-->
```buffer
# A
# B

para┃
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

#### 164. [MoveDown26](../../spec/move-subtree-down.md#movedown26)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Work
- review┃

# Home
para
```

</td><td>

<!--silverbullet-->
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

#### 165. [MoveDown27](../../spec/move-subtree-down.md#movedown27)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# A
## s┃

# B
## t
```

</td><td>

<!--silverbullet-->
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

#### 166. [MoveDown28](../../spec/move-subtree-down.md#movedown28)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# A
## sub
- s1

┃para

# B
```

</td><td>

<!--silverbullet-->
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

# B
┃para
```

</td></tr>
</table>

#### 167. [MoveDown29](../../spec/move-subtree-down.md#movedown29)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
pa┃ra
1. a
- b

next
```

</td><td>

<!--silverbullet-->
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

#### 168. [MoveDown30](../../spec/move-subtree-down.md#movedown30)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
9. a┃
10. b
    - x
```

</td><td>

<!--silverbullet-->
```buffer
1. b
    - x
2. a
┃
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

#### 169. [MoveUp6](../../spec/move-subtree-up.md#moveup6)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
→- b
- c
→- d┃
```

</td></tr>
</table>

> moveSubtreeUp

<table>
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
```buffer
- a
→- b
- c
→- d┃
```

</td><td>

<!--ourus-->
```buffer
- a
→- b
→- d┃
- c
```

</td></tr>
</table>

> moveSubtreeUp

<table>
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
```buffer
- a
→- b
- c
→- d┃
```

</td><td>

<!--ourus-->
```buffer
- a
→- d┃
→- b
- c
```

</td></tr>
</table>

#### 170. [MoveUp7](../../spec/move-subtree-up.md#moveup7)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

para

- b┃
- c
```

</td><td>

<!--silverbullet-->
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

#### 171. [MoveUp8](../../spec/move-subtree-up.md#moveup8)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
```buffer
- a
- b
  - c┃
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

#### 172. [MoveUp9](../../spec/move-subtree-up.md#moveup9)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
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

<!--silverbullet-->
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

#### 173. [MoveUp10](../../spec/move-subtree-up.md#moveup10)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- «b
  - b1
- c»
- d
```

</td><td>

<!--silverbullet-->
```buffer
- ┃b
  - b1
- a
- c
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

#### 174. [MoveUp11](../../spec/move-subtree-up.md#moveup11)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
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

<!--silverbullet-->
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

#### 175. [MoveUp12](../../spec/move-subtree-up.md#moveup12)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
intro

- b┃
  - b1
```

</td><td>

<!--silverbullet-->
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

#### 176. [MoveUp15](../../spec/move-subtree-up.md#moveup15)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
9. a
   - x
10. b┃
```

</td><td>

<!--silverbullet-->
```buffer
1. b
┃2. a
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

#### 177. [MoveUp17](../../spec/move-subtree-up.md#moveup17)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
first

para┃
- a
```

</td><td>

<!--silverbullet-->
```buffer
para┃

first
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

#### 178. [MoveUp18](../../spec/move-subtree-up.md#moveup18)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
→- a
┃para
```

</td><td>

<!--silverbullet-->
```buffer
→┃para
- a
```

</td><td>

<!--ourus-->
```buffer
┃para

→- a
```

</td></tr>
</table>

#### 179. [MoveUp19](../../spec/move-subtree-up.md#moveup19)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
---
para┃
```

</td><td>

<!--silverbullet-->
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

#### 180. [MoveUp20](../../spec/move-subtree-up.md#moveup20)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
[a]: /u
para┃
```

</td><td>

<!--silverbullet-->
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

#### 181. [MoveUp21](../../spec/move-subtree-up.md#moveup21)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para
- a┃
- b
```

</td><td>

<!--silverbullet-->
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

#### 182. [MoveUp22](../../spec/move-subtree-up.md#moveup22)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Work
- email

# Home
- ┃review
- water
```

</td><td>

<!--silverbullet-->
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

#### 183. [MoveUp23](../../spec/move-subtree-up.md#moveup23)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# A
## sub
- s1

# B
┃para
```

</td><td>

<!--silverbullet-->
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

#### 184. [MoveUp24](../../spec/move-subtree-up.md#moveup24)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Todo
- one

## Later
- ┃two
- three
```

</td><td>

<!--silverbullet-->
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

#### 185. [MoveUp26](../../spec/move-subtree-up.md#moveup26)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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

#### 186. [MoveUp27](../../spec/move-subtree-up.md#moveup27)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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

#### 187. [MoveUp29](../../spec/move-subtree-up.md#moveup29)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# H
- ┃a
- b
```

</td><td>

<!--silverbullet-->
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

#### 188. [MoveUp30](../../spec/move-subtree-up.md#moveup30)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
[a]: /u
    ┃code
```

</td><td>

<!--silverbullet-->
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

#### 189. [MoveUp35](../../spec/move-subtree-up.md#moveup35)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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

#### 190. [Enter › E4](../../spec/obsidian-true-outliner.md#e4)

> enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- first
  second┃ line
```

</td><td>

<!--silverbullet-->
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

#### 191. [Enter › E7, E8 › End of parent opens empty first child](../../spec/obsidian-true-outliner.md#end-of-parent-opens-empty-first-child)

> enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- alpha┃
→- child
```

</td><td>

<!--silverbullet-->
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

#### 192. [Enter › E9](../../spec/obsidian-true-outliner.md#e9)

> enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
one┃ two
- child
```

</td><td>

<!--silverbullet-->
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

#### 193. [Enter › E10](../../spec/obsidian-true-outliner.md#e10)

> enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- item┃

  para
```

</td><td>

<!--silverbullet-->
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

#### 194. [Enter › E17](../../spec/obsidian-true-outliner.md#e17)

> enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Hello┃ world
====
```

</td><td>

<!--silverbullet-->
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

#### 195. [Enter › E18](../../spec/obsidian-true-outliner.md#e18)

> enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Hello world
==┃==
```

</td><td>

<!--silverbullet-->
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

#### 196. [Enter › E32 › Task checkbox carries over unchecked](../../spec/obsidian-true-outliner.md#task-checkbox-carries-over-unchecked)

> enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] alpha┃ beta
```

</td><td>

<!--silverbullet-->
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

#### 197. [Enter › E33](../../spec/obsidian-true-outliner.md#e33)

> enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- al«pha be»ta
```

</td><td>

<!--silverbullet-->
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

#### 198. [Enter › #267, E5](../../spec/obsidian-true-outliner.md#267-e5)

> enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# H
para┃ text
> q
```

</td><td>

<!--silverbullet-->
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

#### 199. [Enter › E14, E20 › Split title above an existing paragraph](../../spec/obsidian-true-outliner.md#split-title-above-an-existing-paragraph)

> enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Head┃line
Body.
```

</td><td>

<!--silverbullet-->
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

#### 200. [Enter › E14, E20 › End of heading above a paragraph](../../spec/obsidian-true-outliner.md#end-of-heading-above-a-paragraph)

> enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Head┃
Body.
```

</td><td>

<!--silverbullet-->
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

#### 201. [Shift-Enter › S4](../../spec/obsidian-true-outliner.md#s4)

> shiftEnter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
one┃ two
```

</td><td>

<!--silverbullet-->
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

#### 202. [Shift-Enter › S7, S8 › Line break in setext title refused](../../spec/obsidian-true-outliner.md#line-break-in-setext-title-refused)

> shiftEnter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Hello┃ world
====
```

</td><td>

<!--silverbullet-->
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

#### 203. [Shift-Enter › S7, S8 › Line break in setext underline refused](../../spec/obsidian-true-outliner.md#line-break-in-setext-underline-refused)

> shiftEnter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Hello world
==┃==
```

</td><td>

<!--silverbullet-->
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

#### 204. [Shift-Enter › S9](../../spec/obsidian-true-outliner.md#s9)

> shiftEnter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- item

  para┃ text
```

</td><td>

<!--silverbullet-->
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

#### 205. [Shift-Enter › S11 › Place inside a multi-line item](../../spec/obsidian-true-outliner.md#place-inside-a-multi-line-item)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
```buffer
- foo
┃
  bar
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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
```buffer
- foo
x┃
  bar
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

#### 206. [Shift-Enter › S11 › Leaving the place removes it](../../spec/obsidian-true-outliner.md#leaving-the-place-removes-it)

> shiftEnter cursorDocStart

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
foo┃
bar
```

</td><td>

<!--silverbullet-->
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

#### 207. [Shift-Enter › S13](../../spec/obsidian-true-outliner.md#s13)

> shiftEnter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a«lpha» beta
```

</td><td>

<!--silverbullet-->
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

#### 208. [Backspace › #269 › Emptied middle item removed and renumbered](../../spec/obsidian-true-outliner.md#emptied-middle-item-removed-and-renumbered)

> deleteContentBackward deleteContentBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. p
2. a┃
3. q
```

</td><td>

<!--silverbullet-->
```buffer
1. p
   ┃
3. q
```

</td><td>

<!--ourus-->
```buffer
1. p┃
2. q
```

</td></tr>
</table>

#### 209. [Backspace › delete-to-content-start](../../spec/obsidian-true-outliner.md#delete-to-content-start)

> deleteSoftLineBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- alpha beta┃
```

</td><td>

<!--silverbullet-->
```buffer
┃
```

</td><td>

<!--ourus-->
```buffer
- ┃
```

</td></tr>
</table>

#### 210. [Backspace › Joining a task › Backspace before the checkbox](../../spec/obsidian-true-outliner.md#backspace-before-the-checkbox)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃[ ] b
```

</td><td>

<!--silverbullet-->
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

#### 211. [Backspace › Joining an item with children › Children move to the joined node](../../spec/obsidian-true-outliner.md#children-move-to-the-joined-node)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃b
    - c
```

</td><td>

<!--silverbullet-->
```buffer
- a
  ┃b
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

#### 212. [Backspace › Joining an item with children › Delete forward absorbs child with grandchildren](../../spec/obsidian-true-outliner.md#delete-forward-absorbs-child-with-grandchildren)

> deleteContentForward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - b
    - c
```

</td><td>

<!--silverbullet-->
```buffer
- a┃  - b
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

#### 213. [Backspace › Joining across ordered runs](../../spec/obsidian-true-outliner.md#joining-across-ordered-runs)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a
2. b
- ┃x
3. c
```

</td><td>

<!--silverbullet-->
```buffer
1. a
2. b
┃x
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

#### 214. [Backspace › Joining away the head of a list › Next item becomes the new 1.](../../spec/obsidian-true-outliner.md#next-item-becomes-the-new-1)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- p
  1. ┃a
  2. b
```

</td><td>

<!--silverbullet-->
```buffer
- p
  ┃a
  2. b
```

</td><td>

<!--ourus-->
```buffer
- p┃a
  1. b
```

</td></tr>
</table>

#### 215. [Backspace › Joining away the head of a list › List starting at 3 keeps its start](../../spec/obsidian-true-outliner.md#list-starting-at-3-keeps-its-start)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
3. a
4. ┃b
5. c
```

</td><td>

<!--silverbullet-->
```buffer
3. a
   ┃b
5. c
```

</td><td>

<!--ourus-->
```buffer
3. a┃b
4. c
```

</td></tr>
</table>

#### 216. [Indentation › list-marker-content-column](../../spec/obsidian-true-outliner.md#list-marker-content-column)

> indent

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
-  parent
-  kid┃
```

</td><td>

<!--silverbullet-->
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

#### 217. [Indentation › indent-unit-on-every-line](../../spec/obsidian-true-outliner.md#indent-unit-on-every-line)

> indent

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
→- x
- b┃
  cont
```

</td><td>

<!--silverbullet-->
```buffer
- a
→- x
  - b┃
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

#### 218. [Indentation › destination-list-style](../../spec/obsidian-true-outliner.md#destination-list-style)

> indent

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
* a
  * x
- b┃
```

</td><td>

<!--silverbullet-->
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

#### 219. [Moving › lazy-continuation-at-seams › Blank line added below a quote](../../spec/obsidian-true-outliner.md#blank-line-added-below-a-quote)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para┃
> q
```

</td><td>

<!--silverbullet-->
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

#### 220. [Moving › lazy-continuation-at-seams › No blank line needed before a fence](../../spec/obsidian-true-outliner.md#no-blank-line-needed-before-a-fence)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
```
code┃
```
para
````

</td><td>

<!--silverbullet-->
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

#### 221. [Abandoning an empty place › Shift-Enter, Tab, then leave › Carried place removed on leaving](../../spec/obsidian-true-outliner.md#carried-place-removed-on-leaving)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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

#### 222. [Abandoning an empty place › Shift-Enter, Tab, then leave › Doubly indented place removed on leaving](../../spec/obsidian-true-outliner.md#doubly-indented-place-removed-on-leaving)

> shiftEnter indent indent cursorDocStart

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - kid
  - sib
- foo┃
```

</td><td>

<!--silverbullet-->
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

#### 223. [Abandoning an empty place › Shift-Enter, Tab, then leave › Backspace returns to the start](../../spec/obsidian-true-outliner.md#backspace-returns-to-the-start)

> shiftEnter indent deleteContentBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - kid
- foo┃
```

</td><td>

<!--silverbullet-->
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

#### 224. [Abandoning an empty place › Shift-Enter, Tab, then leave › Shift-Tab then Backspace returns to start](../../spec/obsidian-true-outliner.md#shift-tab-then-backspace-returns-to-start)

> shiftEnter outdent deleteContentBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b┃
- c
```

</td><td>

<!--silverbullet-->
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

#### 225. [Abandoning an empty place › Shift-Enter, Tab, then Enter](../../spec/obsidian-true-outliner.md#shift-enter-tab-then-enter)

> shiftEnter indent enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - kid
- foo┃
- bar
```

</td><td>

<!--silverbullet-->
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

#### 226. [Abandoning an empty place › Enter, Tab, then leave › An empty ordered child kept with a blank line](../../spec/obsidian-true-outliner.md#an-empty-ordered-child-kept-with-a-blank-line)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
```buffer
1. a
   2. ┃
3. b
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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
```buffer
┃1. a
   2. 
3. b
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

#### 227. [Abandoning an empty place › Enter, Tab, then leave › Blank line after the list stays](../../spec/obsidian-true-outliner.md#blank-line-after-the-list-stays)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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

#### 228. [Abandoning an empty place › Enter, Shift-Tab, then leave › Outdented empty ordered item stays](../../spec/obsidian-true-outliner.md#outdented-empty-ordered-item-stays)

> enter outdent cursorDocStart

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. p
   1. a┃
2. q
```

</td><td>

<!--silverbullet-->
```buffer
┃1. p
   1. a
2. 
2. q
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

#### 229. [Paste › #216 › Pasted list takes space indent unit](../../spec/obsidian-true-outliner.md#pasted-list-takes-space-indent-unit)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
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

<!--silverbullet-->
```buffer
- top
  - sib- a
→- b
→→- c
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

#### 230. [Paste › #216 › Pasted list takes tab indent unit](../../spec/obsidian-true-outliner.md#pasted-list-takes-tab-indent-unit)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
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

<!--silverbullet-->
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

#### 231. [Paste › #264 › Pasted quote set off from paragraph](../../spec/obsidian-true-outliner.md#pasted-quote-set-off-from-paragraph)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
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

<!--silverbullet-->
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

#### 232. [Paste › #197 › Pasted list and block become children](../../spec/obsidian-true-outliner.md#pasted-list-and-block-become-children)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
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

<!--silverbullet-->
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

#### 233. [Outdent3](../../spec/outdent.md#outdent3)

> outdent

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
→- b┃
```

</td><td>

<!--silverbullet-->
```buffer
- a
→- b┃
```

</td><td>

<!--ourus-->
```buffer
- a
- b┃
```

</td></tr>
</table>

#### 234. [Outdent7](../../spec/outdent.md#outdent7)

> outdent

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃x
  - 
```

</td><td>

<!--silverbullet-->
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

#### 235. [Outdent8](../../spec/outdent.md#outdent8)

> outdent

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para
- «a
  - b
- c»
```

</td><td>

<!--silverbullet-->
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

#### 236. [Outdent9](../../spec/outdent.md#outdent9)

> outdent

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a
   1. b┃
2. c
```

</td><td>

<!--silverbullet-->
```buffer
1. a
1. b┃
2. c
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

#### 237. [Outdent10](../../spec/outdent.md#outdent10)

> outdent

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - «b
  - c»
- d
```

</td><td>

<!--silverbullet-->
```buffer
- a
- ┃b
  - c
- d
```

</td><td>

<!--ourus-->
```buffer
- a
- «b
- c»
- d
```

</td></tr>
</table>

#### 238. [Outdent12](../../spec/outdent.md#outdent12)

> outdent

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- «a
- b»
```

</td><td>

<!--silverbullet-->
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

#### 239. [Outdent15](../../spec/outdent.md#outdent15)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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

#### 240. [Direct outdent › DirectOutdent2](../../spec/outdent.md#directoutdent2)

> outdent

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

<!--silverbullet-->
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

#### 241. [Direct outdent › DirectOutdent3](../../spec/outdent.md#directoutdent3)

> outdent

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - a1
- b
```

</td><td>

<!--silverbullet-->
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

#### 242. [Direct outdent › DirectOutdent4](../../spec/outdent.md#directoutdent4)

> outdent

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para
- a┃
- b
```

</td><td>

<!--silverbullet-->
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

#### 243. [Paste1](../../spec/paste.md#paste1)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
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

<!--silverbullet-->
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

#### 244. [Paste2](../../spec/paste.md#paste2)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
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

<!--silverbullet-->
```buffer
1. a- x
- y
┃
2. b
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

#### 245. [Paste3](../../spec/paste.md#paste3)

> pastePlain

<table>
<tr><th>clipboard</th><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
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

<!--silverbullet-->
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

#### 246. [Paste4](../../spec/paste.md#paste4)

> pastePlain

<table>
<tr><th>clipboard</th><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
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

<!--silverbullet-->
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

#### 247. [Paste5](../../spec/paste.md#paste5)

> pastePlain

<table>
<tr><th>clipboard</th><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
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

<!--silverbullet-->
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

#### 248. [Paste6](../../spec/paste.md#paste6)

> pastePlain

<table>
<tr><th>clipboard</th><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
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

<!--silverbullet-->
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

#### 249. [Paste7](../../spec/paste.md#paste7)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
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

<!--silverbullet-->
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

#### 250. [Paste9](../../spec/paste.md#paste9)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
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

<!--silverbullet-->
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

#### 251. [Paste10](../../spec/paste.md#paste10)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
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

<!--silverbullet-->
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

#### 252. [Paste11](../../spec/paste.md#paste11)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
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

<!--silverbullet-->
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

#### 253. [Paste12](../../spec/paste.md#paste12)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
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

<!--silverbullet-->
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

#### 254. [Paste13](../../spec/paste.md#paste13)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
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

<!--silverbullet-->
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

#### 255. [Paste14](../../spec/paste.md#paste14)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
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

<!--silverbullet-->
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

#### 256. [Paste15](../../spec/paste.md#paste15)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
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

<!--silverbullet-->
```buffer
- 1. x
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

#### 257. [Paste16](../../spec/paste.md#paste16)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
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

<!--silverbullet-->
```buffer
1. - x
- y
┃
2. b
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

#### 258. [Paste17](../../spec/paste.md#paste17)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
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

<!--silverbullet-->
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

#### 259. [Paste18](../../spec/paste.md#paste18)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
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

<!--silverbullet-->
```buffer
1. a1. x
2. y
┃
2. b
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

#### 260. [Paste19](../../spec/paste.md#paste19)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
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

<!--silverbullet-->
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

#### 261. [Paste20](../../spec/paste.md#paste20)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
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

<!--silverbullet-->
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

#### 262. [Paste21](../../spec/paste.md#paste21)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
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

<!--silverbullet-->
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

#### 263. [Paste22](../../spec/paste.md#paste22)

> pastePlain

<table>
<tr><th>clipboard</th><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
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

<!--silverbullet-->
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

#### 264. [Paste23](../../spec/paste.md#paste23)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
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

<!--silverbullet-->
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

#### 265. [Paste25](../../spec/paste.md#paste25)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
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

<!--silverbullet-->
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

#### 266. [Paste26](../../spec/paste.md#paste26)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
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

<!--silverbullet-->
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

#### 267. [Paste27](../../spec/paste.md#paste27)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
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

<!--silverbullet-->
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

#### 268. [Paste28](../../spec/paste.md#paste28)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
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

<!--silverbullet-->
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

#### 269. [Paste29](../../spec/paste.md#paste29)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
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

<!--silverbullet-->
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

#### 270. [Paste30](../../spec/paste.md#paste30)

> pastePlain

<table>
<tr><th>clipboard</th><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
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

<!--silverbullet-->
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

#### 271. [Paste32](../../spec/paste.md#paste32)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
# h
```

</td><td>

```buffer
para┃
```

</td><td>

<!--silverbullet-->
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

#### 272. [Paste33](../../spec/paste.md#paste33)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
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

<!--silverbullet-->
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

#### 273. [Paste34](../../spec/paste.md#paste34)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
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

<!--silverbullet-->
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

#### 274. [Paste35](../../spec/paste.md#paste35)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
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

<!--silverbullet-->
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

#### 275. [Paste36](../../spec/paste.md#paste36)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
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

<!--silverbullet-->
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

#### 276. [Paste37](../../spec/paste.md#paste37)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
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

<!--silverbullet-->
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

#### 277. [Paste40](../../spec/paste.md#paste40)

> pastePlain

<table>
<tr><th>clipboard</th><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
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

<!--silverbullet-->
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

#### 278. [Paste41](../../spec/paste.md#paste41)

> pastePlain

<table>
<tr><th>clipboard</th><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
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

<!--silverbullet-->
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

#### 279. [Paste42](../../spec/paste.md#paste42)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
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

<!--silverbullet-->
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

#### 280. [Paste44](../../spec/paste.md#paste44)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
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

<!--silverbullet-->
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

#### 281. [Paste45](../../spec/paste.md#paste45)

> pastePlain

<table>
<tr><th>clipboard</th><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
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

<!--silverbullet-->
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

#### 282. [Paste46](../../spec/paste.md#paste46)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
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

<!--silverbullet-->
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

#### 283. [Paste47](../../spec/paste.md#paste47)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
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

<!--silverbullet-->
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

#### 284. [Placeholder1](../../spec/placeholders.md#placeholder1)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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

#### 285. [Placeholder2](../../spec/placeholders.md#placeholder2)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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

#### 286. [Placeholder3](../../spec/placeholders.md#placeholder3)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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

#### 287. [Placeholder4](../../spec/placeholders.md#placeholder4)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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

#### 288. [Placeholder5](../../spec/placeholders.md#placeholder5)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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

#### 289. [Placeholder7](../../spec/placeholders.md#placeholder7)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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

#### 290. [Placeholder9](../../spec/placeholders.md#placeholder9)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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

#### 291. [Placeholder13](../../spec/placeholders.md#placeholder13)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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

#### 292. [Placeholder14](../../spec/placeholders.md#placeholder14)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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

#### 293. [Placeholder15](../../spec/placeholders.md#placeholder15)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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

#### 294. [Placeholder16](../../spec/placeholders.md#placeholder16)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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

#### 295. [Quote1](../../spec/quotes.md#quote1)

> indent

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- > - a
  > - b┃
```

</td><td>

<!--silverbullet-->
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

#### 296. [Indent inside a quote › Quote2](../../spec/quotes.md#quote2)

> indent

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a
> - b┃
```

</td><td>

<!--silverbullet-->
```buffer
> - a
  > - b┃
```

</td><td>

<!--ourus-->
```buffer
> - a
>   - b┃
```

</td></tr>
</table>

#### 297. [Indent inside a quote › Quote3](../../spec/quotes.md#quote3)

> indent

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
>- a
>- b┃
```

</td><td>

<!--silverbullet-->
```buffer
>- a
  >- b┃
```

</td><td>

<!--ourus-->
```buffer
>- a
>   - b┃
```

</td></tr>
</table>

#### 298. [Indent inside a quote › Quote4](../../spec/quotes.md#quote4)

> indent

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
>→- a
>→- b┃
```

</td><td>

<!--silverbullet-->
```buffer
>→- a
  >→- b┃
```

</td><td>

<!--ourus-->
```buffer
>→- a
>→→- b┃
```

</td></tr>
</table>

#### 299. [Indent inside a quote › Quote5](../../spec/quotes.md#quote5)

> indent

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- x
  > - a
  > - b┃
```

</td><td>

<!--silverbullet-->
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

#### 300. [Indent inside a quote › Quote6](../../spec/quotes.md#quote6)

> indent

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> > - a
> > - b┃
```

</td><td>

<!--silverbullet-->
```buffer
> > - a
  > > - b┃
```

</td><td>

<!--ourus-->
```buffer
> > - a
> >   - b┃
```

</td></tr>
</table>

#### 301. [Indent inside a quote › Quote7](../../spec/quotes.md#quote7)

> indent

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> [!note] Title
> - a
> - b┃
```

</td><td>

<!--silverbullet-->
```buffer
> [!note] Title
> - a
  > - b┃
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

#### 302. [Indent inside a quote › Quote8](../../spec/quotes.md#quote8)

> indent

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a
> - b┃
c
```

</td><td>

<!--silverbullet-->
```buffer
> - a
  > - b┃
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

#### 303. [Indent inside a quote › Quote9](../../spec/quotes.md#quote9)

> indent

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> a
>
> b┃
```

</td><td>

<!--silverbullet-->
```buffer
> a
>
> b┃
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

#### 304. [Quote10](../../spec/quotes.md#quote10)

> outdent

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a
>   - b┃
```

</td><td>

<!--silverbullet-->
```buffer
> - a
>   - b┃
```

</td><td>

<!--ourus-->
```buffer
> - a
> - b┃
```

</td></tr>
</table>

#### 305. [Outdent out of a quote › Quote11](../../spec/quotes.md#quote11)

> outdent

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a
> - b┃
```

</td><td>

<!--silverbullet-->
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

#### 306. [Outdent out of a quote › Quote12](../../spec/quotes.md#quote12)

> outdent

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a┃
>   - c
> - b
```

</td><td>

<!--silverbullet-->
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

#### 307. [Outdent out of a quote › Quote13](../../spec/quotes.md#quote13)

> outdent

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> [!note] T
> - a┃
```

</td><td>

<!--silverbullet-->
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

#### 308. [Outdent out of a quote › Quote14](../../spec/quotes.md#quote14)

> outdent

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a
> - b┃
c
```

</td><td>

<!--silverbullet-->
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

#### 309. [Outdent out of a quote › Quote15](../../spec/quotes.md#quote15)

> outdent

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- x
  > - a
  > - b┃
```

</td><td>

<!--silverbullet-->
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

#### 310. [Outdent out of a quote › Quote16](../../spec/quotes.md#quote16)

> outdent

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a
> - b┃
>
>   c
```

</td><td>

<!--silverbullet-->
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

#### 311. [Indent into a quote › Quote17](../../spec/quotes.md#quote17)

> indent

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a
- b┃
```

</td><td>

<!--silverbullet-->
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

#### 312. [Indent into a quote › Quote18](../../spec/quotes.md#quote18)

> indent

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a

- b┃
  - c

  d
```

</td><td>

<!--silverbullet-->
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

#### 313. [Indent into a quote › Quote19](../../spec/quotes.md#quote19)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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

#### 314. [Moving between quotes › Quote21](../../spec/quotes.md#quote21)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - x
- a┃

> - b
```

</td><td>

<!--silverbullet-->
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

#### 315. [Moving between quotes › Quote22](../../spec/quotes.md#quote22)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
```buffer
> - b┃
> - a

- c
```

</td><td>

<!--ourus-->
```buffer
> - a
> - b┃

- c
```

</td></tr>
</table>

#### 316. [Moving between quotes › Quote23](../../spec/quotes.md#quote23)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
```buffer
- c
> - b
> - a┃
```

</td><td>

<!--ourus-->
```buffer
- c
> - a┃
> - b
```

</td></tr>
</table>

#### 317. [Moving inside a quote › Quote25](../../spec/quotes.md#quote25)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a
>
> - b┃
```

</td><td>

<!--silverbullet-->
```buffer
> - b┃
> - a
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

#### 318. [Enter in a quote › Quote31](../../spec/quotes.md#quote31)

> enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a
b┃
```

</td><td>

<!--silverbullet-->
```buffer
> - a
b
> ┃
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

#### 319. [Enter in a quote › Quote32](../../spec/quotes.md#quote32)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
```buffer
> Quote:
> - one
>
> ┃
```

</td><td>

<!--ourus-->
```buffer
> Quote:
> - one

┃
```

</td></tr>
</table>

> "Back to text."

<table>
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
```buffer
> Quote:
> - one
>
> Back to text.┃
```

</td><td>

<!--ourus-->
```buffer
> Quote:
> - one

Back to text.┃
```

</td></tr>
</table>

#### 320. [Enter in a quote › Quote33](../../spec/quotes.md#quote33)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
```buffer
- x
  > - a
  >
  > ┃
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

#### 321. [Enter in a quote › Quote34](../../spec/quotes.md#quote34)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
```buffer
>
> ┃
```

</td><td>

<!--ourus-->
```buffer
┃
```

</td></tr>
</table>

#### 322. [Enter in a quote › Quote35](../../spec/quotes.md#quote35)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
```buffer
> ab
>
> ┃
```

</td><td>

<!--ourus-->
```buffer
> ab

┃
```

</td></tr>
</table>

> "c"

<table>
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
```buffer
> ab
>
> c┃
```

</td><td>

<!--ourus-->
```buffer
> ab

c┃
```

</td></tr>
</table>

#### 323. [Enter in a quote › Quote36](../../spec/quotes.md#quote36)

> enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> ab┃cd
```

</td><td>

<!--silverbullet-->
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

#### 324. [Enter in a quote › Quote37](../../spec/quotes.md#quote37)

> enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> a
>
> ┃b
```

</td><td>

<!--silverbullet-->
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

#### 325. [Enter in a quote › Quote38](../../spec/quotes.md#quote38)

> enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> [!note] Ti┃tle
> body
```

</td><td>

<!--silverbullet-->
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

#### 326. [Enter in a quote › Quote40](../../spec/quotes.md#quote40)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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

#### 327. [Enter in a quote › Quote41](../../spec/quotes.md#quote41)

> enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> [!tip] Title┃- x
> - y
```

</td><td>

<!--silverbullet-->
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

#### 328. [Enter in a quote › Quote42](../../spec/quotes.md#quote42)

> enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> para ┃- x
> - a
```

</td><td>

<!--silverbullet-->
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

#### 329. [Enter in a quote › Quote43](../../spec/quotes.md#quote43)

> enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> [!ti┃p] Title
```

</td><td>

<!--silverbullet-->
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

#### 330. [Shift-Enter in a quote › Quote44](../../spec/quotes.md#quote44)

> shiftEnter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> ab┃cd
```

</td><td>

<!--silverbullet-->
```buffer
> ab
┃cd
```

</td><td>

<!--ourus-->
```buffer
> ab
> ┃cd
```

</td></tr>
</table>

#### 331. [Shift-Enter in a quote › Quote45](../../spec/quotes.md#quote45)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
> ab┃
```

</td></tr>
</table>

> shiftEnter

<table>
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
```buffer
> ab
┃
```

</td><td>

<!--ourus-->
```buffer
> ab
> ┃
```

</td></tr>
</table>

> "c"

<table>
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
```buffer
> ab
c┃
```

</td><td>

<!--ourus-->
```buffer
> ab
> c┃
```

</td></tr>
</table>

#### 332. [Shift-Enter in a quote › Quote46](../../spec/quotes.md#quote46)

> shiftEnter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - ab┃cd
```

</td><td>

<!--silverbullet-->
```buffer
> - ab
┃cd
```

</td><td>

<!--ourus-->
```buffer
> - ab
>   ┃cd
```

</td></tr>
</table>

#### 333. [Shift-Enter in a quote › Quote47](../../spec/quotes.md#quote47)

> shiftEnter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> [!tip] Ti┃tle
> body
```

</td><td>

<!--silverbullet-->
```buffer
> [!tip] Ti
┃tle
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

#### 334. [Joining in a quote › Quote48](../../spec/quotes.md#quote48)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a
> - ┃b
```

</td><td>

<!--silverbullet-->
```buffer
> - a
>   ┃b
```

</td><td>

<!--ourus-->
```buffer
> - a┃b
```

</td></tr>
</table>

#### 335. [Joining in a quote › Quote49](../../spec/quotes.md#quote49)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> a
> - ┃b
```

</td><td>

<!--silverbullet-->
```buffer
> a
> ┃b
```

</td><td>

<!--ourus-->
```buffer
> a┃b
```

</td></tr>
</table>

#### 336. [Joining in a quote › Quote50](../../spec/quotes.md#quote50)

> deleteContentForward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> a┃
> - b
```

</td><td>

<!--silverbullet-->
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

#### 337. [Joining in a quote › Quote51](../../spec/quotes.md#quote51)

> deleteContentForward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> a┃
>
> b
```

</td><td>

<!--silverbullet-->
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

#### 338. [Joining across a quote's edge › Quote52](../../spec/quotes.md#quote52)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a
- ┃b
  - c
```

</td><td>

<!--silverbullet-->
```buffer
> - a
┃b
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

#### 339. [Backspace at a quote's start › Quote54](../../spec/quotes.md#quote54)

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
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
> ┃b
> - c
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
```buffer
- a
┃b
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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
```buffer
- a┃b
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

#### 340. [Backspace at a quote's start › Quote56](../../spec/quotes.md#quote56)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

> ┃q
>
> r
```

</td><td>

<!--silverbullet-->
```buffer
- a

┃q
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

#### 341. [Backspace at a quote's start › Quote57](../../spec/quotes.md#quote57)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para

> [!note] ┃Title
> body
```

</td><td>

<!--silverbullet-->
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

#### 342. [Backspace at a quote's start › Quote58](../../spec/quotes.md#quote58)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para

> ┃[!note] Title
> body
```

</td><td>

<!--silverbullet-->
```buffer
para

┃[!note] Title
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

#### 343. [Backspace at a quote's start › Quote59](../../spec/quotes.md#quote59)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - ┃
```

</td><td>

<!--silverbullet-->
```buffer
> ┃
```

</td><td>

<!--ourus-->
```buffer
┃
```

</td></tr>
</table>

#### 344. [Joining into a callout's title › Quote60](../../spec/quotes.md#quote60)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> [!note] Ti
> ┃tle
>
> body
```

</td><td>

<!--silverbullet-->
```buffer
> [!note] Ti
┃tle
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

#### 345. [Joining into a callout's title › Quote61](../../spec/quotes.md#quote61)

> deleteContentForward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> [!note] Title┃
> body
```

</td><td>

<!--silverbullet-->
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

#### 346. [Joining into a callout's title › Quote62](../../spec/quotes.md#quote62)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> [!note] Title
> - ┃a
```

</td><td>

<!--silverbullet-->
```buffer
> [!note] Title
> ┃a
```

</td><td>

<!--ourus-->
```buffer
> [!note] Title┃a
```

</td></tr>
</table>

#### 347. [Quote63](../../spec/quotes.md#quote63)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
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

<!--silverbullet-->
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

#### 348. [Quote64](../../spec/quotes.md#quote64)

> indent

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> # H
> - a
> - b┃
```

</td><td>

<!--silverbullet-->
```buffer
> # H
> - a
  > - b┃
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

#### 349. [Indenting a paragraph into a quote › Quote65](../../spec/quotes.md#quote65)

> indent

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> q

para┃
```

</td><td>

<!--silverbullet-->
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

#### 350. [Indenting a paragraph into a quote › Quote66](../../spec/quotes.md#quote66)

> outdent

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> q
>
> para┃
```

</td><td>

<!--silverbullet-->
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

#### 351. [Quote68](../../spec/quotes.md#quote68)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - x
> - y

> q┃
```

</td><td>

<!--silverbullet-->
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

#### 352. [Quote71](../../spec/quotes.md#quote71)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> [!note] T
> - a┃

- b
```

</td><td>

<!--silverbullet-->
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

#### 353. [Quote72](../../spec/quotes.md#quote72)

> outdent

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - x
> - a┃
> - b
```

</td><td>

<!--silverbullet-->
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

#### 354. [A paragraph outdented out of a nested quote › Quote69](../../spec/quotes.md#quote69)

> outdent

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a
> > q┃
```

</td><td>

<!--silverbullet-->
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

#### 355. [A paragraph outdented out of a nested quote › Quote70](../../spec/quotes.md#quote70)

> outdent

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> > q┃
> - a
```

</td><td>

<!--silverbullet-->
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

#### 356. [Outliner flows › Scenario3](../../spec/scenarios.md#scenario3)

> enter indent deleteContentBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
```

</td><td>

<!--silverbullet-->
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

#### 357. [Outliner flows › Scenario4](../../spec/scenarios.md#scenario4)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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

#### 358. [Outliner flows › Scenario6](../../spec/scenarios.md#scenario6)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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

#### 359. [Outliner flows › Scenario7](../../spec/scenarios.md#scenario7)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
```buffer
- buy milk
    ┃and eggs
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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
```buffer
- buy milk
┃    and eggs
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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
```buffer
- buy milk

    today:┃and eggs
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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
```buffer
- buy milk

    today:and eggs
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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
```buffer
- buy milk

    today:and eggs┃- call An
```

</td><td>

<!--ourus-->
```buffer
- today:
- buy milk and eggs┃call A
```

</td></tr>
</table>

#### 360. [Outliner flows › Scenario9](../../spec/scenarios.md#scenario9)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
```buffer
- Inbox
  - call Ann
  - buy milk┃
- Errands
```

</td><td>

<!--ourus-->
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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
```buffer
- Inbox
  - call Ann
  - post a letter┃
  - buy milk
- Errands
```

</td><td>

<!--ourus-->
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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
```buffer
- Errands
- Inbox┃
  - call Ann
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

#### 361. [Outliner flows › Scenario11](../../spec/scenarios.md#scenario11)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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

> "more"

<table>
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
```buffer
- a
more┃
- b
```

</td><td>

<!--ourus-->
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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
```buffer
- amore┃- b
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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
```buffer
- amore┃- b
```

</td><td>

<!--ourus-->
```buffer
- amore┃b
```

</td></tr>
</table>

#### 362. [Outliner flows › Scenario12](../../spec/scenarios.md#scenario12)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
```buffer
- a┃- x
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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
```buffer
- a- x┃  - b
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

#### 363. [Outliner flows › Scenario14](../../spec/scenarios.md#scenario14)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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
- c
  - b┃
  - d
```

</td></tr>
</table>

> moveSubtreeUp

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

#### 364. [Outliner flows › Scenario15](../../spec/scenarios.md#scenario15)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
```buffer
- [ ] milk
  - [ ] bread
        two loaves┃
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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
```buffer
- [ ] milk
  - [ ] bread
        two loaves
        ┃
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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
```buffer
- [ ] milk
  - [ ] bread
        two loaves

        ┃
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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
```buffer
- [ ] milk
  - [ ] bread
        two loaves


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

#### 365. [Outliner flows › Scenario16](../../spec/scenarios.md#scenario16)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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

#### 366. [Outliner flows › Scenario18](../../spec/scenarios.md#scenario18)

> pasteStructured "!"

<table>
<tr><th>clipboard</th><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
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

<!--silverbullet-->
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

#### 367. [Notes and sections › Scenario19](../../spec/scenarios.md#scenario19)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
```buffer
first idea
second┃
# Notes
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

#### 368. [Notes and sections › Scenario20](../../spec/scenarios.md#scenario20)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
```buffer
Pack light.
Book the train.
Seat 42.┃
# Trip
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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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

#### 369. [Notes and sections › Scenario21](../../spec/scenarios.md#scenario21)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
```buffer
onetwo┃
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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
```buffer
onetwo┃
```

</td><td>

<!--ourus-->
```buffer
one┃two
```

</td></tr>
</table>

#### 370. [Notes and sections › Scenario23](../../spec/scenarios.md#scenario23)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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

#### 371. [ShiftEnter1](../../spec/shift-enter.md#shiftenter1)

> shiftEnter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one two┃ three
```

</td><td>

<!--silverbullet-->
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

#### 372. [ShiftEnter2](../../spec/shift-enter.md#shiftenter2)

> shiftEnter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a
   - b┃ c
```

</td><td>

<!--silverbullet-->
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

#### 373. [ShiftEnter3](../../spec/shift-enter.md#shiftenter3)

> shiftEnter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- x
→- a┃ b
```

</td><td>

<!--silverbullet-->
```buffer
- x
→- a
┃ b
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

#### 374. [ShiftEnter5](../../spec/shift-enter.md#shiftenter5)

> shiftEnter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc ┃- def
```

</td><td>

<!--silverbullet-->
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

#### 375. [ShiftEnter6](../../spec/shift-enter.md#shiftenter6)

> shiftEnter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc ┃1. def
```

</td><td>

<!--silverbullet-->
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

#### 376. [ShiftEnter7](../../spec/shift-enter.md#shiftenter7)

> shiftEnter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Title ┃===
```

</td><td>

<!--silverbullet-->
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

#### 377. [ShiftEnter8](../../spec/shift-enter.md#shiftenter8)

> shiftEnter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Title ┃--
```

</td><td>

<!--silverbullet-->
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

#### 378. [ShiftEnter9](../../spec/shift-enter.md#shiftenter9)

> shiftEnter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one ┃<div>
```

</td><td>

<!--silverbullet-->
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

#### 379. [ShiftEnter10](../../spec/shift-enter.md#shiftenter10)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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

#### 380. [ShiftEnter13](../../spec/shift-enter.md#shiftenter13)

> shiftEnter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃one
```

</td><td>

<!--silverbullet-->
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

#### 381. [ShiftEnter14](../../spec/shift-enter.md#shiftenter14)

> shiftEnter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Title┃ more
```

</td><td>

<!--silverbullet-->
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

#### 382. [ShiftEnter15](../../spec/shift-enter.md#shiftenter15)

> shiftEnter shiftEnter "p"

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one┃
```

</td><td>

<!--silverbullet-->
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

#### 383. [ShiftEnter17](../../spec/shift-enter.md#shiftenter17)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
```buffer
- one
┃two
```

</td><td>

<!--ourus-->
```buffer
- one
  ┃two
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- one┃two
```

</td></tr>
</table>

#### 384. [ShiftEnter18](../../spec/shift-enter.md#shiftenter18)

> shiftEnter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. abc ┃2. x
```

</td><td>

<!--silverbullet-->
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

#### 385. [ShiftEnter19](../../spec/shift-enter.md#shiftenter19)

> shiftEnter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
a | b ┃|---|---|
```

</td><td>

<!--silverbullet-->
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

#### 386. [ShiftEnter20](../../spec/shift-enter.md#shiftenter20)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- abc┃- def
```

</td></tr>
</table>

#### 387. [ShiftEnter21](../../spec/shift-enter.md#shiftenter21)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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

#### 388. [TaskEnter1](../../spec/tasks.md#taskenter1)

> enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- [ ] ┃
```

</td><td>

<!--silverbullet-->
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

#### 389. [TaskEnter2](../../spec/tasks.md#taskenter2)

> enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - [ ] ┃
```

</td><td>

<!--silverbullet-->
```buffer
- a
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

#### 390. [TaskEnter5](../../spec/tasks.md#taskenter5)

> enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b
  - [ ] ┃
  - c
```

</td><td>

<!--silverbullet-->
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
  - [ ] 
  - [ ] ┃
  - c
```

</td></tr>
</table>

#### 391. [TaskEnter6](../../spec/tasks.md#taskenter6)

> enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - [ ] ┃
  - b
```

</td><td>

<!--silverbullet-->
```buffer
- a
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

#### 392. [TaskEnter7](../../spec/tasks.md#taskenter7)

> enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [x] a┃ b
  - c
```

</td><td>

<!--silverbullet-->
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

#### 393. [TaskBackspace1](../../spec/tasks.md#taskbackspace1)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- 
  - ┃[ ] task
    - child
```

</td><td>

<!--silverbullet-->
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

#### 394. [TaskBackspace2](../../spec/tasks.md#taskbackspace2)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
```buffer
- a
      ┃
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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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

#### 395. [TaskBackspace3](../../spec/tasks.md#taskbackspace3)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- [x] ┃b
```

</td><td>

<!--silverbullet-->
```buffer
- a
      ┃b
```

</td><td>

<!--ourus-->
```buffer
- a
- ┃b
```

</td></tr>
</table>

#### 396. [TaskBackspace6](../../spec/tasks.md#taskbackspace6)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] 
- ┃[x] a
```

</td><td>

<!--silverbullet-->
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

#### 397. [TaskDelete1](../../spec/tasks.md#taskdelete1)

> deleteContentForward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- [ ] b
```

</td><td>

<!--silverbullet-->
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

#### 398. [TaskDelete2](../../spec/tasks.md#taskdelete2)

> deleteContentForward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
- [x] a
```

</td><td>

<!--silverbullet-->
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

#### 399. [TaskDelete3](../../spec/tasks.md#taskdelete3)

> deleteContentForward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- [ ] 
```

</td><td>

<!--silverbullet-->
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

#### 400. [Undo3](../../spec/undo.md#undo3)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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

### Whitespace (10)

#### 1. [Enter26](../../spec/enter.md#enter26)

> enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃b
```

</td><td>

<!--silverbullet-->
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

#### 2. [Enter29](../../spec/enter.md#enter29)

> enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b
  - ┃c
```

</td><td>

<!--silverbullet-->
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

#### 3. [Enter29b](../../spec/enter.md#enter29b)

> enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b
  - ┃c
```

</td><td>

<!--silverbullet-->
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
  - 
  - ┃c
```

</td></tr>
</table>

#### 4. [Enter31](../../spec/enter.md#enter31)

> enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃a
  - b
```

</td><td>

<!--silverbullet-->
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

#### 5. [Fence8](../../spec/fences.md#fence8)

> shiftEnter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ```
  code┃
  ```
````

</td><td>

<!--silverbullet-->
````buffer
- a
  ```
  code
┃
  ```
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

#### 6. [Fence15](../../spec/fences.md#fence15)

> enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- ┃```
  code
  ```
````

</td><td>

<!--silverbullet-->
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

#### 7. [Fence32](../../spec/fences.md#fence32)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
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
  ```
  ┃
````

</td></tr>
</table>

> deleteContentBackward

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

#### 8. [ShiftEnter4](../../spec/shift-enter.md#shiftenter4)

> shiftEnter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one┃
- two
```

</td><td>

<!--silverbullet-->
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

#### 9. [ShiftEnter11](../../spec/shift-enter.md#shiftenter11)

> shiftEnter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  ┃
- two
```

</td><td>

<!--silverbullet-->
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

#### 10. [TaskEnter4](../../spec/tasks.md#taskenter4)

> enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] ┃abc
```

</td><td>

<!--silverbullet-->
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

### Caret (29)

#### 1. [CursorUp2](../../spec/cursor.md#cursorup2)

> cursorLineUp

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
## Title
- ┃a
```

</td><td>

<!--silverbullet-->
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

#### 2. [CursorUp3](../../spec/cursor.md#cursorup3)

> cursorLineUp

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
    - b
- c┃
```

</td><td>

<!--silverbullet-->
```buffer
- a
   ┃ - b
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

#### 3. [CursorDown3](../../spec/cursor.md#cursordown3)

> cursorLineDown

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃a
  - b
```

</td><td>

<!--silverbullet-->
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

#### 4. [CursorDown5](../../spec/cursor.md#cursordown5)

> cursorLineDown

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- [ ] task
```

</td><td>

<!--silverbullet-->
```buffer
- a
- ┃[ ] task
```

</td><td>

<!--ourus-->
```buffer
- a
- [ ] ┃task
```

</td></tr>
</table>

#### 5. [CursorHome1](../../spec/cursor.md#cursorhome1)

> cursorLineBoundaryBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one two┃
```

</td><td>

<!--silverbullet-->
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

#### 6. [CursorHome3](../../spec/cursor.md#cursorhome3)

> cursorLineBoundaryBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
┃- one two
```

</td><td>

<!--silverbullet-->
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
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
-┃ one
```

</td><td>

<!--silverbullet-->
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

#### 8. [CursorHome5](../../spec/cursor.md#cursorhome5)

> cursorLineBoundaryBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b┃
```

</td><td>

<!--silverbullet-->
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

#### 9. [CursorHome6](../../spec/cursor.md#cursorhome6)

> cursorLineBoundaryBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
→- b┃
```

</td><td>

<!--silverbullet-->
```buffer
- a
┃→- b
```

</td><td>

<!--ourus-->
```buffer
- a
→- ┃b
```

</td></tr>
</table>

#### 10. [CursorHome7](../../spec/cursor.md#cursorhome7)

> cursorLineBoundaryBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
10. ten┃
```

</td><td>

<!--silverbullet-->
```buffer
┃10. ten
```

</td><td>

<!--ourus-->
```buffer
10. ┃ten
```

</td></tr>
</table>

#### 11. [CursorHome8](../../spec/cursor.md#cursorhome8)

> cursorLineBoundaryBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] task┃
```

</td><td>

<!--silverbullet-->
```buffer
┃- [ ] task
```

</td><td>

<!--ourus-->
```buffer
- [ ] ┃task
```

</td></tr>
</table>

#### 12. [CursorHome9](../../spec/cursor.md#cursorhome9)

> cursorLineBoundaryBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [x] done┃
```

</td><td>

<!--silverbullet-->
```buffer
┃- [x] done
```

</td><td>

<!--ourus-->
```buffer
- [x] ┃done
```

</td></tr>
</table>

#### 13. [CursorHome10](../../spec/cursor.md#cursorhome10)

> cursorLineBoundaryBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
## Title┃
```

</td><td>

<!--silverbullet-->
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

#### 14. [CursorHome11](../../spec/cursor.md#cursorhome11)

> cursorLineBoundaryBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> quote┃
```

</td><td>

<!--silverbullet-->
```buffer
┃> quote
```

</td><td>

<!--ourus-->
```buffer
> ┃quote
```

</td></tr>
</table>

#### 15. [CursorHome12](../../spec/cursor.md#cursorhome12)

> cursorLineBoundaryBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  two┃
```

</td><td>

<!--silverbullet-->
```buffer
- one
┃  two
```

</td><td>

<!--ourus-->
```buffer
- one
  ┃two
```

</td></tr>
</table>

#### 16. [CursorHome15](../../spec/cursor.md#cursorhome15)

> cursorLineBoundaryBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
┃- [ ] 
```

</td><td>

<!--silverbullet-->
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

#### 17. [CursorHome16](../../spec/cursor.md#cursorhome16)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
> - a┃
```

</td></tr>
</table>

> cursorLineBoundaryBackward

<table>
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
```buffer
┃> - a
```

</td><td>

<!--ourus-->
```buffer
> - ┃a
```

</td></tr>
</table>

> cursorLineBoundaryBackward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
┃> - a
```

</td></tr>
</table>

#### 18. [CursorHome17](../../spec/cursor.md#cursorhome17)

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
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
```buffer
┃> [!note] Title
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

#### 19. [SelectHome1](../../spec/cursor.md#selecthome1)

> selectLineBoundaryBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one┃
```

</td><td>

<!--silverbullet-->
```buffer
┃«- one»
```

</td><td>

<!--ourus-->
```buffer
- ┃«one»
```

</td></tr>
</table>

#### 20. [Delete16g](../../spec/del.md#delete16g)

> deleteContentForward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
-┃  a
```

</td><td>

<!--silverbullet-->
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

#### 21. [Fence13](../../spec/fences.md#fence13)

> enter

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ```
  code
  ┃```
````

</td><td>

<!--silverbullet-->
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

#### 22. [Fence26](../../spec/fences.md#fence26)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
- ┃```
  one
  ```
````

</td><td>

<!--silverbullet-->
````buffer
- a
  ┃```
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

#### 23. [Keys on a blank line › Gap18](../../spec/gaps.md#gap18)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
┃

a
```

</td></tr>
</table>

> moveSubtreeDown

<table>
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
```buffer

┃
a
```

</td><td>

<!--ourus-->
```buffer
┃

a
```

</td></tr>
</table>

> indent

<table>
<tr><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

<!--silverbullet-->
```buffer

┃
a
```

</td><td>

<!--ourus-->
```buffer
┃

a
```

</td></tr>
</table>

#### 24. [Indent28](../../spec/indent.md#indent28)

> indent

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
┃- b
```

</td><td>

<!--silverbullet-->
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

#### 25. [MoveDown14](../../spec/move-subtree-down.md#movedown14)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- «a
  - b»
- c
```

</td><td>

<!--silverbullet-->
```buffer
- c
- ┃a
  - b
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

#### 26. [MoveDown32](../../spec/move-subtree-down.md#movedown32)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
┃- a
- b
```

</td><td>

<!--silverbullet-->
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

#### 27. [MoveUp31](../../spec/move-subtree-up.md#moveup31)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- c
- «a
  - b»
```

</td><td>

<!--silverbullet-->
```buffer
- ┃a
  - b
- c
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

#### 28. [MoveUp34](../../spec/move-subtree-up.md#moveup34)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
┃- b
```

</td><td>

<!--silverbullet-->
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

#### 29. [Outdent14](../../spec/outdent.md#outdent14)

> outdent

<table>
<tr><th>buffer</th><th>silverbullet</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  ┃- b
```

</td><td>

<!--silverbullet-->
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

### Agree (157)

1. [Backspace12](../../spec/backspace.md#backspace12)
2. [Backspace12c](../../spec/backspace.md#backspace12c)
3. [Backspace13](../../spec/backspace.md#backspace13)
4. [Backspace17e](../../spec/backspace.md#backspace17e)
5. [Backspace26](../../spec/backspace.md#backspace26)
6. [Backspace31](../../spec/backspace.md#backspace31)
7. [Backspace32](../../spec/backspace.md#backspace32)
8. [Backspace33](../../spec/backspace.md#backspace33)
9. [CursorLeft1](../../spec/cursor.md#cursorleft1)
10. [CursorLeft3](../../spec/cursor.md#cursorleft3)
11. [CursorRight1](../../spec/cursor.md#cursorright1)
12. [CursorRight2](../../spec/cursor.md#cursorright2)
13. [CursorUp1](../../spec/cursor.md#cursorup1)
14. [CursorDown1](../../spec/cursor.md#cursordown1)
15. [CursorDown2](../../spec/cursor.md#cursordown2)
16. [CursorDown4](../../spec/cursor.md#cursordown4)
17. [CursorHome2](../../spec/cursor.md#cursorhome2)
18. [CursorHome13](../../spec/cursor.md#cursorhome13)
19. [CursorHome14](../../spec/cursor.md#cursorhome14)
20. [CursorEnd1](../../spec/cursor.md#cursorend1)
21. [CursorDocStart1](../../spec/cursor.md#cursordocstart1)
22. [CursorDocEndLeft1](../../spec/cursor.md#cursordocendleft1)
23. [SelectLeft1](../../spec/cursor.md#selectleft1)
24. [SelectRightEnd1](../../spec/cursor.md#selectrightend1)
25. [Delete8](../../spec/del.md#delete8)
26. [Delete15](../../spec/del.md#delete15)
27. [Delete16](../../spec/del.md#delete16)
28. [Delete16f](../../spec/del.md#delete16f)
29. [Delete18](../../spec/del.md#delete18)
30. [Delete18b](../../spec/del.md#delete18b)
31. [Delete21](../../spec/del.md#delete21)
32. [Delete22](../../spec/del.md#delete22)
33. [Delete23](../../spec/del.md#delete23)
34. [Delete24](../../spec/del.md#delete24)
35. [Delete25](../../spec/del.md#delete25)
36. [Enter2](../../spec/enter.md#enter2)
37. [Enter5](../../spec/enter.md#enter5)
38. [Enter32b](../../spec/enter.md#enter32b)
39. [Enter33b](../../spec/enter.md#enter33b)
40. [Fence1](../../spec/fences.md#fence1)
41. [Fence2](../../spec/fences.md#fence2)
42. [Fence3](../../spec/fences.md#fence3)
43. [Fence5](../../spec/fences.md#fence5)
44. [Fence6](../../spec/fences.md#fence6)
45. [Fence7d](../../spec/fences.md#fence7d)
46. [Fence12](../../spec/fences.md#fence12)
47. [Fence28](../../spec/fences.md#fence28)
48. [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap1](../../spec/gaps.md#gap1)
49. [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap2](../../spec/gaps.md#gap2)
50. [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap3](../../spec/gaps.md#gap3)
51. [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap6](../../spec/gaps.md#gap6)
52. [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap8](../../spec/gaps.md#gap8)
53. [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap9](../../spec/gaps.md#gap9)
54. [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap10](../../spec/gaps.md#gap10)
55. [moveSubtreeUp, moveSubtreeDown (Alt-Shift-Up, Alt-Shift-Down) › Gap11](../../spec/gaps.md#gap11)
56. [New text and gaps › Gap12](../../spec/gaps.md#gap12)
57. [Keys on a blank line › Gap17](../../spec/gaps.md#gap17)
58. [Keys on a blank line › Gap19](../../spec/gaps.md#gap19)
59. [Indent1](../../spec/indent.md#indent1)
60. [Indent2](../../spec/indent.md#indent2)
61. [Indent5](../../spec/indent.md#indent5)
62. [Indent8](../../spec/indent.md#indent8)
63. [Indent10](../../spec/indent.md#indent10)
64. [Indent11](../../spec/indent.md#indent11)
65. [Indent12](../../spec/indent.md#indent12)
66. [Indent13](../../spec/indent.md#indent13)
67. [Indent14](../../spec/indent.md#indent14)
68. [Indent15](../../spec/indent.md#indent15)
69. [Indent19](../../spec/indent.md#indent19)
70. [Indent20](../../spec/indent.md#indent20)
71. [Indent23](../../spec/indent.md#indent23)
72. [Indent24](../../spec/indent.md#indent24)
73. [Indent26](../../spec/indent.md#indent26)
74. [MoveDown1](../../spec/move-subtree-down.md#movedown1)
75. [MoveDown3](../../spec/move-subtree-down.md#movedown3)
76. [MoveDown4](../../spec/move-subtree-down.md#movedown4)
77. [MoveDown5](../../spec/move-subtree-down.md#movedown5)
78. [MoveDown6](../../spec/move-subtree-down.md#movedown6)
79. [MoveDown15](../../spec/move-subtree-down.md#movedown15)
80. [MoveDown16](../../spec/move-subtree-down.md#movedown16)
81. [MoveDown17](../../spec/move-subtree-down.md#movedown17)
82. [MoveDown19](../../spec/move-subtree-down.md#movedown19)
83. [MoveDown21](../../spec/move-subtree-down.md#movedown21)
84. [MoveDown22](../../spec/move-subtree-down.md#movedown22)
85. [MoveDown31](../../spec/move-subtree-down.md#movedown31)
86. [MoveUp1](../../spec/move-subtree-up.md#moveup1)
87. [MoveUp2](../../spec/move-subtree-up.md#moveup2)
88. [MoveUp3](../../spec/move-subtree-up.md#moveup3)
89. [MoveUp4](../../spec/move-subtree-up.md#moveup4)
90. [MoveUp5](../../spec/move-subtree-up.md#moveup5)
91. [MoveUp13](../../spec/move-subtree-up.md#moveup13)
92. [MoveUp14](../../spec/move-subtree-up.md#moveup14)
93. [MoveUp16](../../spec/move-subtree-up.md#moveup16)
94. [MoveUp25](../../spec/move-subtree-up.md#moveup25)
95. [MoveUp28](../../spec/move-subtree-up.md#moveup28)
96. [MoveUp32](../../spec/move-subtree-up.md#moveup32)
97. [MoveUp33](../../spec/move-subtree-up.md#moveup33)
98. [Enter › #228 › Renumbering stops at a delimiter change](../../spec/obsidian-true-outliner.md#renumbering-stops-at-a-delimiter-change)
99. [Enter › E15](../../spec/obsidian-true-outliner.md#e15)
100. [Enter › E19, E21 › End of lone heading starts a paragraph](../../spec/obsidian-true-outliner.md#end-of-lone-heading-starts-a-paragraph)
101. [Enter › E19, E21 › Empty paragraph before a section list](../../spec/obsidian-true-outliner.md#empty-paragraph-before-a-section-list)
102. [Enter › E32 › Checked task gives unchecked new item](../../spec/obsidian-true-outliner.md#checked-task-gives-unchecked-new-item)
103. [Enter › E13, E16 › Rest of title becomes first paragraph](../../spec/obsidian-true-outliner.md#rest-of-title-becomes-first-paragraph)
104. [Enter › E13, E16 › Split title above a subheading](../../spec/obsidian-true-outliner.md#split-title-above-a-subheading)
105. [Shift-Enter › S5](../../spec/obsidian-true-outliner.md#s5)
106. [Backspace › #153 › Undoing a fresh line break](../../spec/obsidian-true-outliner.md#undoing-a-fresh-line-break)
107. [Indentation › #255 › Outdented child leaves quote above alone](../../spec/obsidian-true-outliner.md#outdented-child-leaves-quote-above-alone)
108. [Indentation › seams-across-a-re-indent › Indented item keeps its quote](../../spec/obsidian-true-outliner.md#indented-item-keeps-its-quote)
109. [Indentation › seams-across-a-re-indent › Outdented item keeps its quote](../../spec/obsidian-true-outliner.md#outdented-item-keeps-its-quote)
110. [Indentation › seams-across-a-re-indent › Indented item keeps its thematic break](../../spec/obsidian-true-outliner.md#indented-item-keeps-its-thematic-break)
111. [Indentation › seams-across-a-re-indent › Outdented item keeps its code block](../../spec/obsidian-true-outliner.md#outdented-item-keeps-its-code-block)
112. [Moving › lone-block-id › Block id moves with its item](../../spec/obsidian-true-outliner.md#block-id-moves-with-its-item)
113. [Moving › lone-block-id › Block id moves with its paragraph](../../spec/obsidian-true-outliner.md#block-id-moves-with-its-paragraph)
114. [Moving › lazy-continuation-at-seams › No blank line needed after a fence](../../spec/obsidian-true-outliner.md#no-blank-line-needed-after-a-fence)
115. [Abandoning an empty place › Enter, then Shift-Enter and Backspace](../../spec/obsidian-true-outliner.md#enter-then-shift-enter-and-backspace)
116. [Abandoning an empty place › Enter, Shift-Tab, then leave › Second Enter outdents to a kept item](../../spec/obsidian-true-outliner.md#second-enter-outdents-to-a-kept-item)
117. [Outdent1](../../spec/outdent.md#outdent1)
118. [Outdent2](../../spec/outdent.md#outdent2)
119. [Outdent4](../../spec/outdent.md#outdent4)
120. [Outdent5](../../spec/outdent.md#outdent5)
121. [Outdent6](../../spec/outdent.md#outdent6)
122. [Outdent11](../../spec/outdent.md#outdent11)
123. [Outdent13](../../spec/outdent.md#outdent13)
124. [Direct outdent › DirectOutdent1](../../spec/outdent.md#directoutdent1)
125. [Paste24](../../spec/paste.md#paste24)
126. [Paste31](../../spec/paste.md#paste31)
127. [Placeholder6](../../spec/placeholders.md#placeholder6)
128. [Placeholder8](../../spec/placeholders.md#placeholder8)
129. [Placeholder10](../../spec/placeholders.md#placeholder10)
130. [Placeholder11](../../spec/placeholders.md#placeholder11)
131. [Placeholder12](../../spec/placeholders.md#placeholder12)
132. [Moving inside a quote › Quote24](../../spec/quotes.md#quote24)
133. [Moving inside a quote › Quote26](../../spec/quotes.md#quote26)
134. [A quote and a heading don't swap › Quote27](../../spec/quotes.md#quote27)
135. [A quote and a heading don't swap › Quote28](../../spec/quotes.md#quote28)
136. [Enter in a quote › Quote29](../../spec/quotes.md#quote29)
137. [Enter in a quote › Quote30](../../spec/quotes.md#quote30)
138. [Enter in a quote › Quote39](../../spec/quotes.md#quote39)
139. [Backspace at a quote's start › Quote53](../../spec/quotes.md#quote53)
140. [Quote67](../../spec/quotes.md#quote67)
141. [Outliner flows › Scenario1](../../spec/scenarios.md#scenario1)
142. [Outliner flows › Scenario2](../../spec/scenarios.md#scenario2)
143. [Outliner flows › Scenario5](../../spec/scenarios.md#scenario5)
144. [Outliner flows › Scenario8](../../spec/scenarios.md#scenario8)
145. [Outliner flows › Scenario13](../../spec/scenarios.md#scenario13)
146. [Notes and sections › Scenario22](../../spec/scenarios.md#scenario22)
147. [Notes and sections › Scenario24](../../spec/scenarios.md#scenario24)
148. [ShiftEnter12](../../spec/shift-enter.md#shiftenter12)
149. [ShiftEnter22](../../spec/shift-enter.md#shiftenter22)
150. [TaskEnter3](../../spec/tasks.md#taskenter3)
151. [Typing1](../../spec/typing.md#typing1)
152. [Typing2](../../spec/typing.md#typing2)
153. [Typing3](../../spec/typing.md#typing3)
154. [Undo1](../../spec/undo.md#undo1)
155. [Undo2](../../spec/undo.md#undo2)
156. [Undo4](../../spec/undo.md#undo4)
157. [Undo5](../../spec/undo.md#undo5)

## Skipped

### option outdent: logical (8)

1. [obsidian-true-outliner.md › Ordered lists › Outdenting the head of a nested list](../../spec/obsidian-true-outliner.md#outdenting-the-head-of-a-nested-list)
2. [outdent.md › Logical outdent › LogicalOutdent1](../../spec/outdent.md#logicaloutdent1)
3. [outdent.md › Logical outdent › LogicalOutdent2](../../spec/outdent.md#logicaloutdent2)
4. [outdent.md › Logical outdent › LogicalOutdent3](../../spec/outdent.md#logicaloutdent3)
5. [outdent.md › Logical outdent › LogicalOutdent4](../../spec/outdent.md#logicaloutdent4)
6. [outdent.md › Logical outdent › LogicalOutdent5](../../spec/outdent.md#logicaloutdent5)
7. [quotes.md › Outdent out of a quote › Quote12b](../../spec/quotes.md#quote12b)
8. [quotes.md › Moving between quotes › Quote20](../../spec/quotes.md#quote20)

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

### option deleteAtGap: gap (2)

1. [backspace.md › Backspace21b](../../spec/backspace.md#backspace21b)
2. [del.md › Delete17b](../../spec/del.md#delete17b)

### option handleFenceContents: false (2)

1. [fences.md › Fence10](../../spec/fences.md#fence10)
2. [fences.md › Fence11](../../spec/fences.md#fence11)

### option taskEditing: block (2)

1. [tasks.md › TaskBackspace4](../../spec/tasks.md#taskbackspace4)
2. [tasks.md › TaskBackspace7](../../spec/tasks.md#taskbackspace7)

### nothing to compare (1)

1. [fences.md › Fence21](../../spec/fences.md#fence21)

### option bullet: + (1)

1. [indent.md › Indent18](../../spec/indent.md#indent18)

### option pasteStructuredMidText: after (1)

1. [paste.md › Paste38](../../spec/paste.md#paste38)

### option taskEditing: text (1)

1. [tasks.md › TaskBackspace5](../../spec/tasks.md#taskbackspace5)
