
# Paste

Two commands, as most outliners have two pastes; both take the clipboard's text.

- `pasteStructured` (Ctrl-V): the clipboard's Markdown as nodes.
- `pastePlain` (Ctrl-Shift-V): the text goes into the text of the node at the caret, its line breaks
  as Shift-Enter makes them: the next line continues the text at its column, and a line that would
  start a block is escaped. A heading, a single line, refuses several.

A text editor (bare Obsidian, and Obsidian with Outliner) pastes the clipboard as it is: its first
line joins the text at the caret and the rest start at column 0, so pasted lines land glued to the
item's text and outside its nesting (`- a1. x`, `Notes- p`), and a pasted `- y` leaves the item it
was pasted into. Structured paste is the outliners' (Roam and WorkFlowy paste lines as new blocks
after the current one, Logseq and Tine pasted list items), written in Markdown; plain paste keeps
the text in its node, at its column. A host that wants a text editor's paste leaves Ctrl-V to its
own. The outliners differ among themselves here more than on any other command (Paste7, Paste10,
Paste19), which is why ourus's rules are written out below.

Structured paste reads the clipboard as Markdown, its common indentation removed first, so lines
copied from inside a list aren't read as code
([obsidian-true-outliner.md › #264](obsidian-true-outliner.md#pasted-quote-set-off-from-paragraph)).
It follows a few rules:

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
   item's place. In the middle of a paragraph's or an item's text, `pasteStructuredMidText`
   decides: `split` (the default) splits the node where Enter would, the paste going in between
   (Paste36, Paste37); `after` leaves it as it is, the paste going after it (Paste38). Plain lines
   are text, as plain paste puts them (`pasteStructuredLines: text`, the default; Paste7, Paste10),
   or nodes, one each (`items`; Paste8, Paste39). Into a list, items and headings are items. A block that is none of these (code, a
   quote, a table) would end the list: it goes into the item before it, the item at the caret
   (after its text) or a pasted item, as Markdown notes put code under an item; on an empty item it
   is the item's first block; among an item's children it stays where it is
   ([#197](obsidian-true-outliner.md#pasted-list-and-block-become-children)). After pasted code the
   caret is at the end of its last line, not after the closing fence, where typing would unmake it.
6. **What can't be a node where it lands is pasted as text**, as `pastePlain` would.
7. **A list the paste touches is renumbered** from its first number, as by every other command; a
   list it doesn't touch keeps its numbers. Pasted into an ordered list, the paste's items take the
   list's numbers (Paste2, Paste16, Paste18).

One line of plain text is inline text, the host's ([Paste24](#paste24)), and so is any one line in
the middle of the text ([Paste31](#paste31)); at the end of the text, a line that is an item, a
heading or a quote is pasted as nodes, as several are ([Paste26](#paste26)). Outside a list, a
pasted heading is a node ([Paste32](#paste32)) that splits the section it lands in, as a heading
typed there would: what follows it, up to a heading of its level or above, becomes its section
([Paste34](#paste34), [Paste35](#paste35)), and it goes after the sections it closes
([Paste33](#paste33)).
On a code line, what is
pasted is code: plain text, each line in the containers the block is in ([Paste22](#paste22),
[Paste23](#paste23)).

## Paste1

A code block pasted at the end of an item's text goes into the item, after its text (rule 5), as
Markdown notes put code under an item. The list goes on, tight as it was, so `b` stays in the
paragraph's list; placed after the list, the code would end it and take `b` away from the
paragraph. The caret ends in the code, not on its closing fence.

````yaml
rank: edge
clipboard: |
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
  c┃
  ```
- b
````

## Paste2

Bullets pasted into an ordered list are numbered, from the item before, and the items after are
renumbered (rule 7): a bullet is form (rule 2), so nothing is lost.

```yaml
rank: common
clipboard: |
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
4. b
```

## Paste3

Several lines pasted as plain text in the middle of an item continue the item at its content
column (the clipboard ends with a line ending, so `b` starts a line of its own). Bare Obsidian
pastes them at column 0, out of the item.

```yaml
rank: common
clipboard: |
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

```yaml
rank: edge
clipboard: |
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

```yaml
rank: common
clipboard: |
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

```yaml
rank: edge
clipboard: |
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

```buffer
# H┃
```

## Paste7

Plain lines pasted in the middle of an item's text go into it, as plain paste puts them
(`pasteStructuredLines: text`, the default), as in Logseq, Tine, SiYuan, BlockNote and every text
editor. Roam, WorkFlowy and Dynalist make each line an item ([Paste8](#paste8)).

```yaml
rank: core
clipboard: |
  x
  y
```

```buffer
- a┃b
```

> pasteStructured

```buffer
- ax
  y
  ┃b
```

## Paste8

With `pasteStructuredLines: items`, plain lines are items, and in the middle of an item's text it
splits (`pasteStructuredMidText: split`, the default): the first line joins the text before the
caret, each further line is an item, and since the clipboard ends with a line break, the text after
the caret is an item of its own, the caret at its start. WorkFlowy and Dynalist do this.

```yaml
rank: edge
pasteStructuredLines: items
clipboard: |
  x
  y
```

```buffer
- a┃b
```

> pasteStructured

```buffer
- ax
- y
- ┃b
```

## Paste8b

The same with no line break at the clipboard's end: the text after the caret ends the last line.

```yaml
rank: edge
pasteStructuredLines: items
clipboard: |-
  x
  y
```

```buffer
- a┃b
```

> pasteStructured

```buffer
- ax
- y┃b
```

## Paste9

Structured paste on an empty item: the item takes the paste, a code block as its text, as outliners
fill an empty block; placed after the item instead, the code would end the list. The caret ends in
the code.

````yaml
rank: common
clipboard: |
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
  code┃
  ```
````

## Paste10

On an empty item, plain lines are its text, as plain paste puts them; the clipboard's last line
break leaves an empty line to type on, held by a placeholder. With `pasteStructuredLines: items`
they are items ([Paste39](#paste39)).

```yaml
rank: core
clipboard: |
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
  y
  ┃◌
```

## Paste11

On an empty first child, held by a placeholder right after its parent's text, the same.

````yaml
rank: edge
clipboard: |
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
    code┃
    ```
````

## Paste12

A quote pasted on an empty item goes into it, as its first block (rule 5): an item can hold a
quote with no text of its own ([Quote1](quotes.md#quote1)). Escaped as text instead, its `>`s would
show.

```yaml
rank: edge
clipboard: |
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
- > q
  > r┃
```

## Paste13

An ordered list pasted into a bullet list keeps its numbers, as text.

The bullets are the list's form (rule 2), and the numbers are content (rule 1): each item is a
bullet whose text starts with its number, escaped so it stays text.

```yaml
rank: edge
clipboard: |
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

```yaml
rank: edge
clipboard: |
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

```yaml
rank: edge
clipboard: |
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

Bullets pasted on an empty first item of an ordered list are numbered, and the items after are
renumbered (rule 7): bullets carry no numbers to keep, so the list keeps its form (rule 2).

```yaml
rank: edge
clipboard: |
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
3. b
```

## Paste17

A nested list in the paste keeps its own marker: only the pasted top level takes the destination's
form (rule 4).

```yaml
rank: edge
clipboard: |
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

An ordered list pasted into an ordered list takes its numbers, and the items after are renumbered
(rule 7): in an ordered list the numbers are form.

```yaml
rank: edge
clipboard: |
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
2. x
3. y┃
4. b
```

## Paste19

A heading pasted into a list is an item whose text is the heading (an item's first block can be a
heading), and the rest of its section goes with it into the item (rule 5). Glued onto the item's
text (`a# h`), as bare Obsidian, WorkFlowy and Dynalist paste it, the heading would be lost; Logseq
and Roam make a heading block.

```yaml
rank: edge
clipboard: |
  # h
  text
```

```buffer
- a┃
```

> pasteStructured

```buffer
- a
- # h
  text┃
```

## Paste20

A list pasted at the end of a paragraph that owns a list goes first in that list, as Enter there
puts a new node right after the paragraph's text (rule 5); the pasted items take the list's form
(rule 2).

```yaml
rank: common
clipboard: |
  - p
  - q
```

```buffer
Notes┃

- x
- z
```

> pasteStructured

```buffer
Notes

- p
- q┃
- x
- z
```

## Paste21

The same with no blank line between the paragraph and its list: none is added (rule 2: the
destination decides spacing).

```yaml
rank: edge
clipboard: |
  - p
  - q
```

```buffer
Notes┃
- x
```

> pasteStructured

```buffer
Notes
- p
- q┃
- x
```

## Paste22

Plain paste on a code line: the lines are code as they are, each taking the containers the block is
in (here the item's indentation).

```yaml
rank: edge
clipboard: |-
  a = 1
    b = 2
```

````buffer
- code
  ```
  ┃
  ```
````

> pastePlain

````buffer
- code
  ```
  a = 1
    b = 2┃
  ```
````

## Paste23

Structured paste on a code line pastes as plain text: in code, what is pasted is code.

```yaml
rank: rare
clipboard: |-
  - a
  - b
```

````buffer
> ```
> x┃
> ```
````

> pasteStructured

````buffer
> ```
> x- a
> - b┃
> ```
````

## Paste24

One line of plain text is inline text: the host pastes it at the caret.

```yaml
rank: common
clipboard: |-
  x
```

```buffer
- a┃b
```

> pasteStructured

```result
notApplicable
```

```buffer
- ax┃b
```

## Paste25

A code block pasted at the end of the text of an item with children goes after the item's text,
before its children, the list tight as it was (rule 2): blank lines around the code would make it
loose.

````yaml
rank: common
clipboard: |
  ```
  c
  ```
````

```buffer
- a┃
  - kid
- b
```

> pasteStructured

````buffer
- a
  ```
  c┃
  ```
  - kid
- b
````

## Paste26

One line that is an item is pasted as nodes, as several are: here an item after this one. Pasted
by the host as text, it would read `- a- x`. Logseq, Tine and SiYuan make the item; WorkFlowy and
BlockNote paste its text into the item.

```yaml
rank: common
clipboard: |
  - x
```

```buffer
- a┃
- b
```

> pasteStructured

```buffer
- a
- x┃
- b
```

## Paste27

Items pasted as first children land at the existing children's column, here four columns in,
under a task: the destination decides the form (rule 2), so the paste's own indentation goes.

```yaml
rank: edge
clipboard: |
  - a
  - b
```

```buffer
- [ ] t┃
    - g
```

> pasteStructured

```buffer
- [ ] t
    - a
    - b┃
    - g
```

## Paste28

A callout pasted at the end of an item's text goes into the item, as a quote does (rule 5): it is a
quote whose first line is `[!type]`.

```yaml
rank: rare
clipboard: |
  > [!note] t
  > body
```

```buffer
- a┃
- b
```

> pasteStructured

```buffer
- a
  > [!note] t
  > body┃
- b
```

## Paste29

A list and a block after it, pasted at the end of an item's text: the block goes into the pasted
item before it (rule 5), and the list stays tight (rule 2): the clipboard's blank line between them
goes, as in [Paste25](#paste25).

```yaml
rank: edge
clipboard: |
  - alpha

  > note
```

```buffer
- top┃
- next
```

> pasteStructured

```buffer
- top
- alpha
  > note┃
- next
```

## Paste30

Plain paste escapes a line that would start a block as Shift-Enter does
([ShiftEnter18](shift-enter.md#shiftenter18)): an ordered marker on a continuation line is escaped
even when its number isn't 1.

```yaml
rank: rare
clipboard: |-
  x
  2. y
```

```buffer
- a┃
```

> pastePlain

```buffer
- ax
  2\. y┃
```

## Paste31

One line pasted in the middle of the text goes in inline, even one that would be an item at the
text's end ([Paste26](#paste26)): a sentence keeps what is pasted into it.

```yaml
rank: common
clipboard: |-
  1. Introduction
```

```buffer
- see ┃here
```

> pasteStructured

```result
notApplicable
```

```buffer
- see 1. Introduction┃here
```

## Paste32

A heading pasted at the end of a paragraph is a heading node after it, where Enter would put a new
node. A host pastes it as text, glued onto the paragraph: `para# h`.

```yaml
rank: edge
clipboard: |
  # h
```

```buffer
para┃
```

> pasteStructured

```buffer
para

# h┃
```

## Paste33

At the end of a section, a heading of its level goes after the section: it closes it, and takes in
nothing.

```yaml
rank: rare
clipboard: |
  ## h
```

```buffer
## A

para┃
```

> pasteStructured

```buffer
## A

para

## h┃
```

## Paste34

A heading pasted with a paragraph after it takes the paragraph in, as a heading typed there would:
`next` becomes its section's first paragraph.

```yaml
rank: edge
clipboard: |
  # h
```

```buffer
para┃

next
```

> pasteStructured

```buffer
para

# h┃

next
```

## Paste35

Inside a section, a heading of its level closes it and takes in the rest of it, up to the next
heading of its level: `more` and `C` become `h`'s, and `B` stays where it is.

```yaml
rank: rare
clipboard: |
  ## h
```

```buffer
## A

para┃

more

### C

## B
```

> pasteStructured

```buffer
## A

para

## h┃

more

### C

## B
```

## Paste36

Structured paste in the middle of an item's text splits the item where Enter would
(`pasteStructuredMidText: split`, the default), and the paste goes in between: its first text joins
the text before the caret, `y` stays that text's child, as in the clipboard, and the text after the
caret is the next item, the caret at its start. WorkFlowy and Dynalist split; neither keeps `y`
under `x`.

```yaml
rank: edge
clipboard: |
  x
  - y
```

```buffer
- list
  - See ┃here.
```

> pasteStructured

```buffer
- list
  - See x
    - y
  - ┃here.
```

## Paste37

In a paragraph the same: the text after the caret is a paragraph of its own after the paste, set off
by a blank line, which `y` would otherwise take in.

```yaml
rank: edge
clipboard: |
  x
  - y
```

```buffer
See ┃here.
```

> pasteStructured

```buffer
See x
- y

┃here.
```

## Paste38

With `pasteStructuredMidText: after`, the item is left as it is, and the paste goes after it, as at
the end of its text. Logseq, Tine, Roam, SiYuan and true-outliner do this.

```yaml
rank: edge
pasteStructuredMidText: after
clipboard: |
  x
  - y
```

```buffer
- list
  - See ┃here.
```

> pasteStructured

```buffer
- list
  - See here.
  - x
    - y┃
```

## Paste39

With `pasteStructuredLines: items`, plain lines on an empty item are items, one each, in its place,
as Roam, WorkFlowy and Dynalist make them.

```yaml
rank: edge
pasteStructuredLines: items
clipboard: |
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

## Paste40

Plain paste of two paragraphs: the blank line is a paragraph break in the item, as two Shift-Enters
make one, `y` and the rest of the text the item's second paragraph. Logseq, Roam and Tine keep it so.

```yaml
rank: edge
clipboard: |
  x

  y
```

```buffer
- a┃b
- c
```

> pastePlain

```buffer
- ax

  y
  ┃b
- c
```

## Paste41

In a quote, the paragraph break keeps its `>`.

```yaml
rank: rare
clipboard: |
  x

  y
```

```buffer
> See ┃here.
```

> pastePlain

```buffer
> See x
>
> y
> ┃here.
```

## Paste42

In an item with children, the text after the caret takes them, as Enter's split gives them to it
(`enterMidItem: sibling`, the default); a pasted list's first item joins the text before the caret,
its marker being form.

```yaml
rank: rare
clipboard: |
  - x
  - y
```

```buffer
- a┃b
  - child
```

> pasteStructured

```buffer
- ax
- y
- ┃b
  - child
```

## Paste43

With `enterMidItem: child`, the text after the caret is the item's first child after the paste, as
Enter makes it, and the item keeps its children.

```yaml
rank: rare
enterMidItem: child
clipboard: |
  - x
  - y
```

```buffer
- a┃b
  - child
```

> pasteStructured

```buffer
- ax
  - y
  - ┃b
  - child
```

## Paste44

On an empty item, a math block is the item's text, as code is ([Paste9](#paste9)); the caret goes to
the end of its last line, not after the closing `$$`, where typing would unmake it.

```yaml
rank: edge
flavor: obsidian
clipboard: |
  $$
  x^2
  $$
```

```buffer
- a
- ┃
```

> pasteStructured

```buffer
- a
- $$
  x^2┃
  $$
```

## Paste45

Plain paste of a math block's lines: a `$$` at a line's start would open a math block, so it is
escaped, as any line that would start a block; the first line joins the text before the caret.

```yaml
rank: rare
flavor: obsidian
clipboard: |
  $$
  x^2
  $$
```

```buffer
- a┃b
```

> pastePlain

```buffer
- a$$
  x^2
  \$$
  ┃b
```

## Paste46

At the end of a code block, after its closing fence, the paste goes right after the block, where
Enter puts a new node: a second code block goes into the item after the first. Left to the host,
it would join the closing fence (```` ``````js ````), and the code would run on to the end.

````yaml
rank: edge
clipboard: |
  ```js
  code
  ```
````

````buffer
- list
  ```js
  code
  ```┃
````

> pasteStructured

````buffer
- list
  ```js
  code
  ```

  ```js
  code┃
  ```
````

## Paste47

Plain lines at the end of a code block are a paragraph after it: a block that isn't text holds no
lines of its own.

```yaml
rank: rare
clipboard: |
  one
  two
```

````buffer
```
x
```┃
````

> pasteStructured

````buffer
```
x
```

one
two┃
````
