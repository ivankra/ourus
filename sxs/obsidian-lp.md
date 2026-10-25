---
type: "SxS"
app: "obsidian-lp"
version: "1.14.5"
url: "app://obsidian.md/"
model: "text"
command: "node sxs/run.ts obsidian-lp"
elapsed_s: 507
workers: 2
---

# Obsidian (Live Preview) vs ourus

Summary:

| agree | caret | whitespace | disagree | error | skipped | total |
| --- | --- | --- | --- | --- | --- | --- |
| **238 (23%)** | **[21](#caret-21) (2%)** | **[32](#whitespace-32) (3.1%)** | **[570](#disagree-570) (55%)** | **0 (0%)** | **[184](#skipped-184) (18%)** | **1045** |

Per-file:

|  | agree | caret | whitespace | disagree | error | skipped | total |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [backspace.md](../spec/backspace.md) | 10 | 1 |  | 64 |  | 10 | **85** |
| [backtick.md](../spec/backtick.md) | 10 |  |  | 14 |  | 9 | **33** |
| [copy.md](../spec/copy.md) | 2 |  |  | 4 |  | 7 | **13** |
| [cursor.md](../spec/cursor.md) | 26 | 9 |  |  |  | 1 | **36** |
| [delete-subtree.md](../spec/delete-subtree.md) |  |  |  |  |  | 13 | **13** |
| [delete.md](../spec/delete.md) | 11 |  |  | 31 |  | 14 | **56** |
| [duplicate-subtree.md](../spec/duplicate-subtree.md) |  |  |  |  |  | 10 | **10** |
| [enter.md](../spec/enter.md) | 20 | 2 | 1 | 48 |  | 26 | **97** |
| [fences.md](../spec/fences.md) | 14 | 2 |  | 50 |  | 4 | **70** |
| [gaps.md](../spec/gaps.md) | 2 |  | 1 | 15 |  | 1 | **19** |
| [indent.md](../spec/indent.md) | 9 | 1 | 4 | 18 |  | 4 | **36** |
| [move-subtree-down.md](../spec/move-subtree-down.md) | 4 | 1 |  | 35 |  |  | **40** |
| [move-subtree-up.md](../spec/move-subtree-up.md) | 9 | 2 |  | 30 |  | 1 | **42** |
| [obsidian-true-outliner.md](../spec/obsidian-true-outliner.md) | 19 |  | 3 | 41 |  | 4 | **67** |
| [outdent.md](../spec/outdent.md) | 7 | 1 | 1 | 19 |  | 8 | **36** |
| [paste-conv.md](../spec/paste-conv.md) | 1 |  |  | 5 |  |  | **6** |
| [paste-html.md](../spec/paste-html.md) | 2 | 1 | 5 | 11 |  |  | **19** |
| [paste-list-form.md](../spec/paste-list-form.md) |  |  |  | 5 |  | 1 | **6** |
| [paste-list.md](../spec/paste-list.md) | 3 |  |  | 18 |  | 8 | **29** |
| [paste-plain.md](../spec/paste-plain.md) | 30 |  |  |  |  | 6 | **36** |
| [paste.md](../spec/paste.md) | 4 |  | 1 | 18 |  | 13 | **36** |
| [placeholders.md](../spec/placeholders.md) | 6 |  | 1 | 12 |  | 1 | **20** |
| [quirks.md](../spec/quirks.md) |  |  |  |  |  | 7 | **7** |
| [quotes.md](../spec/quotes.md) | 13 | 1 | 11 | 68 |  | 7 | **100** |
| [regressions.md](../spec/regressions.md) | 6 |  |  | 20 |  | 6 | **32** |
| [scenarios.md](../spec/scenarios.md) | 5 |  |  | 19 |  | 2 | **26** |
| [shift-enter.md](../spec/shift-enter.md) | 9 |  | 4 | 18 |  | 5 | **36** |
| [tasks.md](../spec/tasks.md) | 11 |  |  | 4 |  | 15 | **30** |
| [typing.md](../spec/typing.md) | 3 |  |  |  |  |  | **3** |
| [undo.md](../spec/undo.md) | 2 |  |  | 3 |  |  | **5** |
| [z-open.md](../spec/z-open.md) |  |  |  |  |  | 1 | **1** |
| **total** | **238 (23%)** | **21 (2%)** | **32 (3.1%)** | **570 (55%)** | **0 (0%)** | **184 (18%)** | **1045** |

## Disagree (570)

### [Backspace1](../spec/backspace.md#backspace1)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
- ┃two
```

</td><td>

```buffer
- one
-┃two
```

</td><td>

```buffer
- one┃two
```

</td></tr>
</table>

### [Backspace2](../spec/backspace.md#backspace2)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
┃- two
```

</td><td>

```buffer
- one┃- two
```

</td><td>

```buffer
- one┃two
```

</td></tr>
</table>

### [Backspace3](../spec/backspace.md#backspace3)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃b
```

</td><td>

```buffer
- a
  -┃b
```

</td><td>

```buffer
- a┃b
```

</td></tr>
</table>

### [Backspace4](../spec/backspace.md#backspace4)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Title #
- ┃more
```

</td><td>

```buffer
# Title #
-┃more
```

</td><td>

```buffer
# Title┃more #
```

</td></tr>
</table>

### [Backspace5](../spec/backspace.md#backspace5)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- 
- ┃b
```

</td><td>

```buffer
- 
-┃b
```

</td><td>

```buffer
- ┃b
```

</td></tr>
</table>

### [Backspace7](../spec/backspace.md#backspace7)

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

```buffer
- a
  - b
-┃
```

</td><td>

```buffer
- a
  - b┃
```

</td></tr>
</table>

### [Backspace8](../spec/backspace.md#backspace8)

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

```buffer
- a
-┃b
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
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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

### [Backspace10](../spec/backspace.md#backspace10)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

┃
```

</td><td>

```buffer
- a
┃
```

</td><td>

```buffer
- a┃
```

</td></tr>
</table>

### [Backspace11](../spec/backspace.md#backspace11)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

┃b
```

</td><td>

```buffer
- a
┃b
```

</td><td>

```buffer
- a┃b
```

</td></tr>
</table>

### [Backspace12](../spec/backspace.md#backspace12)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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

</td><td>

```buffer
a┃b
```

</td></tr>
</table>

### [Backspace12b](../spec/backspace.md#backspace12b)

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
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

> deleteContentBackward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
a┃b
```

</td></tr>
</table>

### [Backspace12d](../spec/backspace.md#backspace12d)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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

</td><td>

```buffer
a┃b
- x
```

</td></tr>
</table>

### [Backspace12e](../spec/backspace.md#backspace12e)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
a

┃b
```

</td></tr>
</table>

> enter

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
a


┃b
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
a

┃b
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

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

### [Backspace14](../spec/backspace.md#backspace14)

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

```buffer
┃# H1



## H2
```

</td><td>

```buffer
┃# H1

## H2
```

</td></tr>
</table>

### [Backspace15](../spec/backspace.md#backspace15)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para

- ┃a
```

</td><td>

```buffer
para

-┃a
```

</td><td>

```buffer
para┃a
```

</td></tr>
</table>

### [Backspace16](../spec/backspace.md#backspace16)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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
-┃a
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

### [Backspace17](../spec/backspace.md#backspace17)

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

```buffer
-┃
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

### [Backspace17b](../spec/backspace.md#backspace17b)

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

```buffer
-┃
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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

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
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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
-┃
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

### [Backspace17e](../spec/backspace.md#backspace17e)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
```

</td><td>

```buffer
-┃
```

</td><td>

```buffer
┃
```

</td></tr>
</table>

### [Backspace18](../spec/backspace.md#backspace18)

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

```buffer
para

#┃Hello

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

### [Backspace18c](../spec/backspace.md#backspace18c)

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

### [Backspace18d](../spec/backspace.md#backspace18d)

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

```buffer
a
#┃H1
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

### [Backspace18e](../spec/backspace.md#backspace18e)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- # ┃H
```

</td><td>

```buffer
- a
- #┃H
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

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- # ┃H
  text
```

</td><td>

```buffer
- a
- #┃H
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

### [Backspace19](../spec/backspace.md#backspace19)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a

  ┃bc
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
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

> deleteContentBackward

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
┃bc
```

</td><td>

```buffer
- a┃bc
```

</td></tr>
</table>

### [Backspace19b](../spec/backspace.md#backspace19b)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a

  b┃c
```

</td></tr>
</table>

> enter

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

  b
  ┃c
```

</td><td>

```buffer
- a

  b

  ┃c
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

  b
┃c
```

</td><td>

```buffer
- a

  b┃c
```

</td></tr>
</table>

### [Backspace20](../spec/backspace.md#backspace20)

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

```buffer
- a
┃

- b
```

</td><td>

```buffer
- a┃

- b
```

</td></tr>
</table>

### [Backspace21](../spec/backspace.md#backspace21)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

- ┃b
```

</td><td>

```buffer
- a

-┃b
```

</td><td>

```buffer
- a┃b
```

</td></tr>
</table>

### [Backspace22](../spec/backspace.md#backspace22)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Title

┃more
```

</td><td>

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

### [Backspace23](../spec/backspace.md#backspace23)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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

</td><td>

```buffer
# Title

┃more
lines
```

</td></tr>
</table>

### [Backspace24](../spec/backspace.md#backspace24)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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

</td><td>

````buffer
```
x
```

┃para
````

</td></tr>
</table>

### [Backspace25](../spec/backspace.md#backspace25)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- 

┃para
```

</td><td>

```buffer
- a
- 
┃para
```

</td><td>

```buffer
- a
- ┃para
```

</td></tr>
</table>

### [Backspace27](../spec/backspace.md#backspace27)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> q

┃b
```

</td><td>

```buffer
> q
┃b
```

</td><td>

```buffer
> q┃b
```

</td></tr>
</table>

### [Backspace28](../spec/backspace.md#backspace28)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
```
x
```
- ┃
````

</td><td>

````buffer
```
x
```
-┃
````

</td><td>

````buffer
```
x┃
```
````

</td></tr>
</table>

### [Backspace29](../spec/backspace.md#backspace29)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a
2. ┃
3. c
```

</td><td>

```buffer
1. a
2.┃
2. c
```

</td><td>

```buffer
1. a┃
2. c
```

</td></tr>
</table>

### [Backspace30](../spec/backspace.md#backspace30)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃
```

</td><td>

```buffer
- a
  -┃
```

</td><td>

```buffer
- a┃
```

</td></tr>
</table>

### [Backspace33](../spec/backspace.md#backspace33)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃a
- b
```

</td><td>

```buffer
-┃a
- b
```

</td><td>

```buffer
┃a
- b
```

</td></tr>
</table>

### [Backspace35](../spec/backspace.md#backspace35)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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

##┃B

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

### [Backspace36](../spec/backspace.md#backspace36)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Title
=====
┃text
```

</td><td>

```buffer
Title
=====┃text
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

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Title
=====
┃more
lines
```

</td><td>

```buffer
Title
=====┃more
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

### [Backspace38](../spec/backspace.md#backspace38)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
[a]:

┃b
```

</td><td>

```buffer
[a]:
┃b
```

</td><td>

```buffer
[a]\:┃b
```

</td></tr>
</table>

### [Backspace39](../spec/backspace.md#backspace39)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃
p
```

</td><td>

```buffer
- a
-┃
p
```

</td><td>

```buffer
- a┃

p
```

</td></tr>
</table>

### [Backspace40](../spec/backspace.md#backspace40)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
p

- ┃t
2. m
```

</td><td>

```buffer
p

-┃t
2. m
```

</td><td>

```buffer
p┃t

2. m
```

</td></tr>
</table>

### [Backspace40b](../spec/backspace.md#backspace40b)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃x
3. c
```

</td><td>

```buffer
-┃x
3. c
```

</td><td>

```buffer
┃x

3. c
```

</td></tr>
</table>

### [Backspace41](../spec/backspace.md#backspace41)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- - ┃a
  - b
```

</td><td>

```buffer
- -┃a
  - b
```

</td><td>

```buffer
- ┃a
  - b
```

</td></tr>
</table>

### [SoftBackspace1](../spec/backspace.md#softbackspace1)

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
┃def
```

</td><td>

```buffer
- ┃def
```

</td></tr>
</table>

### [SoftBackspace2](../spec/backspace.md#softbackspace2)

> deleteSoftLineBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
abc ┃[a]: tail
```

</td><td>

```buffer
┃[a]: tail
```

</td><td>

```buffer
┃[a]\: tail
```

</td></tr>
</table>

### [SoftBackspace3](../spec/backspace.md#softbackspace3)

> deleteSoftLineBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
abc ┃- x tail
===
```

</td><td>

```buffer
┃- x tail
===
```

</td><td>

```buffer
┃\- x tail
===
```

</td></tr>
</table>

### [SoftBackspace4](../spec/backspace.md#softbackspace4)

> deleteSoftLineBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# abc ┃title #
```

</td><td>

```buffer
┃title #
```

</td><td>

```buffer
# ┃title #
```

</td></tr>
</table>

### [SoftBackspace5](../spec/backspace.md#softbackspace5)

> deleteSoftLineBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
first
abc ┃- x
===
```

</td><td>

```buffer
first
┃- x
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

### [SoftBackspace6](../spec/backspace.md#softbackspace6)

> deleteSoftLineBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
title
=┃==
```

</td><td>

```buffer
title
┃==
```

</td><td>

```buffer
title
=┃==
```

</td></tr>
</table>

### [SoftBackspace7](../spec/backspace.md#softbackspace7)

> deleteSoftLineBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- > q┃
  > m
```

</td><td>

```buffer
- ┃
  > m
```

</td><td>

```buffer
- > ┃m
```

</td></tr>
</table>

### [SoftBackspace9](../spec/backspace.md#softbackspace9)

> deleteSoftLineBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
```┃
code
```
````

</td><td>

````buffer
┃
code
```
````

</td><td>

````buffer
```┃
code
```
````

</td></tr>
</table>

### [SoftBackspace10](../spec/backspace.md#softbackspace10)

> deleteSoftLineBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] ┃def
```

</td><td>

```buffer
┃def
```

</td><td>

```buffer
- ┃def
```

</td></tr>
</table>

### [SoftBackspace11](../spec/backspace.md#softbackspace11)

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

> deleteSoftLineBackward

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
┃ # b
```

</td><td>

```buffer
┃\# b
```

</td></tr>
</table>

### [Backspace44](../spec/backspace.md#backspace44)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

- ┃

- b
```

</td><td>

```buffer
- a

-┃

- b
```

</td><td>

```buffer
- a┃

- b
```

</td></tr>
</table>

### [Backspace44b](../spec/backspace.md#backspace44b)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a

- b┃
```

</td></tr>
</table>

> enter

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
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

- ┃
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

- b
-┃
```

</td><td>

```buffer
- a

- b┃
```

</td></tr>
</table>

### [Backspace45](../spec/backspace.md#backspace45)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃b
    - c
    - d
  - e
```

</td><td>

```buffer
- a
  -┃b
    - c
    - d
  - e
```

</td><td>

```buffer
- a┃b
  - c
  - d
  - e
```

</td></tr>
</table>

### [Backspace47](../spec/backspace.md#backspace47)

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

> deleteContentBackward

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
-┃ # b
```

</td><td>

```buffer
┃\# b
```

</td></tr>
</table>

### [Backspace48](../spec/backspace.md#backspace48)

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

> cursorCharRight deleteContentBackward

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃# b
```

</td><td>

```buffer
- ┃\# b
```

</td></tr>
</table>

### [Backspace49](../spec/backspace.md#backspace49)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para
- ┃i
| a |
|---|
```

</td><td>

```buffer
para
-┃i
| a |
|---|
```

</td><td>

```buffer
para┃i
| a |
|\---|
```

</td></tr>
</table>

### [Backtick4](../spec/backtick.md#backtick4)

> "````"

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
┃
```

</td><td>

`````buffer
````┃
```
`````

</td><td>

`````buffer
````┃
````
`````

</td></tr>
</table>

### [Backtick5](../spec/backtick.md#backtick5)

> "`"

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
```js
code
```┃
````

</td><td>

`````buffer
```js
code
````┃
`````

</td><td>

`````buffer
````js
code
````┃
`````

</td></tr>
</table>

### [Backtick6](../spec/backtick.md#backtick6)

> "`"

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ```┃js
  code
  ```
- b
````

</td><td>

`````buffer
- a
  ````┃js
  code
  ```
- b
`````

</td><td>

`````buffer
- a
  ````┃js
  code
  ````
- b
`````

</td></tr>
</table>

### [Backtick9](../spec/backtick.md#backtick9)

> "```"

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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
```
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

### [Backtick10](../spec/backtick.md#backtick10)

> "```"

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
```md
┃
text
```
````

</td><td>

````buffer
```md
```┃
```
text
```
````

</td><td>

`````buffer
````md
```┃
text
````
`````

</td></tr>
</table>

### [Backtick12](../spec/backtick.md#backtick12)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
``┃print(1)
```

</td></tr>
</table>

> "`"

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
```┃
```print(1)
````

</td><td>

````buffer
```┃print(1)
```
````

</td></tr>
</table>

> enter

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
```
┃
```print(1)
````

</td><td>

````buffer
```
┃print(1)
```
````

</td></tr>
</table>

### [Backtick14](../spec/backtick.md#backtick14)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

`````buffer
````
code
````┃

after
`````

</td><td>

`````buffer
````
code
```┃

after
`````

</td><td>

````buffer
```
code
```┃

after
````

</td></tr>
</table>

### [Backtick23](../spec/backtick.md#backtick23)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

`````buffer
````
code
┃````
`````

</td><td>

`````buffer
````
code
┃```
`````

</td><td>

````buffer
```
code
┃```
````

</td></tr>
</table>

### [Backtick24](../spec/backtick.md#backtick24)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
┃```
```
````

</td><td>

````buffer
┃``
```
````

</td><td>

```buffer
┃``
```

</td></tr>
</table>

### [Backtick25](../spec/backtick.md#backtick25)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
intro

```c++


```┃

after
````

</td><td>

````buffer
intro

```c++


``┃

after
````

</td><td>

```buffer
intro┃

after
```

</td></tr>
</table>

### [Backtick26](../spec/backtick.md#backtick26)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
- ```c++
  ```┃
- b
````

</td><td>

````buffer
- a
- ```c++
  ``┃
- b
````

</td><td>

```buffer
- a
- ┃
- b
```

</td></tr>
</table>

### [Backtick27](../spec/backtick.md#backtick27)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
intro

┃```c++
```

after
````

</td><td>

````buffer
intro

┃``c++
```

after
````

</td><td>

```buffer
intro

┃after
```

</td></tr>
</table>

### [Backtick29](../spec/backtick.md#backtick29)

> "~"

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
~~~js
code
~~~┃
```

</td><td>

```buffer
~~~js
code
~~~~┃
```

</td><td>

```buffer
~~~~js
code
~~~~┃
```

</td></tr>
</table>

### [Backtick30](../spec/backtick.md#backtick30)

> "~~~"

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
intro

┃
```

