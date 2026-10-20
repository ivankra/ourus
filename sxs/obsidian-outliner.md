---
type: "SxS"
app: "obsidian-outliner"
version: "1.14.4, obsidian-outliner 4.10.2"
url: "app://obsidian.md/"
model: "text"
command: "node sxs/run.ts obsidian-outliner"
elapsed_s: 445
workers: 2
---

# Obsidian (Outliner) vs ourus

Summary:

| agree | caret | whitespace | disagree | error | skipped | total |
| --- | --- | --- | --- | --- | --- | --- |
| **248 (27%)** | **[26](#caret-26) (2.9%)** | **[28](#whitespace-28) (3.1%)** | **[474](#disagree-474) (52%)** | **0 (0%)** | **[131](#skipped-131) (14%)** | **907** |

Per-file:

|  | agree | caret | whitespace | disagree | error | skipped | total |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [backspace.md](../spec/backspace.md) | 25 |  |  | 47 |  | 6 | **78** |
| [cursor.md](../spec/cursor.md) | 24 | 8 |  |  |  | 4 | **36** |
| [delete-subtree.md](../spec/delete-subtree.md) |  |  |  |  |  | 10 | **10** |
| [delete.md](../spec/delete.md) | 21 |  |  | 16 |  | 15 | **52** |
| [duplicate-subtree.md](../spec/duplicate-subtree.md) |  |  |  |  |  | 8 | **8** |
| [enter.md](../spec/enter.md) | 28 | 2 | 1 | 47 |  | 11 | **89** |
| [fences.md](../spec/fences.md) | 17 | 6 | 1 | 37 |  | 4 | **65** |
| [gaps.md](../spec/gaps.md) | 2 |  | 1 | 15 |  | 1 | **19** |
| [indent.md](../spec/indent.md) | 17 |  | 1 | 12 |  | 6 | **36** |
| [move-subtree-down.md](../spec/move-subtree-down.md) | 12 |  |  | 26 |  | 1 | **39** |
| [move-subtree-up.md](../spec/move-subtree-up.md) | 11 | 2 |  | 25 |  | 2 | **40** |
| [obsidian-true-outliner.md](../spec/obsidian-true-outliner.md) | 27 | 5 | 2 | 29 |  | 4 | **67** |
| [outdent.md](../spec/outdent.md) | 9 |  |  | 23 |  | 3 | **35** |
| [paste-plain.md](../spec/paste-plain.md) | 3 |  | 4 | 21 |  |  | **28** |
| [paste.md](../spec/paste.md) | 4 |  | 4 | 56 |  | 31 | **95** |
| [placeholders.md](../spec/placeholders.md) | 5 |  | 1 | 11 |  |  | **17** |
| [quotes.md](../spec/quotes.md) | 10 |  | 8 | 74 |  | 4 | **96** |
| [scenarios.md](../spec/scenarios.md) | 12 |  |  | 12 |  | 2 | **26** |
| [shift-enter.md](../spec/shift-enter.md) | 4 | 3 | 5 | 16 |  | 6 | **34** |
| [tasks.md](../spec/tasks.md) | 12 |  |  | 4 |  | 12 | **28** |
| [typing.md](../spec/typing.md) | 3 |  |  |  |  |  | **3** |
| [undo.md](../spec/undo.md) | 2 |  |  | 3 |  |  | **5** |
| [z-open.md](../spec/z-open.md) |  |  |  |  |  | 1 | **1** |
| **total** | **248 (27%)** | **26 (2.9%)** | **28 (3.1%)** | **474 (52%)** | **0 (0%)** | **131 (14%)** | **907** |

## Disagree (474)

### [Backspace4](../spec/backspace.md#backspace4)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

### [Backspace10](../spec/backspace.md#backspace10)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

### [Backspace17e](../spec/backspace.md#backspace17e)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

### [Backspace33](../spec/backspace.md#backspace33)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
\[a]:┃b
```

</td></tr>
</table>

### [Backspace39](../spec/backspace.md#backspace39)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
- ┃
p
```

</td><td>

```buffer
- a┃
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

### [Backspace41](../spec/backspace.md#backspace41)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
┃\[a]: tail
```

</td></tr>
</table>

### [SoftBackspace3](../spec/backspace.md#softbackspace3)

> deleteSoftLineBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
abc ┃- x tail
===
```

</td><td>

```buffer
- ┃x tail
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
first
abc ┃- x
===
```

</td><td>

```buffer
first
- ┃x
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- > q┃
  > m
```

</td></tr>
</table>

> deleteSoftLineBackward

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃
  > m
```

</td><td>

```buffer
- > ┃
  > m
```

</td></tr>
</table>

> cursorLineDown

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- 
  ┃> m
```

</td><td>

```buffer
- > ┃m
```

</td></tr>
</table>

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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] 
  ┃m
```

</td><td>

```buffer
- [ ] m┃
```

</td></tr>
</table>

### [SoftBackspace9](../spec/backspace.md#softbackspace9)

> deleteSoftLineBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

### [Backspace44](../spec/backspace.md#backspace44)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- a

- b┃
```

</td></tr>
</table>

### [Delete4](../spec/delete.md#delete4)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃# H
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃ H
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

### [Delete26](../spec/delete.md#delete26)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [a]:┃
- b
```

</td><td>

```buffer
- [a]:┃b
```

</td><td>

```buffer
- \[a]:┃b
```

</td></tr>
</table>

### [Delete30](../spec/delete.md#delete30)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

### [Enter3](../spec/enter.md#enter3)

> enter

Adapted: under enterSplitSpace: start

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃ b
  - c
```

</td><td>

```buffer
- a
- ┃ b
  - c
```

</td><td>

```buffer
- a
- ┃ b
   - c
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃ b
  - c
```

</td><td>

```buffer
- a
- ┃ b
   - c
```

</td></tr>
</table>

### [Enter3c](../spec/enter.md#enter3c)

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

```buffer
1. a
2. ┃ b
   - c
3. d
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

### [Enter6](../spec/enter.md#enter6)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

Adapted: under enterSplitSpace: start

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc ┃- def
```

</td><td>

```buffer
- abc 
- ┃- def
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

Adapted: under enterSplitSpace: start

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

Adapted: under enterSplitSpace: start

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

Adapted: under enterSplitSpace: start

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

┃\[a]: /url
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

### [Enter12](../spec/enter.md#enter12)

> enter

Adapted: under enterSplitSpace: start

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

┃ text
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

┃ text
```

</td></tr>
</table>

### [Enter14](../spec/enter.md#enter14)

> enter enter enter "p"

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

Adapted: under enterSplitSpace: start

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

### [Enter25](../spec/enter.md#enter25)

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

```buffer
1. z
2. ┃
3. a
   - child
4. b
```

</td><td>

```buffer
8. z
9. ┃
10. a
    - child
11. b
```

</td></tr>
</table>

### [Enter26](../spec/enter.md#enter26)

> enter

Adapted: under enterAtTextStart: stay

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
  - c
- ┃
```

</td></tr>
</table>

> enter

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - c
┃
```

</td><td>

```buffer
- a
  - c

┃
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

### [Enter35](../spec/enter.md#enter35)

> enter

Adapted: under enterSplitSpace: start

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. abc ┃2. def
```

</td><td>

```buffer
1. abc 
2. ┃2. def
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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

Adapted: under enterSplitSpace: start

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Title ┃- x
- y
```

</td><td>

```buffer
# Title 
- ┃x
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

Adapted: under enterSplitSpace: start

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
title ┃- x
===
```

</td><td>

```buffer
title 
- ┃x
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc
- ┃- def
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one two
- ┃ three
  - c
```

</td><td>

```buffer
- one two
- ┃ three
   - c
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- one two┃ three
  - c
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one two
- ┃ three
  - c
```

</td><td>

```buffer
- one two
- ┃ three
   - c
```

</td></tr>
</table>

> cursorLineDown

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- one two
-  three
   - ┃c
```

</td></tr>
</table>

### [Enter65g](../spec/enter.md#enter65g)

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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] one two
- [ ] ┃three
```

</td><td>

```buffer
- [ ] one two┃ three
```

</td></tr>
</table>

### [Enter65i](../spec/enter.md#enter65i)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
one two┃ three
```

</td></tr>
</table>

> enter

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
one two
┃three
```

</td><td>

```buffer
one two

