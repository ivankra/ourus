# Duplicate subtree

Command: `duplicateSubtree`.

The rules:

1. **A copy of the selected nodes, with their subtrees, goes right below them** (DuplicateSubtree1).
2. **The caret goes into the copy**, where it was in the original (DuplicateSubtree1).
3. **A list the command touches is renumbered** (DuplicateSubtree2); `deleteSubtree` takes a copy
   back.
4. **Selected nodes are copied together** (DuplicateSubtree3).
5. **Indented code is refused**: two indented code blocks with a blank line between are one
   (DuplicateSubtree4).
6. **The copy is written as the original is**: its lazy continuation lines stay lazy, which with the
   containers' prefix could read as other blocks (DuplicateSubtree5).
7. **Copies that would land under another parent are refused**: nodes before a heading, copied with
   it, would land in its section (DuplicateSubtree6).
8. **A copy's text starts at its first character**: indentation before it isn't text
   (DuplicateSubtree7).
9. **The caret goes into the copy where typing can't break it**: in code, not on a fence
   (DuplicateSubtree8).
10. **An unclosed fence is refused**: it reads to the end of its container, so its copy would be
    more of its code (DuplicateSubtree9).

## DuplicateSubtree1

A copy goes below, the caret in the copy.

```yaml
tags: common
```

```buffer
- a┃
  - b
- c
```

> duplicateSubtree

```buffer
- a
  - b
- a┃
  - b
- c
```

## DuplicateSubtree2

Ordered items renumber, and deleting the copy gives the list back.

```yaml
tags: common
```

```buffer
1. a┃
2. b
```

> duplicateSubtree

```buffer
1. a
2. a┃
3. b
```

> deleteSubtree

```buffer
1. a┃
2. b
```

## DuplicateSubtree3

Selected nodes are copied together, below the last of them, and the selection goes to the copies.

```yaml
tags: common
```

```buffer
- a
- «b
- c»
- d
```

> duplicateSubtree

```buffer
- a
- b
- c
- «b
- c»
- d
```

## DuplicateSubtree4

Indented code can't be duplicated: with only a blank line between them, two indented code blocks are
one. Refused.

```yaml
tags: rare free-form
```

```buffer
    ┃code

p
```

> duplicateSubtree

```yaml
result: rejected not-expressible
```

```buffer
    ┃code

p
```

## DuplicateSubtree5

A quote's paragraph whose lines below aren't quoted (lazy continuation lines): the copy's are written
as the original's, unquoted. Quoted, `| a |` over `|---|` would be a table, not more of the
paragraph.

```yaml
tags: rare quote-container
flavor: gfm
```

```buffer
> q┃
| a |
|---|
```

> duplicateSubtree

```buffer
> q
| a |
|---|
>
> q┃
| a |
|---|
```

## DuplicateSubtree6

A paragraph and the heading after it, copied together: the copies would go after the heading's
section, the copied paragraph into that section, under another parent than its original, and
`deleteSubtree` couldn't take back copies with two parents. Refused.

```yaml
tags: rare free-form
```

```buffer
«p
#» H

x
```

> duplicateSubtree

```yaml
result: rejected not-expressible
```

```buffer
«p
#» H

x
```
## DuplicateSubtree7

A paragraph indented four spaces, which it can be as the rest of a paragraph a link reference
definition was taken from: the copy is written without the indentation, which isn't text, and on
its own line would make code.

```yaml
tags: edge
```

```buffer
[a]: /u
┃    code
```

> duplicateSubtree

```buffer
[a]: /u
    code

┃code
```

## DuplicateSubtree8

A code block duplicated with the caret on its opening fence: the caret goes into the copy's code, where
typing can't break its fence.

```yaml
tags: rare markup-fence
```

````buffer
┃```
x
```
````

> duplicateSubtree

````buffer
```
x
```
```
┃x
```
````

## DuplicateSubtree9

An unclosed fence reads to the end of its container: a copy below it would be more of its code.
Refused.

```yaml
tags: rare markup-fence
closeBackticks: none
```

````buffer
```
code┃
````

> duplicateSubtree

```yaml
result: rejected not-expressible
```

````buffer
```
code┃
````

## DuplicateSubtree10

An empty item with children duplicated: the copy is written as its original is, its empty text
and its children.

```yaml
tags: edge
```

```buffer
- ┃
  - a
```

> duplicateSubtree

```buffer
-␠
  - a
- ┃
  - a
```
