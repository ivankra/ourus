# Indent

Command: `indent` (Tab). Its inverse is [`outdent`](outdent.md).

Indent takes the selected nodes (contiguous siblings of one kind) one level deeper, with their
subtrees. The rules, in order; the first that applies wins:

1. **On a code line**, Tab is the host's: it indents the code ([Fence21](fences.md#fence21)); any line
   of indented code is one (Indent38). A fence's line is markup: there Tab is the block's (Indent34).
2. **A heading goes one level deeper**, the headings in its section with it, even past a missing
   level (Indent12, Indent23); a setext heading stays setext where it can say the level (Indent16)
   and becomes ATX where it can't (Indent25); past `######` it is refused (Indent24).
3. **A paragraph becomes an item**: the first item of the paragraph above (Indent18, Indent21); after
   a list, its next item, one level in as anywhere, with the list's marker (Indent29, Indent29b,
   Indent29c); with nothing above to hold it, an item in place (Indent22). Into a quote above, it is
   the quote's last child ([quotes.md](quotes.md)). **An atom too**, the item's text (code, math, a
   table, a quote atom: Indent34, Indent35, Indent36, [QuoteAtom21](quotes.md#quoteatom21)), placed
   as a paragraph is; a thematic break under a bullet of its own character is refused, `- ---` being
   one rule (Indent37, Indent37b).
4. **An item becomes the last child of its previous sibling**, its subtree coming along (Indent1,
   Indent2, Indent9): it lines up with the children there, adopting their marker (Indent3); a new
   ordered list starts at 1, so it can't read as more of the text above (Indent4); one joining an
   ordered list continues its numbers (Indent5). Outdent gives it back (Indent26, Indent27). The
   caret ends in its text, even from before its marker (Indent28); from the fence line of an item
   whose text is fenced code, it stays there where the host shows markup as text, so the outdent can
   follow, and else goes into the code (Indent31, Indent31b). Under an empty item it comes
   right after the marker's line, the blank lines between going: an item can start with one blank
   line, no more, and with one it ends (Indent30).
5. **With nothing above it at its level, it is refused** (`no-previous-sibling`, Indent10,
   Indent11).
6. **Indentation follows the document**: tabs where the list has tabs (Indent6, Indent7). What the
   command isn't about stays byte for byte: code payload, hard-break spaces, a tab after a marker,
   CRLF, the numbers of untouched lists (Indent13, Indent14, Indent15, Indent17, Indent19,
   Indent20).

Bare Obsidian's Tab indents the caret's line by a tab (Live Preview the same): an item's children
stay where they are (they become siblings), a heading gets spaces in front of its `#`s, and a
paragraph becomes indented code. Obsidian's Outliner indents an item with its children, as the
outliners and ourus do.

## Indent1

Item becomes last child of previous sibling.

```yaml
tags: core
```

```buffer
- a
- b┃
```

> indent

```buffer
- a
  - b┃
```

## Indent2

The item's whole subtree moves with the item.

Bare Obsidian indents only the line, so `c` stops being `b`'s child.

```yaml
tags: core
```

```buffer
- a
- b┃
  - c
    more c
```

> indent

```buffer
- a
  - b┃
    - c
      more c
```

## Indent3

When the parent already has children, the item lines up with them and adopts their bullet: a
different bullet would start a second list under `a`.

Bare Obsidian indents the line by its own unit and keeps its bullet: `b` is `a`'s child, but in a
second list under it; Obsidian's Outliner lines `b` up with `x`, its bullet kept, the same second
list.

```yaml
tags: common
```

```buffer
- a
    * x
- b┃
```

> indent

```buffer
- a
    * x
    * b┃
```

## Indent4

An ordered item that starts a new list is renumbered from 1, as only a list starting at 1 can
interrupt a paragraph: `   2. b` would read as more of `a`'s text. The list it left renumbers too.

```yaml
tags: common
```

```buffer
1. a
2. b┃
3. c
```

> indent

```buffer
1. a
   1. b┃
2. c
```

## Indent5

Items joining an existing ordered list continue its numbering.

```yaml
tags: common
```

```buffer
1. a
   1. x
2. b┃
```

> indent

```buffer
1. a
   1. x
   2. b┃
```

## Indent6

Tab-indented list keeps indenting with tabs.

```yaml
tags: common
```

```buffer
- a
→- b
- c┃
```

> indent

```buffer
- a
→- b
→- c┃
```

## Indent7

Tab nesting elsewhere in the list sets the indent.

```yaml
tags: edge
```

```buffer
- a
- b┃
- c
→- d
```

> indent

```buffer
- a
→- b┃
- c
→- d
```

## Indent8

A new, empty item can be indented right away.

Due to `- a\n  -` parsing as a setext heading in commonmark,
it needs to open with a placeholder until something is typed.

```yaml
tags: core
```

```buffer
- a
- ┃
```

> indent

```buffer
- a
  - ┃◌
```

> "b"

```buffer
- a
  - b┃
```

## Indent9

Selected siblings indent together.

```yaml
tags: common
```

```buffer
- a
- «b
- c»
- d
```

> indent

```buffer
- a
  - «b
  - c»
- d
```

## Indent10

First item cannot indent: there is nothing above to nest under, and no tab is typed either.

```yaml
tags: common
```

```buffer
- a┃
- b
```

> indent

```yaml
result: rejected no-previous-sibling
```

```buffer
- a┃
- b
```

## Indent11

First item of a paragraph's list cannot indent: the paragraph owns the list, and an item can't
nest under a paragraph's text.

```yaml
tags: edge
```

```buffer
Intro

- a┃
```

> indent

```yaml
result: rejected no-previous-sibling
```

```buffer
Intro

- a┃
```

## Indent12

Subheadings shift with the heading, even with no heading above at its level: a heading's depth is
its level, and Markdown can skip one (as org-mode demotes a first subheading). Bare Obsidian puts
spaces before the `#`s, which leaves the heading as it was.

```yaml
tags: common free-form
```

```buffer
# A
## B┃
### C
```

> indent

```buffer
# A
### B┃
#### C
```

## Indent13

Fenced code reindents with its item.

Its own relative indentation and blank lines are payload, kept there and back.

```yaml
tags: edge
```

````buffer
- a
- b┃
  ```
  x

    y
  ```
````

> indent

````buffer
- a
  - b┃
    ```
    x

      y
    ```
````

> outdent

````buffer
- a
- b┃
  ```
  x

    y
  ```
````

## Indent14

Tab after the marker.

A tab after the marker: shifting the line changes how far the tab reaches, not where the text
starts.

```yaml
tags: rare
```

```buffer
- a
-→b┃
```

> indent

```buffer
- a
  -→b┃
```

## Indent15

Untouched list keeps its numbers.

A list whose items a command leaves alone keeps its numbers, however they run.

```yaml
tags: edge
```

```buffer
1. a
   - x
   - y┃
5. b
9. c
```

> indent

```buffer
1. a
   - x
     - y┃
5. b
9. c
```

## Indent16

Setext heading demoted with its subheading.

Emacs demotes it as ourus does, setext still (`-----`); true-outliner writes it as an ATX `##`; bare
Obsidian and its Outliner indent the line, which leaves it a level-1 heading.

```yaml
tags: rare free-form
```

```buffer
Title┃
=====

## Sub
```

> indent

```buffer
Title┃
-----

### Sub
```

## Indent17

Indent keeps CRLF endings.

The lines keep their CRLF endings, there and back.

```yaml
tags: rare
```

```buffer
- a␍
- b┃␍
```

> indent

```buffer
- a␍
  - b┃␍
```

> outdent

```buffer
- a␍
- b┃␍
```

## Indent18

A paragraph indented under a paragraph becomes its first item, with the `bullet` option's bullet.

```yaml
tags: edge
bullet: +
```

```buffer
intro

b┃
```

> indent

```buffer
intro

+ b┃
```

## Indent19

Hard-break spaces survive an indent.

A structural command may rewrite prefixes, never a node's own text.

```yaml
tags: edge
```

```buffer
- a
- b  
  c┃
```

> indent

```buffer
- a
  - b  
    c┃
```

> outdent

```buffer
- a
- b  
  c┃
```

## Indent20

Code whitespace survives an indent.

```yaml
tags: edge
```

````buffer
- a
- b┃
  ```
    x
  ```
````

> indent

````buffer
- a
  - b┃
    ```
      x
    ```
````

## Indent21

A paragraph indented under a paragraph becomes its list item, right under it: the blank line
separated two paragraphs, and a list needs none ([Gap6](gaps.md#gap6)). Outdented, it is a paragraph
again, set off by a blank line, and the text comes back as it was.

Bare Obsidian and its Outliner indent the paragraph by a tab, which makes it indented code.

```yaml
tags: common
```

```buffer
para a

para b┃
```

> indent

```buffer
para a

- para b┃
```

> outdent

```buffer
para a

para b┃
```

## Indent22

A paragraph with nothing above to hold it becomes an item in place; outdented, it is a paragraph
again.

Bare Obsidian and its Outliner make it indented code, as in [Indent21](#indent21).

```yaml
tags: edge free-form
```

```buffer
Para┃
```

> indent

```buffer
- Para┃
```

> outdent

```buffer
Para┃
```

## Indent23

A heading with a heading above at its level becomes that heading's last subheading, its own
subheadings going one level deeper with it.

```yaml
tags: common free-form
```

```buffer
# A
## B
## C┃
### D
```

> indent

```buffer
# A
## B
### C┃
#### D
```

## Indent24

A level-6 heading can't go deeper (Outdent5's mirror).

```yaml
tags: rare
```

```buffer
# A
###### B┃
```

> indent

```yaml
result: rejected at-h6-bound
```

```buffer
# A
###### B┃
```

## Indent25

A setext level-2 heading indents to ATX `###`, the only way to write level 3. Outdented back, it
stays ATX: the outline comes back, its text written as `##`.

```yaml
tags: rare free-form
```

```buffer
Title┃
-----

### Sub
```

> indent

```buffer
### Title┃

#### Sub
```

> outdent

```buffer
## Title┃

### Sub
```

## Indent26

Indent, then outdent: the item and its subtree are back as they were.

```yaml
tags: common
```

```buffer
- a
- b┃
  - c
- d
```

> indent

```buffer
- a
  - b┃
    - c
- d
```

> outdent

```buffer
- a
- b┃
  - c
- d
```

## Indent27

Indent, then outdent, on a selection: back as it was (Indent9's inverse).

```yaml
tags: common
```

```buffer
- a
- «b
- c»
- d
```

> indent

```buffer
- a
  - «b
  - c»
- d
```

```yaml
result: applied
```

> outdent

```buffer
- a
- «b
- c»
- d
```

## Indent28

From before the marker, Tab indents the item and the caret ends in its text, where typing can't
break the marker.

```yaml
tags: rare
```

```buffer
- a
┃- b
```

> indent

```buffer
- a
  - ┃b
```

## Indent29

A paragraph right after a list becomes its next item, one level in as Tab is anywhere
([Indent22](#indent22)), not the last item's child, two levels in; so outdent and indent invert
([Outdent2](outdent.md#outdent2)). The blank line above it goes: it separated the list from a
paragraph, and kept, it would make the list loose. RemNote does the same; BlockNote, bare Obsidian
and its Outliner make it the item's second paragraph, set off by the blank line, and true-outliner
its child item.

```yaml
tags: edge
```

```buffer
- a

para┃
```

> indent

```buffer
- a
- para┃
```

## Indent29b

After an ordered list, the paragraph takes its numbering, the next number.

```yaml
tags: rare
```

```buffer
1. a

para┃
```

> indent

```buffer
1. a
2. para┃
```

## Indent29c

After a nested list, it joins the list it is one level in from: the top-level one, after `a` and
its children.

```yaml
tags: rare
```

```buffer
- a
  - b

para┃
```

> indent

```buffer
- a
  - b
- para┃
```

## Indent30

An item indented under an empty item set off by a blank line: the blank line goes, since an empty
item followed by one ends there and could hold no child. Outdent gives the outline back, the list
tight now.

```yaml
tags: rare
```

```buffer
- a
- 

┃- b
```

> indent

```buffer
- a
- 
  - ┃b
```

> outdent

```buffer
- a
- 
- ┃b
```

## Indent31

From the fence line of an item whose text is fenced code, the caret stays on the fence where the
host shows markup as text (`markup: text`, the default), where the user had it: in the code, Tab and
Shift-Tab are the host's and indent the code ([Fence21](fences.md#fence21)), so there the outdent
couldn't follow.

```yaml
tags: rare markup-fence
```

````buffer
- a
- ┃```
  code
  ```
````

> indent

````buffer
- a
  - ┃```
    code
    ```
````

> outdent

````buffer
- a
- ┃```
  code
  ```
````

## Indent31b

Where the host decorates markup (`markup: decorated`), the caret goes into the code, where typing
can't break its fence.

```yaml
tags: rare markup-fence
markup: decorated
```

````buffer
- a
- ┃```
  code
  ```
````

> indent

````buffer
- a
  - ```
    ┃code
    ```
````

## Indent32

A paragraph whose lines end differently (a CRLF, then an LF) keeps each line's ending as an item,
and outdented back: the command is about the paragraph's place, not its line endings.

```yaml
tags: rare
```

```buffer
a┃␍
b
```

> indent

```buffer
- a┃␍
  b
```

> outdent

```buffer
a┃␍
b
```

## Indent33

A continuation line's extra leading space, which Shift-Enter's break left there
([ShiftEnter21](shift-enter.md#shiftenter21)), stays when indent and outdent rewrite the line's
indentation: it is the text's, kept past the item's column.

```yaml
tags: rare
```

```buffer
- x
- a┃
   b
```

> indent

```buffer
- x
  - a┃
     b
```

> outdent

```buffer
- x
- a┃
   b
```

## Indent34

Fenced code after a list becomes its next item, the code the item's text, as a paragraph does (rule
3); Tab on a fence's line, which is markup (on a code line it is the host's, rule 1). The outliners
that show fences nest the block so (Athens, Dynalist, Logseq). Outdented, it is code again after the
list: a fence needs no blank line to start.

```yaml
tags: edge
```

````buffer
- a

┃```js
x
```
````

> indent

````buffer
- a
- ┃```js
  x
  ```
````

> outdent

````buffer
- a
┃```js
x
```
````

## Indent35

Math after a paragraph becomes the first item of its list, the math the item's text, as a paragraph
does ([Indent21](#indent21)); outdented, it is math again. In math Tab is the outline's, not the
host's: LaTeX's spaces mean nothing, and every block app acts on the block (Logseq, Tine, Roam,
Athens and Dynalist nest it, RemNote makes an item of it; BlockNote puts it in the item's body, as it
does a paragraph).

```yaml
tags: edge
flavor: obsidian
```

```buffer
Intro

$$
m┃
$$
```

> indent

```buffer
Intro

- $$
  m┃
  $$
```

> outdent

```buffer
Intro

$$
m┃
$$
```

## Indent36

A table after a list becomes its next item, the table the item's text: an item whose first block is
an atom has it as its text, a table as code. Outdented, it is a table again, set off by a blank line
(right under the item's text its rows would continue it).

```yaml
tags: edge
flavor: gfm
```

```buffer
- a

| x┃ | y |
| - | - |
| 1 | 2 |
```

> indent

```buffer
- a
- | x┃ | y |
  | - | - |
  | 1 | 2 |
```

> outdent

```buffer
- a

| x┃ | y |
| - | - |
| 1 | 2 |
```

## Indent37

A thematic break can't become an item of a `-` list: `- ---` reads as one rule.

```yaml
tags: rare
```

```buffer
- a

---┃
```

> indent

```yaml
result: rejected not-expressible
```

```buffer
- a

---┃
```

## Indent37b

Under another bullet it can: `* ---` is an item whose text is the rule.

```yaml
tags: rare
```

```buffer
* a

---┃
```

> indent

```buffer
* a
* ---┃
```

## Indent38

Every line of indented code is a code line: Tab is the host's there (rule 1), as on fenced code's.

```yaml
tags: rare
```

```buffer
para

    co┃de
```

> indent

```yaml
result: deferredToHost
```

```buffer
para

    co┃de
```