┃ three
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
one two┃three
```

</td><td>

```buffer
one two┃ three
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one two
- 
  ┃ three
```

</td><td>

```buffer
- one two
-
  ┃ three
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one two
- 
 ┃three
```

</td><td>

```buffer
- one two
- ┃ three
```

</td></tr>
</table>

### [Enter65l](../spec/enter.md#enter65l)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
# one two┃ three
```

</td></tr>
</table>

> enter

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# one two
┃three
```

</td><td>

```buffer
# one two
┃ three
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# one two┃three
```

</td><td>

```buffer
# one two┃ three
```

</td></tr>
</table>

### [Enter65m](../spec/enter.md#enter65m)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
# one two┃ - x
```

</td></tr>
</table>

> enter

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# one two
- ┃x
```

</td><td>

```buffer
# one two
┃ \- x
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# one two
-┃x
```

</td><td>

```buffer
# one two┃ - x
```

</td></tr>
</table>

### [Enter46](../spec/enter.md#enter46)

> enter

Adapted: under enterAtTextStart: stay

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

> ┃quote
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> ┃quote
```

</td><td>

```buffer

> ┃quote
```

</td></tr>
</table>

### [Enter47](../spec/enter.md#enter47)

Adapted: under enterSplitSpace: start

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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
[Note]: this 
┃matters a lot
```

</td><td>

```buffer
\[Note]: this 

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
\[Note]: this 

┃matters a lot
```

</td><td>

```buffer
[Note]: this ┃matters a lot
```

</td></tr>
</table>

### [Enter48](../spec/enter.md#enter48)

Adapted: under enterSplitSpace: start

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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [a]: b 
- ┃c
```

</td><td>

```buffer
- \[a]: b 
- ┃c
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

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
- \[a]: b 
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

### [Enter60](../spec/enter.md#enter60)

Adapted: under enterSplitSpace: start

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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
title
- ┃x
===
```

</td><td>

```buffer
title
===
┃ \- x
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
title
-┃x
===
```

</td><td>

```buffer
title┃ - x
===
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

### [Enter60b](../spec/enter.md#enter60b)

> enter deleteContentBackward

Adapted: under enterSplitSpace: start

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# title┃ - x
```

</td><td>

```buffer
# title
-┃x
```

</td><td>

```buffer
# title┃ - x
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# title┃ - x
```

</td><td>

```buffer
# title┃ - x
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Plan┃2. draft
```

</td><td>

```buffer
- Plan
- revise ┃2. draft
```

</td><td>

```buffer
- Plan
- revise ┃2\. draft
```

</td></tr>
</table>

### [Fence7d](../spec/fences.md#fence7d)

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

````buffer
- a
  ```
  code
  ```
- ┃

  para
````

</td><td>

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

### [Fence9](../spec/fences.md#fence9)

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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
  
- ┃```
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

### [Fence17](../spec/fences.md#fence17)

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

````buffer
- a
  ```┃one
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

### [Fence19](../spec/fences.md#fence19)

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

````buffer
- a
  ```
  one┃```
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

````buffer
- a
  - b
    ```
    x
    ```
    
  - ┃
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
  one┃```
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
  ```js┃one
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
  ┃```
  one
  ```
````

</td><td>

````buffer
- a┃```
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a
- ┃```
  one
  ```
````

</td><td>

````buffer
- a┃```
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
- ```
  ┃code
  ```
````

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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

### [Fence33](../spec/fences.md#fence33)

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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- a┃
- ```
  one
  ```
````

</td><td>

````buffer
- a┃```
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

````buffer
- a
  ```
  one
  ```┃b
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

### [Fence49](../spec/fences.md#fence49)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
  
- ┃```
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

### [Fence58](../spec/fences.md#fence58)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
  ⍽┃```
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Euler:
  $$
  e^{i\pi}+1=0
- ┃
  $$
```

</td><td>

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

> enter "x"

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Euler:
  $$
  e^{i\pi}+1=0
- x┃
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  $$┃x
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  $$x┃$$
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
- $$
  ┃x
  $$
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- Euler:
- ┃$$
  x
  $$
```

</td><td>

```buffer
- Euler:┃$$
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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

### [Gap1](../spec/gaps.md#gap1)

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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

### [Gap7](../spec/gaps.md#gap7)

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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

```buffer
- t- a
- b┃

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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

b
┃

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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
┃
  b
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

### [Indent3](../spec/indent.md#indent3)

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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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

### [Indent29](../spec/indent.md#indent29)

> indent

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

### [MoveDown1](../spec/move-subtree-down.md#movedown1)

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

```buffer
- a┃
  - a1

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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

### [MoveDown8](../spec/move-subtree-down.md#movedown8)

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

### [MoveDown11](../spec/move-subtree-down.md#movedown11)

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

```buffer
- a
- «b
  - b1
- c»
- d
```

</td><td>

```buffer
- a
- d
- «b
  - b1
- c»
```

</td></tr>
</table>

### [MoveDown12](../spec/move-subtree-down.md#movedown12)

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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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

### [MoveDown14](../spec/move-subtree-down.md#movedown14)

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

```buffer
- «a
  - b»
- c
```

</td><td>

```buffer
- c
- «a
  - b»
```

</td></tr>
</table>

### [MoveDown16](../spec/move-subtree-down.md#movedown16)

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

### [MoveDown18](../spec/move-subtree-down.md#movedown18)

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

### [MoveDown20](../spec/move-subtree-down.md#movedown20)

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
- b
- a┃
  ```
  x

  y
  ```
````

</td></tr>
</table>

### [MoveDown23](../spec/move-subtree-down.md#movedown23)

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

```buffer
1. b
2. a┃
   - x
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para┃
- a

last
```

</td><td>

```buffer
para┃
- a

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

### [MoveDown26](../spec/move-subtree-down.md#movedown26)

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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
pa┃ra
1. a
- b

next
```

</td><td>

```buffer
pa┃ra
1. a
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
9. a┃
10. b
    - x
```

</td><td>

```buffer
1. b
   - x
2. a┃
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- - ┃a
  - b
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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

  x
  ```
  ┃code
  ```
````

</td></tr>
</table>

> moveSubtreeUp

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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

### [MoveDown37](../spec/move-subtree-down.md#movedown37)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
┃
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- b┃
- a



para
```

</td><td>

```buffer
- a
- b┃



para
```

</td></tr>
</table>

### [MoveUp3](../spec/move-subtree-up.md#moveup3)

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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

### [MoveUp7](../spec/move-subtree-up.md#moveup7)

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

### [MoveUp10](../spec/move-subtree-up.md#moveup10)

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

```buffer
- a
- «b
  - b1
- c»
- d
```

</td><td>

```buffer
- «b
  - b1
- c»
- a
- d
```

</td></tr>
</table>

### [MoveUp11](../spec/move-subtree-up.md#moveup11)

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

### [MoveUp12](../spec/move-subtree-up.md#moveup12)

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

````buffer
- b┃
  ```
  x
- a

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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
9. a
   - x
10. b┃
```

</td><td>

```buffer
1. b
2. ┃a
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

### [MoveUp17](../spec/move-subtree-up.md#moveup17)

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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
→- a
┃para
```

</td><td>

```buffer
→- a
┃para
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
---
para┃
```

</td><td>

```buffer
---
para┃
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
[a]: /u
para┃
```

</td><td>

```buffer
[a]: /u
para┃
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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

> moveSubtreeDown

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para
- b
- a┃
```

</td><td>

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

</td></tr>
</table>

### [MoveUp23](../spec/move-subtree-up.md#moveup23)

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

### [MoveUp24](../spec/move-subtree-up.md#moveup24)

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

### [MoveUp25](../spec/move-subtree-up.md#moveup25)

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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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

### [MoveUp29](../spec/move-subtree-up.md#moveup29)

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

### [MoveUp30](../spec/move-subtree-up.md#moveup30)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
[a]: /u
    ┃code
```

</td><td>

```buffer
[a]: /u
    ┃code
```

</td><td>

```buffer
┃code

[a]: /u
```

</td></tr>
</table>

### [MoveUp31](../spec/move-subtree-up.md#moveup31)

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

```buffer
- c
- «a
  - b»
```

</td><td>

```buffer
- «a
  - b»
- c
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para
> q┃
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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