</td><td>

```buffer
intro

~~~┃
```

</td><td>

```buffer
intro

~~~┃
~~~
```

</td></tr>
</table>

### [Copy2](../spec/copy.md#copy2)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- one «two
  - ki»d
- three
```

</td></tr>
</table>

> copy

### [Copy3](../spec/copy.md#copy3)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
> a «b
> c» d
```

</td></tr>
</table>

> copy

### [Cut2](../spec/copy.md#cut2)

> cut

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one «two
  - ki»d
- three
```

</td><td>

```buffer
- one ┃d
- three
```

</td><td>

```buffer
- one ┃d
- three
```

</td></tr>
</table>

### [Cut4](../spec/copy.md#cut4)

> cut

Adapted: under copyAtCaret: host

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one ┃two
  - kid
- three
```

</td><td>

```buffer
┃  - kid
- three
```

</td><td>

```buffer
- one ┃two
  - kid
- three
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
- one ┃two
  - kid
- three
```

</td></tr>
</table>

### [Delete1](../spec/delete.md#delete1)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc┃
  - def
```

</td><td>

```buffer
- abc┃→- def
```

</td><td>

```buffer
- abc┃def
```

</td></tr>
</table>

### [Delete2](../spec/delete.md#delete2)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one┃
- two
```

</td><td>

```buffer
- one┃- two
```

</td><td>

```buffer
- one┃two
```

</td></tr>
</table>

### [Delete3](../spec/delete.md#delete3)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one┃
  two
```

</td><td>

```buffer
- one┃  two
```

</td><td>

```buffer
- one┃two
```

</td></tr>
</table>

### [Delete4](../spec/delete.md#delete4)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Title┃ #
- more
```

</td><td>

```buffer
# Title┃#
- more
```

</td><td>

```buffer
# Title┃more #
```

</td></tr>
</table>

### [Delete4b](../spec/delete.md#delete4b)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Title #┃
- more
```

</td><td>

```buffer
# Title #┃- more
```

</td><td>

```buffer
# Title┃more #
```

</td></tr>
</table>

### [Delete5](../spec/delete.md#delete5)

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

```buffer
- ┃→- a
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

</td></tr>
</table>

### [Delete5b](../spec/delete.md#delete5b)

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

```buffer
- a
  - ┃→→- b
      - c
    - d
  - e
- f
```

</td><td>

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

### [Delete5c](../spec/delete.md#delete5c)

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

```buffer
- x
- ┃→- a
    - b
```

</td><td>

```buffer
- x
- ┃a
  - b
```

</td></tr>
</table>

### [Delete5d](../spec/delete.md#delete5d)

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

### [Delete6](../spec/delete.md#delete6)

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

```buffer
- a
- ┃- b
```

</td><td>

```buffer
- a
- ┃b
```

</td></tr>
</table>

### [Delete7](../spec/delete.md#delete7)

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

```buffer
- a┃- b
  - c
```

</td><td>

```buffer
- a┃b
  - c
```

</td></tr>
</table>

### [Delete9](../spec/delete.md#delete9)

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

```buffer
┃# H1



## H2
```

</td><td>

```buffer
┃# H1

## H2
```

</td></tr>
</table>

### [Delete10](../spec/delete.md#delete10)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
> q
```

</td><td>

```buffer
- a┃> q
```

</td><td>

```buffer
- a┃
> q
```

</td></tr>
</table>

### [Delete11](../spec/delete.md#delete11)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# H┃
    code
```

</td><td>

```buffer
# H┃→→code
```

</td><td>

```buffer
# H┃
    code
```

</td></tr>
</table>

### [Delete12](../spec/delete.md#delete12)

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

```buffer
- a
- b┃- c
→- d
```

</td><td>

```buffer
- a
- b┃c
→- d
```

</td></tr>
</table>

### [Delete13](../spec/delete.md#delete13)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
a┃

# H1
```

</td></tr>
</table>

> deleteContentForward

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
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

</td></tr>
</table>

> deleteContentForward

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
a┃# H1
```

</td><td>

```buffer
a┃H1
```

</td></tr>
</table>

### [Delete13c](../spec/delete.md#delete13c)

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

```buffer
a┃
# H1
text
```

</td><td>

```buffer
a┃

H1

text
```

</td></tr>
</table>

### [Delete13e](../spec/delete.md#delete13e)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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

</td><td>

```buffer
a┃

Title
```

</td></tr>
</table>

### [Delete13g](../spec/delete.md#delete13g)

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃- # H
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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃ # H
```

</td><td>

```buffer
- a┃H
```

</td></tr>
</table>

### [Delete14](../spec/delete.md#delete14)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
a┃

# H1

body
```

</td></tr>
</table>

> deleteContentForward

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
a┃
# H1

body
```

</td><td>

```buffer
a┃

H1

body
```

</td></tr>
</table>

> deleteContentForward

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
a┃# H1

body
```

</td><td>

```buffer
a┃H1

body
```

</td></tr>
</table>

### [Delete15](../spec/delete.md#delete15)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
## A┃
# H1 ##
```

</td></tr>
</table>

> deleteContentForward

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
## A┃# H1 ##
```

</td><td>

```buffer
## A┃
H1
```

</td></tr>
</table>

> deleteContentForward

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
## A┃ H1 ##
```

</td><td>

```buffer
## A┃H1
```

</td></tr>
</table>

### [Delete17](../spec/delete.md#delete17)

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

### [Delete18](../spec/delete.md#delete18)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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

</td><td>

```buffer
a┃b
```

</td></tr>
</table>

### [Delete20](../spec/delete.md#delete20)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- 
- b
```

</td><td>

```buffer
- a┃- 
- b
```

</td><td>

```buffer
- a┃
- b
```

</td></tr>
</table>

### [Delete26](../spec/delete.md#delete26)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Title┃
=====
text
```

</td><td>

```buffer
Title┃=====
text
```

</td><td>

```buffer
Title┃text
=====
```

</td></tr>
</table>

### [Delete27](../spec/delete.md#delete27)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [a]:┃
- b
```

</td><td>

```buffer
- [a]:┃- b
```

</td><td>

```buffer
- [a]\:┃b
```

</td></tr>
</table>

### [Delete30](../spec/delete.md#delete30)

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

```buffer
- a

- ┃
- b
```

</td><td>

```buffer
- a

- ┃b
```

</td></tr>
</table>

### [Delete31](../spec/delete.md#delete31)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - b
    - c
    - d
  - e
```

</td><td>

```buffer
- a┃→- b
    - c
    - d
  - e
```

</td><td>

```buffer
- a┃b
  - c
  - d
  - e
```

</td></tr>
</table>

### [Delete32](../spec/delete.md#delete32)

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

> deleteContentForward

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃# b
```

</td><td>

```buffer
- ┃\# b
```

</td></tr>
</table>

### [Delete33](../spec/delete.md#delete33)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- - b
```

</td></tr>
</table>

> deleteContentForward

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃- - b
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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃ - b
```

</td><td>

```buffer
- a┃b
```

</td></tr>
</table>

### [Delete33b](../spec/delete.md#delete33b)

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃-
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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

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

### [Enter3c](../spec/enter.md#enter3c)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
-┃b
  - c
```

</td><td>

```buffer
- a┃b
  - c
```

</td></tr>
</table>

### [Enter4](../spec/enter.md#enter4)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
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
  - ┃
  - b
```

</td></tr>
</table>

### [Enter6](../spec/enter.md#enter6)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃
```

</td><td>

```buffer
- a
┃
```

</td><td>

```buffer
- a

┃
```

</td></tr>
</table>

### [Enter7](../spec/enter.md#enter7)

> enter

Adapted: under enterOnEmptyItem: outdent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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

</td><td>

```buffer
- a

┃

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

### [Enter8](../spec/enter.md#enter8)

> enter

Adapted: under enterSplitSpace: drop

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc ┃- def
```

</td><td>

```buffer
- abc 
┃- def
```

</td><td>

```buffer
- abc 
- ┃\- def
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

### [Enter9](../spec/enter.md#enter9)

> enter

Adapted: under enterSplitSpace: drop

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc ┃# def
```

</td><td>

```buffer
- abc 
- ┃# def
```

</td><td>

```buffer
- abc 
- ┃\# def
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

### [Enter10](../spec/enter.md#enter10)

> enter

Adapted: under enterSplitSpace: drop

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc ┃<div>
```

</td><td>

```buffer
- abc 
- ┃<div>
```

</td><td>

```buffer
- abc 
- ┃\<div>
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

### [Enter11](../spec/enter.md#enter11)

> enter

Adapted: under enterSplitSpace: drop

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
see ┃[a]: /url
```

</td><td>

```buffer
see 
┃[a]: /url
```

</td><td>

```buffer
see 

┃[a]\: /url
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

┃[a]\: /url
```

</td></tr>
</table>

### [Enter12](../spec/enter.md#enter12)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
some┃ text
```

</td><td>

```buffer
some
┃text
```

</td><td>

```buffer
some

┃text
```

</td></tr>
</table>

### [Enter14](../spec/enter.md#enter14)

> enter enter enter "p"

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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

</td><td>

```buffer
- a
  - b

p┃
```

</td></tr>
</table>

### [Enter16](../spec/enter.md#enter16)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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

### [Enter21](../spec/enter.md#enter21)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
  - a
```

</td><td>

```buffer
┃
  - a
```

</td><td>

```buffer
- 
  - ┃
  - a
```

</td></tr>
</table>

### [Enter22](../spec/enter.md#enter22)

> enter

Adapted: under enterSplitSpace: drop

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para ┃- x
- a
```

</td><td>

```buffer
para 
┃- x
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

### [Enter23](../spec/enter.md#enter23)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
### H┃2
    - a
```

</td><td>

```buffer
### H
┃2
    - a
```

</td><td>

```buffer
### H
┃2

    - a
```

</td></tr>
</table>

### [Enter26](../spec/enter.md#enter26)

> enter

Adapted: under enterAtTextStart: stay

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃b
```

</td><td>

```buffer
- a
  - 
  - ┃b
```

</td><td>

```buffer
- a

  - 
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
  - ┃b
```

</td><td>

```buffer
- a

  - 
  - ┃b
```

</td></tr>
</table>

### [Enter28](../spec/enter.md#enter28)

Adapted: under enterOnEmptyItem: outdent

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
- ┃
  - c
```

</td></tr>
</table>

> enter

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
┃
  - c
```

</td><td>

```buffer
- a
- 
  - ┃
  - c
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
- ┃
  - c
```

</td><td>

```buffer
- a
- 
  - ┃
  - c
```

</td></tr>
</table>

### [Enter34](../spec/enter.md#enter34)

> enter

Adapted: under enterAtTextStart: stay

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
-┃ alpha
```

</td><td>

```buffer
-
┃alpha
```

</td><td>

```buffer
- 
- ┃alpha
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
-┃ alpha
```

</td><td>

```buffer
- 
- ┃alpha
```

</td></tr>
</table>

### [Enter35](../spec/enter.md#enter35)

> enter

Adapted: under enterSplitSpace: drop

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. abc ┃2. def
```

</td><td>

```buffer
1. abc 
┃2. def
```

</td><td>

```buffer
1. abc 
2. ┃2\. def
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

### [Enter36](../spec/enter.md#enter36)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

- b┃
```

</td><td>

```buffer
- a

- b
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

### [Enter36b](../spec/enter.md#enter36b)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
> - a
>
> - b┃
```

</td></tr>
</table>

> enter

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a
>
> - b
> - ┃
```

</td><td>

```buffer
> - a
>
> - b
>
> - ┃
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a
>
> - b
> -┃
```

</td><td>

```buffer
> - a
>
> - b┃
```

</td></tr>
</table>

### [Enter37](../spec/enter.md#enter37)

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

</td></tr>
</table>

### [Enter38](../spec/enter.md#enter38)

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
-┃two
- next
```

</td><td>

```buffer
- one┃two
- next
```

</td></tr>
</table>

### [Enter39](../spec/enter.md#enter39)

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ab
-┃
- c
```

</td><td>

```buffer
- ab┃
- c
```

</td></tr>
</table>

### [Enter40](../spec/enter.md#enter40)

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

```buffer
- a
┃
```

</td><td>

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

### [Enter41](../spec/enter.md#enter41)

> enter

Adapted: under enterSplitSpace: drop

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Title ┃- x
- y
```

</td><td>

```buffer
# Title 
┃- x
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

### [Enter42](../spec/enter.md#enter42)

> enter

Adapted: under enterSplitSpace: drop

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
title ┃- x
===
```

</td><td>

```buffer
title 
┃- x
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

### [Enter43](../spec/enter.md#enter43)

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc
┃- def
```

</td><td>

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

### [Enter44](../spec/enter.md#enter44)

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one two
-┃three
```

</td><td>

```buffer
- one two┃three
```

</td></tr>
</table>

### [Enter64](../spec/enter.md#enter64)

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
- ┃three
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one two 
-┃three
```

</td><td>

```buffer
- one two ┃three
```

</td></tr>
</table>

### [Enter46](../spec/enter.md#enter46)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> ┃quote
```

</td><td>

```buffer
> 
> ┃quote
```

</td><td>

```buffer
> ┃
>
> quote
```

</td></tr>
</table>

### [Enter47](../spec/enter.md#enter47)

Adapted: under enterSplitSpace: drop

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
[Note]: this ┃matters a lot
```

</td></tr>
</table>

> enter

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
[Note]: this 
┃matters a lot
```

</td><td>

```buffer
[Note]\: this 

┃matters a lot
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
[Note]: this ┃matters a lot
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
[Note]\: this 

┃matters a lot
```

</td><td>

```buffer
[Note]: this ┃matters a lot
```

</td></tr>
</table>

### [Enter48](../spec/enter.md#enter48)

Adapted: under enterSplitSpace: drop

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [a]: b 
- ┃c
```

</td><td>

```buffer
- [a]\: b 
- ┃c
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [a]: b 
-┃c
```

</td><td>

```buffer
- [a]: b ┃c
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter</th><th>deleteContentBackward</th></tr>
<tr valign="top"><td>

```buffer
- [a]: b ┃c
```

</td><td>

```buffer
- [a]\: b 
- ┃c
```

</td><td>

```buffer
- [a]: b ┃c
```

</td></tr>
</table>

### [Enter51](../spec/enter.md#enter51)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
one
┃two
three
---
```

</td></tr>
</table>

> enter

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
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

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
one
┃two
three
---
```

</td><td>

```buffer
one┃two
three
---
```

</td></tr>
</table>

> undo undo

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
one
┃two
three
---
```

</td></tr>
</table>

> cursorLineBoundaryForward enter

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
one
two
┃
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

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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

### [Enter53](../spec/enter.md#enter53)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
-┃a
```

</td></tr>
</table>

> enter

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
-
┃a
```

</td><td>

```buffer
\-

┃a
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
-┃a
```

</td></tr>
</table>

### [Enter56](../spec/enter.md#enter56)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a«bc
- de»f
```

</td><td>

```buffer
- a
┃f
```

</td><td>

```buffer
- a
- ┃f
```

</td></tr>
</table>

### [Enter56b](../spec/enter.md#enter56b)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
a«b
c»d
```

</td><td>

```buffer
a
┃d
```

</td><td>

```buffer
a

┃d
```

</td></tr>
</table>

### [Enter57](../spec/enter.md#enter57)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
p
#┃a
```

</td><td>

```buffer
p
#
┃a
```

</td><td>

```buffer
p
\#

┃a
```

</td></tr>
</table>

### [Enter58](../spec/enter.md#enter58)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ⍽┃
```

</td><td>

```buffer
- a
┃
```

</td><td>

```buffer
- a
- ⍽
- ┃
```

</td></tr>
</table>

### [Enter60](../spec/enter.md#enter60)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
title┃ - x
===
```

</td></tr>
</table>

> enter

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
title
┃- x
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

> deleteContentBackward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
title┃- x
===
```

</td></tr>
</table>

### [Enter61](../spec/enter.md#enter61)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
# Title┃more #
```

</td></tr>
</table>

> enter

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Title
┃more #
```

</td><td>

```buffer
# Title #
┃more
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
# Title┃more #
```

</td></tr>
</table>

### [Enter62](../spec/enter.md#enter62)

> enter "revise "

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Plan┃2. draft
```

</td><td>

```buffer
- Plan
revise ┃2. draft
```

</td><td>

```buffer
- Plan
- revise ┃2\. draft
```

</td></tr>
</table>

### [Enter66](../spec/enter.md#enter66)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
[^1]: a note┃
```

</td></tr>
</table>

> enter

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
[^1]: a note
┃
```

</td><td>

```buffer
[^1]: a note

┃
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
[^1]: a note┃
```

</td></tr>
</table>

### [Enter67](../spec/enter.md#enter67)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
---┃
```

</td><td>

```buffer
---
┃
```

</td><td>

```buffer
---

┃
```

</td></tr>
</table>

### [Enter68](../spec/enter.md#enter68)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> [!note] ┃q
p # h
```

</td><td>

```buffer
> [!note] 
> ┃q
p # h
```

</td><td>

```buffer
> [!note]
> ┃q

p # h
```

</td></tr>
</table>

### [Fence7](../spec/fences.md#fence7)

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

````buffer
- a
  ```
  code
  ```
  b┃
````

</td><td>

````buffer
- a
  ```
  code
  ```
- b┃
````

</td></tr>
</table>

### [Fence7c](../spec/fences.md#fence7c)

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

````buffer
- a
  ```
  code
  ```
  ┃
  - c
````

</td><td>

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

### [Fence9](../spec/fences.md#fence9)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
`┃``
code
```
````

</td><td>

````buffer
`
┃``
code
```
````

</td><td>

````buffer
`┃``
code
```
````

</td></tr>
</table>

### [Fence12](../spec/fences.md#fence12)

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

````buffer
- a
  
  ┃```
  code
  ```
````

</td><td>

````buffer
- a
- ```
  ┃code
  ```
````

</td></tr>
</table>

### [Fence14](../spec/fences.md#fence14)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
```
code
``┃`
````

</td><td>

````buffer
```
code
``
┃`
````

</td><td>

````buffer
```
code
``┃`
````

</td></tr>
</table>

### [Fence15](../spec/fences.md#fence15)

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

````buffer
- 
  ┃```
  code
  ```
````

</td><td>

````buffer
- ┃
- ```
  code
  ```
````

</td></tr>
</table>

### [Fence16](../spec/fences.md#fence16)

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

````buffer
- a
  ```
  one
┃two
  ```
````

</td><td>

````buffer
- a
  ```
  one┃two
  ```
````

</td></tr>
</table>

### [Fence17](../spec/fences.md#fence17)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ```
  ┃one
  ```
````

</td><td>

````buffer
- a
  ```
