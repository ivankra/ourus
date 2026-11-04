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
- Over a selection: it goes first, as a cut takes it, and the paste goes where that leaves the caret
  (`pasteOverSelection: replace`). With `ignore` (as Logseq, Logseq DB, Tine, Tana, Roam and Athens
  paste blocks), a paste of nodes (blocks between nodes, not text put into a text) over a selection
  in one node's text leaves the text as it is, the nodes going where a paste at a caret puts them;
  what is pasted as text replaces the selection either way, as typing does.

## Paste1

```yaml
tags: common
clipboard: |
  x
  y
```

```markdown
- a┃b
```

> paste

```markdown
- ax
  y
  ┃b
```

## Paste2

A heading's title is one line: lines pasted there are a paragraph, first in its section.

```yaml
tags: common
clipboard: |-
  x
  y
```

```markdown
# T┃

para
```

> paste

```markdown
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

```markdown
Notes┃

more
```

> paste

```markdown
Notes

- x
- y┃

more
```

## Paste4

At the end of a paragraph that owns a list, the items go first in it, the list written apart from
the paragraph as it was.

```yaml
tags: common
clipboard: |-
  - x
  - y
```

```markdown
Notes┃

- z
```

> paste

```markdown
Notes

- x
- y┃
- z
```

## Paste4b

With `pasteSeams: open`, the first item's text joins the paragraph's; the rest go first in its
list, beside its items, the list written apart from the paragraph as it was.

```yaml
tags: rare
pasteSeams: open
clipboard: |-
  - x
  - y
```

```markdown
Notes┃

- z
```

> paste

```markdown
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

```markdown
See ┃here.
```

> paste

```markdown
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

```markdown
# T┃

- z
```

> paste

```markdown
# T

- x
- y┃
- z
```

## Paste7

A block that isn't a list goes after the paragraph, set apart.

````yaml
tags: common
clipboard: |-
  ```
  c
  ```
````

```markdown
p┃

q
```

> paste

````markdown
p

```
c┃
```

q
````

## Paste8

```yaml
tags: rare
clipboard: |-
  - x
  - y
```

```markdown
- a

  p┃

- b
```

> paste

```markdown
- a

  p

  - x
  - y┃

- b
```

## Paste9

```yaml
tags: rare
clipboard: |-
  - x
  - y
quotes: container
```

```markdown
> p┃

after
```

> paste

```markdown
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

```markdown
# A

p┃

q

## B

r
```

> paste

```markdown
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
tags: common
clipboard: |-
  ## h
  text
```

```markdown
## A┃

p

## B
```

> paste

```markdown
## A

## h
text┃

p

## B
```

## Paste12

A heading of a deeper level goes first in the section, and takes in what follows it there.

```yaml
tags: common
clipboard: |-
  ### h
  text
```

```markdown
## A┃

p
```

> paste

```markdown
## A

### h
text┃

p
```

## Paste13

On a blank line, the paste fills it: the nodes go after the node above, the blank lines below the
caret's after them.

```yaml
tags: common
clipboard: |
  - x
```

```markdown
a
┃

b
```

> paste

```markdown
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

````markdown
```
a┃
```
````

> paste

````markdown
```
a- x
- y
┃
```
````

## Paste15

At the end of a block that isn't text (after code's closing fence), the paste goes after it.

````yaml
tags: common markup-fence
clipboard: |-
  - x
  - y
````

````markdown
```
a
```┃

after
````

> paste

````markdown
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
tags: rare
clipboard: |
  - x
  - y
```

```markdown
┃- one
```

> paste

```yaml
result: deferredToHost
```

```markdown
- x
- y
┃- one
```

## Paste17

Over a selection, the selection goes first, then the paste goes where that leaves the caret
(`pasteOverSelection: replace`).

```yaml
tags: common
clipboard: |-
  - x
  - y
```

```markdown
- a«bc»d
- e
```

> paste

```markdown
- ad
- x
- y┃
- e
```

## Paste17b

With `pasteOverSelection: ignore`, pasted nodes leave the selected text as it is: they go where a
paste at a caret puts them, after the item, the caret at the end of the last.

```yaml
tags: rare
pasteOverSelection: ignore
clipboard: |-
  - x
  - y
```

```markdown
- a«bc»d
- e
```

> paste

```markdown
- abcd
- x
- y┃
- e
```

## Paste17c

With `pasteOverSelection: ignore`, the selection decides nothing, over the whole text as anywhere
in it.

```yaml
tags: rare
pasteOverSelection: ignore
clipboard: |-
  - x
  - y
```

```markdown
- «abcd»
- e
```

> paste