### [MoveUp39](../spec/move-subtree-up.md#moveup39)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one
- two
┃
```

</td><td>

```buffer
- one
- two
┃
```

</td><td>

```buffer
- two┃
- one

```

</td></tr>
</table>

### [Renumbering stops at a delimiter change](../spec/obsidian-true-outliner.md#renumbering-stops-at-a-delimiter-change)

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

### [E9](../spec/obsidian-true-outliner.md#e9)

> enter

Adapted: under enterSplitSpace: start

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

┃ two
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

### [E10](../spec/obsidian-true-outliner.md#e10)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

### [E17](../spec/obsidian-true-outliner.md#e17)

> enter

Adapted: under enterSplitSpace: start

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
┃ world
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

### [E18](../spec/obsidian-true-outliner.md#e18)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

### [#267, E5](../spec/obsidian-true-outliner.md#267-e5)

> enter

Adapted: under enterSplitSpace: start

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

┃ text
> q
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
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

┃ text
> q
```

</td></tr>
</table>

### [Split title above an existing paragraph](../spec/obsidian-true-outliner.md#split-title-above-an-existing-paragraph)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

### [End of heading above a paragraph](../spec/obsidian-true-outliner.md#end-of-heading-above-a-paragraph)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

### [Line break in setext underline refused](../spec/obsidian-true-outliner.md#line-break-in-setext-underline-refused)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

### [Leaving the place removes it](../spec/obsidian-true-outliner.md#leaving-the-place-removes-it)

> shiftEnter cursorDocStart

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

</td><td>

```buffer
┃foo
bar
```

</td></tr>
</table>

### [List starting at 3 keeps its start](../spec/obsidian-true-outliner.md#list-starting-at-3-keeps-its-start)

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

```buffer
1. a┃b
2. c
```

</td><td>

```buffer
3. a┃b
4. c
```

</td></tr>
</table>

### [Indented item keeps its thematic break](../spec/obsidian-true-outliner.md#indented-item-keeps-its-thematic-break)

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

### [Outdented item keeps its code block](../spec/obsidian-true-outliner.md#outdented-item-keeps-its-code-block)

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

### [destination-list-style](../spec/obsidian-true-outliner.md#destination-list-style)

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

### [Block id moves with its paragraph](../spec/obsidian-true-outliner.md#block-id-moves-with-its-paragraph)

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

### [Blank line added below a quote](../spec/obsidian-true-outliner.md#blank-line-added-below-a-quote)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para┃
> q
```

</td><td>

```buffer
para┃
> q
```

</td><td>

```buffer
> q

para┃
```

</td></tr>
</table>

### [No blank line needed after a fence](../spec/obsidian-true-outliner.md#no-blank-line-needed-after-a-fence)

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

````buffer
para┃
```
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

### [No blank line needed before a fence](../spec/obsidian-true-outliner.md#no-blank-line-needed-before-a-fence)

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

````buffer
```
code┃
```
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

### [Carried place removed on leaving](../spec/obsidian-true-outliner.md#carried-place-removed-on-leaving)

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

```buffer
- ┃one
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

### [Doubly indented place removed on leaving](../spec/obsidian-true-outliner.md#doubly-indented-place-removed-on-leaving)

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

```buffer
- ┃one
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

### [Shift-Enter, Tab, then Enter](../spec/obsidian-true-outliner.md#shift-enter-tab-then-enter)

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

### [An empty ordered child kept with a blank line](../spec/obsidian-true-outliner.md#an-empty-ordered-child-kept-with-a-blank-line)

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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. ┃a
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

### [Blank line after the list stays](../spec/obsidian-true-outliner.md#blank-line-after-the-list-stays)

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

```buffer
- ┃foo
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

### [Empty paragraph and blank lines removed](../spec/obsidian-true-outliner.md#empty-paragraph-and-blank-lines-removed)

> enter enter cursorDocStart

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- ┃a

- b
```

</td><td>

```buffer
┃- a
- b
```

</td></tr>
</table>

### [Indented list under paragraph restored](../spec/obsidian-true-outliner.md#indented-list-under-paragraph-restored)

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

### [Pasted list takes space indent unit](../spec/obsidian-true-outliner.md#pasted-list-takes-space-indent-unit)

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

```buffer
- top
  - sib- a
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

### [Pasted list takes tab indent unit](../spec/obsidian-true-outliner.md#pasted-list-takes-tab-indent-unit)

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

```buffer
- top
→- sib- a
    - b
        - c┃
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

### [Pasted quote set off from paragraph](../spec/obsidian-true-outliner.md#pasted-quote-set-off-from-paragraph)

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

```buffer
## Hfirst

> quote┃
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

### [Pasted list and block become children](../spec/obsidian-true-outliner.md#pasted-list-and-block-become-children)

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

```buffer
- top- alpha

> note┃
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

### [Outdent6](../spec/outdent.md#outdent6)

> outdent

Adapted: under outdent: logical

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

  - c

- b┃

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

  - c

- b┃

- d
```

</td></tr>
</table>

### [Outdent7](../spec/outdent.md#outdent7)

> outdent

Adapted: under outdent: logical

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃x
  - 
```

</td><td>

```buffer
- a
  - 
- ┃x
```

</td><td>

```buffer
- a

  - 
- ┃x
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
  - ┃x
  - 
```

</td><td>

```buffer
- a

  - 
- ┃x
```

</td></tr>
</table>

### [Outdent8](../spec/outdent.md#outdent8)

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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
para
- b┃
```

</td></tr>
</table>

### [DirectOutdent2](../spec/outdent.md#directoutdent2)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

Adapted: under outdent: logical

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
- b

a┃
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
- b

a┃
```

</td></tr>
</table>

### [DirectOutdent5](../spec/outdent.md#directoutdent5)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

### [Outdent17](../spec/outdent.md#outdent17)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
\|---|---|
```

</td></tr>
</table>

### [Outdent20b](../spec/outdent.md#outdent20b)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

### [Paste4](../spec/paste-plain.md#paste4)

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

```buffer
- ax
- y
┃b
```

</td><td>

```buffer
- ax
  \- y
  ┃b
```

</td></tr>
</table>

### [Paste6](../spec/paste-plain.md#paste6)

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

```buffer
# Hx
y
┃
```

</td><td>

```buffer
# H┃
```

</td></tr>
</table>

### [Paste22](../spec/paste-plain.md#paste22)

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

````buffer
- code
  ```
  a = 1
  b = 2┃
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

### [Paste30](../spec/paste-plain.md#paste30)

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

```buffer
- ax
2. y┃
```

</td><td>

```buffer
- ax
  2\. y┃
```

</td></tr>
</table>

### [Paste40](../spec/paste-plain.md#paste40)

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

```buffer
- ax

y
┃b
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

### [Paste41](../spec/paste-plain.md#paste41)

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

```buffer
> See x

y
┃here.
```

</td><td>

```buffer
> See x
>
> y
> ┃here.
```

</td></tr>
</table>

### [Paste45](../spec/paste-plain.md#paste45)

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

```buffer
- a$$
x^2
$$
┃b
```

</td><td>

```buffer
- a$$
  x^2
  \$$
  ┃b
```

</td></tr>
</table>

### [Paste55](../spec/paste-plain.md#paste55)

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
> [!note] Ti┃tle
> body
```

</td><td>

```buffer
> [!note] Tix
y
┃tle
> body
```

</td><td>

```buffer
> [!note] Ti┃tle
> body
```

</td></tr>
</table>

### [Paste64](../spec/paste-plain.md#paste64)

> pastePlain

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
- a
- b
```

</td><td>

```buffer
┃words
```

</td><td>

```buffer
- a
- b┃words
```

</td><td>

```buffer
\- a
\- b┃words
```

</td></tr>
</table>

### [Paste68](../spec/paste-plain.md#paste68)

> pastePlain

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
x
```

</td><td>

```buffer
p┃ ---
```

</td><td>

```buffer
px
┃ ---
```

</td><td>

```buffer
px
┃\---
```

</td></tr>
</table>

### [Paste69](../spec/paste-plain.md#paste69)

> pastePlain

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
x
```

</td><td>

```buffer
[a]: ┃b c
```

</td><td>

```buffer
[a]: x
┃b c
```

</td><td>

```buffer
\[a]: x
┃b c
```

</td></tr>
</table>

### [Paste78](../spec/paste-plain.md#paste78)

> pastePlain

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
    first
    second
```

