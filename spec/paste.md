# Paste

`paste` (Ctrl-V): the clipboard, every format the host has of it, read as Markdown and placed as
nodes. Plain paste (Ctrl-Shift-V, `pastePlain`) is [paste-plain.md](paste-plain.md)'s.

Which of the clipboard's formats it reads is [paste-conv.md](paste-conv.md)'s, how HTML converts
[paste-html.md](paste-html.md)'s; where it goes in a list [paste-list.md](paste-list.md)'s, and the
form it takes there [paste-list-form.md](paste-list-form.md)'s; this file is the rest of where what
it reads goes.

A clipboard is written without a final line break (`|-`), as an app's copy of blocks has none (one
would be an empty node in RemNote and Dynalist), but where the line break is the case's: one line
copied with it, plain lines, the host's paste.

- Plain lines: lines with no structure (paragraphs only) go into the text at the caret, as plain paste puts them
  (`pasteLines: text`, as Logseq, Logseq DB, Tine and SiYuan paste them; [paste-plain.md](paste-plain.md)).
- In an item or a quote: a paragraph in an item or a quote owns no list: what is pasted after it goes after it, in the item
  or the quote, and a pasted paragraph's list follows it.
- Headings: a pasted heading splits the section it lands in, as one typed there would: what follows it, up to a
  heading of its level or above, is its section.

## Paste1

```yaml
tags: common
clipboard: |
  x
  y
```

```buffer
- a┃b
```

> paste

```buffer
- ax
  y
  ┃b
```

## Paste2

A heading's title is one line: lines pasted there are a paragraph, first in its section.

```yaml
tags: edge
clipboard: |-
  x
  y
```

```buffer
# T┃

para
```

> paste

```buffer
# T

x
y┃

para
```

## Paste3

A list pasted at a paragraph's end is its list.

```yaml
tags: common
clipboard: |-
  - x
  - y
```

```buffer
Notes┃

more
```

> paste

```buffer
Notes

- x
- y┃

more
```

## Paste4

At the end of a paragraph that owns a list, the items go first in it, the list written apart from
the paragraph as it was.

```yaml
tags: edge
clipboard: |-
  - x
  - y
```

```buffer
Notes┃

- z
```

> paste

```buffer
Notes

- x
- y┃
- z
```

## Paste4b

With `pasteSeams: open`, the first item's text joins the paragraph's; the rest go first in its
list, beside its items, the list written apart from the paragraph as it was.

```yaml
tags: edge
pasteSeams: open
clipboard: |-
  - x
  - y
```

```buffer
Notes┃

- z
```

> paste

```buffer
Notesx

- y┃
- z
```

## Paste5

In the middle of a paragraph, the paste goes after it, the paragraph whole.

```yaml
tags: common
clipboard: |-
  - x
  - y
```

```buffer
See ┃here.
```

> paste

```buffer
See here.

- x
- y┃
```

## Paste6

At a heading's end, the paste goes first in its section.

```yaml
tags: common
clipboard: |-
  - x
  - y
```

```buffer
# T┃

- z
```

> paste

```buffer
# T

- x
- y┃
- z
```

## Paste7

A block that isn't a list goes after the paragraph, set apart.

````yaml
tags: edge
clipboard: |-
  ```
  c
  ```
````

```buffer
p┃

q
```

> paste

````buffer
p

```
c┃
```

q
````

## Paste8

```yaml
tags: edge
clipboard: |-
  - x
  - y
```

```buffer
- a

  p┃

- b
```

> paste

```buffer
- a

  p

  - x
  - y┃

- b
```

## Paste9

```yaml
tags: edge
clipboard: |-
  - x
  - y
```

```buffer
> p┃

after
```

> paste

```buffer
> p
>
> - x
> - y┃

after
```

## Paste10

After a paragraph, a heading takes in the rest of the section, up to the next heading of its level.

```yaml
tags: common
clipboard: |-
  ## h
  text
```

```buffer
# A

p┃

q

## B

r
```

> paste

```buffer
# A

p

## h
text┃

q

## B

r
```

## Paste11

At the end of a heading of its level, the pasted heading closes that section: it goes after it, and
what was the section's is its own.

```yaml
tags: edge
clipboard: |-
  ## h
  text
```

```buffer
## A┃

p

## B
```

> paste

```buffer
## A

## h
text┃

p

## B
```

## Paste12

A heading of a deeper level goes first in the section, and takes in what follows it there.

```yaml
tags: edge
clipboard: |-
  ### h
  text
```

```buffer
## A┃

p
```

> paste

```buffer
## A

### h
text┃

p
```

## Paste13

On a blank line, the paste fills it: the nodes go after the node above, the blank lines below the
caret's after them.

```yaml
tags: edge
clipboard: |
  - x
```

```buffer
a
┃

b
```

> paste

```buffer
a
- x┃

b
```

## Paste14

In code, what is pasted is code: its text, as plain paste puts it.

````yaml
tags: common
clipboard: |
  - x
  - y
````