┃one
  ```
````

</td><td>

````buffer
- a
  ```
  ┃one
  ```
````

</td></tr>
</table>

### [Fence18](../spec/fences.md#fence18)

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

````buffer
- a
  ```
  one┃  two
  ```
````

</td><td>

````buffer
- a
  ```
  one┃two
  ```
````

</td></tr>
</table>

### [Fence19](../spec/fences.md#fence19)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ```
  one┃
  ```
````

</td><td>

````buffer
- a
  ```
  one┃  ```
````

</td><td>

````buffer
- a
  ```
  one┃
  ```
````

</td></tr>
</table>

### [Fence20](../spec/fences.md#fence20)

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

````buffer
> ```
> one
>┃two
> ```
````

</td><td>

````buffer
> ```
> one┃two
> ```
````

</td></tr>
</table>

### [Fence22](../spec/fences.md#fence22)

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

````buffer
- a
  - b
    ```
    x
    ```
  ┃
````

</td><td>

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

### [Fence23](../spec/fences.md#fence23)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ```
  one
  ┃```
````

</td><td>

````buffer
- a
  ```
  one
┃```
````

</td><td>

````buffer
- a
  ```
  one
  ┃```
````

</td></tr>
</table>

### [Fence24](../spec/fences.md#fence24)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ```js┃
  one
  ```
````

</td><td>

````buffer
- a
  ```js┃  one
  ```
````

</td><td>

````buffer
- a
  ```js┃
  one
  ```
````

</td></tr>
</table>

### [Fence25](../spec/fences.md#fence25)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ┃```
  one
  ```
````

</td><td>

````buffer
- a
┃```
  one
  ```
````

</td><td>

````buffer
- a
  ┃```
  one
  ```
````

</td></tr>
</table>

### [Fence26](../spec/fences.md#fence26)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
- ┃```
  one
  ```
````

</td><td>

````buffer
- a
-┃```
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

### [Fence27](../spec/fences.md#fence27)

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ```js
┃
  code
  ```
````

</td><td>

````buffer
- a
  ```js┃
  code
  ```
````

</td></tr>
</table>

### [Fence29](../spec/fences.md#fence29)

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ```
  code
  
  ┃```
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

> deleteContentBackward

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ```
  code
  
┃```
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

### [Fence30](../spec/fences.md#fence30)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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
  ┃  ```
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

### [Fence31](../spec/fences.md#fence31)

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  
  ┃```
  code
  ```
````

</td><td>

````buffer
- a
- ```
  ┃code
  ```
````

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  
┃```
  code
  ```
````

</td><td>

````buffer
- a
  ```
  ┃code
  ```
````

</td></tr>
</table>

### [Fence31b](../spec/fences.md#fence31b)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

````buffer
- a

  para

  ┃```
  code
  ```
````

</td></tr>
</table>

> enter

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a

  para

  
  ┃```
  code
  ```
````

</td><td>

````buffer
- a

  para

- ```
  ┃code
  ```
````

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a

  para

  
┃```
  code
  ```
````

</td><td>

````buffer
- a

  para

  ```
  ┃code
  ```
````

</td></tr>
</table>

### [Fence32](../spec/fences.md#fence32)

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ```
  code
  ```
┃
````

</td><td>

````buffer
- a
  ```
  code
  ```┃
````

</td></tr>
</table>

### [Fence33](../spec/fences.md#fence33)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
para
┃```
x
```
````

</td><td>

````buffer
para┃```
x
```
````

</td><td>

````buffer
para
┃```
x
```
````

</td></tr>
</table>

### [Fence34](../spec/fences.md#fence34)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a┃
- ```
  one
  ```
````

</td><td>

````buffer
- a┃- ```
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

### [Fence35](../spec/fences.md#fence35)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ```
  one
  ```┃
- b
````

</td><td>

````buffer
- a
  ```
  one
  ```┃- b
````

</td><td>

````buffer
- a
  ```
  one
  ```┃
- b
````

</td></tr>
</table>

### [Fence36](../spec/fences.md#fence36)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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
``┃`
body
```
````

</td><td>

`````buffer
````
``┃`
body
````
`````

</td></tr>
</table>

### [Fence37](../spec/fences.md#fence37)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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
``┃`
body
```
````

</td><td>

`````buffer
````
``┃`
body
````
`````

</td></tr>
</table>

### [Fence38](../spec/fences.md#fence38)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

````buffer
```
x┃```
body
```
````

</td></tr>
</table>

> shiftEnter

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
```
x
┃```
body
```
````

</td><td>

`````buffer
````
x
┃```
body
````
`````

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
```
x┃```
body
```
````

</td><td>

`````buffer
````
x┃```
body
````
`````

</td></tr>
</table>

### [Fence39](../spec/fences.md#fence39)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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
```
┃x
body
```
````

</td><td>

`````buffer
````
```
┃x
body
````
`````

</td></tr>
</table>

### [Fence40](../spec/fences.md#fence40)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> ~~~
> ~~┃
> ~
> body
> ~~~
```

</td><td>

```buffer
> ~~~
> ~~┃> ~
> body
> ~~~
```

</td><td>

```buffer
> ~~~~
> ~~┃~
> body
> ~~~~
```

</td></tr>
</table>

### [Fence48](../spec/fences.md#fence48)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

````buffer
- p
  - ┃a
    ```
    x
    
    y
    ```
````

</td></tr>
</table>

> outdent

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- p
- ┃a
    ```
    x
    
    y
    ```
````

</td><td>

````buffer
- p
- ┃a
  ```
  x
  
  y
  ```
````

</td></tr>
</table>

> indent

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- p
  - ┃a
    ```
    x
    
    y
    ```
````

</td><td>

````buffer
- p
  - ┃a
    ```
    x
  
    y
    ```
````

</td></tr>
</table>

### [Fence49](../spec/fences.md#fence49)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
- ┃```
    x
  ```
````

</td><td>

````buffer
- a
-┃```
    x
  ```
````

</td><td>

````buffer
- a┃
  ```
    x
  ```
````

</td></tr>
</table>

### [Fence50](../spec/fences.md#fence50)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ┃```
    x
  ```
````

</td><td>

````buffer
- a
  
  ┃```
    x
  ```
````

</td><td>

````buffer
- a
- ```
    ┃x
  ```
````

</td></tr>
</table>

### [Fence51](../spec/fences.md#fence51)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- 
- ┃```
  code
  ```
````

</td><td>

````buffer
- 
-┃```
  code
  ```
````

</td><td>

````buffer
- ```
  ┃code
  ```
````

</td></tr>
</table>

### [Fence58](../spec/fences.md#fence58)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ```
  ⍽
  ┃```
````

</td><td>

````buffer
- a
  ```
  ⍽
┃```
````

</td><td>

````buffer
- a
  ```
  ⍽
  ┃```
````

</td></tr>
</table>

### [Fence59](../spec/fences.md#fence59)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

````buffer
```
code
```┃
````

</td></tr>
</table>

> enter

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

````buffer
```
code
```
┃
````

</td></tr>
</table>

> cursorDocStart

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
┃```
code
```

````

</td><td>

````buffer
┃```
code
```
````

</td></tr>
</table>

### [Fence59b](../spec/fences.md#fence59b)

> enter "x"

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
```
code
```┃
q
````

</td><td>

````buffer
```
code
```
x┃
q
````

</td><td>

````buffer
```
code
```
x┃

q
````

</td></tr>
</table>

### [Fence42](../spec/fences.md#fence42)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- Euler:
  $$
  e^{i\pi}+1=0┃
  $$
```

</td></tr>
</table>

> enter

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- Euler:
  $$
  e^{i\pi}+1=0
  ┃
  $$
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Euler:
  $$
  e^{i\pi}+1=0
┃
  $$
```

</td><td>

```buffer
- Euler:
  $$
  e^{i\pi}+1=0┃
  $$
```

</td></tr>
</table>

> enter "x"

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Euler:
  $$
  e^{i\pi}+1=0

x┃
  $$
```

</td><td>

```buffer
- Euler:
  $$
  e^{i\pi}+1=0
  x┃
  $$
```

</td></tr>
</table>

### [Fence43](../spec/fences.md#fence43)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- task:
  > %%
  > hidden┃
  > %%
```

</td></tr>
</table>

> shiftEnter "more"

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- task:
  > %%
  > hidden
  > more┃
  > %%
```

</td></tr>
</table>

> cursorLineBoundaryBackward deleteContentBackward

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- task:
  > %%
  > hidden
  >┃more
  > %%
```

</td><td>

```buffer
- task:
  > %%
  > hidden┃more
  > %%
```

</td></tr>
</table>

### [Fence45](../spec/fences.md#fence45)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
$┃$
x
$$
```

</td><td>

```buffer
$
┃$
x
$$
```

</td><td>

```buffer
$┃$
x
$$
```

</td></tr>
</table>

### [Fence46](../spec/fences.md#fence46)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> %%
> a┃
> b
> %%
```

</td><td>

```buffer
> %%
> a┃> b
> %%
```

</td><td>

```buffer
> %%
> a┃b
> %%
```

</td></tr>
</table>

### [Fence47](../spec/fences.md#fence47)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
  $$
  ┃x
  $$
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  $$
┃x
  $$
```

</td><td>

```buffer
- a
  $$
  ┃x
  $$
```

</td></tr>
</table>

> cursorLineBoundaryForward deleteContentForward

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  $$
x┃  $$
```

</td><td>

```buffer
- a
  $$
  x┃
  $$
```

</td></tr>
</table>

### [Fence52](../spec/fences.md#fence52)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para

    a
    ┃code
```

</td><td>

```buffer
para

    a
  ┃code
```

</td><td>

```buffer
para

    a┃code
```

</td></tr>
</table>

### [Fence53](../spec/fences.md#fence53)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para

    a┃
    code
```

</td><td>

```buffer
para

    a┃→→code
```

</td><td>

```buffer
para

    a┃code
```

</td></tr>
</table>

### [Fence54](../spec/fences.md#fence54)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para

    ┃a
```

</td><td>

```buffer
para

  ┃a
```

</td><td>

```buffer
para

    ┃a
```

</td></tr>
</table>

### [Fence55](../spec/fences.md#fence55)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- Euler:
  ┃$$
  x
  $$
```

</td></tr>
</table>

> enter

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Euler:
  
  ┃$$
  x
  $$
```

</td><td>

```buffer
- Euler:
- $$
  ┃x
  $$
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Euler:
  
┃$$
  x
  $$
```

</td><td>

```buffer
- Euler:
  $$
  ┃x
  $$
```

</td></tr>
</table>

### [Fence56](../spec/fences.md#fence56)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Euler:
- ┃$$
  x
  $$
```

</td><td>

```buffer
- Euler:
-┃$$
  x
  $$
```

</td><td>

```buffer
- Euler:┃
  $$
  x
  $$
```

</td></tr>
</table>

### [Fence57](../spec/fences.md#fence57)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
> a
> ┃%%
> x
> %%
```

</td></tr>
</table>

> enter

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> a
> 
> ┃%%
> x
> %%
```

</td><td>

```buffer
> a
>
> ┃%%
> x
> %%
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> a
> 
>┃%%
> x
> %%
```

</td><td>

```buffer
> a
> ┃%%
> x
> %%
```

</td></tr>
</table>

### [Fence62](../spec/fences.md#fence62)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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
┃```
body
```
````

</td><td>

`````buffer
````
┃```
body
````
`````

</td></tr>
</table>

### [Fence63](../spec/fences.md#fence63)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- item text
    ┃```
    code
    ```
````

</td><td>

````buffer
- item text
    
    ┃```
    code
    ```
````

</td><td>

````buffer
- item text
- ```
  ┃code
  ```
````

</td></tr>
</table>

### [Gap1](../spec/gaps.md#gap1)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
a

b┃

c
```

</td><td>

```buffer
a
b┃


c
```

</td><td>

```buffer
b┃

a

c
```

</td></tr>
</table>

### [Gap2](../spec/gaps.md#gap2)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
a┃

b

c
```

</td><td>

```buffer

a┃
b

c
```

</td><td>

```buffer
b

a┃

c
```

</td></tr>
</table>

### [Gap3](../spec/gaps.md#gap3)

> moveSubtreeUp

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

### [Gap4](../spec/gaps.md#gap4)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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
- b┃
- a

- c
```

</td></tr>
</table>

### [Gap5](../spec/gaps.md#gap5)

> moveSubtreeUp

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

```buffer
a
## A┃
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

### [Gap7](../spec/gaps.md#gap7)

> moveSubtreeDown

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

````buffer
```
x┃
code
```

q
````

</td><td>

````buffer
```
code
```

x┃

q
````

</td></tr>
</table>

### [Gap9](../spec/gaps.md#gap9)

> moveSubtreeUp

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

```buffer
- p
  - x
  - y┃


- q
```

</td><td>

```buffer
- p
  - y┃

  - x

- q
```

</td></tr>
</table>

### [Gap10](../spec/gaps.md#gap10)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
a

b┃

```

</td><td>

```buffer
a
b┃


```

</td><td>

```buffer
b┃

a

```

</td></tr>
</table>

### [Gap11](../spec/gaps.md#gap11)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer

a┃

b

c
```

</td><td>

```buffer


a┃
b

c
```

</td><td>

```buffer

b

a┃

c
```

</td></tr>
</table>

### [Gap13](../spec/gaps.md#gap13)

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

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- t┃

para
```

</td><td>

```buffer
- t- a
- b
┃

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

### [Gap14](../spec/gaps.md#gap14)

> moveSubtreeUp

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

```buffer
a

┃
b

c
```

</td><td>

```buffer
b
┃

a

c
```

</td></tr>
</table>

### [Gap15](../spec/gaps.md#gap15)

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

```buffer
- a
- b
  ┃
- c
```

</td><td>

```buffer
- a
  - b
┃
- c
```

</td></tr>
</table>

### [Gap16](../spec/gaps.md#gap16)

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

```buffer
- a
  - b
┃
- c
```

</td><td>

```buffer
- a
- b
┃
- c
```

</td></tr>
</table>

### [Gap17](../spec/gaps.md#gap17)

> moveSubtreeDown

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

```buffer
- a
  b
┃
- c
```

</td><td>

```buffer
- c
- a
┃
  b
```

</td></tr>
</table>

### [Indent2](../spec/indent.md#indent2)

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

```buffer
- a
  - b┃
  - c
    more c
```

</td><td>

```buffer
- a
  - b┃
    - c
      more c
```

</td></tr>
</table>

### [Indent3](../spec/indent.md#indent3)

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

```buffer
- a
    * x
  - b┃
```

</td><td>

```buffer
- a
    * x
    * b┃
```

</td></tr>
</table>

### [Indent12](../spec/indent.md#indent12)

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

### [Indent13](../spec/indent.md#indent13)

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
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

### [Indent15](../spec/indent.md#indent15)

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

```buffer
1. a
   - x
     - y┃
2. b
3. c
```

</td><td>

```buffer
1. a
   - x
     - y┃
5. b
9. c
```

</td></tr>
</table>

### [Indent16](../spec/indent.md#indent16)

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
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
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
- b  
  c┃
```

</td></tr>
</table>

### [Indent20](../spec/indent.md#indent20)

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

````buffer
- a
  - b┃
  ```
    x
  ```
````

</td><td>

````buffer
- a
  - b┃
    ```
      x
    ```
````

</td></tr>
</table>

### [Indent21](../spec/indent.md#indent21)

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

```buffer
para a

  para b┃
```

</td><td>

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

### [Indent22](../spec/indent.md#indent22)

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

```buffer
  Para┃
```

</td><td>

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

### [Indent23](../spec/indent.md#indent23)

> indent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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

### [Indent25](../spec/indent.md#indent25)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
Title┃
-----

### Sub
```

</td></tr>
</table>

> indent

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
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

> outdent

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Title┃
-----

### Sub
```

</td><td>

```buffer
## Title┃

### Sub
```

</td></tr>
</table>

### [Indent26](../spec/indent.md#indent26)

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
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

### [Indent29](../spec/indent.md#indent29)

> indent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

para┃
```

</td><td>

```buffer
- a

  para┃
```

</td><td>

```buffer
- a
- para┃
```

</td></tr>
</table>

### [Indent29b](../spec/indent.md#indent29b)

> indent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a

para┃
```

</td><td>

```buffer
1. a

   para┃
```

</td><td>

```buffer
1. a
2. para┃
```

</td></tr>
</table>

### [Indent29c](../spec/indent.md#indent29c)

> indent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b

para┃
```

</td><td>

```buffer
- a
  - b

  para┃
```

</td><td>

```buffer
- a
  - b
- para┃
```

</td></tr>
</table>

### [Indent30](../spec/indent.md#indent30)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
- 

┃- b
```

</td></tr>
</table>

> indent

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- 

  ┃- b
```

</td><td>

```buffer
- a
- 
  - ┃b
```

</td></tr>
</table>

> outdent

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- 

┃- b
```

</td><td>

```buffer
- a
- 
- ┃b
```

</td></tr>
</table>

### [Indent31](../spec/indent.md#indent31)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

````buffer
- a
- ┃```
  code
  ```
````

</td></tr>
</table>

> indent

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  - ┃```
  code
  ```
````

</td><td>

````buffer
- a
  - ┃```
    code
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
- ┃```
  code
  ```
````

</td></tr>
</table>

### [MoveDown1](../spec/move-subtree-down.md#movedown1)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - a1

- b
```

</td><td>

```buffer
  - a1
- a┃

- b
```

</td><td>

```buffer
- b

- a┃
  - a1
```

</td></tr>
</table>

### [MoveDown2](../spec/move-subtree-down.md#movedown2)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# H
- a┃

para
```

</td><td>

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

### [MoveDown3](../spec/move-subtree-down.md#movedown3)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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

### [MoveDown4](../spec/move-subtree-down.md#movedown4)

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
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

### [MoveDown5](../spec/move-subtree-down.md#movedown5)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
one┃

two
```

</td><td>

```buffer

one┃
two
```

</td><td>

```buffer
two

one┃
```

</td></tr>
</table>

### [MoveDown6](../spec/move-subtree-down.md#movedown6)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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

### [MoveDown7](../spec/move-subtree-down.md#movedown7)

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
→→- b1
→- b┃
- c
→- d
```

</td><td>

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
→→- b1
- c
→- b┃
→- d
```

</td><td>

```buffer
- a
- c
→- d
→- b┃
→→- b1
```

</td></tr>
</table>

### [MoveDown8](../spec/move-subtree-down.md#movedown8)

> moveSubtreeDown

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
    - c1
  - c┃
- b
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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

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

### [MoveDown13](../spec/move-subtree-down.md#movedown13)

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
  - b1
- b┃

intro
```

</td><td>

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

### [MoveDown16](../spec/move-subtree-down.md#movedown16)

> moveSubtreeDown

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

```buffer
- x
# A┃
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

### [MoveDown17](../spec/move-subtree-down.md#movedown17)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
## ┃H
# H
- a
```

</td><td>

```buffer
# H
## ┃H
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

### [MoveDown18](../spec/move-subtree-down.md#movedown18)

> moveSubtreeDown

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

```buffer
# Work
- email

- ┃review
# Home
- water
```

</td><td>

```buffer
# Work
- email

# Home
- ┃review
- water
```

</td></tr>
</table>

### [MoveDown19](../spec/move-subtree-down.md#movedown19)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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

</td><td>

```buffer
# A
## s┃