</td><td>

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

### [Paste80](../spec/paste-plain.md#paste80)

> pastePlain

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
. a
b
```

</td><td>

```buffer
1┃
```

</td><td>

```buffer
1. a
b
┃
```

</td><td>

```buffer
1\. a
b
┃
```

</td></tr>
</table>

### [Paste81](../spec/paste-plain.md#paste81)

> pastePlain

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
1. a
2. b
```

</td><td>

```buffer
- 2┃\. y
```

</td><td>

```buffer
- 21. a
2. b
┃\. y
```

</td><td>

```buffer
- 21\. a
  2\. b
  ┃\. y
```

</td></tr>
</table>

### [Paste82](../spec/paste-plain.md#paste82)

> pastePlain

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard

x
```

</td><td>

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

  x┃b
```

</td></tr>
</table>

### [Paste83](../spec/paste-plain.md#paste83)

> pastePlain

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard

x
```

</td><td>

```buffer
┃abc
```

</td><td>

```buffer

x┃abc
```

</td><td>

```buffer
x┃abc
```

</td></tr>
</table>

### [Paste83b](../spec/paste-plain.md#paste83b)

> pastePlain

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard


x
```

</td><td>

```buffer
p

┃abc
```

</td><td>

```buffer
p



x┃abc
```

</td><td>

```buffer
p

x┃abc
```

</td></tr>
</table>

### [Paste84](../spec/paste-plain.md#paste84)

> pastePlain

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard

```

</td><td>

```buffer
p

┃
```

</td><td>

```buffer
p


┃
```

</td><td>

```buffer
p

┃
```

</td></tr>
</table>

### [Paste85](../spec/paste-plain.md#paste85)

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
- a«bc
  de»f
```

</td><td>

```buffer
- ax
- y┃f
```

</td><td>

```buffer
- ax
  \- y┃f
```

</td></tr>
</table>

### [Paste85b](../spec/paste-plain.md#paste85b)

> pastePlain

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
x
# y
```

</td><td>

```buffer
> a«bc
> de»f
```

</td><td>

```buffer
> ax
# y┃f
```

</td><td>

```buffer
> ax
> \# y┃f
```

</td></tr>
</table>

### [Paste91](../spec/paste-plain.md#paste91)

> pastePlain

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

````clipboard
x
```
y
````

</td><td>

````buffer
```
co┃de
```
````

</td><td>

````buffer
```
cox
```
y┃de
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

### [Paste1](../spec/paste.md#paste1)

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

````buffer
para
- a```
c
```┃
- b
````

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

### [Paste2](../spec/paste.md#paste2)

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

### [Paste9](../spec/paste.md#paste9)

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

````buffer
- a
- ```
code
```┃
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

### [Paste11](../spec/paste.md#paste11)

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

````buffer
- a
  - ```
code
```┃
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

### [Paste12](../spec/paste.md#paste12)

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

```buffer
- a
- > q r┃
```

</td><td>

```buffer
- a
- > q
  > r┃
```

</td></tr>
</table>

### [Paste13](../spec/paste.md#paste13)

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

```buffer
- a1. x
2. y┃
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

### [Paste14](../spec/paste.md#paste14)

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

```buffer
- a1. x
2. y┃
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

### [Paste15](../spec/paste.md#paste15)

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

```buffer
- x
2. y┃
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

### [Paste16](../spec/paste.md#paste16)

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

```buffer
1. x
- y┃
1. b
```

</td><td>

```buffer
1. x
2. y┃
3. b
```

</td></tr>
</table>

### [Paste17](../spec/paste.md#paste17)

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

```buffer
- a1. x
    1. x1
2. y┃
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

### [Paste18](../spec/paste.md#paste18)

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

```buffer
1. a1. x
2. y┃
3. b
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

### [Paste19](../spec/paste.md#paste19)

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

```buffer
- a# h

text┃
```

</td><td>

```buffer
- a
- # h
  text┃
```

</td></tr>
</table>

### [Paste20](../spec/paste.md#paste20)

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

```buffer
Notes- p
- q┃

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

### [Paste21](../spec/paste.md#paste21)

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

```buffer
Notes- p
- q┃
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

### [Paste23](../spec/paste.md#paste23)

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

````buffer
> ```
> x- a
- b┃
> ```
````

</td><td>

````buffer
> ```
> x- a
> - b┃
> ```
````

</td></tr>
</table>

### [Paste25](../spec/paste.md#paste25)

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

````buffer
- a```
c
```┃
  - kid
- b
````

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

### [Paste26](../spec/paste.md#paste26)

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

```buffer
- a- x┃
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

### [Paste27](../spec/paste.md#paste27)

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

```buffer
- [ ] t- a
- b┃
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

### [Paste28](../spec/paste.md#paste28)

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

```buffer
- a> [!note] t body┃
- b
```

</td><td>

```buffer
- a
  > [!note] t
  > body┃
- b
```

</td></tr>
</table>

### [Paste29](../spec/paste.md#paste29)

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

```buffer
- top- alpha

> note┃
- next
```

</td><td>

```buffer
- top
- alpha
  > note┃
- next
```

</td></tr>
</table>

### [Paste32](../spec/paste.md#paste32)

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

```buffer
para# h┃
```

</td><td>

```buffer
para

# h┃
```

</td></tr>
</table>

### [Paste33](../spec/paste.md#paste33)

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

```buffer
## A

para## h┃
```

</td><td>

```buffer
## A

para

## h┃
```

</td></tr>
</table>

### [Paste34](../spec/paste.md#paste34)

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

```buffer
para# h┃

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

### [Paste35](../spec/paste.md#paste35)

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

```buffer
## A

para## h┃

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

### [Paste36](../spec/paste.md#paste36)

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

```buffer
- list
  - See x

- y┃here.
```

</td><td>

```buffer
- list
  - See x
  - y
  - ┃here.
```

</td></tr>
</table>

### [Paste37](../spec/paste.md#paste37)

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

```buffer
See x

- y┃here.
```

</td><td>

```buffer
See x
- y

┃here.
```

</td></tr>
</table>

### [Paste42](../spec/paste.md#paste42)

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

```buffer
- a- x
- y┃b
  - child
```

</td><td>

```buffer
- ax
- y
- ┃b
  - child
```

</td></tr>
</table>

### [Paste44](../spec/paste.md#paste44)

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

```buffer
- a
- $$
x^2
$$
┃
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

### [Paste46](../spec/paste.md#paste46)

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

```````buffer
- list
  ```js
  code
  ``````js
code
```┃
```````

</td><td>

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

### [Paste47](../spec/paste.md#paste47)

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

````buffer
```
x
```one
two
┃
````

</td><td>

````buffer
```
x
```

one
two┃
````

</td></tr>
</table>

### [Paste50](../spec/paste.md#paste50)

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
- al«pha
- be»ta
```

</td><td>

```buffer
- al- x
- y┃ta
```

</td><td>

```buffer
- alx
- y
- ┃ta
```

</td></tr>
</table>

### [Paste51](../spec/paste.md#paste51)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
x
```

</td><td>

```buffer
- see ┃- below
```

</td><td>

```buffer
- see x
- ┃below
```

</td><td>

```buffer
- see x
  ┃\- below
```

</td></tr>
</table>

### [Paste52](../spec/paste.md#paste52)

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
- ┃
  - kid
```

</td><td>

````buffer
- ```
code
```┃
  - kid
````

</td><td>

````buffer
- ```
  code┃
  ```
  - kid
````

</td></tr>
</table>

### [Paste53](../spec/paste.md#paste53)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
Title
=====
```

</td><td>

```buffer
para┃
```

</td><td>

```buffer
para# Title┃
```

</td><td>

```buffer
para

Title┃
=====
```

</td></tr>
</table>

### [Paste54](../spec/paste.md#paste54)

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
# Hel┃lo
```

</td><td>

```buffer
# Helx
y
┃lo
```

</td><td>

```buffer
# Hello

x
y┃
```

</td></tr>
</table>

### [Paste57](../spec/paste.md#paste57)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
## Summary

The fix:
- parser
- test
```

</td><td>

```buffer
- Notes┃
- Later
```

</td><td>