````buffer
```
a┃
```
````

> paste

````buffer
```
a- x
- y
┃
```
````

## Paste15

At the end of a block that isn't text (after code's closing fence), the paste goes after it.

````yaml
tags: edge
clipboard: |-
  - x
  - y
````

````buffer
```
a
```┃

after
````

> paste

````buffer
```
a
```

- x
- y┃

after
````

## Paste16

In markup (before an item's marker, a heading's `#`s), the paste is the host's.

```yaml
tags: edge
clipboard: |
  - x
  - y
```

```buffer
┃- one
```

> paste

```yaml
result: notApplicable
```

```buffer
- x
- y
┃- one
```

## Paste17

Over a selection, the selection goes first, then the paste goes where that leaves the caret.

```yaml
tags: common
clipboard: |-
  - x
  - y
```

```buffer
- a«bc»d
- e
```

> paste

```buffer
- ad
- x
- y┃
- e
```

## Paste18

With `pasteLines: items` (Roam, Athens, WorkFlowy, Dynalist), plain lines are a node each: in a
list, an item each.

```yaml
tags: edge
pasteLines: items
clipboard: |-
  x
  y
```

```buffer
- a┃
- b
```

> paste

```buffer
- a
- x
- y┃
- b
```

## Paste19

With `pasteLines: items`, outside a list, a paragraph each.

```yaml
tags: edge
pasteLines: items
clipboard: |-
  x
  y
```

```buffer
p┃

q
```

> paste

```buffer
p

x

y┃

q
```

## Paste20

With `pasteAtTextStart: before`, a heading pasted at a paragraph's start goes before it, and takes it
in, as one typed there would.

```yaml
tags: edge
pasteAtTextStart: before
clipboard: |-
  ## h
  text
```

```buffer
# A

┃para
```

> paste

```buffer
# A

## h
text┃

para
```

## Paste21

With `pasteSeams: open`, a pasted heading's title joins the text before the caret, as a paragraph's
would, and the text after it joins the last pasted text.

```yaml
tags: edge
pasteSeams: open
clipboard: |-
  # h
  text
```

```buffer
p┃q
```

> paste

```buffer
ph

text┃q
```

## Paste22

What comes before a pasted heading that closes the section stays in the section; the heading goes after
it, and takes in what follows.

```yaml
tags: common
clipboard: |-
  x

  # h
```

```buffer
## A

p┃

q

## B
```

> paste

```buffer
## A

p

x

# h┃

q

## B
```

## Paste23

At the end of a callout's title, a pasted heading goes first in the callout's body, and what follows
the callout stays out of its section.

```yaml
tags: edge
flavor: gfm
clipboard: |-
  ## h
  text
```

```buffer
> [!note] q┃

after
```

> paste

```buffer
> [!note] q
> ## h
> text┃

after
```

## Paste24

On the empty line Enter holds (a placeholder), the paste takes its place, as it fills an empty item.
(At the end of a text without a final line ending, which a buffer can't draw, it failed to write: an
API test, `test/commands/commands.test.ts`.)

```yaml
tags: common
clipboard: |-
  - a
    - b
```

```buffer
# h1
┃◌
```

> paste

```buffer
# h1
- a
  - b┃
```

## Paste24b

With `pasteSeams: open`, the same: an empty line has no text for a seam to join, and is filled.

```yaml
tags: edge
pasteSeams: open
clipboard: |-
  - a
    - b
```

```buffer
# h1
┃◌
```

> paste

```buffer
# h1
- a
  - b┃
```

## Paste25

In Obsidian a callout's title is a line of its own, as a heading's: pasted nodes, and plain lines,
go first in the callout's body, wherever in the title the caret is (as Paste23 elsewhere). The
host's paste would break the title into lines that end the callout.

```yaml
tags: edge
flavor: obsidian
clipboard: |-
  x
  y
```

```buffer
> [!note] q┃
> body
```

> paste

```buffer
> [!note] q
> x
> y┃
>
> body
```

## Paste26

On the blank line Shift-Enter leaves at the end of a node's text, pasted nodes fill it: they follow
the node with no blank line where Markdown needs none, as the text editors paste them there. Text
pasted there stays on it.

```yaml
tags: edge
clipboard: |-
  - a
  - b
```

```buffer
p┃
```

> shiftEnter paste

```buffer
p
- a
- b┃
```

## Paste26b

With `pasteSeams: open`, the blank line Shift-Enter leaves is the text's next line: the first
pasted text joins the text there, after a line break, and the rest follow it, the paragraph's list.

```yaml
tags: edge
pasteSeams: open
clipboard: |-
  - a
  - b
```

```buffer
p┃
```

> shiftEnter paste

```buffer
p
a
- b┃
```

## Paste27

A heading inside a pasted quote (or item) splits no section: it is the quote's, and what follows the
paste stays where it is.

```yaml
tags: edge
clipboard: |
  > # q
```

```buffer
# A
para┃

more
```

> paste

```buffer
# A
para

> # q┃

more
```