# B
- x
```

</td></tr>
</table>

### [MoveDown20](../spec/move-subtree-down.md#movedown20)

> moveSubtreeDown

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

### [MoveDown21](../spec/move-subtree-down.md#movedown21)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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

````buffer
  ```
- a┃
  x

  y
  ```
- b
````

</td><td>

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

### [MoveDown22](../spec/move-subtree-down.md#movedown22)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a┃
2. b
```

</td><td>

```buffer
2. b
3. a┃
```

</td><td>

```buffer
1. b
2. a┃
```

</td></tr>
</table>

### [MoveDown23](../spec/move-subtree-down.md#movedown23)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
9. a┃
   - x
10. b
```

</td><td>

```buffer
  - x
9. a┃
10. b
```

</td><td>

```buffer
9. b
10. a┃
    - x
```

</td></tr>
</table>

### [MoveDown24](../spec/move-subtree-down.md#movedown24)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para┃
- a

last
```

</td><td>

```buffer
- a
para┃

last
```

</td><td>

```buffer
last

para┃
- a
```

</td></tr>
</table>

### [MoveDown25](../spec/move-subtree-down.md#movedown25)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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

</td><td>

```buffer
# A

# B
para┃
- x
```

</td></tr>
</table>

### [MoveDown26](../spec/move-subtree-down.md#movedown26)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Work
- review┃

# Home
para
```

</td><td>

```buffer
# Work

- review┃
# Home
para
```

</td><td>

```buffer
# Work

# Home
- review┃

para
```

</td></tr>
</table>

### [MoveDown27](../spec/move-subtree-down.md#movedown27)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# A
## s┃

# B
## t
```

</td><td>

```buffer
# A

## s┃
# B
## t
```

</td><td>

```buffer
# A

# B
## s┃
## t
```

</td></tr>
</table>

### [MoveDown28](../spec/move-subtree-down.md#movedown28)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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

### [MoveDown29](../spec/move-subtree-down.md#movedown29)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
pa┃ra
1. a
- b

next
```

</td><td>

```buffer
1. a
pa┃ra
- b

next
```

</td><td>

```buffer
next

pa┃ra
1. a
- b
```

</td></tr>
</table>

### [MoveDown30](../spec/move-subtree-down.md#movedown30)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
9. a┃
10. b
    - x
```

</td><td>

```buffer
10. b
11. a┃
    - x
```

</td><td>

```buffer
9. b
   - x
10. a┃
```

</td></tr>
</table>

### [MoveDown31](../spec/move-subtree-down.md#movedown31)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para┃

---
```

</td><td>

```buffer

para┃
---
```

</td><td>

```buffer
---

para┃
```

</td></tr>
</table>

### [MoveDown33](../spec/move-subtree-down.md#movedown33)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- - ┃a
  - b
```

</td></tr>
</table>

> moveSubtreeDown

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
  - b
- - ┃a
```

</td><td>

```buffer
- - b
  - ┃a
```

</td></tr>
</table>

> moveSubtreeUp

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- - ┃a
  - b
```

</td></tr>
</table>

### [MoveDown34](../spec/move-subtree-down.md#movedown34)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

````buffer
- a
  ┃```
  code
  ```
  x
````

</td></tr>
</table>

> moveSubtreeDown

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  code
  ┃```
  ```
  x
````

</td><td>

````buffer
- a

  x
  ```
  ┃code
  ```
````

</td></tr>
</table>

> moveSubtreeUp

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ┃```
  code
  ```
  x
````

</td><td>

````buffer
- a

  ```
  ┃code
  ```
  x
````

</td></tr>
</table>

### [MoveDown35](../spec/move-subtree-down.md#movedown35)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
1. a
   1. ┃x
   2. b
```

</td></tr>
</table>

> moveSubtreeDown

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a
   2. b
   3. ┃x
```

</td><td>

```buffer
1. a
   1. b
   2. ┃x
```

</td></tr>
</table>

> moveSubtreeUp

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a
   2. ┃x
   3. b
```

</td><td>

```buffer
1. a
   1. ┃x
   2. b
```

</td></tr>
</table>

### [MoveDown36](../spec/move-subtree-down.md#movedown36)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- item
  - ┃a

  para
```

</td><td>

```buffer
- item

  - ┃a
  para
```

</td><td>

```buffer
- item
  - ┃a

  para
```

</td></tr>
</table>

### [MoveDown37](../spec/move-subtree-down.md#movedown37)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- ┃```

  x
  ```
- b
````

</td><td>

````buffer

- ┃```
  x
  ```
- b
````

</td><td>

````buffer
- b
- ```

  ┃x
  ```
````

</td></tr>
</table>

### [MoveDown38](../spec/move-subtree-down.md#movedown38)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b
┃
para
```

</td><td>

```buffer
- a
- b
para
┃
```

</td><td>

```buffer
- a

para

- b┃
```

</td></tr>
</table>

### [MoveDown39](../spec/move-subtree-down.md#movedown39)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
- b┃



para
```

</td></tr>
</table>

> moveSubtreeDown

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

- b┃


para
```

</td><td>

```buffer
- a

para



- b┃
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



para
```

</td></tr>
</table>

### [MoveDown40](../spec/move-subtree-down.md#movedown40)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a
2. «
1) b»
2) c
```

</td><td>

```buffer
1. a
2) c
3. «
4) b»
```

</td><td>

```buffer
1. a
1) c
2) «
3) b»
```

</td></tr>
</table>

### [MoveUp1](../spec/move-subtree-up.md#moveup1)

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- b┃
- a
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

### [MoveUp3](../spec/move-subtree-up.md#moveup3)

> moveSubtreeUp

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

### [MoveUp4](../spec/move-subtree-up.md#moveup4)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
one

two┃
```

</td><td>

```buffer
one
two┃

```

</td><td>

```buffer
two┃

one
```

</td></tr>
</table>

### [MoveUp5](../spec/move-subtree-up.md#moveup5)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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

### [MoveUp7](../spec/move-subtree-up.md#moveup7)

> moveSubtreeUp

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - c┃
- b
    - c1
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

### [MoveUp9](../spec/move-subtree-up.md#moveup9)

> moveSubtreeUp

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

### [MoveUp12](../spec/move-subtree-up.md#moveup12)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
intro

- b┃
  - b1
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

### [MoveUp13](../spec/move-subtree-up.md#moveup13)

> moveSubtreeUp

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

````buffer
- b┃
- a
  ```
  x

  y
  ```
````

</td><td>

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

### [MoveUp15](../spec/move-subtree-up.md#moveup15)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
9. a
   - x
10. b┃
```

</td><td>

```buffer
9. a
10. b┃
    - x
```

</td><td>

```buffer
9. b┃
10. a
    - x
```

</td></tr>
</table>

### [MoveUp16](../spec/move-subtree-up.md#moveup16)

> moveSubtreeUp

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

```buffer
# A
# B┃
## a1
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

### [MoveUp17](../spec/move-subtree-up.md#moveup17)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
first

para┃
- a
```

</td><td>

```buffer
first
para┃

- a
```

</td><td>

```buffer
para┃
- a

first
```

</td></tr>
</table>

### [MoveUp18](../spec/move-subtree-up.md#moveup18)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
→- a
┃para
```

</td><td>

```buffer
┃para
→- a
```

</td><td>

```buffer
┃para

→- a
```

</td></tr>
</table>

### [MoveUp19](../spec/move-subtree-up.md#moveup19)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
---
para┃
```

</td><td>

```buffer
para┃
---
```

</td><td>

```buffer
para┃

---
```

</td></tr>
</table>

### [MoveUp20](../spec/move-subtree-up.md#moveup20)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
[a]: /u
para┃
```

</td><td>

```buffer
para┃
[a]: /u
```

</td><td>

```buffer
para┃

[a]: /u
```

</td></tr>
</table>

### [MoveUp21](../spec/move-subtree-up.md#moveup21)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
para
- a┃
- b
```

</td></tr>
</table>

> moveSubtreeUp

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
para
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

> moveSubtreeDown

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
para
- a┃
- b
```

</td></tr>
</table>

### [MoveUp22](../spec/move-subtree-up.md#moveup22)

> moveSubtreeUp

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

```buffer
# Work
- email

- ┃review
# Home
- water
```

</td><td>

```buffer
# Work
- email
- ┃review

# Home
- water
```

</td></tr>
</table>

### [MoveUp23](../spec/move-subtree-up.md#moveup23)

> moveSubtreeUp

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

┃para

# B
```

</td></tr>
</table>

### [MoveUp24](../spec/move-subtree-up.md#moveup24)

> moveSubtreeUp

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

```buffer
# Todo
- one

- ┃two
## Later
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

### [MoveUp25](../spec/move-subtree-up.md#moveup25)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

- b┃
  - b1
```

</td><td>

```buffer
- a
- b┃

  - b1
```

</td><td>

```buffer
- b┃
  - b1

- a
```

</td></tr>
</table>

### [MoveUp26](../spec/move-subtree-up.md#moveup26)

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# A
- x

## s┃
# B
- y
```

</td><td>

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# A
- x

# B
## s┃
- y
```

</td><td>

```buffer
# A
- x

# B

## s┃
- y
```

</td></tr>
</table>

### [MoveUp27](../spec/move-subtree-up.md#moveup27)

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

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
- ┃review

# Home
```

</td></tr>
</table>

> moveSubtreeDown

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
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

# Home

- ┃review
```

</td></tr>
</table>

### [MoveUp28](../spec/move-subtree-up.md#moveup28)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
## X
# A┃
- a
```

</td><td>

```buffer
# A┃
## X
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

### [MoveUp30](../spec/move-subtree-up.md#moveup30)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
[a]: /u
    ┃code
```

</td><td>

```buffer
    ┃code
[a]: /u
```

</td><td>

```buffer
┃code

[a]: /u
```

</td></tr>
</table>

### [MoveUp33](../spec/move-subtree-up.md#moveup33)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# H
- a
## ┃H
```

</td><td>

```buffer
# H
## ┃H
- a
```

</td><td>

```buffer
# H
- a
## ┃H
```

</td></tr>
</table>

### [MoveUp35](../spec/move-subtree-up.md#moveup35)

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> q┃
para
- a
```

</td><td>

```buffer
> q┃

para
- a
```

</td></tr>
</table>

> moveSubtreeDown

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para
> q┃
- a
```

</td><td>

```buffer
para
- a

> q┃
```

</td></tr>
</table>

### [MoveUp36](../spec/move-subtree-up.md#moveup36)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
para
┃- i
2. m
```

</td></tr>
</table>

> moveSubtreeUp

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
┃- i
para
2. m
```

</td><td>

```buffer
- ┃i

para

2. m
```

</td></tr>
</table>

> moveSubtreeDown

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para
┃- i
2. m
```

</td><td>

```buffer
para

- ┃i

2. m
```

</td></tr>
</table>

### [MoveUp38](../spec/move-subtree-up.md#moveup38)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- b
- $$
  x$$┃
  tail
```

</td><td>

```buffer
- b
  x$$┃
- $$
  tail
```

</td><td>

```buffer
- $$
  x┃$$
  tail
- b
```

</td></tr>
</table>

### [MoveUp39](../spec/move-subtree-up.md#moveup39)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
- two
┃
```

</td><td>

```buffer
- one
┃
- two
```

</td><td>

```buffer
- two┃
- one

```

</td></tr>
</table>

### [MoveUp40](../spec/move-subtree-up.md#moveup40)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- x
  - y
  - a┃
     b
```

</td><td>

```buffer
- x
  - a┃
  - y
     b
```

</td><td>

```buffer
- x
  - a┃
     b
  - y
```

</td></tr>
</table>

### [TO-Bug228](../spec/obsidian-true-outliner.md#to-bug228)

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

```buffer
1. a
2. ┃
3) b
4) c
```

</td><td>

```buffer
1. a
2. ┃
1) b
2) c
```

</td></tr>
</table>

### [TO-E7-E8b](../spec/obsidian-true-outliner.md#to-e7-e8b)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- alpha┃
→- child
```

</td><td>

```buffer
- alpha
- ┃
→- child
```

</td><td>

```buffer
- alpha
→- ┃
→- child
```

</td></tr>
</table>

### [TO-E9](../spec/obsidian-true-outliner.md#to-e9)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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

</td><td>

```buffer
one

┃two
- child
```

</td></tr>
</table>

### [TO-E10](../spec/obsidian-true-outliner.md#to-e10)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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

  para
```

</td></tr>
</table>

### [TO-E17](../spec/obsidian-true-outliner.md#to-e17)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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

</td><td>

```buffer
Hello
====
┃world
```

</td></tr>
</table>

### [TO-E18](../spec/obsidian-true-outliner.md#to-e18)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Hello world
==┃==
```

</td><td>

```buffer
Hello world
==
┃==
```

</td><td>

```buffer
Hello world
====
┃
```

</td></tr>
</table>

### [TO-E33](../spec/obsidian-true-outliner.md#to-e33)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- al«pha be»ta
```

</td><td>

```buffer
- al
┃ta
```

</td><td>

```buffer
- al
- ┃ta
```

</td></tr>
</table>

### [TO-Bug267-E5](../spec/obsidian-true-outliner.md#to-bug267-e5)

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

```buffer
# H
para
┃text
> q
```

</td><td>

```buffer
# H
para

┃text
> q
```

</td></tr>
</table>

### [TO-E14-E20](../spec/obsidian-true-outliner.md#to-e14-e20)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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

</td><td>

```buffer
# Head
┃line

Body.
```

</td></tr>
</table>

### [TO-E14-E20b](../spec/obsidian-true-outliner.md#to-e14-e20b)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Head┃
Body.
```

</td><td>

```buffer
# Head
┃
Body.
```

</td><td>

```buffer
# Head
┃

Body.
```

</td></tr>
</table>

### [TO-S7-S8b](../spec/obsidian-true-outliner.md#to-s7-s8b)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Hello world
==┃==
```

</td><td>

```buffer
Hello world
==
┃==
```

</td><td>

```buffer
Hello world
==┃==
```

</td></tr>
</table>

### [TO-Bug269](../spec/obsidian-true-outliner.md#to-bug269)

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

```buffer
1. p
2.┃
2. q
```

</td><td>

```buffer
1. p┃
2. q
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

> deleteContentBackward

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  - kid
- foo
┃
```

</td><td>

```buffer
- one
  - kid
- foo┃
```

</td></tr>
</table>

### [TO2](../spec/obsidian-true-outliner.md#to2)

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

```buffer
- a
  -┃b
    - c
```

</td><td>

```buffer
- a┃b
  - c
```

</td></tr>
</table>

### [TO3](../spec/obsidian-true-outliner.md#to3)

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

```buffer
- a┃→- b
    - c
```

</td><td>

```buffer
- a┃b
  - c
```

</td></tr>
</table>

### [TO4](../spec/obsidian-true-outliner.md#to4)

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

```buffer
1. a
2. b
-┃x
3. c
```

</td><td>

```buffer
1. a
2. b┃x
3. c
```

</td></tr>
</table>

### [TO5](../spec/obsidian-true-outliner.md#to5)

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

```buffer
- p
  1.┃a
  1. b
```

</td><td>

```buffer
- p┃a
  1. b
```

</td></tr>
</table>

### [TO6](../spec/obsidian-true-outliner.md#to6)

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

```buffer
3. a
4.┃b
4. c
```

</td><td>

```buffer
3. a┃b
4. c
```

</td></tr>
</table>

### [TO-Seams](../spec/obsidian-true-outliner.md#to-seams)

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

```buffer
- a
  - b┃
  > q
```

</td><td>

```buffer
- a
  - b┃
    > q
```

</td></tr>
</table>

### [TO-Seamsc](../spec/obsidian-true-outliner.md#to-seamsc)

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

```buffer
- a
  - b┃

  ---
```

</td><td>

```buffer
- a
  - b┃

    ---
```

</td></tr>
</table>

### [TO-Seamsd](../spec/obsidian-true-outliner.md#to-seamsd)

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

```buffer
- a
- b┃

        code
```

</td><td>

```buffer
- a
- b┃

      code
```

</td></tr>
</table>

### [TO-ListStyle](../spec/obsidian-true-outliner.md#to-liststyle)

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

```buffer
* a
  * x
  - b┃
```

</td><td>

```buffer
* a
  * x
  * b┃
```

</td></tr>
</table>

### [TO-BlockId](../spec/obsidian-true-outliner.md#to-blockid)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b┃
  ^id
```

</td><td>

```buffer
- b┃
- a
  ^id
```

</td><td>

```buffer
- b┃
  ^id
- a
```

</td></tr>
</table>

### [TO-BlockIdb](../spec/obsidian-true-outliner.md#to-blockidb)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para one
^blk

para┃ two
```

</td><td>

```buffer
para one
^blk
para┃ two

```

</td><td>

```buffer
para┃ two

para one
^blk
```

</td></tr>
</table>

### [TO-Lazy](../spec/obsidian-true-outliner.md#to-lazy)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para┃
> q
```

</td><td>

```buffer
> q
para┃
```

</td><td>

```buffer
> q

para┃
```

</td></tr>
</table>

### [TO-Lazyb](../spec/obsidian-true-outliner.md#to-lazyb)

> moveSubtreeDown

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

````buffer
```
para┃
code
```
````

</td><td>

````buffer
```
code
```
para┃
````

</td></tr>
</table>

### [TO-Lazyc](../spec/obsidian-true-outliner.md#to-lazyc)

> moveSubtreeDown

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

````buffer
```
```
code┃
para
````

</td><td>

````buffer
para
```
code┃
```
````

</td></tr>
</table>

### [TO8](../spec/obsidian-true-outliner.md#to8)

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

```buffer
- one
  - kid
- foo
    ┃
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

> cursorDocStart

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
┃- one
  - kid
- foo
    
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

```buffer
┃- one
  - kid
  - sib
- foo
      
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

### [TO10](../spec/obsidian-true-outliner.md#to10)

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

```buffer
- one
  - kid
- foo
  ┃
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
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b┃
- c
```

</td><td>

```buffer
- a
  - b
┃
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
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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
  ┃
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

### [TO13](../spec/obsidian-true-outliner.md#to13)

> enter shiftEnter deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- foo┃
```

</td><td>

```buffer
- foo
- 
┃
```

</td><td>

```buffer
- foo
- ┃
```

</td></tr>
</table>

### [TO14](../spec/obsidian-true-outliner.md#to14)

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
<tr><th>buffer</th></tr>
<tr valign="top"><td>

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

```buffer
┃1. a
   1. 
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

### [TO15](../spec/obsidian-true-outliner.md#to15)

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

```buffer
┃- foo
  - 

para
```

</td><td>

```buffer
┃- foo

  - 

para
```

</td></tr>
</table>

### [TO18](../spec/obsidian-true-outliner.md#to18)

> enter enter cursorDocStart

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
┃- a

- b
```

</td><td>

```buffer
┃- a
- b
```

</td></tr>
</table>