```buffer
- Notes## Summary

The fix:

- parser
- test┃
- Later
```

</td><td>

```buffer
- Notes
- ## Summary
  The fix:
  - parser
  - test┃
- Later
```

</td></tr>
</table>

### [Paste58](../spec/paste.md#paste58)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
---
title: x
---
```

</td><td>

```buffer
Intro

┃

Outro
```

</td><td>

```buffer
Intro

---
title: x
---
┃

Outro
```

</td><td>

```buffer
Intro

---
title: x┃
---

Outro
```

</td></tr>
</table>

### [Paste59](../spec/paste.md#paste59)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
- milk
- eggs
```

</td><td>

```buffer
# Groceries┃

- bread
```

</td><td>

```buffer
# Groceries- milk
- eggs┃

- bread
```

</td><td>

```buffer
# Groceries

- milk
- eggs┃
- bread
```

</td></tr>
</table>

### [Paste60](../spec/paste.md#paste60)

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
- a

- ┃
```

</td><td>

```buffer
- a

- x
- y┃
```

</td><td>

```buffer
- a

- x

- y┃
```

</td></tr>
</table>

### [Paste61](../spec/paste.md#paste61)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
# Z
```

</td><td>

```buffer
# A
## B
text┃
## C
```

</td><td>

```buffer
# A
## B
text# Z┃
## C
```

</td><td>

```buffer
# A
## B
text
# Z┃
## C
```

</td></tr>
</table>

### [Paste62](../spec/paste.md#paste62)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

````clipboard
```
make build
```
````

</td><td>

```buffer
Run ┃then deploy.
```

</td><td>

````buffer
Run ```
make build
```┃then deploy.
````

</td><td>

````buffer
Run
```
make build
```

┃then deploy.
````

</td></tr>
</table>

### [Paste63](../spec/paste.md#paste63)

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
- see ┃here
```

</td><td>

```buffer
- see 1. x
2. y┃here
```

</td><td>

```buffer
- see 1. x
- 2\. y
- ┃here
```

</td></tr>
</table>

### [Paste65](../spec/paste.md#paste65)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

````clipboard
```js
y
```
````

</td><td>

````buffer
- grandchild
  ```js
  x
  ```
┃
- next
````

</td><td>

````buffer
- grandchild
  ```js
  x
  ```
```js
y
```┃
- next
````

</td><td>

````buffer
- grandchild
  ```js
  x
  ```

  ```js
  y┃
  ```

- next
````

</td></tr>
</table>

### [Paste66](../spec/paste.md#paste66)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

````clipboard
```js
      // greet
        f();
      ```
````

</td><td>

```buffer
- grandchild┃
```

</td><td>

````buffer
- grandchild```js
// greet
  f();
```┃
````

</td><td>

````buffer
- grandchild
  ```js
  // greet
    f();┃
  ```
````

</td></tr>
</table>

### [Paste67](../spec/paste.md#paste67)

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
a
┃
b
```

</td><td>

```buffer
a
x
y
┃
b
```

</td><td>

```buffer
a

x
y┃

b
```

</td></tr>
</table>

### [Paste70](../spec/paste.md#paste70)

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
p┃
    - g
```

</td><td>

````buffer
p```
c
```┃
    - g
````

</td><td>

````buffer
p
```
c
```

┃\- g
````

</td></tr>
</table>

### [Paste71](../spec/paste.md#paste71)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
# h
```

</td><td>

````buffer
- i
  ```
  x
  ```┃

  ```
  y
  ```
````

</td><td>

````buffer
- i
  ```
  x
  ```# h┃

  ```
  y
  ```
````

</td><td>

````buffer
- i
  ```
  x
  ```

  # h┃

  ```
  y
  ```
````

</td></tr>
</table>

### [Paste72](../spec/paste.md#paste72)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
> q
```

</td><td>

```buffer
- a
- [ ] ┃
- b
```

</td><td>

```buffer
- a
- [ ] > q┃
- b
```

</td><td>

```buffer
- a
- [ ] 
  > q┃
- b
```

</td></tr>
</table>

### [Paste93](../spec/paste.md#paste93)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

````clipboard
x
```
y
````

</td><td>

```buffer
a┃

b
```

</td><td>

````buffer
ax

```
y
```┃

b
````

</td><td>

````buffer
a

x
```
y┃
```

b
````

</td></tr>
</table>

### [Paste73](../spec/paste.md#paste73)

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
-  ┃
  - kid
```

</td><td>

```buffer
-  x
y
┃
  - kid
```

</td><td>

```buffer
- x
  y
  ┃
  - kid
```

</td></tr>
</table>

### [Paste74](../spec/paste.md#paste74)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

````clipboard
```
if x:
    y
```
````

</td><td>

```buffer
- a
- ┃
```

</td><td>

````buffer
- a
- ```
if x:
    y
```┃
````

</td><td>

````buffer
- a
- ```
  if x:
      y┃
  ```
````

</td></tr>
</table>

### [Paste76](../spec/paste.md#paste76)

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
# ┃Hello
body
```

</td><td>

```buffer
# - a
- b┃Hello
body
```

</td><td>

```buffer
# Hello

- a
- b┃

body
```

</td></tr>
</table>

### [Paste77](../spec/paste.md#paste77)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
## S
fix:
- p
```

</td><td>

```buffer
> a┃
```

</td><td>

```buffer
> a## S

fix:

- p┃
```

</td><td>

```buffer
> a
>
> ## S
> fix:
> - p┃
```

</td></tr>
</table>

### [Paste79](../spec/paste.md#paste79)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
$$
    x
    $$
```

</td><td>

```buffer
a┃
```

</td><td>

```buffer
a$$
    x
    $$┃
```

</td><td>

```buffer
a

$$
    x┃
    $$
```

</td></tr>
</table>

### [Paste90](../spec/paste.md#paste90)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
> p

> q
```

</td><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- a> p

> q┃
- b
```

</td><td>

```buffer
- a
  > p

  > q┃
- b
```

</td></tr>
</table>

### [Paste90b](../spec/paste.md#paste90b)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
- x

  p

  q
```

</td><td>

```buffer
- a┃
- b
```

</td><td>

```buffer
- a- x
    
    p
    
    q┃
- b
```

</td><td>

```buffer
- a
- x

  p

  q┃
- b
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃a

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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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

### [Placeholder4](../spec/placeholders.md#placeholder4)

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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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

> cursorDocEnd cursorCharLeft

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
-  ``` x
- b┃
````

</td><td>

````buffer
- \``` x
- b┃
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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

> cursorDocEnd cursorCharLeft

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para
- 
- a┃
```

</td><td>

```buffer
para

- 
- a┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter</th><th>cursorDocEnd cursorCharLeft</th></tr>
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
- a┃
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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

### [Quote1](../spec/quotes.md#quote1)

> indent

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- > - a
  > - b┃
```

</td><td>

```buffer
- > - a
  > - b┃
```

</td><td>

```buffer
- > - a
  >   - b┃
```

</td></tr>
</table>

### [Quote5](../spec/quotes.md#quote5)

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

```buffer
- x
  > - a
  > - b┃
```

</td><td>

```buffer
- x
  > - a
  >   - b┃
```

</td></tr>
</table>

### [Quote9](../spec/quotes.md#quote9)

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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

Adapted: under outdent: logical

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
> - b
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
> - a┃
>   - c
> - b
```

</td><td>

```buffer
> - b
- a┃
  - c
```

</td></tr>
</table>

### [Quote13](../spec/quotes.md#quote13)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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

### [Quote20](../spec/quotes.md#quote20)

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

```buffer
> - a┃
> - x

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

> moveSubtreeDown

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a┃
> - x

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

> indent

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> →- a┃
> - x

> - b
```

</td><td>

```buffer
> - x

> - b
> - a┃
```

</td></tr>
</table>

### [Quote21](../spec/quotes.md#quote21)

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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- c
> - a┃
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

### [Quote24](../spec/quotes.md#quote24)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
> - b┃
> - a
```

</td></tr>
</table>

### [Quote25](../spec/quotes.md#quote25)

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

```buffer
> - a
>
> - b┃
```

</td><td>

```buffer
> - b┃
>
> - a
```

</td></tr>
</table>

