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
tags: rare
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
tags: rare
quotes: container
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

## Regression33

A quoted text's lazy line is read out of the quote, where the paragraph it continues isn't open: a
list from 2 starts there (`> q1⏎2) x` is a quote and a list), so the line is escaped, though in the
quote a list from 2 couldn't interrupt the paragraph (dev/19-quotes.md §3.2.1).

```yaml
tags: edge
```

```buffer
> q1
p ┃2) x
```

> deleteSoftLineBackward

```buffer
> q1
┃2\) x
```

## Regression34

The quote's frame gone, its lazy line is a paragraph's, which the `---` after it would underline: a
blank line sets the break apart. The seam check read the paragraph's later line with the quote's `>`
before it, a container's, though it was the text's own frame (dev/19-quotes.md §3.2.2).

```yaml
tags: edge
```

```buffer
> ┃q0
S1
---
```

> deleteContentBackward

```buffer
┃q0
S1

---
```

## Regression35

An empty item can't interrupt a link reference definition (it reads as the paragraph's `-`): a blank
line sets it apart. The seam check took any block starting on its line for it (dev/19-quotes.md §3.2.2).

```yaml
tags: edge
clipboard: |-
  x

  [a]: /u
```

```buffer
- foo┃

  - 

para
```

> paste

```buffer
- foo

  - x

  [a]: /u┃

  - 

para
```

## Regression36

A quoted text can't start with spaces after its `> `: the quote's paragraph's padding, which the read
leaves out. Pasted indented lines in a quote lose them on their first line (dev/19-quotes.md §3.2.1).

```yaml
tags: edge
clipboard: |-
  - x

    ```
    c
    ```
```

```buffer
> a┃b
> c
```

> pastePlain

```buffer
> a- x

> \```
>   c
>   \```┃b
> c
```

## Regression37

Lazy lines that would make a table in the quote make none out of it (CommonMark's reference parser
agrees): no escape on the delimiter row (dev/19-quotes.md §3.2.1).

```yaml
tags: edge
```

```buffer
- a

> q┃
| a | b |
|---|---|
```

> indent

```buffer
- a
- > q┃
  | a | b |
  |---|---|
```

## Regression38

The quote gone, its paragraph adopts the list after it, which an empty item can't start right under
the paragraph's text: a blank line between. The check read the paragraph's later line with the
quote's `>` before it, the paragraph written as itself taking its old container's pieces (dev/19-quotes.md
§3.2.2).

```yaml
tags: edge
quotes: container
```

```buffer
>┃ q
    - a
1. 
```

> deleteSoftLineBackward

```buffer
┃q
    - a

1. 
```

## Regression39

An item after the moved one, of its list as it is (`- x` beside `  - b`), isn't lined up with it where that would move its paragraph's line that could start a block (`2) x`): a shift the writer can't write (dev/19-quotes.md §3.2.3).

```yaml
tags: edge
flavor: obsidian
```

```buffer
  - l┃ong text
  - b
- x
  2) x
```

> moveSubtreeDown

```buffer
  - b
  - l┃ong text
- x
  2) x
```

## Regression40

A paragraph in a subtree that moves within its container, whose line could start a block once re-indented (`- b` past four columns), is spelled where it lands: the writer lines the subtree up with the list it joins (dev/19-quotes.md §3.2.4).

```yaml
tags: edge
flavor: commonmark
```

```buffer
   - x
*┃« a
   - b
         - b
   »   - b
```

> moveSubtreeUp

```buffer
   - ┃«a
      - b
            - b
         - »b
   - x
```

## Regression41

An item regrouped into a callout behind the paragraph placed there is spelled where it lands, as a placed one is (dev/19-quotes.md §3.2.4).

```yaml
tags: edge
flavor: obsidian
quotes: container
```

```buffer
> [!note] T
┃«code
 »  - x
         - b
```

> indent

```buffer
> [!note] T
> ┃«code
> - x
>       - b»
```

## Regression42

A moved item is never written where the item before it would take it in: `- b` joins `  - x`'s list, but after `* x` at column 0 it goes at column 0, `  - x` lined up with it (dev/19-quotes.md §3.2.3).

```yaml
tags: edge
flavor: commonmark
```

```buffer
  - x
1. b«
* x
- b»
```

> moveSubtreeUp

```buffer
1. b«
* x
- b»
- x
```

## Regression43

A moved item that would take in the item after it, of another list, goes at that one's column, the item before it not taking it in: lined up with it instead, `- x` would shift, and what follows it with it (dev/19-quotes.md §3.2.3).