### [TO19](../spec/obsidian-true-outliner.md#to19)

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

```buffer
┃para
  - a
- 
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
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- top
  - sib┃
```

</td><td>

```buffer
- top
  - sib- a
  - b
    - c
┃
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

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- top
→- sib┃
```

</td><td>

```buffer
- top
→- sib- a
  - b
    - c
┃
```

</td><td>

```buffer
- top
→- sib
→- a
→→- b
→→→- c┃
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

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
## H┃
below
```

</td><td>

```buffer
## H    first

    > quote
┃
below
```

</td><td>

```buffer
## H

first

> quote┃

below
```

</td></tr>
</table>

### [TO-Bug197](../spec/obsidian-true-outliner.md#to-bug197)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
- alpha

> note
```

</td></tr>
</table>

> paste

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- top┃
  - see
```

</td><td>

```buffer
- top- alpha

> note
┃
  - see
```

</td><td>

```buffer
- top
  - alpha
  > note┃
  - see
```

</td></tr>
</table>

### [Outdent2](../spec/outdent.md#outdent2)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
- b┃
```

</td></tr>
</table>

> outdent

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- b┃
```

</td><td>

```buffer
- a

b┃
```

</td></tr>
</table>

> indent

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
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

</td></tr>
</table>

### [Outdent4](../spec/outdent.md#outdent4)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
## A┃
### B
```

</td><td>

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

### [Outdent7](../spec/outdent.md#outdent7)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃x
  - 
```

</td><td>

```buffer
- a
- ┃x
  - 
```

</td><td>

```buffer
- a
- ┃x

  - 
```

</td></tr>
</table>

### [Outdent8](../spec/outdent.md#outdent8)

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

```buffer
para
- «a
- b
- c»
```

</td><td>

```buffer
para

«a
- b

c»
```

</td></tr>
</table>

### [Outdent11](../spec/outdent.md#outdent11)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
# T
## A┃
## B
```

</td></tr>
</table>

> outdent

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
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

> indent

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# T
  ## A┃
## B
```

</td><td>

```buffer
# T
## A┃
### B
```

</td></tr>
</table>

### [Outdent12](../spec/outdent.md#outdent12)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- «a
- b»
```

</td><td>

```buffer
- «a
- b»
```

</td><td>

```buffer
«a

b»
```

</td></tr>
</table>

### [Outdent13](../spec/outdent.md#outdent13)

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
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

> indent

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
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

### [Outdent15](../spec/outdent.md#outdent15)

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para
- b┃
```

</td><td>

```buffer
para

b┃
```

</td></tr>
</table>

> indent

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para
  - b┃
```

</td><td>

```buffer
para

- b┃
```

</td></tr>
</table>

### [DirectOutdent2](../spec/outdent.md#directoutdent2)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

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

### [DirectOutdent3](../spec/outdent.md#directoutdent3)

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

### [DirectOutdent4](../spec/outdent.md#directoutdent4)

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

### [DirectOutdent5](../spec/outdent.md#directoutdent5)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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

b┃
- c
```

</td></tr>
</table>

### [DirectOutdent6](../spec/outdent.md#directoutdent6)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a
2. b┃
3. c
```

</td><td>

```buffer
1. a
2. b┃
3. c
```

</td><td>

```buffer
1. a

b┃
1. c
```

</td></tr>
</table>

### [Outdent16](../spec/outdent.md#outdent16)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
┃1. n
- 
  - g
```

</td><td>

```buffer
┃1. n
- 
  - g
```

</td><td>

```buffer
┃n

- 
  - g
```

</td></tr>
</table>

### [Outdent17](../spec/outdent.md#outdent17)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃# H
- b
```

</td><td>

```buffer
- ┃# H
- b
```

</td><td>

```buffer
# ┃H
- b
```

</td></tr>
</table>

### [Outdent19](../spec/outdent.md#outdent19)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- ┃```
  code
  ```
  - c
- d
````

</td><td>

````buffer
- ┃```
  code
  ```
  - c
- d
````

</td><td>

````buffer
┃```
code
```
- c
- d
````

</td></tr>
</table>

### [Outdent20](../spec/outdent.md#outdent20)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- t1┃
| a | b |
|---|---|
```

</td><td>

```buffer
- t1┃
| a | b |
|---|---|
```

</td><td>

```buffer
t1┃
| a | b |
|\---|---|
```

</td></tr>
</table>

### [Outdent20b](../spec/outdent.md#outdent20b)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- t1┃
===
```

</td><td>

```buffer
- t1┃
===
```

</td><td>

```buffer
t1┃
\===
```

</td></tr>
</table>

### [Outdent21](../spec/outdent.md#outdent21)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- - ┃b
```

</td><td>

```buffer
- a
- - ┃b
```

</td><td>

```buffer
- a
- ┃b
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
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- a- x
- y
┃
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
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- a- x
- y┃
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
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- a- x

- y┃
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

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
```
a┃
```
````

</td><td>

````buffer
```
ax **y**┃
```
````

</td><td>

````buffer
```
ax y┃
```
````

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
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- a- x _b_
- y┃
- b
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

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
┃
```

</td><td>

```buffer
This site uses XSLT; that functionality is being [removed from this browser very soon](https://chromestatus.com/feature/4709671889534976).

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

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
┃
```

</td><td>

```buffer
x **b**

y

z┃
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

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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

</td><td>

```buffer
- x
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

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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

</td><td>

```buffer
x

- y

z┃
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

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
┃
```

</td><td>

```buffer
|a|b|
|---|--:|
|1|2|┃
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

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
┃
```

</td><td>

```buffer
- a **b** _i_ `c` ~~s~~ [l](https://e.x/p)
- z┃
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

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
┃
```

</td><td>

```buffer
- 1. not a list, *x* and [y]
- # not a heading┃
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

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
┃
```

</td><td>

````buffer
## Setup

[](#setup)

```shell
npm install
```┃
````

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

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
┃
```

</td><td>

```buffer
**

- Bold start
    

- nested
    



**┃
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

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
┃
```

</td><td>

```buffer
·⍽⍽⍽⍽⍽ one

o⍽⍽⍽⍽⍽ nested┃
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

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
┃
```

</td><td>

```buffer
javascript

Copy code

`let a = 1;`┃
```

</td><td>

````buffer
```javascript
let a = 1;┃
```
````

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
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- a1. x
2. y┃
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

### [PasteListForm2](../spec/paste-list-form.md#pastelistform2)

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
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a┃
2. b
```

</td><td>

```buffer
1. a- x
- y┃
1. b
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
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
```

</td><td>

```buffer
- a- x
  1. x1
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

### [PasteListForm4](../spec/paste-list-form.md#pastelistform4)

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
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- a- x

- y┃
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

### [PasteListForm5](../spec/paste-list-form.md#pastelistform5)

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
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃

- b
```

</td><td>

```buffer
- a- x
- y┃

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

### [PasteList1](../spec/paste-list.md#pastelist1)

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
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- a- x
- y┃
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

### [PasteList2](../spec/paste-list.md#pastelist2)

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
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃b
- c
```

</td><td>

```buffer
- a- x
- y┃b
- c
```

</td><td>

```buffer
- ab
- x
- y┃
- c
```

</td></tr>
</table>

### [PasteList3](../spec/paste-list.md#pastelist3)

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
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃ab
- c
```

</td><td>

```buffer
- x
- y┃ab
- c
```

</td><td>

```buffer
- ab
- x
- y┃
- c
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

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - kid
```

</td><td>

```buffer
- a- x
- y┃
  - kid
```

</td><td>

```buffer
- a
  - x
  - y┃
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

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
  - kid
```

</td><td>

```buffer
- x
- y┃
  - kid
```

</td><td>

```buffer
- 
  - x
  - y┃
  - kid
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
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- aNotes:
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
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
```

</td><td>

```buffer
- aone
two

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

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

````buffer
- a```
c
```┃
- b
````

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

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

````buffer
- a- x

```
c
```┃
- b
````

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

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - kid
```

</td><td>

````buffer
- a```
c
```┃
  - kid
````

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

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
- b
```

</td><td>

````buffer
- ```
c
```┃
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

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- a# h
text┃
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

### [PasteList17](../spec/paste-list.md#pastelist17)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
> q
```

</td></tr>
</table>

> paste

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃
```

</td><td>

```buffer
- a
- > q
┃
```

</td><td>

```buffer
- a
- > q┃
```

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

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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
┃
  - b1
```

</td><td>

```buffer
- a
- > q┃
  - b1
```

</td></tr>
</table>

### [PasteList25](../spec/paste-list.md#pastelist25)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
1. Introduction
```

</td></tr>
</table>

> paste

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃here
```

</td><td>

```buffer
- Introduction┃here
```

</td><td>

```buffer
- 1\. Introduction┃here
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

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

````buffer
- a- ```
  code
  ```
┃
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

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

````buffer
- a- ```
  code┃
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

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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

</td><td>

```buffer
# T

x
y┃

para
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

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Notes┃

more
```

</td><td>

```buffer
Notes- x
- y┃

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

### [Paste4](../spec/paste.md#paste4)

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
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Notes┃

- z
```

</td><td>

```buffer
Notes- x
- y┃

- z
```

</td><td>

```buffer
Notes

- x
- y┃
- z
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

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
See ┃here.
```

</td><td>

```buffer
See - x
- y┃here.
```

</td><td>

```buffer
See here.

- x
- y┃
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

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# T┃

- z
```

</td><td>

```buffer
# T- x
- y┃

- z
```

</td><td>

```buffer
# T

- x
- y┃
- z
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

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
p┃

q
```

</td><td>

````buffer
p```
c
```┃

q
````

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

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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
- y┃

- b
```

</td><td>

```buffer
- a

  p

  - x
  - y┃

- b
```

</td></tr>
</table>

### [Paste9](../spec/paste.md#paste9)

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
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> p┃

after
```

</td><td>

```buffer
> p- x
- y┃

after
```

</td><td>

```buffer
> p
>
> - x
> - y┃

after
```

</td></tr>
</table>

### [Paste10](../spec/paste.md#paste10)

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

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# A

p┃

q

## B

r
```

</td><td>

```buffer
# A

p## h
text┃

q

## B

r
```

</td><td>

```buffer
# A

p

## h
text┃

q

## B

r
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

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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

</td><td>

```buffer
## A

## h
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

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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

</td><td>

```buffer
## A

### h
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

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
a
┃

b
```

</td><td>

```buffer
a
- x
┃

b
```

</td><td>

```buffer
a
- x┃

b
```

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

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
```
a
```┃

after
````

</td><td>

````buffer
```
a
```- x
- y┃

after
````

</td><td>

````buffer
```
a
```

- x
- y┃

after
````

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
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a«bc»d
- e
```

</td><td>

```buffer
- a- x
- y┃d
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

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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

px

# h┃

q

## B
```

</td><td>

```buffer
## A

p

x

# h┃

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

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> [!note] q┃

after
```

</td><td>

```buffer
> [!note] q## h
text┃

after
```

</td><td>

```buffer
> [!note] q
> ## h
> text┃

after
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

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> [!note] q┃
> body
```

</td><td>

```buffer
> [!note] qx
y┃
> body
```

</td><td>

```buffer
> [!note] q
> x
> y┃
>
> body
```

</td></tr>
</table>

### [Paste27](../spec/paste.md#paste27)

<table>
<tr><th>clipboard (text/plain)</tr>
<tr valign="top"><td>

```clipboard
> # q
```

</td></tr>
</table>

> paste

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# A
para┃

more
```

</td><td>

```buffer
# A
para> # q
┃

more
```

</td><td>

```buffer
# A
para

> # q┃

more
```

</td></tr>
</table>

### [Placeholder1](../spec/placeholders.md#placeholder1)

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

```buffer
- a┃
  - 
```

</td><td>

```buffer
- a┃

  - 
```

</td></tr>
</table>

### [Placeholder2](../spec/placeholders.md#placeholder2)

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

```buffer
- a
┃
```

</td><td>

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

```buffer
┃- a

```

</td><td>

```buffer
┃- a
```

</td></tr>
</table>

### [Placeholder3](../spec/placeholders.md#placeholder3)

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

```buffer
para
┃
```

</td><td>

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

```buffer
┃para

```

</td><td>

```buffer
┃para
```

</td></tr>
</table>

### [Placeholder5](../spec/placeholders.md#placeholder5)

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

```buffer
- a┃
  - 
```

</td><td>

```buffer
- a┃

  - 
```

</td></tr>
</table>

### [Placeholder7](../spec/placeholders.md#placeholder7)

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

```buffer
- a┃
  - 
```

</td><td>

```buffer
- a┃

  - 
```

</td></tr>
</table>

### [Placeholder17](../spec/placeholders.md#placeholder17)

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
-  ``` x
- b
┃
````

</td><td>

````buffer
- \``` x
- b
````

</td></tr>
</table>

### [Placeholder13](../spec/placeholders.md#placeholder13)

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

```buffer
# H1

┃
## H2
```

</td><td>

```buffer
# H1

## ┃H2
```

</td></tr>
</table>

### [Placeholder14](../spec/placeholders.md#placeholder14)

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

```buffer
para

┃
text
```

</td><td>

```buffer
para

┃text
```

</td></tr>
</table>

### [Placeholder15](../spec/placeholders.md#placeholder15)

Adapted: under enterAtTextStart: stay

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

```buffer
para
- 
- ┃a
```

</td><td>

```buffer
para

- 
- ┃a
```

</td></tr>
</table>

> cursorDocEnd

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para
- 
- a
┃
```

</td><td>

```buffer
para

- 
- a
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter</th><th>cursorDocEnd</th></tr>
<tr valign="top"><td>

```buffer
para
- ┃a
```

</td><td>

```buffer
para

- 
- ┃a
```

</td><td>

```buffer
para

- 
- a
┃
```

</td></tr>
</table>

### [Placeholder16](../spec/placeholders.md#placeholder16)

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
┃«- a
  - »
```

</td><td>

```buffer
┃«- a

  - »
```

</td></tr>
</table>

### [Placeholder18](../spec/placeholders.md#placeholder18)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
a┃ # b

after
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
┃ # b

after
```

</td></tr>
</table>

> cursorDocEnd

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
 # b

after
┃
```

</td><td>

```buffer
\# b

after
```

</td></tr>
</table>

### [Placeholder19](../spec/placeholders.md#placeholder19)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

````buffer
para
a┃ ``` x

after
````

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

````buffer
para
┃ ``` x

after
````

</td></tr>
</table>

> cursorDocEnd

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
para
 ``` x

after
┃
````

</td><td>

````buffer
para
\``` x

after
````

</td></tr>
</table>

### [Quote9](../spec/quotes.md#quote9)

> indent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> a
>
> b┃
```

</td><td>

```buffer
> a
>
> →b┃
```

</td><td>

```buffer
> a
>
> - b┃
```

</td></tr>
</table>

### [Quote11](../spec/quotes.md#quote11)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a
> - b┃
```

</td><td>

```buffer
> - a
> - b┃
```

</td><td>

```buffer
> - a
- b┃
```

</td></tr>
</table>

### [Quote12](../spec/quotes.md#quote12)

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

```buffer
> - a┃
>   - c
> - b
```

</td><td>

```buffer
- a┃
  - c
> - b
```

</td></tr>
</table>

### [Quote13](../spec/quotes.md#quote13)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> [!note] T
> - a┃
```

</td><td>

```buffer
> [!note] T
> - a┃
```

</td><td>

```buffer
> [!note] T
- a┃
```

</td></tr>
</table>

### [Quote14](../spec/quotes.md#quote14)

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

```buffer
> - a
> - b┃
c
```

</td><td>

```buffer
> - a
- b┃
c
```

</td></tr>
</table>

### [Quote15](../spec/quotes.md#quote15)

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

```buffer
- x
  > - a
> - b┃
```

</td><td>

```buffer
- x
  > - a
  - b┃
```

</td></tr>
</table>

### [Quote16](../spec/quotes.md#quote16)

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

```buffer
> - a
> - b┃
>
>   c
```

</td><td>

```buffer
> - a
- b┃

  c
```

</td></tr>
</table>

### [Quote17](../spec/quotes.md#quote17)

> indent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a
- b┃
```

</td><td>

```buffer
> - a
  - b┃
```

</td><td>

```buffer
> - a
> - b┃
```

</td></tr>
</table>

### [Quote18](../spec/quotes.md#quote18)

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

```buffer
> - a

  - b┃
  - c

  d
```

</td><td>

```buffer
> - a
> - b┃
>   - c
>
>   d
```

</td></tr>
</table>

### [Quote19](../spec/quotes.md#quote19)

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a
  - b┃
```

</td><td>

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

### [Quote21](../spec/quotes.md#quote21)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - x
- a┃

> - b
```

</td><td>

```buffer
> - x

- a┃
> - b
```

</td><td>

```buffer
> - x

> - b

- a┃
```

</td></tr>
</table>

### [Quote22](../spec/quotes.md#quote22)

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a

> - b┃
- c
```

</td><td>

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

### [Quote23](../spec/quotes.md#quote23)

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a┃
- c
> - b
```

</td><td>

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

### [Quote25](../spec/quotes.md#quote25)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a
>
> - b┃
```

</td><td>

```buffer
> - a
> - b┃
>
```

</td><td>

```buffer
> - b┃
>
> - a
```

</td></tr>
</table>

### [Quote27](../spec/quotes.md#quote27)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> q
# H┃
```

</td><td>

```buffer
# H┃
> q
```

</td><td>

```buffer
> q
# H┃
```

</td></tr>
</table>

### [Quote31](../spec/quotes.md#quote31)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a
b┃
```

</td><td>

```buffer
> - a
b
┃
```

</td><td>

```buffer
> - a
b
> - ┃
```

</td></tr>
</table>

### [Quote32](../spec/quotes.md#quote32)

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

```buffer
> Quote:
> - one
> ┃
```

</td><td>

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

### [Quote33](../spec/quotes.md#quote33)

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

```buffer
- x
  > - a
  > ┃
```

</td><td>

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

```buffer
- x
  > - a
  
  ┃
```

</td><td>

```buffer
- x
  > - a

  ┃
```

</td></tr>
</table>

### [Quote34](../spec/quotes.md#quote34)

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

```buffer

┃
```

</td><td>

```buffer
┃
```

</td></tr>
</table>

### [Quote35](../spec/quotes.md#quote35)

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> ab
> ┃
```

</td><td>

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

### [Quote36](../spec/quotes.md#quote36)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> ab┃cd
```

</td><td>

```buffer
> ab
> ┃cd
```

</td><td>

```buffer
> ab
>
> ┃cd
```

</td></tr>
</table>

### [Quote38](../spec/quotes.md#quote38)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> [!note] Ti┃tle
> body
```

</td><td>

```buffer
> [!note] Ti
> ┃tle
> body
```

</td><td>

```buffer
> [!note] Ti
> ┃tle
>
> body
```

</td></tr>
</table>

### [Quote40](../spec/quotes.md#quote40)

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> [!note] Title
> ┃
> body
```

</td><td>

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> [!note] Title
> x┃
> body
```

</td><td>

```buffer
> [!note] Title
> x┃
>
> body
```

</td></tr>
</table>

### [Quote41](../spec/quotes.md#quote41)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> [!tip] Title┃- x
> - y
```

</td><td>

```buffer
> [!tip] Title
> ┃- x
> - y
```

</td><td>

```buffer
> [!tip] Title
> ┃\- x
> - y
```

</td></tr>
</table>

### [Quote42](../spec/quotes.md#quote42)

> enter

Adapted: under enterSplitSpace: drop

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> para ┃- x
> - a
```

</td><td>

```buffer
> para 
> ┃- x
> - a
```

</td><td>

```buffer
> para 
>
> ┃\- x
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
> para 
>
> ┃\- x
> - a
```

</td></tr>
</table>

### [Quote43](../spec/quotes.md#quote43)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> [!ti┃p] Title
```

</td><td>

```buffer
> [!ti
> ┃p] Title
```

</td><td>

```buffer
> [!ti
┃p] Title
```

</td></tr>
</table>

### [Quote47](../spec/quotes.md#quote47)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> [!tip] Ti┃tle
> body
```

</td><td>

```buffer
> [!tip] Ti
> ┃tle
> body
```

</td><td>

```buffer
> [!tip] Ti┃tle
> body
```

</td></tr>
</table>

### [Quote48](../spec/quotes.md#quote48)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a
> - ┃b
```

</td><td>

```buffer
> - a
> -┃b
```

</td><td>

```buffer
> - a┃b
```

</td></tr>
</table>

### [Quote49](../spec/quotes.md#quote49)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> a
> - ┃b
```

</td><td>

```buffer
> a
> -┃b
```

</td><td>

```buffer
> a┃b
```

</td></tr>
</table>

### [Quote50](../spec/quotes.md#quote50)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> a┃
> - b
```

</td><td>

```buffer
> a┃> - b
```

</td><td>

```buffer
> a┃b
```

</td></tr>
</table>

### [Quote51](../spec/quotes.md#quote51)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> a┃
>
> b
```

</td><td>

```buffer
> a┃>
> b
```

</td><td>

```buffer
> a┃b
```

</td></tr>
</table>

### [Quote52](../spec/quotes.md#quote52)

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

```buffer
> - a
-┃b
  - c
```

</td><td>

```buffer
> - a┃b
>   - c
```

</td></tr>
</table>

### [Quote53](../spec/quotes.md#quote53)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

> ┃q
```

</td><td>

```buffer
- a

>┃q
```

</td><td>

```buffer
- a

┃q
```

</td></tr>
</table>

### [Quote54](../spec/quotes.md#quote54)

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
> -┃b
> - c
```

</td><td>

```buffer
- a
> ┃b
> - c
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
> ┃b
> - c
```

</td><td>

```buffer
- a

┃b
> - c
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
>┃b
> - c
```

</td><td>

```buffer
- a┃b
> - c
```

</td></tr>
</table>

### [Quote56](../spec/quotes.md#quote56)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a

> ┃q
>
> r
```

</td><td>

```buffer
- a

>┃q
>
> r
```

</td><td>

```buffer
- a

┃q

> r
```

</td></tr>
</table>

### [Quote57](../spec/quotes.md#quote57)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para

> [!note] ┃Title
> body
```

</td><td>

```buffer
para

> [!note]┃Title
> body
```

</td><td>

```buffer
para

> ┃Title
>
> body
```

</td></tr>
</table>

### [Quote59](../spec/quotes.md#quote59)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - ┃
```

</td><td>

```buffer
> -┃
```

</td><td>

```buffer
┃
```

</td></tr>
</table>

### [Quote89](../spec/quotes.md#quote89)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
> ┃q
```

</td></tr>
</table>

> enter

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> 
> ┃q
```

</td><td>

```buffer
> ┃
>
> q
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> 
>┃q
```

</td><td>

```buffer
> ┃q
```

</td></tr>
</table>

### [Quote90](../spec/quotes.md#quote90)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

````buffer
> ```
> code
> ```┃
````

</td></tr>
</table>

> enter

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

````buffer
> ```
> code
> ```
> ┃
````

</td></tr>
</table>

> cursorDocStart

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
┃> ```
> code
> ```
> 
````

</td><td>

````buffer
┃> ```
> code
> ```
````

</td></tr>
</table>

### [Quote60](../spec/quotes.md#quote60)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> [!note] Ti
> ┃tle
>
> body
```

</td><td>

```buffer
> [!note] Ti
>┃tle
>
> body
```

</td><td>

```buffer
> [!note] Ti┃tle
>
> body
```

</td></tr>
</table>

### [Quote61](../spec/quotes.md#quote61)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> [!note] Title┃
> body
```

</td><td>

```buffer
> [!note] Title┃> body
```

</td><td>

```buffer
> [!note] Title┃body
```

</td></tr>
</table>

### [Quote62](../spec/quotes.md#quote62)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> [!note] Title
> - ┃a
```

</td><td>

```buffer
> [!note] Title
> -┃a
```

</td><td>

```buffer
> [!note] Title┃a
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

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a┃
```

</td><td>

```buffer
> - a- x
  - y
┃
```

</td><td>

```buffer
> - a
> - x
>   - y┃
```

</td></tr>
</table>

### [Quote65](../spec/quotes.md#quote65)

> indent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> q

para┃
```

</td><td>

```buffer
> q

  para┃
```

</td><td>

```buffer
> q
>
> para┃
```

</td></tr>
</table>

### [Quote66](../spec/quotes.md#quote66)

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

```buffer
> q
>
> para┃
```

</td><td>

```buffer
> q

para┃
```

</td></tr>
</table>

### [Quote68](../spec/quotes.md#quote68)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - x
> - y

> q┃
```

</td><td>

```buffer
> - x
> - y
> q┃

```

</td><td>

```buffer
> q┃

> - x
> - y
```

</td></tr>
</table>

### [Quote71](../spec/quotes.md#quote71)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> [!note] T
> - a┃

- b
```

</td><td>

```buffer
> [!note] T

> - a┃
- b
```

</td><td>

```buffer
> [!note] T
- b

  - a┃
```

</td></tr>
</table>

### [Quote72](../spec/quotes.md#quote72)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - x
> - a┃
> - b
```

</td><td>

```buffer
> - x
> - a┃
> - b
```

</td><td>

```buffer
> - x
- a┃
> - b
```

</td></tr>
</table>

### [Quote73](../spec/quotes.md#quote73)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- > a┃b
```

</td></tr>
</table>

> enter

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- > a
- ┃b
```

</td><td>

```buffer
- > a
  >
  > ┃b
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- > a
-┃b
```

</td><td>

```buffer
- > a┃b
```

</td></tr>
</table>

### [Quote74](../spec/quotes.md#quote74)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- > a┃b
```

</td></tr>
</table>

> shiftEnter

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- > a
  ┃b
```

</td><td>

```buffer
- > a
  > ┃b
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- > a
┃b
```

</td><td>

```buffer
- > a┃b
```

</td></tr>
</table>

### [Quote75](../spec/quotes.md#quote75)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- > ┃q
  >
  > r
```

</td><td>

```buffer
- a
- >┃q
  >
  > r
```

</td><td>

```buffer
- a
- ┃q
  > r
```

</td></tr>
</table>

### [Quote77](../spec/quotes.md#quote77)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - > ┃q
```

</td><td>

```buffer
- a
- > ┃q
```

</td><td>

```buffer
- a
  - ┃q
```

</td></tr>
</table>

### [Quote78](../spec/quotes.md#quote78)

> indent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> q

┃p
- x
```

</td><td>

```buffer
> q

  ┃p
- x
```

</td><td>

```buffer
> q
>
> ┃p
> - x
```

</td></tr>
</table>

### [Quote79](../spec/quotes.md#quote79)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> [«!note] q6»
```

</td><td>

```buffer
> [
┃
```

</td><td>

```buffer
> [«!note] q6»
```

</td></tr>
</table>

### [Quote80](../spec/quotes.md#quote80)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- > ┃q
```

</td></tr>
</table>

> enter

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- > 
- ┃q
```

</td><td>

```buffer
- > ┃
  >
  > q
```

</td></tr>
</table>

> "x"

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- > 
- x┃q
```

</td><td>

```buffer
- > x┃
  >
  > q
```

</td></tr>
</table>

### [Quote81](../spec/quotes.md#quote81)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- > ┃p
  >
  > q
```

</td></tr>
</table>

> moveSubtreeDown

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
  >
- > ┃p
  > q
```

</td><td>

```buffer
- > q
  >
  > ┃p
```

</td></tr>
</table>

> moveSubtreeUp

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- > ┃p
  >
  > q
```

</td></tr>
</table>

### [Quote88](../spec/quotes.md#quote88)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- > ┃
  >
  > q
```

</td><td>

```buffer
- > ┃  >
  > q
```

</td><td>

```buffer
- > ┃q
```

</td></tr>
</table>

### [Quote83](../spec/quotes.md#quote83)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- > q
  - ┃g
```

</td></tr>
</table>

> moveSubtreeUp

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
  - ┃g
- > q
```

</td><td>

```buffer
- - ┃g
  > q
```

</td></tr>
</table>

> moveSubtreeDown

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- > q
  - ┃g
```

</td></tr>
</table>

### [Quote85](../spec/quotes.md#quote85)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- > - ┃a
  > - b
```

</td><td>

```buffer
- > - ┃a
  > - b
```

</td><td>

```buffer
- - ┃a
  > - b
```

</td></tr>
</table>

### [Quote87](../spec/quotes.md#quote87)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - ┃q
    - g
```

</td><td>

```buffer
> - ┃q
    - g
```

</td><td>

```buffer
- ┃q
      - g
```

</td></tr>
</table>

### [Quote91b](../spec/quotes.md#quote91b)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
>- ┃a
>- b
```

</td><td>

```buffer
>- 
>  ┃a
>- b
```

</td><td>

```buffer
>-
>   ┃a
>- b
```

</td></tr>
</table>

### [Quote92](../spec/quotes.md#quote92)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃b
  > q
  >
  > r
```

</td></tr>
</table>

> indent

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃b
  > q
  >
  > r
```

</td><td>

```buffer
- a
  - ┃b
    > q
    >
    > r
```

</td></tr>
</table>

> outdent

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃b
  > q
  >
  > r
```

</td></tr>
</table>

### [Quote93](../spec/quotes.md#quote93)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> a
> # ┃H
```

</td><td>

```buffer
> a
> #┃H
```

</td><td>

```buffer
> a
>
> ┃H
```

</td></tr>
</table>

### [Quote69](../spec/quotes.md#quote69)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a
> > q┃
```

</td><td>

```buffer
> - a
> > q┃
```

</td><td>

```buffer
> - a
>
> q┃
```

</td></tr>
</table>

### [Quote70](../spec/quotes.md#quote70)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> > q┃
> - a
```

</td><td>

```buffer
> > q┃
> - a
```

</td><td>

```buffer
> q┃
> - a
```

</td></tr>
</table>

### [Quote94](../spec/quotes.md#quote94)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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
  >┃q
- b
```

</td><td>

```buffer
- a
- [ ] ┃q
- b
```

</td></tr>
</table>

### [Quote97](../spec/quotes.md#quote97)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
>→- ┃a
>→- b
```

</td><td>

```buffer
>→-┃a
>→- b
```

</td><td>

```buffer
> ┃a
>→- b
```

</td></tr>
</table>

### [Regression1](../spec/regressions.md#regression1)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
* a
  * ┃b
  2) x
```

</td><td>

```buffer
* a
  *┃b
  2) x