### [Quote26](../spec/quotes.md#quote26)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a
> q┃
```

</td><td>

```buffer
- a
> q┃
```

</td><td>

```buffer
> q┃
- a
```

</td></tr>
</table>

### [Quote28](../spec/quotes.md#quote28)

> moveSubtreeDown

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> ┃q
## S
```

</td><td>

```buffer
> ┃q
## S
```

</td><td>

```buffer
## S
> ┃q
```

</td></tr>
</table>

### [Quote30](../spec/quotes.md#quote30)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- x
  > - a┃
```

</td><td>

```buffer
- x
  > - a
- ┃
```

</td><td>

```buffer
- x
  > - a
  > - ┃
```

</td></tr>
</table>

### [Quote31](../spec/quotes.md#quote31)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
  >
  > ┃
```

</td></tr>
</table>

> enter

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

Adapted: under enterSplitSpace: start

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - a
- ┃b
  - c
```

</td><td>

```buffer
> - a
- ┃b
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

Adapted: under enterAtTextStart: stay

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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> 
> ┃q
```

</td><td>

```buffer

> ┃q
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> 
>┃q
```

</td><td>

```buffer

┃q
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter</th><th>deleteContentBackward</th></tr>
<tr valign="top"><td>

```buffer
> ┃q
```

</td><td>

```buffer

> ┃q
```

</td><td>

```buffer

┃q
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

```buffer
> - a- x
    - y┃
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

### [Quote67](../spec/quotes.md#quote67)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> >     code
> a┃
```

</td><td>

```buffer
> >     code
> a┃
```

</td><td>

```buffer
> a┃
> >     code
```

</td></tr>
</table>

### [Quote68](../spec/quotes.md#quote68)

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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

Adapted: under outdent: logical

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
> - b
- a┃
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
> - x
> - a┃
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th></tr>
<tr valign="top"><td>

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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- > a┃b
```

</td></tr>
</table>

### [Quote75](../spec/quotes.md#quote75)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

### [Quote76](../spec/quotes.md#quote76)

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
- > a┃b
```

</td><td>

```buffer
- > ax
y
┃b
```

</td><td>

```buffer
- > ax
  > y
  > ┃b
```

</td></tr>
</table>

### [Quote77](../spec/quotes.md#quote77)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

Adapted: under enterAtTextStart: stay

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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- > 
- ┃q
```

</td><td>

```buffer

- > ┃q
```

</td></tr>
</table>

> "x"

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- > 
- x┃q
```

</td><td>

```buffer

- > x┃q
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter</th><th>"x"</th></tr>
<tr valign="top"><td>

```buffer
- > ┃q
```

</td><td>

```buffer

- > ┃q
```

</td><td>

```buffer

- > x┃q
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- > ┃p
  >
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- > ┃
  >
  > q
```

</td><td>

```buffer
- > ┃>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- > q
  - ┃g
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

Adapted: under outdent: logical

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
- > - b
  - ┃a
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- > - ┃a
  > - b
```

</td><td>

```buffer
- > - b
  - ┃a
```

</td></tr>
</table>

### [Quote87](../spec/quotes.md#quote87)

> outdent

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
    \- g
```

</td></tr>
</table>

### [Quote91b](../spec/quotes.md#quote91b)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

### [Quote93](../spec/quotes.md#quote93)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
- example┃
- next
```

</td><td>

````buffer
- example```
code
```!┃
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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

Adapted: under enterSplitSpace: start

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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
One.
┃Two.
```

</td><td>

```buffer
One.

┃ Two.
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
One.┃Two.
```

</td><td>

```buffer
One.┃ Two.
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>enter</th><th>deleteContentBackward</th></tr>
<tr valign="top"><td>

```buffer
One.┃ Two.
```

</td><td>

```buffer
One.

┃ Two.
```

</td><td>

```buffer
One.┃ Two.
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Plan
2. revise ┃draft
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Plan
2. revise 
   ┃draft
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

### [ShiftEnter12](../spec/shift-enter.md#shiftenter12)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
para
┃
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

> deleteContentBackward

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
para
┃
```

</td><td>

```buffer
para┃
```

</td></tr>
</table>

### [ShiftEnter13b](../spec/shift-enter.md#shiftenter13b)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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

### [ShiftEnter18](../spec/shift-enter.md#shiftenter18)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. abc ┃2. x
```

</td><td>

```buffer
1. abc 
   ┃2. x
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

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
 ┃\|---|---|
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- abc
- ┃def
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one two
  ┃ three
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one two
 ┃three
```

</td><td>

```buffer
- one two ┃three
```

</td></tr>
</table>

### [ShiftEnter23](../spec/shift-enter.md#shiftenter23)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
\[Note]: this
 ┃matters a lot
```

</td></tr>
</table>

### [ShiftEnter25](../spec/shift-enter.md#shiftenter25)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

┃\[r]: /u
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- p
  -┃a
```

</td></tr>
</table>

### [ShiftEnter31](../spec/shift-enter.md#shiftenter31)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
[a]:┃

b
```

</td></tr>
</table>

> shiftEnter

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
[a]:
┃

b
```

</td><td>

```buffer
\[a]:
┃

b
```

</td></tr>
</table>

> deleteContentBackward

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
[a]:┃

b
```

</td></tr>
</table>

### [TaskEnter1](../spec/tasks.md#taskenter1)

> enter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

### [TaskEnter10](../spec/tasks.md#taskenter10)

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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- [ ] a
- [ ] ┃b
  - c
```

</td><td>

```buffer
- [ ] a┃ b
  - c
```

</td></tr>
</table>

### [TaskDelete1](../spec/tasks.md#taskdelete1)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- [ ] b
```

</td><td>

```buffer
- a┃[ ] b
```

</td><td>

```buffer
- a┃b
```

</td></tr>
</table>

### [TaskDelete3](../spec/tasks.md#taskdelete3)

> deleteContentForward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃
- [ ] 
```

</td><td>

```buffer
- a┃[ ] 
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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

## Whitespace (28)

### [Enter55](../spec/enter.md#enter55)

> enter

Adapted: under enterAtTextStart: stay

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

> indent

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
┃

a
```

</td></tr>
</table>

> indent

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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

### [Indent24](../spec/indent.md#indent24)

> indent

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

### [Rest of title becomes first paragraph](../spec/obsidian-true-outliner.md#rest-of-title-becomes-first-paragraph)

> enter

Adapted: under enterSplitSpace: start

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Hello┃ world
```

</td><td>

```buffer
# Hello
┃world
```

</td><td>

```buffer
# Hello
┃ world
```

</td></tr>
</table>

Original:
<table>
<tr><th>buffer</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
# Hello┃ world
```

</td><td>

```buffer
# Hello
┃ world
```

</td></tr>
</table>

### [S13](../spec/obsidian-true-outliner.md#s13)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a«lpha» beta
```

</td><td>

```buffer
- a
 ┃beta
```

</td><td>

```buffer
- a
   ┃beta
```

</td></tr>
</table>

### [Paste3](../spec/paste-plain.md#paste3)

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

### [Paste5](../spec/paste-plain.md#paste5)

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

```buffer
- ax
y
┃
```

</td><td>

```buffer
- ax
  y
  ┃
```

</td></tr>
</table>

### [Paste86](../spec/paste-plain.md#paste86)

> pastePlain

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
a  
b
```

</td><td>

```buffer
- ┃
```

</td><td>

```buffer
- a  
b┃
```

</td><td>

```buffer
- a  
  b┃
```

</td></tr>
</table>

### [Paste89](../spec/paste-plain.md#paste89)

<table>
<tr><th>clipboard</th><th>buffer</th></tr>
<tr valign="top"><td>

```clipboard
x
y
```

</td><td>

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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- x
y┃ b
  - c
```

</td><td>

```buffer
- x
  y┃ b
  - c
```

</td></tr>
</table>

### [Paste7](../spec/paste.md#paste7)

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

### [Paste10](../spec/paste.md#paste10)

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

```buffer
- a
- x
y
┃
```

</td><td>

```buffer
- a
- x
  y
  ┃
```

</td></tr>
</table>

### [Paste48](../spec/paste.md#paste48)

> pasteStructured

<table>
<tr><th>clipboard</th><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```clipboard
new
better
```

</td><td>

```buffer
- the «old» plan
```

</td><td>

```buffer
- the new
better┃ plan
```

</td><td>

```buffer
- the new
  better┃ plan
```

