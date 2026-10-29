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
«x
   - x
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

## Regression65

A pasted item keeps the tab after its marker where it spans the same there; after a nested marker
it would span to five columns past it, its text indented code: written with a space instead.

```yaml
tags: rare
clipboard: |
  - →b
```

```buffer
- a┃
  - c
```

> paste

```buffer
- a
  - b┃
  - c
```

## Regression66

A pasted item whose text starts below its marker is written one column past the marker, `101.`'s
text at five, as the writer writes it: the paragraph after it, at two, is set apart by a blank line,
not taken in.

```yaml
tags: rare
clipboard: |
  -
    x
```

```buffer
100. a
┃
  b
```

> paste

```buffer
100. a
101.
     x┃

  b
```

## Regression67

A caret on the blank line after a folded subtree is in the folded node's gap: a command there acts
on the folded node, never on the last descendant the fold hides.

```yaml
tags: rare
folded: ①
```

```buffer
- a①
  - b
┃
- c
```

> deleteSubtree

```buffer
- ┃c
```

## Regression68

Shift-Up from the blank line after a folded subtree selects the folded node, not its hidden last
descendant.

```yaml
tags: rare
folded: ①
```

```buffer
- a①
  - b
┃
- c
```

> selectNodeUp

```buffer
- ┃««a»»
  - b

- c
```

## Regression69

On a folded row two nodes share, the caret is the outer node's, whose fold it is: the inner item is
one of its hidden children.

```yaml
tags: rare
folded: ①
```

```buffer
- - ┃a①②
  - b
```

> selectNodeDown

```buffer
- - ««a
  - b»»
```

## Regression70

A caret on the blank line after a placeholder's empty paragraph is in that paragraph's gap, not
the node above it.

```yaml
tags: rare
```

```buffer
- x
- a

  ◌
┃
- b
```

> deleteSubtree

```buffer
- x
- a┃

- b
```

## Regression71