```

</td><td>

```buffer
* a┃b
  1) x
```

</td></tr>
</table>

### [Regression2](../spec/regressions.md#regression2)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  1. 
- ┃b
```

</td><td>

```buffer
- a
  1. 
-┃b
```

</td><td>

```buffer
- a
  1\. ┃b
```

</td></tr>
</table>

### [Regression4](../spec/regressions.md#regression4)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
p0
2. m1┃
```

</td></tr>
</table>

> enter

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
p0
2. m1
3. ┃
```

</td><td>

```buffer
p0
2. m1

┃
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
p0
2. m1
3.┃
```

</td><td>

```buffer
p0
2. m1┃
```

</td></tr>
</table>

### [Regression5](../spec/regressions.md#regression5)

> enter

Adapted: under enterSplitSpace: drop

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
\[a]: ┃/url
```

</td><td>

```buffer
\[a]: 
┃/url
```

</td><td>

```buffer
\[a]: 

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
\[a]: 

┃/url
```

</td></tr>
</table>

### [Regression6](../spec/regressions.md#regression6)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

`````````````buffer
```
x┃````````````
body
```
`````````````

</td><td>

`````````````buffer
```
┃````````````
body
```
`````````````

</td><td>

``````````````buffer
`````````````
┃````````````
body
`````````````
``````````````

</td></tr>
</table>

### [Regression7](../spec/regressions.md#regression7)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
```
code
┃    ```
````

</td><td>

````buffer
```
code┃→→```
````

</td><td>

````buffer
```
code┃    ```
````

</td></tr>
</table>

### [Regression8](../spec/regressions.md#regression8)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - b
  2) ┃x
```

</td><td>

```buffer
- a
  2) ┃x
  - b
```

</td><td>

```buffer
- a
  1) ┃x
  - b
```

</td></tr>
</table>

### [Regression9](../spec/regressions.md#regression9)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃a
    1. b
      - c
```

</td><td>

```buffer
- ┃a
    1. b
      - c
```

</td><td>

```buffer
┃a
1. b
       - c
```

</td></tr>
</table>

### [Regression10](../spec/regressions.md#regression10)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- one┃<div>
```

</td></tr>
</table>

> shiftEnter

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  ┃<div>
```

</td><td>

```buffer
- one
  ┃\<div>
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
┃<div>
```

</td><td>

```buffer
- one┃\<div>
```

</td></tr>
</table>

### [Regression11](../spec/regressions.md#regression11)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

````buffer
para┃``` x
````

</td></tr>
</table>

> shiftEnter

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
para
┃``` x
````

</td><td>

````buffer
para
┃\``` x
````

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
para┃``` x
````

</td><td>

````buffer
para┃\``` x
````

</td></tr>
</table>

### [Regression12](../spec/regressions.md#regression12)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
p0
2. m1┃
```

</td></tr>
</table>

> shiftEnter

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
p0
2. m1
   ┃
```

</td><td>

```buffer
p0
2. m1
┃
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
p0
2. m1
┃
```

</td><td>

```buffer
p0
2. m1┃
```

</td></tr>
</table>

### [Regression14](../spec/regressions.md#regression14)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para
  - b┃
    - c
  - d
```

</td><td>

```buffer
para
- b┃
    - c
  - d
```

</td><td>

```buffer
para

b┃
- c
- d
```

</td></tr>
</table>

### [Regression24](../spec/regressions.md#regression24)

Adapted: under enterSplitSpace: drop

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
revise ┃2\. draft
```

</td></tr>
</table>

> enter

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
revise 
┃2\. draft
```

</td><td>

```buffer
revise 

┃2\. draft
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
revise ┃2\. draft
```

</td><td>

```buffer
revise ┃2. draft
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
revise 

┃2\. draft
```

</td><td>

```buffer
revise ┃2. draft
```

</td></tr>
</table>

### [Regression25](../spec/regressions.md#regression25)

Adapted: under enterSplitSpace: drop

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- revise 
-┃2\. draft
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
- revise ┃2\. draft
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

### [Regression26](../spec/regressions.md#regression26)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
a ┃\- b
```

</td></tr>
</table>

> shiftEnter

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
a 
┃\- b
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
a ┃\- b
```

</td><td>

```buffer
a ┃- b
```

</td></tr>
</table>

### [Regression27](../spec/regressions.md#regression27)

> enter

Adapted: under enterSplitSpace: drop

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
revise ┃2\. a
3\. b
```

</td><td>

```buffer
revise 
┃2\. a
3\. b
```

</td><td>

```buffer
revise 

┃2\. a
3\. b
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
revise ┃2\. a
3\. b
```

</td><td>

```buffer
revise 

┃2\. a
3\. b
```

</td></tr>
</table>

### [Regression29](../spec/regressions.md#regression29)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> [!a b] x┃
```

</td><td>

```buffer
> [!a b] x
> ┃
```

</td><td>

```buffer
> [!a b] x
>
> ┃
```

</td></tr>
</table>

### [Regression30](../spec/regressions.md#regression30)

> indent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
┃para
→- a
```

</td><td>

```buffer
→┃para
→- a
```

</td><td>

```buffer
- ┃para
  →\- a
```

</td></tr>
</table>

### [Regression31](../spec/regressions.md#regression31)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
┃- para
  →\- a
```

</td><td>

```buffer
┃- para
  →\- a
```

</td><td>

```buffer
┃para
→- a
```

</td></tr>
</table>

### [Regression32](../spec/regressions.md#regression32)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- para┃
  →\- a
```

</td><td>

```buffer
- para┃  →\- a
```

</td><td>

```buffer
- para┃→- a
```

</td></tr>
</table>

### [Scenario3](../spec/scenarios.md#scenario3)

> enter indent deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
```

</td><td>

```buffer
- a
  -┃
```

</td><td>

```buffer
- a┃
```

</td></tr>
</table>

### [Scenario4](../spec/scenarios.md#scenario4)

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
  - 
```

</td><td>

```buffer
- a┃

  - 
```

</td></tr>
</table>

> cursorLineDown cursorLineDown "b"

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - 
b┃
```

</td><td>

```buffer
- a

  - b┃
```

</td></tr>
</table>

### [Scenario5](../spec/scenarios.md#scenario5)

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
  - b
- a┃
  - c
- d
```

</td><td>

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

### [Scenario6](../spec/scenarios.md#scenario6)

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Groceries
┃
```

</td><td>

```buffer
Groceries

┃
```

</td></tr>
</table>

> "- milk"

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Groceries
- milk┃
```

</td><td>

```buffer
Groceries

- milk┃
```

</td></tr>
</table>

> enter "eggs"

> enter indent "brown"

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

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
  - brown┃
```

</td></tr>
</table>

> enter enter

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

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
- ┃
```

</td></tr>
</table>

> enter "Done."

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Groceries
- milk
- eggs
  - brown
Done.┃
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

### [Scenario7](../spec/scenarios.md#scenario7)

Adapted: under enterAtTextStart: stay

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- buy milk
- ┃and eggs
- call Ann
```

</td><td>

```buffer
- buy milk ┃and eggs
- call Ann
```

</td></tr>
</table>

> cursorLineBoundaryBackward

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- buy milk
┃- and eggs
- call Ann
```

</td><td>

```buffer
- ┃buy milk and eggs
- call Ann
```

</td></tr>
</table>

> enter "today:"

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- buy milk

today:┃- and eggs
- call Ann
```

</td><td>

```buffer
- 
- today:┃buy milk and eggs
- call Ann
```

</td></tr>
</table>

> cursorLineDown cursorLineDown cursorLineBoundaryForward deleteContentBackward cursorCharLeft deleteContentForward

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- buy milk