```markdown
- abcd
- x
- y┃
- e
```

## Paste17d

With `pasteOverSelection: ignore`, in an item with children the nodes go where a paste at a caret
puts them there, first among its children (`pasteOnParent: children`).

```yaml
tags: rare
pasteOverSelection: ignore
clipboard: |-
  - x
  - y
```

```markdown
- a«bc»d
  - kid
- e
```

> paste

```markdown
- abcd
  - x
  - y┃
  - kid
- e
```

## Paste17e

With `pasteOverSelection: ignore`, one item copied with its line break is a node, and leaves the
selected text too.

```yaml
tags: rare
pasteOverSelection: ignore
clipboard: |
  - x
```

```markdown
- a«bc»d
- e
```

> paste

```markdown
- abcd
- x┃
- e
```

## Paste17f

With `pasteOverSelection: ignore`, what is pasted as text replaces the selection, as typing does:
one line, put in at the caret.

```yaml
tags: rare
pasteOverSelection: ignore
clipboard: "x"
```

```markdown
- a«bc»d
- e
```

> paste

```markdown
- ax┃d
- e
```

## Paste17g

With `pasteOverSelection: ignore` and `pasteLines: items` (Tana, Roam and Athens), plain lines are
nodes, and leave the selected text; with `pasteLines: text` they are text, and replace it.

```yaml
tags: rare
pasteOverSelection: ignore
pasteLines: items
clipboard: |-
  x
  y
```

```markdown
- a«bc»d
- e
```

> paste

```markdown
- abcd
- x
- y┃
- e
```

## Paste18

With `pasteLines: items` (Roam, Athens, WorkFlowy, Dynalist), plain lines are a node each: in a
list, an item each.

```yaml
tags: rare
pasteLines: items
clipboard: |-
  x
  y
```

```markdown
- a┃
- b
```

> paste

```markdown
- a
- x
- y┃
- b
```

## Paste19

With `pasteLines: items`, outside a list, a paragraph each.

```yaml
tags: rare
pasteLines: items
clipboard: |-
  x
  y
```

```markdown
p┃

q
```

> paste

```markdown
p

x

y┃

q
```

## Paste20

With `pasteAtTextStart: before`, a heading pasted at a paragraph's start goes before it, and takes it
in, as one typed there would.

```yaml
tags: rare
pasteAtTextStart: before
clipboard: |-
  ## h
  text
```

```markdown
# A

┃para
```

> paste

```markdown
# A

## h
text┃

para
```

## Paste21

With `pasteSeams: open`, a pasted heading's title joins the text before the caret, as a paragraph's
would, and the text after it joins the last pasted text.

```yaml
tags: rare
pasteSeams: open
clipboard: |-
  # h
  text
```

```markdown
p┃q
```

> paste

```markdown
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

```markdown
## A

p┃

q

## B
```

> paste

```markdown
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
tags: rare
flavor: obsidian
clipboard: |-
  ## h
  text
```

```markdown
> [!note] q┃

after
```

> paste

```markdown
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

```markdown
# h1
┃◌
```

> paste

```markdown
# h1
- a
  - b┃
```

## Paste24b

With `pasteSeams: open`, the same: an empty line has no text for a seam to join, and is filled.

```yaml
tags: rare
pasteSeams: open
clipboard: |-
  - a
    - b
```

```markdown
# h1
┃◌
```

> paste

```markdown
# h1
- a
  - b┃
```

## Paste25

In Obsidian a callout's title is a line of its own, as a heading's: pasted nodes, and plain lines,
go first in the callout's body, wherever in the title the caret is (as Paste23 elsewhere). The
host's paste would break the title into lines that end the callout.

```yaml
tags: rare
flavor: obsidian
clipboard: |-
  x
  y
```

```markdown
> [!note] q┃
> body
```

> paste

```markdown
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
tags: common
clipboard: |-
  - a
  - b
```

```markdown
p┃
```

> shiftEnter paste

```markdown
p
- a
- b┃
```

## Paste26b

With `pasteSeams: open`, the blank line Shift-Enter leaves is the text's next line: the first
pasted text joins the text there, after a line break, and the rest follow it, the paragraph's list.

```yaml
tags: rare
pasteSeams: open
clipboard: |-
  - a
  - b
```

```markdown
p┃
```

> shiftEnter paste

```markdown
p
a
- b┃
```

## Paste27

A heading inside a pasted quote (or item) splits no section: it is the quote's, and what follows the
paste stays where it is.

```yaml
tags: rare
clipboard: |
  > # q
```

```markdown
# A
para┃

more
```

> paste

```markdown
# A
para

> # q┃

more
```