A duplicate of a subtree selection whose first root has no text of its own (an item whose first
block is on its marker's line) selects the copy as whole lines.

```yaml
tags: rare
```

```buffer
- x
- - ««a
  - b»»
- y
```

> duplicateSubtree

```buffer
- x
- - a
  - b
- - ««a
  - b»»
- y
```

## Regression72

A plain paste over a subtree selection whose first root has no text of its own replaces it with one
node, under the root's prefix: its first child's text is the one replaced.

```yaml
tags: rare
clipboard: 'z'
```

```buffer
- x
- - ««a
  - b»»
- y
```

> pastePlain

```buffer
- x
- - z┃
- y
```

## Regression73

A cut of a line's only word keeps the no-break spaces around it: they are text, not blanks, so the
line isn't emptied.

```yaml
tags: rare
```

```buffer
a
⍽«x»⍽
b
```

> cut

```buffer
a
⍽┃⍽
b
```

## Regression74

A paste after a text's backslash, before punctuation: the backslash is the escape now, as in a text
editor, and the caret goes back with the text it absorbed into, to the end of what was pasted.

```yaml
tags: rare
clipboard: |-
  - a
  - b
```

```buffer
\┃
```

> pastePlain

```buffer
\- a
\- b┃
```

## Regression75

Lines pasted into an empty item that holds a typed space: its text is written one space past the
marker, and the lines after the first line up with it, not with the space the empty item had.

```yaml
tags: rare
clipboard: |-
  Call Sam
  Email Alex
```

```buffer
- Project
  -  ┃◌
- Inbox
```

> pastePlain

```buffer
- Project
  - Call Sam
    Email Alex┃
- Inbox
```

## Regression76

An item indented two columns past its list's others, after an item whose text starts further in: it
is a top-level item. Indenting the item before it puts its sibling there, whose content column it
would reach, so it is lined up with its list, rather than becoming that sibling's child.

```yaml
tags: rare
```

```buffer
- Earlier
-  ┃Review
  - Detail
- Later
```

> indent

```buffer
- Earlier
  -  ┃Review
- Detail
- Later
```

## Regression77

The same item, after the item before it moves up: lined up with the item now before it.

```yaml
tags: rare
```

```buffer
- Earlier
-  ┃Review
  - Detail
- Later
```

> moveSubtreeUp

```buffer
-  ┃Review
- Earlier
- Detail
- Later
```

## Regression78

Enter over a selection that takes part of a quote's markup, read as an atom: its `>` is markup,
the host's to edit where markup is text, as for any selection from inside markup.

```yaml
tags: rare
quotes: atom
```

```buffer
- «>» q
```

> enter

```yaml
result: deferredToHost
```

## Regression79

In an Obsidian note that starts with a thematic break, a copy of it below would close frontmatter
that it opens: a blank line before it, as where a command makes a rule first (DeleteSubtree9).

```yaml
tags: rare
flavor: obsidian
```

```buffer
««---
para»»
```

> duplicateSubtree

```buffer

---
para

««---
para»»
```

## Regression80

A drop whose item has a tab after its marker, in a quote in an item: the seam after it is read at
the column the line is written at, where the tab spans two columns and its text is a paragraph that
the line after would continue, so the blank line stays between them.

```yaml
tags: rare
clipboard: |
  - →b
```

```buffer
┃- x
  > - a
    ▸

  y
```

> pasteAt

```buffer
- ┃x
  > - a
  >
  > - →b

  y
```

## Regression81

Shift-Enter at the start of an item's text, past two spaces after its marker: its text goes below
its marker, which narrows its content column to the marker's and one space, which the top-level
item after it, indented two, would reach: lined up with its list, not made its child.

```yaml
tags: rare
```

```buffer
- Earlier
-  ┃Review
  - Detail
- Later
```

> shiftEnter

```buffer
- Earlier
-
  ┃Review
- Detail
- Later
```

## Regression82

The same item emptied by Shift-Backspace: its content column narrows too.

```yaml
tags: rare
```

```buffer
- Earlier
-  Review┃
  - Detail
- Later
```

> deleteSoftLineBackward

```buffer
- Earlier
- ┃
- Detail
- Later
```

## Regression83

Word's list copied from a nested item into the next top-level one: its first paragraph deeper than
those after it. Each goes under the nearest one before it at a shallower level, else at the top:
nothing is left out.

```yaml
tags: rare
clipboard:
  text/plain: |-
    Draft announcement
    Send update
    Archive notes
  text/html: '<p style="mso-list:l0 level2 lfo1"><span style="mso-list:Ignore">o </span>Draft announcement</p><p style="mso-list:l0 level1 lfo1"><span style="mso-list:Ignore">· </span>Send update</p><p style="mso-list:l0 level1 lfo1"><span style="mso-list:Ignore">· </span>Archive notes</p>'
```

```buffer
- Inbox┃
```

> paste

```buffer
- Inbox
- Draft announcement
- Send update
- Archive notes┃
```

## Regression84

An outdent that moves a quote two columns left: the tab after an item's marker in it, which spanned
two columns, would span four there, its text five past the marker, code: spelled as the spaces it
spanned.

```yaml
tags: rare
```

```buffer
- x┃
  > - a
  >
  > - →b

  y
```

> outdent

```buffer
x┃
> - a
>
> -   b

y
```

## Regression85

A paste over a lazy line of an item's paragraph that starts with a checkbox, in CommonMark, of an
item whose text starts below its marker: the checkbox stays on the marker's line, a space after the
marker.

```yaml
tags: rare
flavor: commonmark
clipboard: |
  -
    x
```

```buffer
- [x]␠
   «    - b»
```

> paste

```buffer
- [x]␠
  x┃
```

## Regression86

A code span from HTML whose code starts and ends with a space: padded, so Markdown strips the
padding, not the code's own spaces.

```yaml
tags: rare
clipboard:
  text/plain: 'before a after'
  text/html: '<p>before<code> a </code>after</p>'
```

```buffer
┃
```

> paste

```buffer
before`  a  `after┃
```

## Regression87

Formatting from HTML that Markdown can't write as it stands: two elements of one kind side by side
are one (their delimiters would run together, `*a**b*`), and emphasis whose delimiter can't close
before what follows it (`*foo!*bar`) is its text alone.

```yaml
tags: rare
clipboard:
  text/plain: 'ab foo!bar'
  text/html: '<p><em>a</em><em>b</em> <em>foo!</em>bar</p>'
```

```buffer
┃
```

> paste

```buffer
*ab* foo!bar┃
```

## Regression88

Links from HTML: one labelled `x` is no checkbox, and a destination with `>` in it is written as it
is, which Markdown reads whole (angle brackets only where it couldn't: blanks, unbalanced parentheses).

```yaml
tags: rare
clipboard:
  text/plain: 'x y'
  text/html: '<p><a href="/u">x</a> <a href="https://example.com/a&gt;b">y</a></p>'
```

```buffer
┃
```

> paste

```buffer
[x](/u) [y](https://example.com/a>b)┃
```

## Regression89

Text from HTML with the extensions' delimiters in it: escaped, so it reads as the text it is in every
flavor, not a strikethrough or a comment.

```yaml
tags: rare
flavor: obsidian
clipboard:
  text/plain: 'Keep ~~draft~~ and %%this%% literal'
  text/html: '<ul><li>Keep ~~draft~~ and %%this%% literal</li></ul>'
```

```buffer
┃
```

> paste

```buffer
- Keep \~\~draft\~\~ and %\%this%\% literal┃
```

## Regression90

A backtick typed over a selection that starts and ends with a space wraps it with a space more each
side, which the code span strips, keeping the selection's own.

```yaml
tags: rare
closeBackticks: all
```

```buffer
a« b »c
```

> "`"

```buffer
a` « b » `c
```

## Regression91

Lines pasted as typed with Enter between them, the space after the caret starting the second half as
its padding: the next line is typed where the caret is, before that space, which stays between the
words, as typing the lines does.

```yaml
tags: rare
pastePlainLines: enter
enterSplitSpace: start
clipboard: |-
  x
  y
```

```buffer
- a┃ b
```

> pastePlain

```buffer
- ax
- y┃ b
```

## Regression92

Backspace at a nested item's line start, its text after the spaces Markdown hides before it (an
Enter's second half under `enterSplitSpace: start`): it acts where the node's text starts, before
those spaces, joining the node to the one above with them, not past them, where a press is the host's
(which would take the line break before the caret, the marker left as text).

```yaml
tags: rare
```

```buffer
- Parent
┃  -  child
```

> deleteContentBackward

```buffer
- Parent┃ child
```

## Regression93

A duplicate of an empty item a placeholder holds, the caret in it (Enter, then Tab): its copy below
it, the caret in the copy; the original, empty, apart from the text above by a blank line, which
without its placeholder it would continue.

```yaml
tags: rare
```

```buffer
- a
  - ┃◌
```

> duplicateSubtree

```buffer
- a

  - 
  - ┃
```

## Regression94

Zoomed in, the root's first child moved up: nothing is above it in the view, as at the document's
start, the reason the rule's, not the zoom's.

```yaml
tags: rare
zoom: ①
```

```buffer
- top①
  - ┃one
  - two
- other
```

> moveSubtreeUp

```yaml
result: rejected no-previous-sibling
```

## Regression95

A heading from HTML whose text ends with a `#` after a space, or is all `#`s: escaped, so it isn't
read as the heading's closing sequence and dropped.

```yaml
tags: rare
clipboard:
  text/plain: 'Issue #'
  text/html: '<h2>Issue #</h2>'
```

```buffer
┃
```

> paste

```buffer
## Issue \#┃
```

## Regression96

Formatting from HTML across a paragraph break: each paragraph's part formatted on its own, where one
pair of delimiters across the blank line would be literal.

```yaml
tags: rare
clipboard:
  text/plain: |-
    a

    b
  text/html: '<p><em>a<br><br>b</em></p>'
```

```buffer
┃
```

> paste

```buffer
*a*

*b*┃
```

## Regression97

Zoomed in, Backspace over the root selected as a block deletes it, as cut does, the zoom going to
its nearest ancestor left, none at the top level (Logseq, Logseq DB, Tana delete it too).

```yaml
tags: rare
zoom: ①
```

```buffer
- ««top»»①
  - one
  - two
- other
```

> deleteContentBackward

```yaml
zoom: none
```

```buffer
- ┃other
```

## Regression98

A heading alone from HTML, pasted at a text's end: a block, as pasting its Markdown with a line break
is, not inline text joined to the text before it (`- here## Title`).

```yaml
tags: rare
clipboard:
  text/plain: 'Title'
  text/html: '<h2>Title</h2>'
```

```buffer
here┃
```

> paste

```buffer
here

## Title┃
```

## Regression99

A cut of the spaces between two words: they are the clipboard, which a paste puts back. A line the
copy takes whole, blank, is empty; part of one is as it is.

```yaml
tags: rare
```

```buffer
- a«  »b
```

> cut

```yaml
clipboard: "  "
```

```buffer
- a┃b
```

## Regression100

A copy through the text's final line ending ends with it, as one ending at the next line's start
does: a cut takes it.

```yaml
tags: rare
```

```buffer
- al«pha
»
```

> copy

```yaml
clipboard: |
  pha
```

## Regression101

Backspace on an empty item that is all of a quote, a heading after it: the quote goes with it,
holding nothing, the caret to the heading's text.

```yaml
tags: rare
```

```buffer
> - ┃◌
# h
```

> deleteContentBackward

```buffer
# ┃h
```

## Regression102

Shift-Enter at an item's text start, past spaces after its marker: the text below the marker, at the
item's content column one past it, its later lines with it.

```yaml
tags: rare
```

```buffer
-   ┃a
b
```

> shiftEnter

```buffer
-
  ┃a
  b
```

## Regression103

Enter at the end of a code line in an item whose code starts below its marker: a code line, the
marker on its line of its own as it was.

```yaml
tags: rare enter-in-fence
```

````buffer
-
  ```
  code┃
  ```
````

> enter

````buffer
-
  ```
  code
  ┃
  ```
````

## Regression104

Backspace after a character of code that is two UTF-16 units, before backticks that would close the
block: the whole character goes, as the host deletes it, so the fences grow past what is left, as for
any other character.

```yaml
tags: rare
```

````buffer
```
😀┃```
payload
```
````

> deleteContentBackward

`````buffer
````
┃```
payload
````
`````

## Regression105

A heading alone pasted mid-text under open seams: its text joins the text before the caret, and the
text after it joins it in turn, as an item's does.

```yaml
tags: rare
pasteSeams: open
clipboard: |
  # h
```

```buffer
p┃q
```

> paste

```buffer
ph┃q
```

## Regression106

Delete at the end of an item's marker line, its code starting below it: the code goes up onto the
marker's line, the line break between them taken.

```yaml
tags: rare
```

````buffer
-┃
  ```
  code
  ```
````

> deleteContentForward

````buffer
- ┃```
  code
  ```
````

## Regression107

The same item outdented at the top level, from its fence (on a code line Shift-Tab is the host's):
the code a block of its own, the marker's line gone with the marker.

```yaml
tags: rare
```

````buffer
-
  ┃```
  code
  ```
````

> outdent

````buffer
┃```
code
```
````

## Regression108

A quote's line above its callout title, `>` alone: no line of the title, its markup. Enter there is
the host's, as in any markup, not a split of the title it doesn't touch.

```yaml
tags: rare
```

```buffer
>┃
> [!note] Title
```

> enter

```yaml
result: deferredToHost
```

## Regression109

A duplicate of a footnote in a quote, the caret before the quote's `>`: the copy's prefix and label
are written anew, and the caret, in the original's markup, goes to the copy's text start.

```yaml
tags: rare
flavor: gfm
```

```buffer
┃> [^1]: note
```

> duplicateSubtree

```buffer
> [^1]: note
> [^1]: ┃note
```

## Regression110

A definition with a space before it, indented into an item: the space is no text of the item's, its
padding there, gone.

```yaml
tags: rare
```

```buffer
┃ [a]: /url
```

> indent

```buffer
- ┃[a]: /url
```

## Regression111

Lines pasted into an empty item after a tab in a quote: the lines after the first at the item's
content column, a space past its marker, which its own line, ending at the marker, didn't reach.

```yaml
tags: rare
clipboard: |-
  x
  y
```

```buffer
>→-┃
```

> pastePlain

```buffer
>→- x
>→  y┃
```

## Regression112

Backspace at the text start of an item first in a quote, its text starting `[!type]`: as a paragraph
first in the quote it would be its callout's title, which GFM's escapes can't keep it from being (Obsidian's write `\[!note]`). Refused.

```yaml
tags: rare
flavor: gfm
```

```buffer
> - ┃[!note] title
```

> deleteContentBackward

```yaml
result: rejected not-expressible
```

## Regression113

Enter at the end of the only paragraph, then everything selected and deleted: the empty paragraph
the caret is in stays, held, the text otherwise empty.

```yaml
tags: rare
```

```buffer
«a

◌»
```

> deleteContentBackward

```buffer
┃◌
```

## Regression114

Lines pasted as typed with Enter between them in a quote whose Enter makes a line of it: each line
a line of the quote, as typing them is.

```yaml
tags: rare
pastePlainLines: enter
enterInQuote: line
clipboard: |-
  x
  y
```

```buffer
> a┃
```

> pastePlain

```buffer
> ax
> y┃
```

## Regression115

A cut of code that leaves a fence on its line, which would close the block early: the block's
fences grow past it, as a character Backspace deletes there makes them.

```yaml
tags: rare
```

````buffer
```
«X»```
PAYLOAD
```
AFTER
````

> cut

```yaml
clipboard: "X"
```

`````buffer
````
┃```
PAYLOAD
````
AFTER
`````

## Regression116

Backspace of the tab before a code line's backticks, which would make them a fence: the block's
fences grow past it.

```yaml
tags: rare
```

````buffer
```
→┃```
PAYLOAD
```
AFTER
````

> deleteContentBackward

`````buffer
````
┃```
PAYLOAD
````
AFTER
`````

## Regression117

Backspace of a space of a code line's indentation that would leave its backticks a fence, indented
three columns: the block's fences grow past it.

```yaml
tags: rare
```

```buffer
> ```
>     ┃```
> PAYLOAD
> ```
> AFTER
```

> deleteContentBackward

````buffer
> ````
>    ┃```
> PAYLOAD
> ````
> AFTER
````

## Regression118

Cmd-Backspace on a code line that would leave a fence: the block's fences grow past it.

```yaml
tags: rare
```

````buffer
```
X┃```
PAYLOAD
```
AFTER
````

> deleteSoftLineBackward

`````buffer
````
┃```
PAYLOAD
````
AFTER
`````

## Regression119

Cmd-Backspace on a code line in a quote: back to the line's start past the quote's `>`, which the
host's would take, ending the quote and the block.

```yaml
tags: rare
```

````buffer
> ```
> PAYLOAD┃
> ```
> AFTER
````

> deleteSoftLineBackward

````buffer
> ```
> ┃
> ```
> AFTER
````

## Regression120

A fence pasted on a code line is code: the block's fences grow past it.

````yaml
tags: rare
clipboard: "```"
````

````buffer
```
BEFORE
┃
PAYLOAD
```
AFTER
````

> paste

`````buffer
````
BEFORE
```┃
PAYLOAD
````
AFTER
`````

## Regression121

Lines pasted over code lines, a fence among them: code, the block's fences grown past it.

````yaml
tags: rare
clipboard: |-
  ```
  INJECTED
````

````buffer
```
BEFORE
«START
END»
PAYLOAD
```
AFTER
````

> pastePlain

`````buffer
````
BEFORE
```
INJECTED┃
PAYLOAD
````
AFTER
`````

## Regression122

A space typed over code, which would leave a fence: the block's fences grow past it.

```yaml
tags: rare
```

````buffer
```
«X»```
PAYLOAD
```
AFTER
````

> " "

`````buffer
````
 ┃```
PAYLOAD
````
AFTER
`````

## Regression123

A character typed at a closing fence's start, where markup is decorated: it would unmake the block,
refused.

```yaml
tags: rare
markup: decorated
```

````buffer
```
PAYLOAD
┃```
AFTER
````

> "x"

```yaml
result: rejected not-expressible
```

## Regression124

A cut at the caret on a folded row two items share: the folded item, its hidden children with it,
as delete subtree takes them there; the clipboard has them all.

```yaml
tags: rare
folded: ①
```

```buffer
- - ┃a①②
  - SECRET③
- KEEP④
```

> cut

```yaml
clipboard: |
  - - a
    - SECRET
```

```buffer
- ┃KEEP④
```

## Regression125

Backspace of the only character of a task whose status is another than `[ ]` or `[x]`, its children
after a blank line: the empty task is held, keeping them, as for any status.

```yaml
tags: rare
flavor: obsidian
```

```buffer
- [?] x┃

  - child
```

> deleteContentBackward

```buffer
- [?] ┃◌

  - child
```

## Regression126

Tab on a fence after an item, its code holding a line that starts with a tab: the block is the
item's text, its lines two columns in, where the tab spans two columns and makes the backticks
after it a fence: the block's fences grow past them.

```yaml
tags: rare
```

````buffer
- a
┃```
x
→```
y
```
````

> indent

`````buffer
- a
- ┃````
  x
  →```
  y
  ````
`````

## Regression127

Enter at the end of a quote's second paragraph, whose first line has no space after its `>`, its
later line starting with spaces after the `>`: those spaces are the text's, written past the space
the `>` takes; the new paragraph after it, held.

```yaml
tags: rare
```

```buffer
>a
>
>z
>  e┃
```

> enter

```buffer
>a
>
>z
>  e
>
> ┃◌
```

## Regression128

A paragraph dropped after a quote whose last node is a paragraph, a fence opening it: set apart by
a blank line, which keeps it out of the quote's paragraph.

```yaml
tags: rare
clipboard: |
  para
```

````buffer
> ```
> x
> ```
> after┃
▸
````

> pasteAt

````buffer
> ```
> x
> ```
> after┃

para
````

## Regression129

A held space the caret leaves that no writing of its text keeps (a lazy line's, `-` after a task in
a quote, which written as text would be an item): it goes, the text read as it is saved, the line
the item it is.

```yaml
tags: rare
```

```buffer
>- [x] >
 ┃   -
```

> deleteContentForward

```buffer
>- [x] >
 ┃◌  -
```

> cursorDocStart

```buffer
┃>- [x] >
   -
```

```yaml
outline: |
  quote
    item [x]: >
  item
```

## Regression130

Tab over a paragraph and a quote after it whose paragraph has a lazy line starting with a tab: both
items, the second lined up with the first, which was no item to line up with; the lazy line, its tab
now two columns past the item's, escaped where it would open a fence.

```yaml
tags: rare
```

```buffer
«x
>b»
→~~~
```

> indent

```buffer
- «x
- >b»
  →\~~~
```

## Regression131

Shift-Down from a paragraph to a quote whose last line is a blank `>` after its item, the item's
blank line: the quote is selected whole, its lines the item's and that blank line.

```yaml
tags: rare
```

```buffer
««=
»»>-
>
after
```

> selectNodeDown

```buffer
««=
>-»»
>
after
```

## Regression132

A text drag's deletion with nothing selected, a caret: it deletes nothing, where Backspace would
join the item to the one above.

```yaml
tags: rare
```

```buffer
- alpha
- ┃beta
```

> deleteByDrag

```buffer
- alpha
- ┃beta
```

## Regression133

`closeBackticks: all`, Backspace between two backticks of a code span's code: one goes, as any
character of code; they are no empty pair.

```yaml
tags: rare
closeBackticks: all
```

````buffer
a ```x `┃` y``` b
````

> deleteContentBackward

````buffer
a ```x ┃` y``` b
````

## Regression134

`closeBackticks: all`, between an escaped backtick and another: no empty pair, so Backspace deletes
one and a backtick typed is typed, not stepped over.

```yaml
tags: rare
closeBackticks: all
```

```buffer
a \`┃` b
```

> deleteContentBackward

```buffer
a \┃` b
```

> "``"

```buffer
a \``┃` b
```

## Regression135

Cmd-Backspace at the end of a setext title's only line: the title goes, the heading stays, an empty
ATX one of its level, which Markdown holds (its underline would be text under no title), as block
apps keep an emptied heading.

```yaml
tags: rare
```

```buffer
Title┃
---

para
```

> deleteSoftLineBackward

```buffer
## ┃

para
```

## Regression136

Cmd-Backspace at the end of a setext title's last line, below another: that line goes with its line
break, the title the line above it.

```yaml
tags: rare
```

```buffer
Ti
tle┃
===
```

> deleteSoftLineBackward

```buffer
Ti┃
===
```

## Regression137

Enter at the end of an ATX title with a closing sequence, the caret before its blank: as at any
title's end, an empty paragraph after it, the closing `#`s staying the title's, not the new text.

```yaml
tags: rare
```

```buffer
## title┃ ##
```

> enter

```buffer
## title ##
┃◌
```

## Regression138

Backspace joining a paragraph that ends in ` #` onto an ATX title: its `#` the title's text still,
escaped, not the title's closing sequence.

```yaml
tags: rare
```

```buffer
# h

┃x #
```

> deleteContentBackward

```buffer
# h┃x \#
```

## Regression139

A paste at an ATX title's end of text ending in ` #`: the `#` escaped, text, not a closing sequence.

```yaml
tags: rare
clipboard: "b #"
```

```buffer
# a┃
```

> paste

```buffer
# ab \#┃
```

## Regression140

A paste of text starting with a space at the start of an item's text, the item with children: the
space goes, as a pasted first line's leading blanks do at a text's start (as padding they would
move the item's text past its children's column, which would leave it).

```yaml
tags: rare
clipboard: " x"
```

```buffer
- ┃bravo
  - charlie
```

> paste

```buffer
- x┃bravo
  - charlie
```

## Regression141

A plain paste of one line starting with a space at an item's text start: the space goes, as for
several lines.

```yaml
tags: rare
clipboard: " x"
```

```buffer
- ┃bravo
  - charlie
```

> pastePlain

```buffer
- x┃bravo
  - charlie
```

## Regression142

Enter at the end of an item numbered 999999999: the next number has ten digits, no list marker's,
so the new item would be text: refused.

```yaml
tags: rare
```

```buffer
999999999. a┃
```

> enter

```yaml
result: rejected not-expressible
```

## Regression143

Enter at the end of an item whose number is written with leading zeros: its marker stays as written,
the new item numbered after it.

```yaml
tags: rare
```

```buffer
007. a┃
```

> enter

```buffer
007. a
8. ┃
```

## Regression144

Tab on a heading after a blank line: it goes into the section above, the blank line staying between
the two, where the author wrote it, not moving after it.

```yaml
tags: rare
```

```buffer
## B

## ┃C
```

> indent

```buffer
## B

### ┃C
```

## Regression145

Shift-Tab on the last heading, after a blank line, the text ending with no line ending: no blank
lines move or come at the end.

```yaml
tags: rare
```

```buffer
# A

## B

### ┃C
```

> outdent

```buffer
# A

## B

## ┃C
```

## Regression146

Backspace at a heading's start making it a paragraph, a blank line above it: the blank line stays,
the text gaining none at its end.

```yaml
tags: rare
```

```buffer
# h

# ┃n
```

> deleteContentBackward

```buffer
# h

┃n
```

## Regression147

Backspace in the closing fence of an empty block, the text's last, a blank line above it: the block
goes, the text ending where the paragraph above does, as the block's end did.

```yaml
tags: rare
```

````buffer
alpha

```
``┃`
````

> deleteContentBackward

```buffer
alpha┃
```

## Regression148

Cmd-Backspace emptying the only paragraph, a blank line above it: the paragraph stays, empty, held
on its own line, the blank line above it.

```yaml
tags: rare
```

```buffer

a┃
```

> deleteSoftLineBackward

```buffer

┃◌
```

## Regression149

Enter on the only item, empty, a blank line above it: a paragraph, held on the item's line.

```yaml
tags: rare
```

```buffer

- ┃
```

> enter

```buffer

┃◌
```

## Regression150

Enter at the end of an unclosed math block, the text's last line: a new line of the block, as in an
unclosed fence.

```yaml
tags: rare enter-in-fence
flavor: obsidian
```

```buffer
$$
a┃
```

> enter

```buffer
$$
a
┃
```

## Regression151

Tab on a code line of an item's code that starts below its marker: the host's, which indents the
code, as on any code line; the item stays where it is.

```yaml
tags: rare
```

````buffer
- a
-
  ```
  ┃X
  ```
````

> indent

```yaml
result: deferredToHost
```

## Regression152

Escape on such an item, where markup is decorated: the caret where typing edits its code, at the
code's first line, not before its opening fence.

```yaml
tags: rare
markup: decorated
```

````buffer
««-
  ```
  X
  ```»»
````

> selectNode

````buffer
-
  ```
  ┃X
  ```
````

## Regression153

Tab on a paragraph of two hyphens: an item, its text escaped, which with the bullet would read as a
rule (`- --`).

```yaml
tags: rare
```

```buffer
-┃-
```

> indent

```buffer
- \-┃-
```

## Regression154

A line break pasted in indented code whose lines end with a lone CR: a blank line of the code, its
ending a CRLF, as the old line's LF after the CR alone would read the two as one.

```yaml
tags: rare
clipboard: |+

```

```buffer
→k┃␍    :
```

> pastePlain

```buffer
→k␍┃␍
    :
```

## Regression155

Cmd-Backspace on a paragraph's last line after a lone CR: the line emptied, a blank line after the
paragraph, its ending no LF after the CR.

```yaml
tags: rare
```

```buffer
c␍~┃
```

> deleteSoftLineBackward

```buffer
c
┃
```

## Regression156

Shift-Enter at a later line's start, the line above ending with a lone CR, a blank line and a
paragraph below: two paragraphs, the blank line between them, the one below as it was.

```yaml
tags: rare
```

```buffer
a␍┃c

c
```

> shiftEnter

```buffer
a␍␍┃c

c
```

## Regression157

A paste of two paragraphs into an empty item held with spaces after its marker: the first its text,
written past the marker and a space, the second its child at that column, not at the column the
spaces made.

```yaml
tags: rare
clipboard: |-
  line one
  line two

  p2
```

```buffer
- Project
  -  ┃◌
- Inbox
```

> paste

```buffer
- Project
  - line one
    line two

    p2┃
- Inbox
```

## Regression158

Shift-Tab on a quoted item written with no space after the `>`, its later line lazy and starting
with a space: the item out of the quote, its later line at its content column, the space still its
text's.

```yaml
tags: rare
```

```buffer
>2) a
 ~┃
```

> outdent

```buffer
2) a
    ~┃
```

## Regression159

Backspace at the start of an item whose first child is a nested item on its line, after spaces: the
two one item, its later line, lazy, at the item's column now, not the column the spaces made.

```yaml
tags: rare
```

```buffer
┃1.  - d
e
```

> deleteContentBackward

```buffer
1. ┃d
   e
```

## Regression160

Lines pasted as typed with Enter, mid-text in an item written with spaces after its marker, its later
line lazy, indented short of its text: the second half a new item, that line's spaces its text's
still, written past the new item's column, where it isn't lazy.

```yaml
tags: rare
pastePlainLines: enter
clipboard: |+

```

```buffer
-  y┃x
  y
```

> pastePlain

```buffer
-  y
- ┃x
    y
```

## Regression161

A deletion across a callout's title and a paragraph of two lines below it: the paragraph would join
the title, which holds one line: refused, as Backspace joining them is.

```yaml
tags: rare
flavor: obsidian
```

```buffer
>[!e]«
»a
b
```

> deleteContentBackward

```yaml
result: rejected not-expressible
```

## Regression162

Tab on a quote of two lines whose first `>` is indented a space: an item whose text the quote is,
the space before its `>` gone, which as the item's padding would leave its later `>` outside it.

```yaml
tags: rare
```

```buffer
 >┃a
>b
```

> indent

```buffer
- >┃a
  >b
```

## Regression163

Duplicate of a list whose first items are indented and its last not: the copies after the last,
lined up with it, every one of them, the first's column the rest's too (one left as it was would
be the first's child).

```yaml
tags: rare
```

```buffer
««  - a
  - b
- c»»
```

> duplicateSubtree

```buffer
  - a
  - b
- c
- ««a
- b
- c»»
```

## Regression164

Tab on a fence between an empty item and an item indented two columns: an item, the fence its text;
the item below it lined up with it, which, as it was, would be its child.

```yaml
tags: rare
```

````buffer
-
┃```
```
  -
````

> indent

````buffer
-
- ┃```
  ```
-
````

## Regression165

Tab on a footnote definition whose body is an empty quote: an item whose text is the definition,
read whole, its label and its `>`, as at the top level.

```yaml
tags: rare
flavor: gfm
```

```buffer
┃[^1]:>
```

> indent

```buffer
- [^1]:┃>
```

## Regression166

Duplicate of a quote's paragraph whose last line is lazy, `=`, which read with no `>` before it
would be a setext underline: the copy set apart from it by a blank line of the quote, which the
copy would otherwise continue.

```yaml
tags: rare
quotes: container
```

```buffer
>┃a
=
```

> duplicateSubtree

```buffer
>a
=
>
>┃a
>\=
```

## Regression167

Duplicate of a paragraph indented two spaces that owns a list: the copy after the list, its first
line without those spaces, which there would make it the last item's content.

```yaml
tags: rare
```

```buffer
  ┃e
- g
  >y
```

> duplicateSubtree

```buffer
  e
- g
  >y

┃e
- g
  >y
```

## Regression168

Alt-Down on an item past an empty heading whose paragraph is indented two spaces: the item first in
the heading's section, the paragraph after it without those spaces, which there would make it the
item's.

```yaml
tags: rare
```

```buffer
- # ┃g
  e
#
  y
```

> moveSubtreeDown

```buffer
#
- # ┃g
  e

y
```

## Regression169

A paste in an item whose text is a reference definition, its paragraph after it lazy (`T`, no
indentation): the pasted node between them, the paragraph spelled again after the item's prefix,
lazy no longer right after what it continued.

```yaml
tags: rare
clipboard: |
  x
```

```buffer
- [a]:u┃
T
```

> paste

```buffer
- [a]:u
  - x┃

  T
```

## Regression170

A paste renumbering an item `10.` to `2.`, its later line lazy, indented three columns, short of
`10.`'s content: past `2.`'s it would be no longer lazy, its spaces the item's; written past that
column, its text as it was.

```yaml
tags: rare
clipboard: |
  -␠
```

```buffer
1.
10. c┃
   a
```

> paste

```buffer
1.
2. c
      a
3. ┃
```

## Regression171

Shift-Tab on a quote's reference definition, its paragraph after it lazy: the definition out of the
quote, the paragraph the quote's, its `>` now on its line, which the definition's was.

```yaml
tags: rare
```

```buffer
>[a]:u┃
b
```

> outdent

```buffer
[a]:u┃
> b
```

## Regression172

Shift-Enter at the text start of a nested quote's item whose tab follows its marker, the marker
right after the `>`s: the text below the marker at its content column, the `>`'s space taken by
the tab past them.

```yaml
tags: rare
```

```buffer
>>-→┃]
```

> shiftEnter

```buffer
>>-
>>→ ┃]
```

## Regression173

Shift-Enter before a quoted item whose marker a tab follows, its later line lazy: the text below the
marker at the content column one past it, its later lines there too, in spaces (the tab's columns
past the marker no longer the item's).

```yaml
tags: rare
```

```buffer
┃ > +→]
`
```

> shiftEnter

```buffer
 > +
 >   ┃]
 >   `
```

## Regression174

Alt-Up on an item whose first block is a list on its line, past an item of another bullet: it takes
the list's bullet, written over its own on that line.

```yaml
tags: rare
```

```buffer
+ b
- - ┃c
```

> moveSubtreeUp

```buffer
+ - ┃c
+ b
```

## Regression175

Alt-Up on a numbered item whose first block is a list on its line: renumbered, its number written
over the old one on that line.

```yaml
tags: rare
```

```buffer
1. a
2. - ┃b
```

> moveSubtreeUp

```buffer
1. - ┃b
2. a
```

## Regression176

Shift-Enter in a paragraph that starts `[!type]` on a quote's second line, its first a blank `>`:
a quote of a paragraph, no callout (a callout is the quote's opening line's only), the blank line
kept.

```yaml
tags: rare
flavor: obsidian
```

```buffer
>
>[!e]┃a
```

> shiftEnter

```buffer
>
>[!e]
>┃a
```

## Regression177

A plain paste over a subtree selection of an indented paragraph, a blank line of spaces after it:
the paragraph's text replaced, its indentation and the blank line kept.

```yaml
tags: rare
clipboard: "x"
```

```buffer
 ««b»»
␠
```

> pastePlain

```buffer
 x┃
␠
```

## Regression178

`closeBackticks: all`, three backticks typed at once between a space and a backtick: a fence, as
they make typed one by one.

```yaml
tags: rare
closeBackticks: all
```

```buffer
 ┃`
```

> "```"

````buffer
```┃
```
````

## Regression179

A rule dropped under an item with no children: it is an item of a list of its own, whose bullet isn't
the rule's character (`- ---` would read as one rule).

```yaml
tags: rare
```

```buffer
- a
  ▸
---┃①
```

> moveSubtree ①

```buffer
- a
  * ---┃①
```

## Regression180

A cut of a numbered list's first item: the next, renumbered, has a narrower number, so its content
column moves left, to where the paragraph after the list is padded; the paragraph is written without
its padding, so it stays out of the item.

```yaml
tags: rare
```

```buffer
1. a┃
10. b

   c
```

> cut

```buffer
1. ┃b

c
```

## Regression181

Tab on a paragraph whose first line is a checkbox alone that the flavor reads as no task (GFM's
statuses are ` `, `x` and `X`): an item whose paragraph goes on below it, so its next line is a line
of that paragraph, which no definition starts, unescaped.

```yaml
tags: rare
```

```buffer
[a]
[a]:s┃
```

> indent

```buffer
- [a]
  [a]:s┃
```

## Regression182

Shift-Tab on an item of the list a paragraph right after a reference definition adopts: the
paragraph is the rest of the parser's paragraph the definition starts, `-` its text, which the item
out of it, a paragraph now, would go on; a blank line sets it apart.

```yaml
tags: rare
```

```buffer
[a]:u
-
- b┃
```

> outdent

```buffer
[a]:u
-

b┃
```

## Regression183

Shift-Tab on a quoted footnote definition whose paragraph's later line could start a block where it
stood alone: the definition leaves the quote with its lines as written, that line still indented
under it.

```yaml
tags: rare
flavor: gfm
```

```buffer
>[^1]: a
>     #t┃
```

> outdent

```buffer
[^1]: a
    #t┃
```

## Regression184

Shift-Enter at the end of a line inside a quote's text: the quote holds two paragraphs, the blank
line between them quoted, the caret on it, the lines after it still quoted, as the text editors
keep them. Typed on, the two are one text again; Backspace on that line joins them back too.

```yaml
tags: rare
```

```buffer
> a
> b┃
> c
```

> shiftEnter

```buffer
> a
> b
> ┃
> c
```

> "x"

```buffer
> a
> b
> x┃
> c
```

> deleteContentBackward

```buffer
> a
> b
> ┃
> c
```

> deleteContentBackward

```buffer
> a
> b┃
> c
```

## Regression185

Shift-Enter at the end of a line inside an item's quote text: the quote, two paragraphs in it, is
the item's first block, on its marker's line, the item with no text of its own; Backspace on the
quoted blank line joins them, the quote the item's text again.

```yaml
tags: rare
```

```buffer
- > a
  > b┃
  > c
```

> shiftEnter

```buffer
- > a
  > b
  > ┃
  > c
```

> deleteContentBackward

```buffer
- > a
  > b┃
  > c
```

## Regression186

Shift-Tab on a nested quote's paragraph whose lazy line starts with a tab the outer quote took a
column of: out of the quote, the rest of that tab is the spaces it spanned, not the tab, which
would span four columns there.

```yaml
tags: rare
```

```buffer
>>┃=
>→e
```

> outdent

```buffer
>┃=
  e
```

## Regression187

Shift-Tab on quoted indented code past two tabs, the quote taking a column of the first: the code
leaves the quote with its payload as it was, each tab the spaces it spanned where it was.

```yaml
tags: rare
```

```buffer
>→→%
┃
```

> outdent

```buffer
      %
┃
```

## Regression188

Shift-Tab on a quote nested after a tab the outer quote took a column of: out of it, its `>` after
the spaces that tab's rest spanned (a tab there would span four columns, the quote then code).

```yaml
tags: rare
```

```buffer
>→> ┃q
```

> outdent

```buffer
  > ┃q
```

## Regression189

Enter at the text start of an item on its parent's marker line, a tab after that marker: the new
empty item goes there, the marker's tab kept, and the text's item below it, at the content column.

```yaml
tags: rare
```

```buffer
-→- ┃->
```

> enter

```buffer
-→- ┃
    - ->
```