today:- and eggs
- call An┃
```

</td><td>

```buffer
- 
- today:buy milk and eggs
- call An┃
```

</td></tr>
</table>

> cursorLineUp cursorLineBoundaryForward deleteContentForward

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- buy milk

today:- and eggs┃- call An
```

</td><td>

```buffer
- 
- today:buy milk and eggs┃call An
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
- ┃and eggs
- call Ann
```

</td><td>

```buffer
- buy milk ┃and eggs
- call Ann
```

</td><td>

```buffer
- ┃buy milk and eggs
- call Ann
```

</td><td>

```buffer
- 
- today:┃buy milk and eggs
- call Ann
```

</td><td>

```buffer
- 
- today:buy milk and eggs
- call An┃
```

</td><td>

```buffer
- 
- today:buy milk and eggs┃call An
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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Work┃
- Inbox
  - email
- Home
  - plants
```

</td><td>

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Inbox
  - email
- Work┃
- Home
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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Inbox
  - Work┃
  - email
- Home
  - plants
```

</td><td>

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
  - call Ann
- Inbox┃
- Errands
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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
┃more
- b
```

</td><td>

```buffer
- a┃more
- b
```

</td></tr>
</table>

> cursorLineBoundaryForward deleteContentForward

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
more┃- b
```

</td><td>

```buffer
- amore┃b
```

</td></tr>
</table>

> undo

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
more┃
- b
```

</td><td>

```buffer
- amore┃
- b
```

</td></tr>
</table>

> redo

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  ┃more
- b
```

</td><td>

```buffer
- amore┃b
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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃
  - b
- c
  - d
```

</td><td>

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- x┃
  - b
- c
  - d
```

</td><td>

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
-┃x
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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃-x
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

### [Scenario13](../spec/scenarios.md#scenario13)

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
2. one
3. three
4. two┃
```

</td><td>

```buffer
1. one
2. three
3. two┃
```

</td></tr>
</table>

### [Scenario16](../spec/scenarios.md#scenario16)

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

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
- [x] ┃review

# Home
- water
```

</td></tr>
</table>

> undo

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

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- example┃
- next
```

</td><td>

````buffer
- example```
code
```
!┃
- next
````

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

### [Scenario19](../spec/scenarios.md#scenario19)

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Notes
first idea
second┃
```

</td><td>

```buffer
# Notes
first idea

second┃
```

</td></tr>
</table>

> moveSubtreeUp

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Notes
second┃
first idea
```

</td><td>

```buffer
# Notes
second┃

first idea
```

</td></tr>
</table>

### [Scenario20](../spec/scenarios.md#scenario20)

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Trip
Pack light.
Book the train.┃
```

</td><td>

```buffer
# Trip
Pack light.

Book the train.┃
```

</td></tr>
</table>

> shiftEnter "Seat 42."

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Trip
Pack light.
Book the train.
Seat 42.┃
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

> moveSubtreeUp

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Trip
Pack light.
Seat 42.┃
Book the train.
```

</td><td>

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Trip
Pack light.
Book the train.
Seat 42.┃
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

### [Scenario21](../spec/scenarios.md#scenario21)

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
one
┃two
```

</td><td>

```buffer
one

┃two
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
one┃two
```

</td></tr>
</table>

> enter cursorDocStart cursorLineBoundaryForward

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
one┃
two
```

</td><td>

```buffer
one┃

two
```

</td></tr>
</table>

> deleteContentForward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
one┃two
```

</td></tr>
</table>

### [Scenario21b](../spec/scenarios.md#scenario21b)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
One.┃ Two.
```

</td></tr>
</table>

> enter

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
One.
┃Two.
```

</td><td>

```buffer
One.

┃Two.
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
One.┃Two.
```

</td></tr>
</table>

### [Scenario22](../spec/scenarios.md#scenario22)

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
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

### [Scenario23](../spec/scenarios.md#scenario23)

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Plan
revise ┃2. draft
```

</td><td>

```buffer
# Plan
revise ┃2\. draft
```

</td></tr>
</table>

> shiftEnter

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Plan
revise 
┃2. draft
```

</td><td>

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

### [Scenario25](../spec/scenarios.md#scenario25)

> enter "Shop closes at six."

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

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

</td><td>

```buffer
- [ ] milk
- [ ] bread
  - two loaves

Shop closes at six.┃
```

</td></tr>
</table>

### [ShiftEnter5](../spec/shift-enter.md#shiftenter5)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc ┃- def
```

</td><td>

```buffer
- abc 
  ┃- def
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

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc ┃1. def
```

</td><td>

```buffer
- abc 
  ┃1. def
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

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Title ┃===
```

</td><td>

```buffer
Title 
┃===
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

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Title ┃--
```

</td><td>

```buffer
Title 
┃--
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

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one ┃<div>
```

</td><td>

```buffer
- one 
  ┃<div>
```

</td><td>

```buffer
- one 
  ┃\<div>
```

</td></tr>
</table>

### [ShiftEnter11](../spec/shift-enter.md#shiftenter11)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- one┃
- two
```

</td></tr>
</table>

> shiftEnter shiftEnter

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  
  ┃
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

> deleteContentBackward

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
  
┃
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

### [ShiftEnter13](../spec/shift-enter.md#shiftenter13)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- ┃one
```

</td></tr>
</table>

> shiftEnter

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- 
  ┃one
```

</td><td>

```buffer
-
  ┃one
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- 
┃one
```

</td><td>

```buffer
- ┃one
```

</td></tr>
</table>

### [ShiftEnter13b](../spec/shift-enter.md#shiftenter13b)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃b
```

</td><td>

```buffer
- a
  - 
    ┃b
```

</td><td>

```buffer
- a

  -
    ┃b
```

</td></tr>
</table>

### [ShiftEnter30](../spec/shift-enter.md#shiftenter30)

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
-  
  ┃``` x
````

</td><td>

````buffer
-
  ┃\``` x
````

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

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

### [ShiftEnter19](../spec/shift-enter.md#shiftenter19)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
a | b ┃|---|---|
```

</td><td>

```buffer
a | b 
┃|---|---|
```

</td><td>

```buffer
a | b 
┃|\---|---|
```

</td></tr>
</table>

### [ShiftEnter20](../spec/shift-enter.md#shiftenter20)

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc
  ┃- def
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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc
┃- def
```

</td><td>

```buffer
- abc┃- def
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
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- one two
  ┃ three
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one two
┃ three
```

</td><td>

```buffer
- one two┃ three
```

</td></tr>
</table>

### [ShiftEnter23](../spec/shift-enter.md#shiftenter23)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
[Note]: this ┃matters a lot
```

</td><td>

```buffer
[Note]: this 
┃matters a lot
```

</td><td>

```buffer
[Note]\: this 
┃matters a lot
```

</td></tr>
</table>

### [ShiftEnter25](../spec/shift-enter.md#shiftenter25)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
p
┃[r]: /u
```

</td><td>

```buffer
p

┃[r]: /u
```

</td><td>

```buffer
p

┃[r]\: /u
```

</td></tr>
</table>

### [ShiftEnter28](../spec/shift-enter.md#shiftenter28)

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- p
  -
  ┃a
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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- p
  -
┃a
```

</td><td>

```buffer
- p
  -┃a
```

</td></tr>
</table>

### [ShiftEnter32](../spec/shift-enter.md#shiftenter32)

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
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

### [ShiftEnter33](../spec/shift-enter.md#shiftenter33)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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

### [TaskEnter1](../spec/tasks.md#taskenter1)

> enter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- [ ] ┃
```

</td><td>

```buffer
- a
┃
```

</td><td>

```buffer
- a

┃
```

</td></tr>
</table>

### [TaskDelete1](../spec/tasks.md#taskdelete1)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- [ ] b
```

</td><td>

```buffer
- a┃- [ ] b
```

</td><td>

```buffer
- a┃b
```

</td></tr>
</table>

### [TaskDelete2](../spec/tasks.md#taskdelete2)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
- [x] a
```

</td><td>

```buffer
- ┃- [x] a
```

</td><td>

```buffer
- [x] ┃a
```

</td></tr>
</table>

### [TaskDelete3](../spec/tasks.md#taskdelete3)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- [ ] 
```

</td><td>

```buffer
- a┃- [ ] 
```

</td><td>

```buffer
- a┃
```

</td></tr>
</table>

### [Undo3](../spec/undo.md#undo3)

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

```buffer
- a┃
  - 
```

</td><td>

```buffer
- a┃

  - 
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

## Whitespace (32)

### [Enter55](../spec/enter.md#enter55)

> enter

Adapted: under enterAtTextStart: stay

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
#┃ Title
```

</td><td>

```buffer
#
┃Title
```

</td><td>

```buffer
# 
┃Title
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
#┃ Title
```

</td><td>

```buffer
# 
┃Title
```

</td></tr>
</table>

### [Gap18](../spec/gaps.md#gap18)

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer

┃
a
```

</td><td>

```buffer
┃

a
```

</td></tr>
</table>

> indent

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer

  ┃
a
```

</td><td>

```buffer
┃

a
```

</td></tr>
</table>

### [Indent10](../spec/indent.md#indent10)

> indent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
  - a┃
- b
```

</td><td>

```buffer
- a┃
- b
```

</td></tr>
</table>

### [Indent11](../spec/indent.md#indent11)

> indent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Intro

- a┃
```

</td><td>

```buffer
Intro

  - a┃
```

</td><td>

```buffer
Intro

- a┃
```

</td></tr>
</table>

### [Indent24](../spec/indent.md#indent24)

> indent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# A
###### B┃
```

</td><td>

```buffer
# A
  ###### B┃
```

</td><td>

```buffer
# A
###### B┃
```

</td></tr>
</table>

### [Indent33](../spec/indent.md#indent33)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- x
- a┃
   b
```

</td></tr>
</table>

> indent

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- x
  - a┃
   b
```

</td><td>

```buffer
- x
  - a┃
     b
```

</td></tr>
</table>

> outdent

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- x
- a┃
   b
```

</td></tr>
</table>

### [TO-S13](../spec/obsidian-true-outliner.md#to-s13)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a«lpha» beta
```

</td><td>

```buffer
- a
┃ beta
```

</td><td>

```buffer
- a
  ┃ beta
```

</td></tr>
</table>

### [TO-IndentUnit](../spec/obsidian-true-outliner.md#to-indentunit)

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

```buffer
- a
→- x
→- b┃
  cont
```

</td><td>

```buffer
- a
→- x
→- b┃
→  cont
```

</td></tr>
</table>

### [TO-Seamsb](../spec/obsidian-true-outliner.md#to-seamsb)

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

```buffer
- a
- b┃
    > q
```

</td><td>

```buffer
- a
- b┃
  > q
```

</td></tr>
</table>

### [DirectOutdent1](../spec/outdent.md#directoutdent1)

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

```buffer
- a
- b┃
    - b1
  - c
- d
```

</td><td>

```buffer
- a
- b┃
  - b1
  - c
- d
```

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

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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

</td><td>

```buffer
- x
  - y
- z┃
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

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
┃
```

</td><td>

```buffer
- [x]  done
- [ ]  todo┃
```

</td><td>

```buffer
- [x] done
- [ ] todo┃
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

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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

</td><td>

```buffer
line one
line two

p2┃
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

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
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

</td><td>

```buffer
> q1
>
> q2┃
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
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃b
```

</td><td>

```buffer
- ax
y
┃b
```

</td><td>

```buffer
- ax
  y
  ┃b
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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
-  b
   - c
┃
```

</td><td>

```buffer
- b
  - c
```

</td></tr>
</table>

### [Quote1](../spec/quotes.md#quote1)

> indent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- > - a
  > - b┃
```

</td><td>

```buffer
- > - a
  > →- b┃
```

</td><td>

```buffer
- > - a
  >   - b┃
```

</td></tr>
</table>

### [Quote2](../spec/quotes.md#quote2)

> indent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a
> - b┃
```

</td><td>

```buffer
> - a
> →- b┃
```

</td><td>

```buffer
> - a
>   - b┃
```

</td></tr>
</table>

### [Quote3](../spec/quotes.md#quote3)

> indent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
>- a
>- b┃
```

</td><td>

```buffer
>- a
>→- b┃
```

</td><td>

```buffer
>- a
>   - b┃
```

</td></tr>
</table>

### [Quote5](../spec/quotes.md#quote5)

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

```buffer
- x
  > - a
  > →- b┃
```

</td><td>

```buffer
- x
  > - a
  >   - b┃
```

</td></tr>
</table>

### [Quote6](../spec/quotes.md#quote6)

> indent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> > - a
> > - b┃
```

</td><td>

```buffer
> > - a
> > →- b┃
```

</td><td>

```buffer
> > - a
> >   - b┃
```

</td></tr>
</table>

### [Quote7](../spec/quotes.md#quote7)

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

```buffer
> [!note] Title
> - a
> →- b┃
```

</td><td>

```buffer
> [!note] Title
> - a
>   - b┃
```

</td></tr>
</table>

### [Quote8](../spec/quotes.md#quote8)

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

```buffer
> - a
> →- b┃
c
```

</td><td>

```buffer
> - a
>   - b┃
c
```

</td></tr>
</table>

### [Quote37](../spec/quotes.md#quote37)

> enter

Adapted: under enterAtTextStart: stay

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> a
>
> ┃b
```

</td><td>

```buffer
> a
>
> 
> ┃b
```

</td><td>

```buffer
> a
>
>
> ┃b
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> a
>
> ┃b
```

</td><td>

```buffer
> a
>
>
> ┃b
```

</td></tr>
</table>

### [Quote64](../spec/quotes.md#quote64)

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

```buffer
> # H
> - a
> →- b┃
```

</td><td>

```buffer
> # H
> - a
>   - b┃
```

</td></tr>
</table>

### [Quote91](../spec/quotes.md#quote91)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
>- a┃b
```

</td><td>

```buffer
>- a
>  ┃b
```

</td><td>

```buffer
>- a
>   ┃b
```

</td></tr>
</table>

### [Quote95](../spec/quotes.md#quote95)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
>- a
>   - ┃b
```

</td><td>

```buffer
>- a
> - ┃b
```

</td><td>

```buffer
>- a
>- ┃b
```

</td></tr>
</table>

### [ShiftEnter10](../spec/shift-enter.md#shiftenter10)

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

> "x"

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  
  x┃bc
```

</td><td>

```buffer
- a

  x┃bc
```

</td></tr>
</table>

### [ShiftEnter14](../spec/shift-enter.md#shiftenter14)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Title┃ more
```

</td><td>

```buffer
# Title
┃ more
```

</td><td>

```buffer
# Title
┃more
```

</td></tr>
</table>

### [ShiftEnter15](../spec/shift-enter.md#shiftenter15)

> shiftEnter shiftEnter "p"

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one┃
```

</td><td>

```buffer
- one
  
  p┃
```

</td><td>

```buffer
- one

  p┃
```

</td></tr>
</table>

### [ShiftEnter27](../spec/shift-enter.md#shiftenter27)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a«bc
- de»f
```

</td><td>

```buffer
- a
┃f
```

</td><td>

```buffer
- a
  ┃f
```

</td></tr>
</table>

## Caret (21)

### [SoftBackspace8](../spec/backspace.md#softbackspace8)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- [ ] t┃
  m
```

</td></tr>
</table>

> deleteSoftLineBackward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- [ ] ┃
  m
```

</td></tr>
</table>

> cursorLineDown

<table>
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] 
  ┃m
```

</td><td>

```buffer
- [ ] 
  m┃
```

</td></tr>
</table>

### [CursorUp1](../spec/cursor.md#cursorup1)

> cursorLineUp

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
ab┃
```

</td><td>

```buffer
ab
```

</td><td>

```buffer
┃ab
```

</td></tr>
</table>

### [CursorUp2](../spec/cursor.md#cursorup2)

> cursorLineUp

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
## Title
- ┃a
```

</td><td>

```buffer
## Ti┃tle
- a
```

</td><td>

```buffer
## ┃Title
- a
```

</td></tr>
</table>

### [CursorUp3](../spec/cursor.md#cursorup3)

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

```buffer
- a
  ┃  - b
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

### [CursorDown3](../spec/cursor.md#cursordown3)

> cursorLineDown

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃a
  - b
```

</td><td>

```buffer
- a
  ┃- b
```

</td><td>

```buffer
- a
  - ┃b
```

</td></tr>
</table>

### [CursorHome3](../spec/cursor.md#cursorhome3)

> cursorLineBoundaryBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
┃- one two
```

</td><td>

```buffer
┃- one two
```

</td><td>

```buffer
- ┃one two
```

</td></tr>
</table>

### [CursorHome4](../spec/cursor.md#cursorhome4)

> cursorLineBoundaryBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
-┃ one
```

</td><td>

```buffer
┃- one
```

</td><td>

```buffer
- ┃one
```

</td></tr>
</table>

### [CursorHome10](../spec/cursor.md#cursorhome10)

> cursorLineBoundaryBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
## Title┃
```

</td><td>

```buffer
┃## Title
```

</td><td>

```buffer
## ┃Title
```

</td></tr>
</table>

### [CursorHome15](../spec/cursor.md#cursorhome15)

> cursorLineBoundaryBackward

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
┃- [ ] 
```

</td><td>

```buffer
┃- [ ] 
```

</td><td>

```buffer
- [ ] ┃
```

</td></tr>
</table>

### [CursorHome17](../spec/cursor.md#cursorhome17)

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
<tr><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> ┃[!note] Title
```

</td><td>

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

### [Enter55b](../spec/enter.md#enter55b)

> enter

Adapted: under enterAtTextStart: stay

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
p

┃# Title
```

</td><td>

```buffer
p


┃# Title
```

</td><td>

```buffer
p


# ┃Title
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
p

┃# Title
```

</td><td>

```buffer
p


# ┃Title
```

</td></tr>
</table>

### [Fence13](../spec/fences.md#fence13)

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

````buffer
- a
  ```
  code
  
  ┃```
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

### [Fence41](../spec/fences.md#fence41)

> shiftEnter

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

````buffer
- a
  ```
  code
  
  ┃```
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

### [Indent28](../spec/indent.md#indent28)

> indent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
┃- b
```

</td><td>

```buffer
- a
  ┃- b
```

</td><td>

```buffer
- a
  - ┃b
```

</td></tr>
</table>

### [MoveDown32](../spec/move-subtree-down.md#movedown32)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
┃- a
- b
```

</td><td>

```buffer
- b
┃- a
```

</td><td>

```buffer
- b
- ┃a
```

</td></tr>
</table>

### [MoveUp34](../spec/move-subtree-up.md#moveup34)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
┃- b
```

</td><td>

```buffer
┃- b
- a
```

</td><td>

```buffer
- ┃b
- a
```

</td></tr>
</table>

### [MoveUp37](../spec/move-subtree-up.md#moveup37)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃$$
```

</td><td>

```buffer
- ┃$$
- a
```

</td><td>

```buffer
- $$┃
- a
```

</td></tr>
</table>

### [Outdent14](../spec/outdent.md#outdent14)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  ┃- b
```

