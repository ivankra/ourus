# Regressions

Cases added while fixing bugs and refactoring the editing core: each pins a behavior a fix or a
change settled: an escape kept or not, a list's numbering, a fence's growth, a tab's columns. Each
is `Regression<N>`, numbered in the order they were added; its steps say which command it is about.

## Regression1

The only item of a bullet list in an item joins the item's text: the ordered list from 2 after it,
now first under that text, starts at 1, which can interrupt it (as Regression8); under a paragraph
a blank line sets it apart instead (Backspace40).

```yaml
tags: rare
```

```buffer
* a
  * ┃b
  2) x
```

> deleteContentBackward

```buffer
* a┃b
  1) x
```

## Regression2

An item joins the text above it, whose last line is an empty marker (`1.`, which can't interrupt a
paragraph, so it is text): with text after it the line would start an ordered list, so it is
escaped. The caret is at the seam, past the backslash.

```yaml
tags: rare
```

```buffer
- a
  1.␠
- ┃b
```

> deleteContentBackward

```buffer
- a
  1\. ┃b
```

## Regression3

A deleted first character's place in a quote in an item holds as text, as it does right after a
marker ([Backspace47](backspace.md#backspace47)): the space left before `# b` is the place, so the
text reads as it did, not as a heading (with two spaces after `>`, the line would be one). Every
container on the line counts, not only a list marker.

```yaml
tags: rare
```

```buffer
- > a┃ # b
```

> deleteContentBackward

```buffer
- > ┃◌ # b
```

## Regression4

The line the split ends keeps its spelling where it read so before: `2. m1` continues the paragraph
(a list from 2 can't interrupt one), and ending it here doesn't change that, so it gets no escape
([Regression12](#regression12)).

```yaml
tags: rare
```

```buffer
p0
2. m1┃
```

> enter

```buffer
p0
2. m1

┃◌
```

> deleteContentBackward

```buffer
p0
2. m1┃
```

## Regression5

An escape the text was written with stays where a split leaves it needing none: `[a]:` with nothing
after it is no definition, but the backslash may be the author's. Only the escape a split wrote goes
when a join takes it back ([Enter47](enter.md#enter47)).

```yaml
tags: rare
```

```buffer
\[a]: ┃/url
```

> enter

```buffer
\[a]:

┃/url
```

## Regression6

Fence62 with a longer run: the fences grow past it however long it is, to one more than the run.

````yaml
tags: edge
````

```````````````buffer
```
x┃````````````
body
```
```````````````

> deleteContentBackward

```````````````buffer
`````````````
┃````````````
body
`````````````
```````````````

## Regression7

A line of backticks indented four columns or more past the opening fence is code, not a closing
fence: the block, unclosed, takes it in. Backspace at its start joins it to the code line above, as
on any code line.

````yaml
tags: rare markup-fence
````

````buffer
```
code
┃    ```
````

> deleteContentBackward

````buffer
```
code┃    ```
````

## Regression8

An item of an ordered list from 2, after a bullet list in an item, moved above it: first under the
item's text, it starts at 1, the only number that can interrupt the text (from 2 it would continue
it), as a list first under text takes its start (MoveDown35); a blank line would set it apart, but
loosen the item's list.

```yaml
tags: rare
```

```buffer
- a
  - b
  2) ┃x
```

> moveSubtreeUp

```buffer
- a
  1) ┃x
  - b
```

## Regression9

A lazy line of a child's text, indented as far as its item's content but short of the child's:
outdented, the child's content column comes closer, and the line would start a list in it. It is
escaped, and stays the child's text.

```yaml
tags: rare
```

```buffer
- ┃a
    1. b
      - c
```

> outdent

```buffer
┃a
1. b
       - c
```

## Regression10

Shift-Enter, then Backspace, where the break escaped an HTML block's start: the join keeps the
escape. Mid-line `<div>` is inline HTML, while the line before the join shows `<div>` as text; the
join keeps what the text says, so it isn't quite the inverse ([ShiftEnter20](shift-enter.md#shiftenter20) drops
an escape whose character means nothing mid-line).

```yaml
tags: rare
```

```buffer
- one┃<div>
```

> shiftEnter

```buffer
- one
  ┃\<div>
```

> deleteContentBackward

```buffer
- one┃\<div>
```

## Regression11

The same with a code fence's backticks: mid-line they could open a code span with backticks later in
the text, so the escape stays.

```yaml
tags: rare
```

```buffer
para┃``` x
```

> shiftEnter

```buffer
para
┃\``` x
```

> deleteContentBackward

```buffer
para┃\``` x
```

## Regression12

The line the break ends keeps its spelling where it read so before: `2. m1` continues the paragraph
(a list from 2 can't interrupt one), and ending it here doesn't change that, so it gets no escape. A
line the break makes, or one it ends into a block, is escaped ([ShiftEnter19](shift-enter.md#shiftenter19)).

```yaml
tags: rare
```

```buffer
p0
2. m1┃
```

> shiftEnter

```buffer
p0
2. m1
┃
```

> deleteContentBackward

```buffer
p0
2. m1┃
```

## Regression13

Plain paste over a selection from the text's start, of text that starts with a line break: the
break goes (no line there is empty, as PastePlain25), and what is left replaces the selection, as
any paste over one does.

```yaml
tags: rare
clipboard: |-

  x
```

```buffer
«ab»c
```

> pastePlain

```buffer
x┃c
```

## Regression14

An item of an indented list under a paragraph, outdented at the top level: it becomes a paragraph,
its child and the items after it its list, lined up at the paragraph's column (an item left where it
was would nest under the child moved out).

```yaml
tags: rare
```

```buffer
para
  - b┃
    - c
  - d
```

> outdent

```buffer
para

b┃
- c
- d
```

## Regression15

Plain paste of text that starts with a line break, at the start of a setext title's second line:
the break would leave a blank line in the title, which would end it there; refused, as a blank line
pasted inside a title is.

```yaml
tags: rare markup-heading
clipboard: |-

  x
```

```buffer
Title
┃more
---
```

> pastePlain

```yaml
result: rejected not-expressible
```

```buffer
Title
┃more
---
```

## Regression16

With `enterMidItem: child`, Enter in the middle of an item without children: the rest is its next
sibling, as with `sibling`; the option is of an item with children, whose rest takes them or leaves
them.

```yaml
tags: rare
enterMidItem: child
```

```buffer
- one two┃ three
- next
```

> enter

```buffer
- one two
- ┃three
- next
```

## Regression17

An empty task outdented out of its list, a sibling after it: the sibling becomes its child, below its
checkbox, as under any empty item (a checkbox alone is no paragraph the child would continue).

```yaml
tags: rare markup-task
```

```buffer
- a
  - b
  - [ ] ┃
  - c
```

> outdent

```buffer
- a
  - b
- [ ] ┃
  - c
```

## Regression18

With `headingEditing: block`, Backspace at the title's start of an item whose text is a heading joins
the title into the item above, as at any heading's: the option is of headings wherever they are.

```yaml
tags: rare markup-heading
headingEditing: block
```

```buffer
- a
- # ┃H
```

> deleteContentBackward

```buffer
- a┃H
```

## Regression19

With `headingEditing: block`, Delete before an item whose text is a heading joins its title, as
before any heading.

```yaml
tags: rare markup-heading
headingEditing: block
```

```buffer
- a┃
- # H
```

> deleteContentForward

```buffer
- a┃H
```

## Regression20

With `joinWithChildren: refuse`, Delete on an empty item whose first child has children of its own
is refused: the child would come up into it with them, which either option refuses.

```yaml
tags: rare
joinWithChildren: refuse
```

```buffer
- ┃
  - a
    - b
```

> deleteContentForward

```yaml
result: rejected has-children
```

```buffer
- ┃
  - a
    - b
```

## Regression21

With `pasteLines: items`, one line with its line break, pasted in the middle of a paragraph's text:
a node, as each line is, placed after the paragraph as a pasted paragraph is (not text at the caret).

```yaml
tags: rare
pasteLines: items
clipboard: |
  x
```

```buffer
one ┃two
```

> paste

```buffer
one two

x┃
```

## Regression22

With `pastePlainLines: items`, plain paste of one line with its line break is a node too, as each
line of several is.

```yaml
tags: rare
pastePlainLines: items
clipboard: |
  x
```

```buffer
one ┃two
```

> pastePlain

```buffer
one two

x┃
```

## Regression23

Enter at the end of an unclosed fence's opening line, the document's last: the code's first line,
empty, the caret on it (the fence still unclosed, the code running to the document's end).

```yaml
tags: rare markup-fence
```

```buffer
intro

```js┃
```

> enter

```buffer
intro

```js
┃
```

## Regression24

Enter before a backslash that is text mid-line (`2\.` after other text escapes nothing) but markup at
a line's start, where `2.` would start a list: the new paragraph keeps it, as the escape its line
needs, and its text is `2. draft`. Backspace joins the line back, where it isn't needed: it goes, as a
split's own escape would (decision 7: escapes carry no provenance).

To revisit (the user): the author's backslash shouldn't be stripped, only one ourus generated. With a
mark on the escapes ourus writes (as `AUTO_WHITESPACE_MARK` marks its whitespace), the join would keep
this one: `revise 2\. draft`.

```yaml
tags: rare
```

```buffer
revise ┃2\. draft
```

> enter

```buffer
revise

┃2\. draft
```

> deleteContentBackward

```buffer
revise┃2. draft
```

## Regression25

The same in an item.

```yaml
tags: rare
```

```buffer
- revise ┃2\. draft
```

> enter

```buffer
- revise
- ┃2\. draft
```

> deleteContentBackward

```buffer
- revise┃2. draft
```

## Regression26

Shift-Enter before `\-`: on its own line `- b` would interrupt the paragraph as a list, so the
backslash is the line's escape there, and goes when Backspace joins the line back.

```yaml
tags: rare
```

```buffer
a ┃\- b
```

> shiftEnter

```buffer
a 
┃\- b
```

> deleteContentBackward

```buffer
a ┃- b
```

## Regression27

Enter before `2\.` in a paragraph whose next line starts `3\.`: the first line's backslash becomes
the escape its line needs, and the second line's stays text, as reading has it (`3.` can't interrupt a
paragraph, so nothing needs it): each line's escapes are judged against the lines as written.

```yaml
tags: rare
```

```buffer
revise ┃2\. a
3\. b
```

> enter

```buffer
revise

┃2\. a
3\. b
```

## Regression28

A callout whose `[!type]` has no space after it is still one, as Obsidian reads it: Enter at the end
of its title starts the callout's body, as it does after `[!tip] x`.

```yaml
tags: rare quote-container
flavor: obsidian
```

```buffer
> [!tip]x┃
```

> enter

```buffer
> [!tip]x
> ┃◌
```

## Regression29

A quote starting `[!a b]` is no callout (a callout's type has no spaces), but a plain quote: Enter at
the end of its paragraph starts a new one in the quote.

```yaml
tags: rare quote-container
```

```buffer
> [!a b] x┃
```

> enter

```buffer
> [!a b] x
>
> ┃◌
```

## Regression30

A paragraph whose second line is indented with a tab, made an item: the tab after the item's
indentation is narrower than at the line's start, so the line would start a list in the item. It
is escaped, and stays the paragraph's text.

```yaml
tags: rare
```

```buffer
┃para
→- a
```

> indent

```buffer
- ┃para
  →\- a
```

## Regression31

A backslash after a tab past an item's indentation, where the tab spans two columns (`- a` would
start a list there), is markup, not text. Out of the item, at the line's start, the tab spans four:
`- a` starts nothing, and the backslash goes.

```yaml
tags: rare free-form
```

```buffer
┃- para
  →\- a
```

> outdent

```buffer
┃para
→- a
```

## Regression32

The same line joined onto the item's first: past `para`, `- a` starts nothing, and the backslash
goes.

```yaml
tags: rare
```

```buffer
- para┃
  →\- a
```

> deleteContentForward

```buffer
- para┃→- a
```