</td></tr>
</table>

### [Paste75](../spec/paste.md#paste75)

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
- [ ] ┃
```

</td><td>

```buffer
- a
- [ ] x
y
┃
```

</td><td>

```buffer
- a
- [ ] x
  y
  ┃
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

> cursorDocEnd cursorCharLeft

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
-  b
   - c┃
```

</td><td>

```buffer
- b
  - c┃
```

</td></tr>
</table>

### [Quote2](../spec/quotes.md#quote2)

> indent

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

### [Quote6](../spec/quotes.md#quote6)

> indent

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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

### [ShiftEnter11](../spec/shift-enter.md#shiftenter11)

<table>
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- one
  ┃
- two
```

</td></tr>
</table>

> shiftEnter

<table>
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th></tr>
<tr valign="top"><td>

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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th></tr>
<tr valign="top"><td>

```buffer
- ┃one
```

</td></tr>
</table>

### [ShiftEnter15](../spec/shift-enter.md#shiftenter15)

> shiftEnter shiftEnter "p"

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

## Caret (26)

### [CursorUp1](../spec/cursor.md#cursorup1)

> cursorLineUp

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

### [CursorDown5](../spec/cursor.md#cursordown5)

> cursorLineDown

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

### [CursorHome2](../spec/cursor.md#cursorhome2)

> cursorLineBoundaryBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- ┃one two
```

</td><td>

```buffer
- ┃one two
```

</td><td>

```buffer
┃- one two
```

</td></tr>
</table>

### [CursorHome10](../spec/cursor.md#cursorhome10)

> cursorLineBoundaryBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

### [CursorHome13](../spec/cursor.md#cursorhome13)

> cursorLineBoundaryBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
- one
┃  two
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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

### [CursorDocStart1](../spec/cursor.md#cursordocstart1)

> cursorDocStart

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- a┃b
- c
```

</td><td>

```buffer
- ┃ab
- c
```

</td><td>

```buffer
┃- ab
- c
```

</td></tr>
</table>

### [Enter55b](../spec/enter.md#enter55b)

> enter

Adapted: under enterAtTextStart: stay

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

### [Fence15](../spec/fences.md#fence15)

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

````buffer
- 
- ┃```
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>obsidian-outliner</th><th>ourus</th></tr>
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

</td><td>

````buffer
- a
  ```
  code┃
  ```
````

</td></tr>
</table>

### [Fence41](../spec/fences.md#fence41)

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

### [Fence51](../spec/fences.md#fence51)

> deleteContentBackward

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

````buffer
- 
- ┃```
  code
  ```
````

</td><td>

````buffer
- ┃```
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

### [MoveUp37](../spec/move-subtree-up.md#moveup37)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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

### [MoveUp38](../spec/move-subtree-up.md#moveup38)

> moveSubtreeUp

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- b
- $$
  x$$┃
  tail
```

</td><td>

```buffer
- $$
  x$$┃
  tail
- b
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

### [S4](../spec/obsidian-true-outliner.md#s4)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
one┃ two
```

</td><td>

```buffer
one
┃ two
```

</td><td>

```buffer
one
 ┃two
```

</td></tr>
</table>

### [Line break in setext title](../spec/obsidian-true-outliner.md#line-break-in-setext-title)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
Hello┃ world
====
```

</td><td>

```buffer
Hello
┃ world
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

### [S9](../spec/obsidian-true-outliner.md#s9)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- item

  para┃ text
```

</td><td>

```buffer
- item

  para
  ┃ text
```

</td><td>

```buffer
- item

  para
   ┃text
```

</td></tr>
</table>

### [Outdented empty ordered item stays](../spec/obsidian-true-outliner.md#outdented-empty-ordered-item-stays)

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

```buffer
1. ┃p
   1. a
2. 
3. q
```

</td><td>

```buffer
┃1. p
   1. a
2. 
3. q
```

</td></tr>
</table>

### [Second Enter outdents to a kept item](../spec/obsidian-true-outliner.md#second-enter-outdents-to-a-kept-item)

> enter enter cursorDocStart

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
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
```

</td><td>

```buffer
┃- a
  - b
- 
```

</td></tr>
</table>

### [ShiftEnter1](../spec/shift-enter.md#shiftenter1)

> shiftEnter

<table>
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- one two┃ three
```

</td><td>

```buffer
- one two
  ┃ three
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
1. a
   - b┃ c
```

</td><td>