</td><td>

```buffer
- a
┃- b
```

</td><td>

```buffer
- a
- ┃b
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

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
┃
```

</td><td>

````buffer
```js
let a = 1;
let b = 2;
```┃
````

</td><td>

````buffer
```js
let a = 1;
let b = 2;┃
```
````

</td></tr>
</table>

### [Quote84](../spec/quotes.md#quote84)

> enter

Adapted: under flavor: obsidian

<table>
<tr><th>buffer</th><th>obsidian-lp</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> [!note] Title
┃two
lines
```

</td><td>

```buffer
> [!note] Title

┃two
lines
```

</td><td>

```buffer
> [!note] Title
┃
two
lines
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
> [!note] Title
┃
two
lines
```

</td></tr>
</table>

## Skipped (184)

| example | why |
| --- | --- |
| **backspace.md** | |
| [Backspace17f](../spec/backspace.md#backspace17f) | option emptyItemWithChildren: refuse |
| [Backspace17g](../spec/backspace.md#backspace17g) | option emptyItemWithChildren: refuse |
| [Backspace17h](../spec/backspace.md#backspace17h) | option emptyItemWithChildren: refuse |
| [Backspace18b](../spec/backspace.md#backspace18b) | option headingEditing: block |
| [Backspace18f](../spec/backspace.md#backspace18f) | option headingEditing: block |
| [Backspace34](../spec/backspace.md#backspace34) | option backspaceAtTopItem: refuse |
| [Backspace42b](../spec/backspace.md#backspace42b) | option markup: decorated |
| [Backspace45b](../spec/backspace.md#backspace45b) | option joinWithChildren: refuse |
| [Backspace50](../spec/backspace.md#backspace50) | option backspaceAtItemStart: body |
| [Backspace50b](../spec/backspace.md#backspace50b) | option backspaceAtItemStart: unwrap |
| **backtick.md** | |
| [Backtick7](../spec/backtick.md#backtick7) | option markup: decorated |
| [Backtick8](../spec/backtick.md#backtick8) | option closeBackticks: none |
| [Backtick11](../spec/backtick.md#backtick11) | option closeBackticks: none |
| [Backtick13](../spec/backtick.md#backtick13) | option markup: decorated |
| [Backtick15](../spec/backtick.md#backtick15) | caret right after a backtick at a line's end (Live Preview moves it before the run) |
| [Backtick16](../spec/backtick.md#backtick16) | option markup: decorated |
| [Backtick17](../spec/backtick.md#backtick17) | caret right after a backtick at a line's end (Live Preview moves it before the run) |
| [Backtick31](../spec/backtick.md#backtick31) | option markup: decorated |
| [Backtick32](../spec/backtick.md#backtick32) | caret before a code span's closing backticks (Live Preview moves it past them) |
| **copy.md** | |
| [Copy4](../spec/copy.md#copy4) | nothing to compare |
| [Copy5](../spec/copy.md#copy5) | option copySelection: nodes |
| [Copy6](../spec/copy.md#copy6) | nothing to compare |
| [Copy7](../spec/copy.md#copy7) | option copySelection: nodes |
| [Copy8](../spec/copy.md#copy8) | nothing to compare |
| [Copy9](../spec/copy.md#copy9) | nothing to compare |
| [Cut3](../spec/copy.md#cut3) | option copySelection: nodes |
| **cursor.md** | |
| [CursorLeft2](../spec/cursor.md#cursorleft2) | CR line endings |
| **delete-subtree.md** | |
| [DeleteSubtree1](../spec/delete-subtree.md#deletesubtree1) | action deleteSubtree |
| [DeleteSubtree2](../spec/delete-subtree.md#deletesubtree2) | action deleteSubtree |
| [DeleteSubtree3](../spec/delete-subtree.md#deletesubtree3) | action deleteSubtree |
| [DeleteSubtree4](../spec/delete-subtree.md#deletesubtree4) | action deleteSubtree |
| [DeleteSubtree5](../spec/delete-subtree.md#deletesubtree5) | action deleteSubtree |
| [DeleteSubtree6](../spec/delete-subtree.md#deletesubtree6) | action deleteSubtree |
| [DeleteSubtree7](../spec/delete-subtree.md#deletesubtree7) | action deleteSubtree |
| [DeleteSubtree8](../spec/delete-subtree.md#deletesubtree8) | action deleteSubtree |
| [DeleteSubtree9](../spec/delete-subtree.md#deletesubtree9) | action deleteSubtree |
| [DeleteSubtree10](../spec/delete-subtree.md#deletesubtree10) | action deleteSubtree |
| [DeleteSubtree11](../spec/delete-subtree.md#deletesubtree11) | action deleteSubtree |
| [DeleteSubtree12](../spec/delete-subtree.md#deletesubtree12) | action deleteSubtree |
| [DeleteSubtree13](../spec/delete-subtree.md#deletesubtree13) | action deleteSubtree |
| **delete.md** | |
| [Delete5e](../spec/delete.md#delete5e) | option emptyItemWithChildren: refuse |
| [Delete5f](../spec/delete.md#delete5f) | option emptyItemWithChildren: refuse |
| [Delete13b](../spec/delete.md#delete13b) | option headingEditing: block |
| [Delete13d](../spec/delete.md#delete13d) | option headingEditing: block |
| [Delete13f](../spec/delete.md#delete13f) | option headingEditing: block |
| [Delete16](../spec/delete.md#delete16) | option markup: decorated |
| [Delete16b](../spec/delete.md#delete16b) | option markup: decorated |
| [Delete16c](../spec/delete.md#delete16c) | option markup: decorated |
| [Delete16d](../spec/delete.md#delete16d) | option markup: decorated |
| [Delete16e](../spec/delete.md#delete16e) | option markup: decorated |
| [Delete16f](../spec/delete.md#delete16f) | option markup: decorated |
| [Delete19](../spec/delete.md#delete19) | option markup: decorated |
| [Delete31b](../spec/delete.md#delete31b) | option joinWithChildren: refuse |
| [Delete34](../spec/delete.md#delete34) | nothing to compare |
| **duplicate-subtree.md** | |
| [DuplicateSubtree1](../spec/duplicate-subtree.md#duplicatesubtree1) | action duplicateSubtree |
| [DuplicateSubtree2](../spec/duplicate-subtree.md#duplicatesubtree2) | action duplicateSubtree |
| [DuplicateSubtree3](../spec/duplicate-subtree.md#duplicatesubtree3) | action duplicateSubtree |
| [DuplicateSubtree4](../spec/duplicate-subtree.md#duplicatesubtree4) | action duplicateSubtree |
| [DuplicateSubtree5](../spec/duplicate-subtree.md#duplicatesubtree5) | action duplicateSubtree |
| [DuplicateSubtree6](../spec/duplicate-subtree.md#duplicatesubtree6) | action duplicateSubtree |
| [DuplicateSubtree7](../spec/duplicate-subtree.md#duplicatesubtree7) | action duplicateSubtree |
| [DuplicateSubtree8](../spec/duplicate-subtree.md#duplicatesubtree8) | action duplicateSubtree |
| [DuplicateSubtree9](../spec/duplicate-subtree.md#duplicatesubtree9) | option closeBackticks: none |
| [DuplicateSubtree10](../spec/duplicate-subtree.md#duplicatesubtree10) | action duplicateSubtree |
| **enter.md** | |
| [Enter3b](../spec/enter.md#enter3b) | option enterMidItem: child |
| [Enter7c](../spec/enter.md#enter7c) | option enterOnEmptyItem: unwrap |
| [Enter17](../spec/enter.md#enter17) | CR line endings |
| [Enter18](../spec/enter.md#enter18) | CR line endings |
| [Enter21b](../spec/enter.md#enter21b) | option enterOnEmptyItem: unwrap |
| [Enter27b](../spec/enter.md#enter27b) | option enterOnEmptyItem: unwrap |
| [Enter30](../spec/enter.md#enter30) | option outdent: logical |
| [Enter65](../spec/enter.md#enter65) | option enterSplitSpace: start |
| [Enter65b](../spec/enter.md#enter65b) | option enterSplitSpace: start |
| [Enter65c](../spec/enter.md#enter65c) | option enterSplitSpace: start |
| [Enter65d](../spec/enter.md#enter65d) | option enterSplitSpace: start |
| [Enter65e](../spec/enter.md#enter65e) | option enterSplitSpace: start |
| [Enter65f](../spec/enter.md#enter65f) | option enterSplitSpace: start |
| [Enter65g](../spec/enter.md#enter65g) | option enterSplitSpace: start |
| [Enter65h](../spec/enter.md#enter65h) | option enterSplitSpace: start |
| [Enter65i](../spec/enter.md#enter65i) | option enterSplitSpace: start |
| [Enter65j](../spec/enter.md#enter65j) | option enterSplitSpace: start |
| [Enter65k](../spec/enter.md#enter65k) | option enterSplitSpace: start |
| [Enter65l](../spec/enter.md#enter65l) | option enterSplitSpace: start |
| [Enter65m](../spec/enter.md#enter65m) | option enterSplitSpace: start |
| [Enter49](../spec/enter.md#enter49) | caret in a table (Live Preview edits it in a table of its own) |
| [Enter50](../spec/enter.md#enter50) | caret in a table (Live Preview edits it in a table of its own) |
| [Enter54](../spec/enter.md#enter54) | caret in a task's checkbox (Live Preview draws it) |
| [Enter54b](../spec/enter.md#enter54b) | caret in a task's checkbox (Live Preview draws it) |
| [Enter63](../spec/enter.md#enter63) | option enterOnEmptyItem: exit |
| [Enter63b](../spec/enter.md#enter63b) | option enterOnEmptyItem: exit |
| **fences.md** | |
| [Fence10](../spec/fences.md#fence10) | option handleFenceContents: false |
| [Fence11](../spec/fences.md#fence11) | option handleFenceContents: false |
| [Fence21](../spec/fences.md#fence21) | nothing to compare |
| [Fence32b](../spec/fences.md#fence32b) | option markup: decorated |
| **gaps.md** | |
| [Gap19](../spec/gaps.md#gap19) | caret in the frontmatter (Live Preview shows it as properties) |
| **indent.md** | |
| [Indent17](../spec/indent.md#indent17) | CR line endings |
| [Indent18](../spec/indent.md#indent18) | option bullet: + |
| [Indent31b](../spec/indent.md#indent31b) | option markup: decorated |
| [Indent32](../spec/indent.md#indent32) | CR line endings |
| **move-subtree-up.md** | |
| [MoveUp41](../spec/move-subtree-up.md#moveup41) | option closeBackticks: none |
| **obsidian-true-outliner.md** | |
| [TO-E7-E8](../spec/obsidian-true-outliner.md#to-e7-e8) | option enterMidItem: child |
| [TO-E11](../spec/obsidian-true-outliner.md#to-e11) | option enterMidItem: child |
| [TO1](../spec/obsidian-true-outliner.md#to1) | option markup: decorated |
| [TO7](../spec/obsidian-true-outliner.md#to7) | option outdent: logical |
| **outdent.md** | |
| [LogicalOutdent1](../spec/outdent.md#logicaloutdent1) | option outdent: logical |
| [LogicalOutdent2](../spec/outdent.md#logicaloutdent2) | option outdent: logical |
| [LogicalOutdent3](../spec/outdent.md#logicaloutdent3) | option outdent: logical |
| [LogicalOutdent4](../spec/outdent.md#logicaloutdent4) | option outdent: logical |
| [LogicalOutdent6](../spec/outdent.md#logicaloutdent6) | option outdent: logical |
| [LogicalOutdent5](../spec/outdent.md#logicaloutdent5) | option outdent: logical |
| [Outdent17b](../spec/outdent.md#outdent17b) | option outdent: logical |
| [Outdent19b](../spec/outdent.md#outdent19b) | option markup: decorated |
| **paste-list-form.md** | |
| [PasteListForm6](../spec/paste-list-form.md#pastelistform6) | option pasteListForm: own |
| **paste-list.md** | |
| [PasteList7b](../spec/paste-list.md#pastelist7b) | option enterTask: plain |
| [PasteList18](../spec/paste-list.md#pastelist18) | option pasteOnParent: after |
| [PasteList19](../spec/paste-list.md#pastelist19) | option pasteOnParent: after |
| [PasteList20](../spec/paste-list.md#pastelist20) | option pasteAtTextStart: before |
| [PasteList21](../spec/paste-list.md#pastelist21) | option pasteParagraphList: children |
| [PasteList22](../spec/paste-list.md#pastelist22) | option pasteSeams: open |
| [PasteList23](../spec/paste-list.md#pastelist23) | option pasteSeams: open |
| [PasteList24](../spec/paste-list.md#pastelist24) | option pasteSeams: open |
| **paste-plain.md** | |
| [PastePlain31](../spec/paste-plain.md#pasteplain31) | option pastePlainLines: enter |
| [PastePlain32](../spec/paste-plain.md#pasteplain32) | option pastePlainLines: items |
| [PastePlain33](../spec/paste-plain.md#pasteplain33) | option pastePlainLines: items |
| [PastePlain33b](../spec/paste-plain.md#pasteplain33b) | option pastePlainLines: items |
| [PastePlain33c](../spec/paste-plain.md#pasteplain33c) | option pastePlainLines: items |
| [PastePlain34](../spec/paste-plain.md#pasteplain34) | nothing to compare |
| **paste.md** | |
| [Paste4b](../spec/paste.md#paste4b) | option pasteSeams: open |
| [Paste17b](../spec/paste.md#paste17b) | option pasteOverSelection: ignore |
| [Paste17c](../spec/paste.md#paste17c) | option pasteOverSelection: ignore |
| [Paste17d](../spec/paste.md#paste17d) | option pasteOverSelection: ignore |
| [Paste17e](../spec/paste.md#paste17e) | option pasteOverSelection: ignore |
| [Paste17f](../spec/paste.md#paste17f) | option pasteOverSelection: ignore |
| [Paste17g](../spec/paste.md#paste17g) | option pasteOverSelection: ignore |
| [Paste18](../spec/paste.md#paste18) | option pasteLines: items |
| [Paste19](../spec/paste.md#paste19) | option pasteLines: items |
| [Paste20](../spec/paste.md#paste20) | option pasteAtTextStart: before |
| [Paste21](../spec/paste.md#paste21) | option pasteSeams: open |
| [Paste24b](../spec/paste.md#paste24b) | option pasteSeams: open |
| [Paste26b](../spec/paste.md#paste26b) | option pasteSeams: open |
| **placeholders.md** | |
| [Placeholder20](../spec/placeholders.md#placeholder20) | option enterSplitSpace: start |
| **quirks.md** | |
| [Quirk1](../spec/quirks.md#quirk1) | option quirkEnterMidHeading: workflowy |
| [Quirk1b](../spec/quirks.md#quirk1b) | option quirkEnterMidHeading: workflowy |
| [Quirk1c](../spec/quirks.md#quirk1c) | option quirkEnterMidHeading: workflowy |
| [Quirk2](../spec/quirks.md#quirk2) | option quirkPasteCaret: roam |
| [Quirk2b](../spec/quirks.md#quirk2b) | option quirkPasteCaret: athens |
| [Quirk3](../spec/quirks.md#quirk3) | option backspaceAtItemStart: logseq |
| [Quirk4](../spec/quirks.md#quirk4) | option quirkPasteText: dynalist |
| **quotes.md** | |
| [Quote12b](../spec/quotes.md#quote12b) | option outdent: logical |
| [Quote20](../spec/quotes.md#quote20) | option outdent: logical |
| [Quote43b](../spec/quotes.md#quote43b) | option markup: decorated |
| [Quote55](../spec/quotes.md#quote55) | option backspaceAtTopItem: refuse |
| [Quote82](../spec/quotes.md#quote82) | action deleteSubtree |
| [Quote86](../spec/quotes.md#quote86) | action duplicateSubtree |
| [Quote96](../spec/quotes.md#quote96) | action duplicateSubtree |
| **regressions.md** | |
| [Regression16](../spec/regressions.md#regression16) | option enterMidItem: child |
| [Regression18](../spec/regressions.md#regression18) | option headingEditing: block |
| [Regression19](../spec/regressions.md#regression19) | option headingEditing: block |
| [Regression20](../spec/regressions.md#regression20) | option joinWithChildren: refuse |
| [Regression21](../spec/regressions.md#regression21) | option pasteLines: items |
| [Regression22](../spec/regressions.md#regression22) | option pastePlainLines: items |
| **scenarios.md** | |
| [Scenario10](../spec/scenarios.md#scenario10) | action deleteSubtree |
| [Scenario17](../spec/scenarios.md#scenario17) | option pasteLines: items |
| **shift-enter.md** | |
| [ShiftEnter16](../spec/shift-enter.md#shiftenter16) | CR line endings |
| [ShiftEnter22b](../spec/shift-enter.md#shiftenter22b) | option markup: decorated |
| [ShiftEnter24](../spec/shift-enter.md#shiftenter24) | caret in a table (Live Preview edits it in a table of its own) |
| [ShiftEnter26](../spec/shift-enter.md#shiftenter26) | caret in a task's checkbox (Live Preview draws it) |
| [ShiftEnter26b](../spec/shift-enter.md#shiftenter26b) | option markup: decorated |
| **tasks.md** | |
| [TaskEnter9](../spec/tasks.md#taskenter9) | option enterTask: plain |
| [TaskEnter9b](../spec/tasks.md#taskenter9b) | option enterTask: plain |
| [TaskEnter9c](../spec/tasks.md#taskenter9c) | option enterTask: plain |
| [TaskEnter10](../spec/tasks.md#taskenter10) | option enterSplitSpace: start |
| [TaskBackspace1](../spec/tasks.md#taskbackspace1) | option markup: decorated |
| [TaskBackspace3b](../spec/tasks.md#taskbackspace3b) | option taskEditing: unwrap |
| [TaskBackspace3c](../spec/tasks.md#taskbackspace3c) | option taskEditing: unwrap |
| [TaskBackspace4](../spec/tasks.md#taskbackspace4) | option taskEditing: block |
| [TaskBackspace6](../spec/tasks.md#taskbackspace6) | option markup: decorated |
| [TaskBackspace7](../spec/tasks.md#taskbackspace7) | option taskEditing: block |
| [TaskBackspace8](../spec/tasks.md#taskbackspace8) | caret in a task's checkbox (Live Preview draws it) |
| [TaskBackspace8b](../spec/tasks.md#taskbackspace8b) | caret in a task's checkbox (Live Preview draws it) |
| [TaskBackspace9](../spec/tasks.md#taskbackspace9) | caret in a task's checkbox (Live Preview draws it) |
| [TaskBackspace11](../spec/tasks.md#taskbackspace11) | option taskEditing: block |
| [TaskDelete4](../spec/tasks.md#taskdelete4) | caret in a task's checkbox (Live Preview draws it) |
| **z-open.md** | |
| [Open2](../spec/z-open.md#open2) | action deleteSubtree |