```yaml
tags: edge
flavor: gfm
```

```buffer
   - 
« »     1. x
   - x
```

> outdent

```buffer
   - 
«   1. »x
   - x
```

## Regression44

In CommonMark, below a checkbox alone on its line the paragraph the checkbox starts goes on: the next line's spaces are text, not padding, and the line stays as it was (dev/19-quotes.md §3.2.5).

```yaml
tags: edge markup-task
flavor: commonmark
```

```buffer
- [x] x┃
       - b
```

> deleteSoftLineBackward

```buffer
- [x] ┃
       - b
```

## Regression45

A lazy line past spaces, its node moved to another column, is written at its new container's content column: as it was, its spaces would be the item's (dev/19-quotes.md §3.2.4).

```yaml
tags: edge markup-task
flavor: commonmark
```

```buffer
1. x«
    - [x]» 
  cont
```

> outdent

```buffer
x«
- [x] 
    cont»
```

## Regression46

In CommonMark, which has no tasks, the paragraph a lone checkbox starts goes on below it: `2) x` interrupts nothing and gets no escape (dev/19-quotes.md §3.2.5).

```yaml
tags: edge markup-task
flavor: commonmark
```

```buffer
- b c
  - ┃[ ] 
    2) x
```

> outdent

```buffer
- b c
- [ ] 
  ┃2) x
```

## Regression47

A setext heading past a checkbox keeps its underline unescaped: the underline is the title's frame (dev/19-quotes.md §3.2.5).

```yaml
tags: edge
flavor: obsidian
```

```buffer
- [x] a
      - lo┃ng text
  - 
```

> shiftEnter

```buffer
- [x] a
      - lo
  ┃ng text
  - 
```

## Regression48

An item isn't lined up further left where the indented block after it (code) would then be its (dev/19-quotes.md §3.2.3).

```yaml
tags: edge
flavor: commonmark
```

```buffer
1. ┃«x
    - [»x] x
1. a
  1. 
    - 
```

> moveSubtreeDown

```buffer
1. a
1. ┃«x
    - [»x] x
  1. 
    - 
```

## Regression49

The seam check reads an item with no text with its first child's line, which keeps it open past a blank line: the paragraph after it, lazy there, is set off by one (dev/19-quotes.md §3.2.2).

```yaml
tags: edge
flavor: obsidian
```

```buffer
1. 
    1. x

      - x
- a
      «- b
      1. x»
```

> outdent

```buffer
1. 
    1. x

      - x

a
    «- b
    1. x»
```

## Regression50

A paragraph out of its quote into a section: its lazy lines are regular ones there, where `| a |⏎|---|` would make a table, so they are escaped (dev/19-quotes.md §3.2.4).

```yaml
tags: edge
flavor: gfm
quotes: container
```

```buffer
┃> q
| a |
|---|
```

> outdent

```buffer
┃q
| a |
|\---|
```


## Regression51

A copy beside its original, at its column, is written as it is, its paragraph's line that could start a block too; and a placed item isn't lined up with the one before it where it needn't be and the shift would carry such a line (dev/19-quotes.md §3.2.3).

```yaml
tags: edge
flavor: obsidian
```

```buffer
  - b
  - «long text
- x»
  2) x
```

> duplicateSubtree

```buffer
  - b
  - long text
- x
  2) x
- «long text
- x»
  2) x
```

## Regression52

A placed item isn't lined up further left where the indented block after it (code) would then be its (dev/19-quotes.md §3.2.3).

```yaml
tags: edge
flavor: commonmark
```

```buffer
1. x
    - [x] x
1. a
  1. «
 »   - 
```

> duplicateSubtree

```buffer
1. x
    - [x] x
1. a
  1. 
    - 
  1. «
    »- 
```

## Regression53

A setext title can't start with a task's checkbox alone on its line in a flavor with tasks: an empty task there, its next line code. Refused (dev/19-quotes.md §3.2.6).

```yaml
tags: edge markup-task
flavor: obsidian
```

```buffer
- [x] a┃
      - long text
  - 
```

> deleteSoftLineBackward

```yaml
result: rejected not-expressible
```

```buffer
- [x] a┃
      - long text
  - 
```

## Regression54

The seam check finds an item a paragraph adopts from beside it where it was: the empty item read as itself, the code after it set off by a blank line (dev/19-quotes.md §3.2.2).

```yaml
tags: edge
flavor: commonmark
```

```buffer
1. a
┃1. x
    - [x] x
  1. 
    - 
```

> outdent

```buffer
1. a

┃x
  - [x] x
  1. 

    - 
```

## Regression55