```buffer
1. a
   - b
     ┃ c
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
<tr><th>buffer</th><th>obsidian-outliner</th><th>ourus</th></tr>
<tr valign="top"><td>

```buffer
- x
→- a┃ b
```

</td><td>

```buffer
- x
→- a
→  ┃ b
```

</td><td>

```buffer
- x
→- a
→   ┃b
```

</td></tr>
</table>

## Skipped (131)

| example | why |
| --- | --- |
| **backspace.md** | |
| [Backspace2](../spec/backspace.md#backspace2) | caret before an item's text (Outliner keeps it on the text) |
| [Backspace18b](../spec/backspace.md#backspace18b) | option headingEditing: block |
| [Backspace18f](../spec/backspace.md#backspace18f) | option headingEditing: block |
| [Backspace34](../spec/backspace.md#backspace34) | option backspaceAtTopItem: refuse |
| [Backspace42](../spec/backspace.md#backspace42) | caret before an item's text (Outliner keeps it on the text) |
| [Backspace42b](../spec/backspace.md#backspace42b) | option markup: decorated |
| **cursor.md** | |
| [CursorLeft2](../spec/cursor.md#cursorleft2) | CR line endings |
| [CursorHome3](../spec/cursor.md#cursorhome3) | caret before an item's text (Outliner keeps it on the text) |
| [CursorHome4](../spec/cursor.md#cursorhome4) | caret before an item's text (Outliner keeps it on the text) |
| [CursorHome15](../spec/cursor.md#cursorhome15) | caret before an item's text (Outliner keeps it on the text) |
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
| **delete.md** | |
| [Delete13b](../spec/delete.md#delete13b) | option headingEditing: block |
| [Delete13d](../spec/delete.md#delete13d) | option headingEditing: block |
| [Delete13f](../spec/delete.md#delete13f) | option headingEditing: block |
| [Delete16](../spec/delete.md#delete16) | option markup: decorated |
| [Delete16b](../spec/delete.md#delete16b) | option markup: decorated |
| [Delete16c](../spec/delete.md#delete16c) | option markup: decorated |
| [Delete16d](../spec/delete.md#delete16d) | option markup: decorated |
| [Delete16e](../spec/delete.md#delete16e) | option markup: decorated |
| [Delete16f](../spec/delete.md#delete16f) | option markup: decorated |
| [Delete16g](../spec/delete.md#delete16g) | option markup: decorated |
| [Delete19](../spec/delete.md#delete19) | option markup: decorated |
| [Delete23](../spec/delete.md#delete23) | caret before an item's text (Outliner keeps it on the text) |
| [Delete24](../spec/delete.md#delete24) | caret before an item's text (Outliner keeps it on the text) |
| [Delete25](../spec/delete.md#delete25) | caret before an item's text (Outliner keeps it on the text) |
| [Delete29](../spec/delete.md#delete29) | caret before an item's text (Outliner keeps it on the text) |
| **duplicate-subtree.md** | |
| [DuplicateSubtree1](../spec/duplicate-subtree.md#duplicatesubtree1) | action duplicateSubtree |
| [DuplicateSubtree2](../spec/duplicate-subtree.md#duplicatesubtree2) | action duplicateSubtree |
| [DuplicateSubtree3](../spec/duplicate-subtree.md#duplicatesubtree3) | action duplicateSubtree |
| [DuplicateSubtree4](../spec/duplicate-subtree.md#duplicatesubtree4) | action duplicateSubtree |
| [DuplicateSubtree5](../spec/duplicate-subtree.md#duplicatesubtree5) | action duplicateSubtree |
| [DuplicateSubtree6](../spec/duplicate-subtree.md#duplicatesubtree6) | action duplicateSubtree |
| [DuplicateSubtree7](../spec/duplicate-subtree.md#duplicatesubtree7) | action duplicateSubtree |
| [DuplicateSubtree8](../spec/duplicate-subtree.md#duplicatesubtree8) | action duplicateSubtree |
| **enter.md** | |
| [Enter3b](../spec/enter.md#enter3b) | option enterMidItem: child |
| [Enter17](../spec/enter.md#enter17) | CR line endings |
| [Enter18](../spec/enter.md#enter18) | CR line endings |
| [Enter34](../spec/enter.md#enter34) | caret before an item's text (Outliner keeps it on the text) |
| [Enter64](../spec/enter.md#enter64) | option enterSplitSpace: drop |
| [Enter49](../spec/enter.md#enter49) | caret in a table (Live Preview edits it in a table of its own) |
| [Enter50](../spec/enter.md#enter50) | caret in a table (Live Preview edits it in a table of its own) |
| [Enter54](../spec/enter.md#enter54) | caret before an item's text (Outliner keeps it on the text) |
| [Enter54b](../spec/enter.md#enter54b) | caret before an item's text (Outliner keeps it on the text) |
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
| [Indent28](../spec/indent.md#indent28) | caret before an item's text (Outliner keeps it on the text) |
| [Indent30](../spec/indent.md#indent30) | caret before an item's text (Outliner keeps it on the text) |
| [Indent31b](../spec/indent.md#indent31b) | option markup: decorated |
| [Indent32](../spec/indent.md#indent32) | CR line endings |
| **move-subtree-down.md** | |
| [MoveDown32](../spec/move-subtree-down.md#movedown32) | caret before an item's text (Outliner keeps it on the text) |
| **move-subtree-up.md** | |
| [MoveUp34](../spec/move-subtree-up.md#moveup34) | caret before an item's text (Outliner keeps it on the text) |
| [MoveUp36](../spec/move-subtree-up.md#moveup36) | caret before an item's text (Outliner keeps it on the text) |
| **obsidian-true-outliner.md** | |
| [Split item becomes first tab-indented child](../spec/obsidian-true-outliner.md#split-item-becomes-first-tab-indented-child) | option enterMidItem: child |
| [E11](../spec/obsidian-true-outliner.md#e11) | option enterMidItem: child |
| [S5](../spec/obsidian-true-outliner.md#s5) | caret before an item's text (Outliner keeps it on the text) |
| [Backspace before the checkbox](../spec/obsidian-true-outliner.md#backspace-before-the-checkbox) | option markup: decorated |
| **outdent.md** | |
| [Outdent14](../spec/outdent.md#outdent14) | caret before an item's text (Outliner keeps it on the text) |
| [Outdent16](../spec/outdent.md#outdent16) | caret before an item's text (Outliner keeps it on the text) |
| [Outdent19b](../spec/outdent.md#outdent19b) | option markup: decorated |
| **paste.md** | |
| [Paste2b](../spec/paste.md#paste2b) | option pasteStructuredListForm: own |
| [Paste8](../spec/paste.md#paste8) | option pasteStructuredLines: items |
| [Paste8b](../spec/paste.md#paste8b) | option pasteStructuredLines: items |
| [Paste8c](../spec/paste.md#paste8c) | option pasteStructuredLines: items |
| [Paste13b](../spec/paste.md#paste13b) | option pasteStructuredListForm: drop |
| [Paste13c](../spec/paste.md#paste13c) | option pasteStructuredListForm: own |
| [Paste13d](../spec/paste.md#paste13d) | option pasteStructuredAtEnd: join |
| [Paste13e](../spec/paste.md#paste13e) | option pasteStructuredAtEnd: join |
| [Paste14b](../spec/paste.md#paste14b) | option pasteStructuredOnParent: after |
| [Paste15b](../spec/paste.md#paste15b) | option pasteStructuredListForm: literal |
| [Paste15c](../spec/paste.md#paste15c) | option pasteStructuredListForm: drop |
| [Paste15d](../spec/paste.md#paste15d) | option pasteStructuredListForm: own |
| [Paste16b](../spec/paste.md#paste16b) | option pasteStructuredListForm: own |
| [Paste17b](../spec/paste.md#paste17b) | option pasteStructuredListForm: literal |
| [Paste17c](../spec/paste.md#paste17c) | option pasteStructuredListForm: drop |
| [Paste17d](../spec/paste.md#paste17d) | option pasteStructuredAtEnd: join |
| [Paste18b](../spec/paste.md#paste18b) | option pasteStructuredListForm: literal |
| [Paste19b](../spec/paste.md#paste19b) | option pasteStructuredAtEnd: join |
| [Paste20b](../spec/paste.md#paste20b) | option pasteStructuredAtEnd: join |
| [Paste26b](../spec/paste.md#paste26b) | option pasteStructuredAtEnd: join |
| [Paste27b](../spec/paste.md#paste27b) | option pasteStructuredAtEnd: join |
| [Paste27c](../spec/paste.md#paste27c) | option pasteStructuredAtEnd: join |
| [Paste27d](../spec/paste.md#paste27d) | option pasteStructuredOnParent: after |
| [Paste36b](../spec/paste.md#paste36b) | option pasteStructuredParagraphList: children |
| [Paste38](../spec/paste.md#paste38) | option pasteStructuredMidText: after |
| [Paste38b](../spec/paste.md#paste38b) | option pasteStructuredMidText: after |
| [Paste39](../spec/paste.md#paste39) | option pasteStructuredLines: items |
| [Paste42b](../spec/paste.md#paste42b) | option pasteStructuredOnParent: after |
| [Paste43](../spec/paste.md#paste43) | option enterMidItem: child |
| [Paste56](../spec/paste.md#paste56) | caret in a table (Live Preview edits it in a table of its own) |
| [Paste59b](../spec/paste.md#paste59b) | option pasteStructuredOnParent: after |
| **quotes.md** | |
| [Quote43b](../spec/quotes.md#quote43b) | option markup: decorated |
| [Quote55](../spec/quotes.md#quote55) | option backspaceAtTopItem: refuse |
| [Quote82](../spec/quotes.md#quote82) | action deleteSubtree |
| [Quote86](../spec/quotes.md#quote86) | action duplicateSubtree |
| **scenarios.md** | |
| [Scenario10](../spec/scenarios.md#scenario10) | action deleteSubtree |
| [Scenario17](../spec/scenarios.md#scenario17) | option pasteStructuredLines: items |
| **shift-enter.md** | |
| [ShiftEnter16](../spec/shift-enter.md#shiftenter16) | CR line endings |
| [ShiftEnter22](../spec/shift-enter.md#shiftenter22) | caret before an item's text (Outliner keeps it on the text) |
| [ShiftEnter22b](../spec/shift-enter.md#shiftenter22b) | option markup: decorated |
| [ShiftEnter24](../spec/shift-enter.md#shiftenter24) | caret in a table (Live Preview edits it in a table of its own) |
| [ShiftEnter26](../spec/shift-enter.md#shiftenter26) | caret before an item's text (Outliner keeps it on the text) |
| [ShiftEnter26b](../spec/shift-enter.md#shiftenter26b) | option markup: decorated |
| **tasks.md** | |
| [TaskEnter9](../spec/tasks.md#taskenter9) | option enterTask: plain |
| [TaskEnter9b](../spec/tasks.md#taskenter9b) | option enterTask: plain |
| [TaskEnter9c](../spec/tasks.md#taskenter9c) | option enterTask: plain |
| [TaskBackspace1](../spec/tasks.md#taskbackspace1) | option markup: decorated |
| [TaskBackspace4](../spec/tasks.md#taskbackspace4) | option taskEditing: block |
| [TaskBackspace6](../spec/tasks.md#taskbackspace6) | option markup: decorated |
| [TaskBackspace7](../spec/tasks.md#taskbackspace7) | option taskEditing: block |
| [TaskBackspace8](../spec/tasks.md#taskbackspace8) | caret before an item's text (Outliner keeps it on the text) |
| [TaskBackspace8b](../spec/tasks.md#taskbackspace8b) | caret before an item's text (Outliner keeps it on the text) |
| [TaskBackspace9](../spec/tasks.md#taskbackspace9) | caret before an item's text (Outliner keeps it on the text) |
| [TaskBackspace11](../spec/tasks.md#taskbackspace11) | option taskEditing: block |
| [TaskDelete4](../spec/tasks.md#taskdelete4) | caret before an item's text (Outliner keeps it on the text) |
| **z-open.md** | |
| [Open2](../spec/z-open.md#open2) | action deleteSubtree |
