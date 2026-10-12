# Paste

Two commands, as most outliners have two pastes; both take the clipboard's text.

- `pasteStructured` (Ctrl-V): the clipboard's Markdown as nodes.
- `pastePlain` (Ctrl-Shift-V): the text goes into the text of the node at the caret, its line breaks
  as Shift-Enter makes them: the next line continues the text at its column, and a line that would
  start a block is escaped. A heading, a single line, refuses several.

Structured paste follows a few rules:

1. **Nothing pasted is lost.** Text, numbers, checkboxes, `#`s and `>`s all arrive; what can't be
   structure where it lands stays text, escaped.
2. **The destination decides form, the paste content.** Form is the bullet, the columns, the
   spacing; content is the text, the numbers, the checkboxes and the paste's own nesting. So pasted
   bullets take a list's marker or numbering, and pasted numbers are kept: in a bullet list as
   text (`- 1\. x`).
3. **A list's first item sets its form.** Pasted as a list's first items (on its empty first item),
   a single ordered list keeps its numbers, and the items after it are numbered on.
4. **The paste's nesting is kept**, rebased where it lands: its top level takes the destination's
   form, a nested list keeps its own.
5. **The nodes go where Enter at the end of the node's text would put a new one**, or in an empty
   item's place. In the middle of an item's text, `pasteMidText` decides: `after` (the default)
   leaves the item as it is; `split` splits it at the caret ([Paste8](#paste8)). Into a list, plain
   lines are items, one each.
6. **What can't be a node where it lands is pasted as text**, as `pastePlain` would (a heading, a
   quote in an empty item's place).
7. **Numbers are never renumbered**, pasted or existing: Markdown numbers an ordered list from its
   first number.

One line is inline text, the host's.

## Paste1

A block pasted into a paragraph's list ends the list.

The items after the block follow the block, not the paragraph.

````clipboard
```
c
```
````

````buffer
para
- a┃
- b
````

> pasteStructured

````buffer
para
- a

```
c
```┃

- b
````

## Paste2

Bullets pasted into an ordered list are numbered, from the item before.

A bullet is form (rule 2), so nothing is lost. The items after keep their numbers (rule 7).

```clipboard
- x
- y
```

```buffer
1. a┃
2. b
```

> pasteStructured

```buffer
1. a
2. x
3. y┃
2. b
```

## Paste3

Several lines pasted as plain text in the middle of an item continue the item.

The pasted lines continue the item at its content column (the clipboard ends with a line ending,
so `b` starts a line of its own).

```clipboard
x
y
```

```buffer
- a┃b
```

> pastePlain

```buffer
- ax
  y
  ┃b
```

## Paste4

Plain paste: a pasted line that would start a block is escaped, so it stays text.

```clipboard
x
- y
```

```buffer
- a┃b
```

> pastePlain

```buffer
- ax
  \- y
  ┃b
```

## Paste5

Plain paste ending with a line break at the end of the text leaves an empty line to type on, held by
a placeholder, as Shift-Enter there does.

```clipboard
x
y
```

```buffer
- a┃
```

> pastePlain

```buffer
- ax
  y
  ┃◌
```

## Paste6

Plain paste of several lines into a heading is refused: a heading is a single line.

```clipboard
x
y
```

```buffer
# H┃
```

> pastePlain

```result
rejected: not-expressible
```

## Paste7

Structured paste in the middle of an item's text leaves the item as it is: each pasted line is an
item after it.

As at the end of the text. Logseq and Roam do this (`pasteMidText: after`, the default).

```clipboard
x
y
```

```buffer
- a┃b
```

> pasteStructured

```buffer
- ab
- x
- y┃
```

## Paste8

With `pasteMidText: split`, structured paste in the middle of an item's text splits the item at the
caret.

The first line joins the text before the caret, each further line is an item, and since the
clipboard ends with a line break, the text after the caret is an item of its own (without one, it
would be the end of the last line, `- y┃b`; a clipboard block always ends with a line break, so that
isn't drawn here). Workflowy and Dynalist do this.

```config
pasteMidText: split
```

```clipboard
x
y
```

```buffer
- a┃b
```

> pasteStructured

```buffer
- ax
- y┃
- b
```

## Paste9

Structured paste on an empty item: the item takes the paste. A code block is the item's text.

As outliners fill an empty block. Placed after the empty item instead, the code would end the list.

````clipboard
```
code
```
````

```buffer
- a
- ┃
```

> pasteStructured

````buffer
- a
- ```
  code
  ```┃
````

## Paste10

On an empty item, plain lines are items, one each, in its place.

```clipboard
x
y
```

```buffer
- a
- ┃
```

> pasteStructured

```buffer
- a
- x
- y┃
```

## Paste11

On an empty first child, held by a placeholder right after its parent's text, the same.

````clipboard
```
code
```
````

```buffer
- a
  - ┃◌
```

> pasteStructured

````buffer
- a
  - ```
    code
    ```┃
````

## Paste12

A quote can't be an item's text: pasted on an empty item, it is pasted as text (rule 6).

```clipboard
> q
> r
```

```buffer
- a
- ┃
```

> pasteStructured

```buffer
- a
- \> q
  \> r
  ┃◌
```

## Paste13

An ordered list pasted into a bullet list keeps its numbers, as text.

The bullets are the list's form (rule 2), and the numbers are content (rule 1): each item is a bullet
whose text starts with its number, escaped so it stays text.

```clipboard
1. x
2. y
```

```buffer
- a┃
- b
```

> pasteStructured

```buffer
- a
- 1\. x
- 2\. y┃
- b
```

## Paste14

The same as an item's first children, before a list already there.

```clipboard
1. x
2. y
```

```buffer
- a┃
  - kid
```

> pasteStructured

```buffer
- a
  - 1\. x
  - 2\. y┃
  - kid
```

## Paste15

An ordered list pasted on a list's empty first item makes the list ordered, numbered on.

A list's first item sets its form (rule 3).

```clipboard
1. x
2. y
```

```buffer
- ┃
- b
```

> pasteStructured

```buffer
1. x
2. y┃
3. b
```

## Paste16

Bullets pasted on an empty first item of an ordered list are numbered; the items after keep theirs.

Bullets carry no numbers to keep, so the list keeps its form (rule 2), and nothing is renumbered
(rule 7).

```clipboard
- x
- y
```

```buffer
1. ┃
2. b
```

> pasteStructured

```buffer
1. x
2. y┃
2. b
```

## Paste17

A nested list in the paste keeps its own marker: only the pasted top level takes the destination's
form (rule 4).

```clipboard
1. x
   1. x1
2. y
```

```buffer
- a┃
```

> pasteStructured

```buffer
- a
- 1\. x
  1. x1
- 2\. y┃
```

## Paste18

An ordered list pasted into an ordered list keeps its numbers as written (rule 7).

Markdown numbers the list from its first number, so it reads 1 to 4 all the same.

```clipboard
1. x
2. y
```

```buffer
1. a┃
2. b
```

> pasteStructured

```buffer
1. a
1. x
2. y┃
2. b
```

## Paste19

A heading can't be a node in a list: it is pasted as text (rule 6).

As plain paste does: the first line joins the text at the caret.

```clipboard
# h
text
```

```buffer
- a┃
```

> pasteStructured

```buffer
- a# h
  text
  ┃◌
```