In CommonMark the text below a lone checkbox keeps its spaces, as text: the caret after the paste stays in the text (it was past its end, the spaces trimmed as padding) (dev/19-quotes.md §3.2.5).

```yaml
tags: edge markup-task
flavor: commonmark
clipboard: |-
  x
  # y
```

```buffer
1. x
    - [x] 
  cont┃
```

> pastePlain

```buffer
1. x
    - [x] 
        contx
      \# y┃
```


## Regression56

Enter at a quote's text start under an empty task, in a flavor with tasks: the empty paragraph above it would be the task's first block, but a blank line after an empty task ends it and without one the line is its text. Refused (dev/19-quotes.md §3.2.6).

```yaml
tags: edge markup-task
flavor: gfm
```

```buffer
- a
- [ ] 
  > ┃q
- b
```

> enter

```yaml
result: rejected not-expressible
```

```buffer
- a
- [ ] 
  > ┃q
- b
```

## Regression57

In CommonMark the checkbox is text, the item not empty: the empty paragraph goes in above the quote, set off from it by a blank line (dev/19-quotes.md §3.2.6).

```yaml
tags: edge markup-task
flavor: commonmark
```

```buffer
- a
- [ ] 
  > ┃q
- b
```

> enter

```buffer
- a
- [ ] 

  ┃◌

  > q
- b
```


## Regression58

An item after a moved one isn't lined up with it where it needn't be and the shift would carry its lazy line past spaces (`    1. x` continuing `  1. b`): at column 0 that line would be `b`'s list (dev/19-quotes.md §3.2.3).

```yaml
tags: edge
flavor: commonmark
```

```buffer
- «a
2)» a
1. x
  1. b
    1. x
```

> moveSubtreeDown

```buffer
┃«1. x
- »a
2. a
  1. b
    1. x
```

## Regression59

A list of its own after an item, placed in its container, stays where it was, the item before it not taking it in there: nothing after it has to move (dev/19-quotes.md §3.2.3).

```yaml
tags: edge
flavor: commonmark
```

```buffer
   1┃«. x
   1. »b
   - 
   - [ ] 
  cont
```

> moveSubtreeDown

```buffer
   - 
   1┃«. x
   1. »b
   - [ ] 
  cont
```

## Regression60

The indented block after an item, last in a list a block adopts (`listParent: block`), is its section's next node: the item isn't lined up further left, where it would take that block in (dev/19-quotes.md §3.2.3).

```yaml
tags: edge
flavor: commonmark
quotes: atom
listParent: block
```

```buffer
    1. a
1. ┃«x
      - [»x] x
1. a
  1. 
    - 
```

> moveSubtreeDown

```buffer
    1. a
1. a
1. ┃«x
      - [»x] x
  1. 
    - 
```

## Regression61

Items moved into a container that would take in the item after them that stays go at that one's column, so it doesn't move (its line `    - x` couldn't) (dev/19-quotes.md §3.2.3).

```yaml
tags: edge
flavor: gfm
quotes: atom
listParent: container
```

```buffer
«   - x
      - x
  »    1. 
   - a
         - x
```

> outdent

```buffer
x
   - «x
   1. »
   - a
         - x
```


## Regression62

A plain paste of a line break before a quote atom's `>`: the line breaks at a text's start go, as
in a paragraph (PastePlain25); with nothing else, refused (PastePlain27). It wrote `> ` before the
quote, which read as a quote in a quote (dev/19-quotes.md §3.3).

```yaml
tags: rare
flavor: gfm
quotes: atom
enterInQuote: split
clipboard: |+

```

```buffer
┃> ab
```

> pastePlain

```yaml
result: rejected not-expressible
```

```buffer
┃> ab
```

## Regression63

An item pasted over a list item's text, which the item after it, of the same list, lines up with: not
at that item's column where the item before, of another list, would take it in (`- a` takes in
column 2), but at its container's (dev/19-quotes.md §3.3).

```yaml
tags: rare
flavor: commonmark
clipboard: |
  - x
```

```buffer
- a
1. «x»
  1. b
```

> paste

```buffer
- a
1. x┃
1. b
```

## Regression64

Tab on a quote atom with a lazy line led by a tab is refused: after the new item's marker the tab
would span other columns, and `2)` would no longer continue the quote (the writer re-indents spaces,
not tabs) (dev/19-quotes.md §3.3).

```yaml
tags: rare
quotes: atom
```

```buffer
- a

> ┃q
→2) long text
```

> indent

```yaml
result: rejected not-expressible
```

```buffer
- a

> ┃q
→2) long text
```
