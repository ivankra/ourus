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

```markdown
* a
  * ┃b
  2) x
```

> deleteContentBackward

```markdown
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

```markdown
- a
  1.␠
- ┃b
```

> deleteContentBackward

```markdown
- a
  1\̬. ┃b
```

## Regression3

A deleted first character's place in a quote in an item holds as text, as it does right after a
marker ([Backspace47](backspace.md#backspace47)): the space left before `# b` is the place, so the
text reads as it did, not as a heading (with two spaces after `>`, the line would be one). Every
container on the line counts, not only a list marker.

```yaml
tags: rare
```

```markdown
- > a┃ # b
```

> deleteContentBackward

```markdown
- > ┃◌ # b
```

## Regression4

The line the split ends keeps its spelling where it read so before: `2. m1` continues the paragraph
(a list from 2 can't interrupt one), and ending it here doesn't change that, so it gets no escape
([Regression12](#regression12)).

```yaml
tags: rare
```

```markdown
p0
2. m1┃
```

> enter

```markdown
p0
2. m1

┃◌
```

> deleteContentBackward

```markdown
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

```markdown
\[a]: ┃/url
```

> enter

```markdown
\[a]:␠

┃/url
```

## Regression6

Fence62 with a longer run: the fences grow past it however long it is, to one more than the run.

````yaml
tags: rare
````

```````````````markdown
```
x┃````````````
body
```
```````````````

> deleteContentBackward

```````````````markdown
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

````markdown
```
code
┃    ```
````

> deleteContentBackward

````markdown
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

```markdown
- a
  - b
  2) ┃x
```

> moveSubtreeUp

```markdown
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

```markdown
- ┃a
    1. b
      - c
```

> outdent

```markdown
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

```markdown
- one┃<div>
```

> shiftEnter

```markdown
- one
  ┃\̬<div>
```

> deleteContentBackward

```markdown
- one┃\̬<div>
```

## Regression11

The same with a code fence's backticks: mid-line they could open a code span with backticks later in
the text, so the escape stays.

```yaml
tags: rare
```

```markdown
para┃``` x
```

> shiftEnter

```markdown
para
┃\̬``` x
```

> deleteContentBackward

```markdown
para┃\̬``` x
```

## Regression12

The line the break ends keeps its spelling where it read so before: `2. m1` continues the paragraph
(a list from 2 can't interrupt one), and ending it here doesn't change that, so it gets no escape. A
line the break makes, or one it ends into a block, is escaped ([ShiftEnter19](shift-enter.md#shiftenter19)).

```yaml
tags: rare
```

```markdown
p0
2. m1┃
```

> shiftEnter

```markdown
p0
2. m1
┃
```

> deleteContentBackward

```markdown
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

```markdown
«ab»c
```

> pastePlain

```markdown
x┃c
```

## Regression14

An item of an indented list under a paragraph, outdented at the top level: it becomes a paragraph,
its child and the items after it its list, lined up at the paragraph's column (an item left where it
was would nest under the child moved out).

```yaml
tags: rare
```

```markdown
para
  - b┃
    - c
  - d
```

> outdent

```markdown
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

```markdown
Title
┃more
---
```

> pastePlain

```yaml
result: rejected not-expressible
```

```markdown
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

```markdown
- one two┃ three
- next
```

> enter

```markdown
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

```markdown
- a
  - b
  - [ ] ┃
  - c
```

> outdent

```markdown
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

```markdown
- a
- # ┃H
```

> deleteContentBackward

```markdown
- a┃H
```

## Regression19

With `headingEditing: block`, Delete before an item whose text is a heading joins its title, as
before any heading.

```yaml
tags: rare markup-heading
headingEditing: block
```

```markdown
- a┃
- # H
```

> deleteContentForward

```markdown
- a┃H
```

## Regression20

With `joinWithChildren: refuse`, Delete on an empty item whose first child has children of its own
is refused: the child would come up into it with them, which either option refuses.

```yaml
tags: rare
joinWithChildren: refuse
```

```markdown
- ┃
  - a
    - b
```

> deleteContentForward

```yaml
result: rejected has-children
```

```markdown
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

```markdown
one ┃two
```

> paste

```markdown
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

```markdown
one ┃two
```

> pastePlain

```markdown
one two

x┃
```

## Regression23

Enter at the end of an unclosed fence's opening line, the document's last: the code's first line,
empty, the caret on it (the fence still unclosed, the code running to the document's end).

```yaml
tags: rare markup-fence
```

```markdown
intro

```js┃
```

> enter

```markdown
intro

```js
┃
```

## Regression24

Enter before a backslash that is text mid-line (`2\.` after other text escapes nothing) but markup at
a line's start, where `2.` would start a list: the new paragraph keeps it, as the escape its line
needs. Backspace joins the line back, where it isn't needed: the author's backslash stays, a character of
the text like any other; only an escape ourus wrote goes ([Regression24b](#regression24b)).

```yaml
tags: rare
```

```markdown
revise ┃2\. draft
```

> enter

```markdown
revise␠

┃2\. draft
```

> deleteContentBackward

```markdown
revise ┃2\. draft
```

## Regression24b

The same where ourus wrote the backslash: `2.` at the start of a line is escaped (an escape of ours,
an `auto` mark on it), and joined back mid-line the escape is no longer needed, so it goes. The
join is the split's inverse.

```yaml
tags: rare
```

```markdown
revise ┃2. draft
```

> enter

```markdown
revise␠

┃2\̬. draft
```

> deleteContentBackward

```markdown
revise ┃2. draft
```

## Regression24c

Enter right after an escape ourus wrote is Enter at the text's start: the backslash isn't text, so
nothing of the text is before the caret, and the empty paragraph opens above as at `┃-`.

```yaml
tags: rare
```

```markdown
-┃-
```

> shiftEnter

```markdown
\̬-
┃\̬-
```

> cursorLineUp cursorCharRight enter

```markdown
┃◌

\̬-
\̬-
```

## Regression24d

A duplicate's escapes are ours as the original's are: joined, each copy's goes.

```yaml
tags: rare
```

```markdown
- x ┃2. a
```

> enter

```markdown
- x␠
- ┃2\̬. a
```

> duplicateSubtree

```markdown
- x␠
- 2\̬. a
- ┃2\̬. a
```

> cursorLineUp cursorLineBoundaryForward deleteContentForward

```markdown
- x␠
- 2\̬. a┃2. a
```

## Regression25

The same in an item.

```yaml
tags: rare
```

```markdown
- revise ┃2\. draft
```

> enter

```markdown
- revise␠
- ┃2\. draft
```

> deleteContentBackward

```markdown
- revise ┃2\. draft
```

## Regression26

Shift-Enter before `\-`: on its own line `- b` would interrupt the paragraph as a list, so the
backslash is the line's escape there, and stays when Backspace joins the line back: it is the author's.

```yaml
tags: rare
```

```markdown
a ┃\- b
```

> shiftEnter

```markdown
a 
┃\- b
```

> deleteContentBackward

```markdown
a ┃\- b
```

## Regression27

Enter before `2\.` in a paragraph whose next line starts `3\.`: the first line's backslash becomes
the escape its line needs, and the second line's stays text, as reading has it (`3.` can't interrupt a
paragraph, so nothing needs it): each line's escapes are judged against the lines as written.

```yaml
tags: rare
```

```markdown
revise ┃2\. a
3\. b
```

> enter

```markdown
revise␠

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

```markdown
> [!tip]x┃
```

> enter

```markdown
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

```markdown
> [!a b] x┃
```

> enter

```markdown
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

```markdown
┃para
→- a
```

> indent

```markdown
- ┃para
  →\̬- a
```

## Regression31

A backslash after a tab past an item's indentation, where the tab spans two columns (`- a` would
start a list there), is markup, not text. Out of the item, at the line's start, the tab spans four:
`- a` starts nothing, and the author's backslash stays.

```yaml
tags: rare free-form
```

```markdown
┃- para
  →\- a
```

> outdent

```markdown
┃para
→\- a
```

## Regression32

The same line joined onto the item's first: past `para`, `- a` starts nothing, and the backslash
stays (the author's).

```yaml
tags: rare
```

```markdown
- para┃
  →\- a
```

> deleteContentForward

```markdown
- para┃→\- a
```

## Regression33

A quoted text's lazy line is read out of the quote, where the paragraph it continues isn't open: a
list from 2 starts there (`> q1⏎2) x` is a quote and a list), so the line is escaped, though in the
quote a list from 2 couldn't interrupt the paragraph (dev/19-quotes.md §3.2.1).

```yaml
tags: rare
```

```markdown
> q1
p ┃2) x
```

> deleteSoftLineBackward

```markdown
> q1
┃2\̬) x
```

## Regression34

The quote's frame gone, its lazy line is a paragraph's, which the `---` after it would underline: a
blank line sets the break apart. The seam check read the paragraph's later line with the quote's `>`
before it, a container's, though it was the text's own frame (dev/19-quotes.md §3.2.2).

```yaml
tags: rare
```

```markdown
> ┃q0
S1
---
```

> deleteContentBackward

```markdown
┃q0
S1

---
```

## Regression35

An empty item can't interrupt a link reference definition (it reads as the paragraph's `-`): a blank
line sets it apart. The seam check took any block starting on its line for it (dev/19-quotes.md §3.2.2).

```yaml
tags: rare
clipboard: |-
  x

  [a]: /u
```

```markdown
- foo┃

  - 

para
```

> paste

```markdown
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
tags: rare
clipboard: |-
  - x

    ```
    c
    ```
```

```markdown
> a┃b
> c
```

> pastePlain

```markdown
> a- x

> \̬```
>   c
>   \̬```┃b
> c
```

## Regression37

Lazy lines that would make a table in the quote make none out of it (CommonMark's reference parser
agrees): no escape on the delimiter row (dev/19-quotes.md §3.2.1).

```yaml
tags: rare
```

```markdown
- a

> q┃
| a | b |
|---|---|
```

> indent

```markdown
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
tags: rare
quotes: container
```

```markdown
>┃ q
    - a
1. 
```

> deleteSoftLineBackward

```markdown
┃q
    - a

1. 
```

## Regression39

An item after the moved one, of its list as it is (`- x` beside `  - b`), isn't lined up with it where that would move its paragraph's line that could start a block (`2) x`): a shift the writer can't write (dev/19-quotes.md §3.2.3).

```yaml
tags: rare
flavor: obsidian
```

```markdown
  - l┃ong text
  - b
- x
  2) x
```

> moveSubtreeDown

```markdown
  - b
  - l┃ong text
- x
  2) x
```

## Regression40

A paragraph in a subtree that moves within its container, whose line could start a block once re-indented (`- b` past four columns), is spelled where it lands: the writer lines the subtree up with the list it joins (dev/19-quotes.md §3.2.4).

```yaml
tags: rare
flavor: commonmark
```

```markdown
   - x
*┃« a
   - b
         - b
   »   - b
```

> moveSubtreeUp

```markdown
   - ┃«a
      - b
            - b
         - »b
   - x
```

## Regression41

An item regrouped into a callout behind the paragraph placed there is spelled where it lands, as a placed one is (dev/19-quotes.md §3.2.4).

```yaml
tags: rare
flavor: obsidian
quotes: container
```

```markdown
> [!note] T
┃«code
 »  - x
         - b
```

> indent

```markdown
> [!note] T
> ┃«code
> - x
>       - b»
```

## Regression42

A moved item is never written where the item before it would take it in: `- b` joins `  - x`'s list, but after `* x` at column 0 it goes at column 0, `  - x` lined up with it (dev/19-quotes.md §3.2.3).

```yaml
tags: rare
flavor: commonmark
```

```markdown
  - x
1. b«
* x
- b»
```

> moveSubtreeUp

```markdown
1. b«
* x
- b»
- x
```

## Regression43

A moved item that would take in the item after it, of another list, goes at that one's column, the item before it not taking it in: lined up with it instead, `- x` would shift, and what follows it with it (dev/19-quotes.md §3.2.3).

```yaml
tags: rare
flavor: gfm
```

```markdown
   - 
« »     1. x
   - x
```

> outdent

```markdown
   - 
«   1. »x
   - x
```

## Regression44

In CommonMark, below a checkbox alone on its line the paragraph the checkbox starts goes on: the next line's spaces are text, not padding, and the line stays as it was (dev/19-quotes.md §3.2.5).

```yaml
tags: rare markup-task
flavor: commonmark
```

```markdown
- [x] x┃
       - b
```

> deleteSoftLineBackward

```markdown
- [x] ┃
       - b
```

## Regression45

A lazy line past spaces, its node moved to another column, is written at its new container's content column: as it was, its spaces would be the item's (dev/19-quotes.md §3.2.4).

```yaml
tags: rare markup-task
flavor: commonmark
```

```markdown
1. x«
    - [x]» 
  cont
```

> outdent

```markdown
x«
- [x] 
    cont»
```

## Regression46

In CommonMark, which has no tasks, the paragraph a lone checkbox starts goes on below it: `2) x` interrupts nothing and gets no escape (dev/19-quotes.md §3.2.5).

```yaml
tags: rare markup-task
flavor: commonmark
```

```markdown
- b c
  - ┃[ ] 
    2) x
```

> outdent

```markdown
- b c
- [ ] 
  ┃2) x
```

## Regression47

A setext heading past a checkbox keeps its underline unescaped: the underline is the title's frame (dev/19-quotes.md §3.2.5).

```yaml
tags: rare
flavor: obsidian
```

```markdown
- [x] a
      - lo┃ng text
  - 
```

> shiftEnter

```markdown
- [x] a
      - lo
  ┃ng text
  - 
```

## Regression48

An item isn't lined up further left where the indented block after it (code) would then be its (dev/19-quotes.md §3.2.3).

```yaml
tags: rare
flavor: commonmark
```

```markdown
1. ┃«x
    - [»x] x
1. a
  1. 
    - 
```

> moveSubtreeDown

```markdown
1. a
2. ┃«x
    - [»x] x
  3. 
    - 
```

## Regression49

The seam check reads an item with no text with its first child's line, which keeps it open past a blank line: the paragraph after it, lazy there, is set off by one (dev/19-quotes.md §3.2.2).

```yaml
tags: rare
flavor: obsidian
```

```markdown
1. 
    1. x

      - x
- a
      «- b
      1. x»
```

> outdent

```markdown
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
tags: rare
flavor: gfm
quotes: container
```

```markdown
┃> q
| a |
|---|
```

> outdent

```markdown
┃q
| a |
|\̬---|
```


## Regression51

A copy beside its original, at its column, is written as it is, its paragraph's line that could start a block too; and a placed item isn't lined up with the one before it where it needn't be and the shift would carry such a line (dev/19-quotes.md §3.2.3).

```yaml
tags: rare
flavor: obsidian
```

```markdown
  - b
  - «long text
- x»
  2) x
```

> duplicateSubtree

```markdown
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
tags: rare
flavor: commonmark
```

```markdown
1. x
    - [x] x
1. a
  1. «
 »   - 
```

> duplicateSubtree

```markdown
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
tags: rare markup-task
flavor: obsidian
```

```markdown
- [x] a┃
      - long text
  - 
```

> deleteSoftLineBackward

```yaml
result: rejected not-expressible
```

```markdown
- [x] a┃
      - long text
  - 
```

## Regression54

The seam check finds an item a paragraph adopts from beside it where it was: the empty item read as itself, the code after it set off by a blank line (dev/19-quotes.md §3.2.2).

```yaml
tags: rare
flavor: commonmark
```

```markdown
1. a
┃1. x
    - [x] x
  1. 
    - 
```

> outdent

```markdown
1. a

┃x
  - [x] x
  1. 

    - 
```

## Regression55

In CommonMark the text below a lone checkbox keeps its spaces, as text: the caret after the paste stays in the text (it was past its end, the spaces trimmed as padding) (dev/19-quotes.md §3.2.5).

```yaml
tags: rare markup-task
flavor: commonmark
clipboard: |-
  x
  # y
```

```markdown
1. x
    - [x] 
  cont┃
```

> pastePlain

```markdown
1. x
    - [x] 
        contx
      \̬# y┃
```


## Regression56

Enter at a quote's text start under an empty task, in a flavor with tasks: the empty paragraph above it would be the task's first block, but a blank line after an empty task ends it and without one the line is its text. Refused (dev/19-quotes.md §3.2.6).

```yaml
tags: rare markup-task
flavor: gfm
```

```markdown
- a
- [ ] 
  > ┃q
- b
```

> enter

```yaml
result: rejected not-expressible
```

```markdown
- a
- [ ] 
  > ┃q
- b
```

## Regression57

In CommonMark the checkbox is text, the item not empty: the empty paragraph goes in above the quote, set off from it by a blank line (dev/19-quotes.md §3.2.6).

```yaml
tags: rare markup-task
flavor: commonmark
```

```markdown
- a
- [ ] 
  > ┃q
- b
```

> enter

```markdown
- a
- [ ] 

  ┃◌

  > q
- b
```


## Regression58

An item after a moved one isn't lined up with it where it needn't be and the shift would carry its lazy line past spaces (`    1. x` continuing `  1. b`): at column 0 that line would be `b`'s list (dev/19-quotes.md §3.2.3).

```yaml
tags: rare
flavor: commonmark
```

```markdown
- «a
2)» a
1. x
  1. b
    1. x
```

> moveSubtreeDown

```markdown
┃«1. x
- »a
2. a
  3. b
    1. x
```

## Regression59

A list of its own after an item, placed in its container, stays where it was, the item before it not taking it in there: nothing after it has to move (dev/19-quotes.md §3.2.3).

```yaml
tags: rare
flavor: commonmark
```

```markdown
   1┃«. x
   1. »b
   - 
   - [ ] 
  cont
```

> moveSubtreeDown

```markdown
   - 
   1┃«. x
   1. »b
   - [ ] 
  cont
```

## Regression60

The indented block after an item, last in a list a block adopts (`listParent: block`), is its section's next node: the item isn't lined up further left, where it would take that block in (dev/19-quotes.md §3.2.3).

```yaml
tags: rare
flavor: commonmark
quotes: atom
listParent: block
```

```markdown
    1. a
1. ┃«x
      - [»x] x
1. a
  1. 
    - 
```

> moveSubtreeDown

```markdown
    1. a
1. a
2. ┃«x
      - [»x] x
  3. 
    - 
```

## Regression61

Items moved into a container that would take in the item after them that stays go at that one's column, so it doesn't move (its line `    - x` couldn't) (dev/19-quotes.md §3.2.3).

```yaml
tags: rare
flavor: gfm
quotes: atom
listParent: container
```

```markdown
«   - x
      - x
  »    1. 
   - a
         - x
```

> outdent

```markdown
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

```markdown
┃> ab
```

> pastePlain

```yaml
result: rejected not-expressible
```

```markdown
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

```markdown
- a
1. «x»
  1. b
```

> paste

```markdown
- a
1. x┃
2. b
```

## Regression64

Tab on a quote atom with a lazy line led by a tab is refused: after the new item's marker the tab
would span other columns, and `2)` would no longer continue the quote (the writer re-indents spaces,
not tabs) (dev/19-quotes.md §3.3).

```yaml
tags: rare
quotes: atom
```

```markdown
- a

> ┃q
→2) long text
```

> indent

```yaml
result: rejected not-expressible
```

```markdown
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

```markdown
- a┃
  - c
```

> paste

```markdown
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

```markdown
100. a
┃
  b
```

> paste

```markdown
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
```

```markdown
- a①⟦folded⟧
  - b
┃
- c
```

> deleteSubtree

```markdown
- ┃c
```

## Regression68

Shift-Up from the blank line after a folded subtree selects the folded node, not its hidden last
descendant.

```yaml
tags: rare
```

```markdown
- a①⟦folded⟧
  - b
┃
- c
```

> selectNodeUp

```markdown
┃- a⟦folded⟧⟦selected⟧
  - b

- c
```

## Regression69

On a folded row two nodes share, the caret is the outer node's, whose fold it is: the inner item is
one of its hidden children.

```yaml
tags: rare
```

```markdown
- - ┃a①②⟦folded⟧
  - b
```

> selectNodeDown

```markdown
- - a⟦folded⟧⟦selected⟧
  - b
```

## Regression70

A caret on the blank line after a placeholder's empty paragraph is in that paragraph's gap, not
the node above it.

```yaml
tags: rare
```

```markdown
- x
- a

  ◌
┃
- b
```

> deleteSubtree

```markdown
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

```markdown
- x
- - a⟦selected⟧
  - b
- y
```

> duplicateSubtree

```markdown
- x
- - a
  - b
- - a⟦selected⟧
  - b
- y
```

## Regression72

A plain paste over a subtree selection whose first root has no text of its own replaces it with one
node, under the root's prefix: its first child's text is the one replaced.

```yaml
tags: rare
clipboard: 'z'
```

```markdown
- x
- - a⟦selected⟧
  - b
- y
```

> pastePlain

```markdown
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

```markdown
a
⍽«x»⍽
b
```

> cut

```markdown
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

```markdown
\┃
```

> pastePlain

```markdown
\- a
\̬- b┃
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

```markdown
- Project
  -  ┃◌
- Inbox
```

> pastePlain

```markdown
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

```markdown
- Earlier
-  ┃Review
  - Detail
- Later
```

> indent

```markdown
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

```markdown
- Earlier
-  ┃Review
  - Detail
- Later
```

> moveSubtreeUp

```markdown
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

```markdown
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

```markdown
---⟦selected⟧
para⟦selected⟧
```

> duplicateSubtree

```markdown

---
para

---⟦selected⟧
para⟦selected⟧
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

```markdown
┃- x
  > - a
    ▸

  y
```

> pasteAt

```markdown
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

```markdown
- Earlier
-  ┃Review
  - Detail
- Later
```

> shiftEnter

```markdown
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

```markdown
- Earlier
-  Review┃
  - Detail
- Later
```

> deleteSoftLineBackward

```markdown
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
tags: common
clipboard:
  text/plain: |-
    Draft announcement
    Send update
    Archive notes
  text/html: '<p style="mso-list:l0 level2 lfo1"><span style="mso-list:Ignore">o </span>Draft announcement</p><p style="mso-list:l0 level1 lfo1"><span style="mso-list:Ignore">· </span>Send update</p><p style="mso-list:l0 level1 lfo1"><span style="mso-list:Ignore">· </span>Archive notes</p>'
```

```markdown
- Inbox┃
```

> paste

```markdown
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

```markdown
- x┃
  > - a
  >
  > - →b

  y
```

> outdent

```markdown
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

```markdown
- [x]␠
   «    - b»
```

> paste

```markdown
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

```markdown
┃
```

> paste

```markdown
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

```markdown
┃
```

> paste

```markdown
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

```markdown
┃
```

> paste

```markdown
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

```markdown
┃
```

> paste

```markdown
- Keep \~\~draft\~\~ and %\%this%\% literal┃
```

## Regression90

A backtick typed over a selection that starts and ends with a space wraps it with a space more each
side, which the code span strips, keeping the selection's own.

```yaml
tags: rare
autoClose: ['```', '~~~', '`']
```

```markdown
a« b »c
```

> "\`"

```markdown
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

```markdown
- a┃ b
```

> pastePlain

```markdown
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

```markdown
- Parent
┃  -  child
```

> deleteContentBackward

```markdown
- Parent┃ child
```

## Regression93

A duplicate of an empty item a placeholder holds, the caret in it (Enter, then Tab): its copy below
it, the caret in the copy; the original, empty, apart from the text above by a blank line, which
without its placeholder it would continue.

```yaml
tags: rare
```

```markdown
- a
  - ┃◌
```

> duplicateSubtree

```markdown
- a

  - 
  - ┃
```

## Regression94

Zoomed in, the root's first child moved up: nothing is above it in the view, as at the document's
start, the reason the rule's, not the zoom's.

```yaml
tags: rare
```

```markdown
- top①⟦zoomed⟧
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

```markdown
┃
```

> paste

```markdown
## Issue \#┃
```

## Regression96

Formatting from HTML across a paragraph break: each paragraph's part formatted on its own, where one
pair of delimiters across the blank line would be literal.

```yaml
tags: common
clipboard:
  text/plain: |-
    a

    b
  text/html: '<p><em>a<br><br>b</em></p>'
```

```markdown
┃
```

> paste

```markdown
*a*

*b*┃
```

## Regression97

Zoomed in, Backspace over the root selected as a block deletes it, as cut does, the zoom going to
its nearest ancestor left, none at the top level (Logseq, Logseq DB, Tana delete it too).

```yaml
tags: rare
```

```markdown
- top①⟦zoomed⟧⟦selected⟧
  - one
  - two
- other
```

> deleteContentBackward

```markdown
- ┃other
```

## Regression98

A heading alone from HTML, pasted at a text's end: a block, as pasting its Markdown with a line break
is, not inline text joined to the text before it (`- here## Title`).

```yaml
tags: common
clipboard:
  text/plain: 'Title'
  text/html: '<h2>Title</h2>'
```

```markdown
here┃
```

> paste

```markdown
here

## Title┃
```

## Regression99

A cut of the spaces between two words: they are the clipboard, which a paste puts back. A line the
copy takes whole, blank, is empty; part of one is as it is.

```yaml
tags: rare
```

```markdown
- a«  »b
```

> cut

```yaml
clipboard: "  "
```

```markdown
- a┃b
```

## Regression100

A copy through the text's final line ending ends with it, as one ending at the next line's start
does: a cut takes it.

```yaml
tags: rare
```

```markdown
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

```markdown
> - ┃◌
# h
```

> deleteContentBackward

```markdown
# ┃h
```

## Regression102

Shift-Enter at an item's text start, past spaces after its marker: the text below the marker, at the
item's content column one past it, its later lines with it.

```yaml
tags: rare
```

```markdown
-   ┃a
b
```

> shiftEnter

```markdown
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

````markdown
-
  ```
  code┃
  ```
````

> enter

````markdown
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

````markdown
```
😀┃```
payload
```
````

> deleteContentBackward

`````markdown
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

```markdown
p┃q
```

> paste

```markdown
ph┃q
```

## Regression106

Delete at the end of an item's marker line, its code starting below it: the code goes up onto the
marker's line, the line break between them taken.

```yaml
tags: rare
```

````markdown
-┃
  ```
  code
  ```
````

> deleteContentForward

````markdown
- ┃```
  code
  ```
````

## Regression107

The same item outdented at the top level, from its fence (on a code line Shift-Tab is the host's):
the code a block of its own, the marker's line gone with the marker.

```yaml
tags: rare markup-fence
```

````markdown
-
  ┃```
  code
  ```
````

> outdent

````markdown
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

```markdown
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

```markdown
┃> [^1]: note
```

> duplicateSubtree

```markdown
> [^1]: note
> [^1]: ┃note
```

## Regression110

A definition with a space before it, indented into an item: the space is no text of the item's, its
padding there, gone.

```yaml
tags: rare
```

```markdown
┃ [a]: /url
```

> indent

```markdown
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

```markdown
>→-┃
```

> pastePlain

```markdown
>→- x
>→  y┃
```

## Regression112

Backspace at the text start of an item first in a quote, its text starting `[!type]`, in GFM: the
item a paragraph of the quote, its text as it was (GFM has no callouts; Obsidian's writes `\[!note]`).

```yaml
tags: rare
flavor: gfm
```

```markdown
> - ┃[!note] title
```

> deleteContentBackward

## Regression113

Enter at the end of the only paragraph, then everything selected and deleted: the empty paragraph
the caret is in stays, held, the text otherwise empty.

```yaml
tags: rare
```

```markdown
«a

◌»
```

> deleteContentBackward

```markdown
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

```markdown
> a┃
```

> pastePlain

```markdown
> ax
> y┃
```

## Regression115

A cut of code that leaves a fence on its line, which would close the block early: the block's
fences grow past it, as a character Backspace deletes there makes them.

```yaml
tags: rare
```

````markdown
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

`````markdown
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
tags: rare markup-fence
```

````markdown
```
→┃```
PAYLOAD
```
AFTER
````

> deleteContentBackward

`````markdown
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

```markdown
> ```
>     ┃```
> PAYLOAD
> ```
> AFTER
```

> deleteContentBackward

````markdown
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

````markdown
```
X┃```
PAYLOAD
```
AFTER
````

> deleteSoftLineBackward

`````markdown
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

````markdown
> ```
> PAYLOAD┃
> ```
> AFTER
````

> deleteSoftLineBackward

````markdown
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

````markdown
```
BEFORE
┃
PAYLOAD
```
AFTER
````

> paste

`````markdown
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

````markdown
```
BEFORE
«START
END»
PAYLOAD
```
AFTER
````

> pastePlain

`````markdown
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

````markdown
```
«X»```
PAYLOAD
```
AFTER
````

> " "

`````markdown
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
tags: rare markup-fence
markup: decorated
```

````markdown
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
```

```markdown
- - ┃a①②⟦folded⟧
  - SECRET③
- KEEP④
```

> cut

```yaml
clipboard: |
  - - a
    - SECRET
```

```markdown
- ┃KEEP④
```

## Regression125

Backspace of the only character of a task whose status is another than `[ ]` or `[x]`, its children
after a blank line: the empty task is held, keeping them, as for any status.

```yaml
tags: rare
flavor: obsidian
```

```markdown
- [?] x┃

  - child
```

> deleteContentBackward

```markdown
- [?] ┃◌

  - child
```

## Regression126

Tab on a fence after an item, its code holding a line that starts with a tab: the block is the
item's text, its lines two columns in, where the tab spans two columns and makes the backticks
after it a fence: the block's fences grow past them.

```yaml
tags: rare markup-fence
```

````markdown
- a
┃```
x
→```
y
```
````

> indent

`````markdown
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

```markdown
>a
>
>z
>  e┃
```

> enter

```markdown
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

````markdown
> ```
> x
> ```
> after┃
▸
````

> pasteAt

````markdown
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

```markdown
>- [x] >
 ┃   -
```

> deleteContentForward

```markdown
>- [x] >
 ┃◌  -
```

> cursorDocStart

```markdown
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

```markdown
«x
>b»
→~~~
```

> indent

```markdown
- «x
- >b»
  →\̬~~~
```

## Regression131

Shift-Down from a paragraph to a quote whose last line is a blank `>` after its item, the item's
blank line: the quote is selected whole, its lines the item's and that blank line.

```yaml
tags: rare
```

```markdown
=⟦selected⟧
>-
>
after
```

> selectNodeDown

```markdown
=⟦selected⟧
>-⟦selected⟧
>
after
```

## Regression132

A text drag's deletion with nothing selected, a caret: it deletes nothing, where Backspace would
join the item to the one above.

```yaml
tags: rare
```

```markdown
- alpha
- ┃beta
```

> deleteByDrag

```markdown
- alpha
- ┃beta
```

## Regression133

With `` ` `` in `autoClose`, Backspace between two backticks of a code span's code: one goes, as any
character of code; they are no empty pair.

```yaml
tags: rare
autoClose: ['```', '~~~', '`']
```

````markdown
a ```x `┃` y``` b
````

> deleteContentBackward

````markdown
a ```x ┃` y``` b
````

## Regression134

With `` ` `` in `autoClose`, between an escaped backtick and another: no empty pair, so Backspace deletes
one and a backtick typed is typed, not stepped over.

```yaml
tags: rare
autoClose: ['```', '~~~', '`']
```

```markdown
a \`┃` b
```

> deleteContentBackward

```markdown
a \┃` b
```

> "\`\`"

```markdown
a \``┃` b
```

## Regression135

Cmd-Backspace at the end of a setext title's only line: the title goes, the heading stays, an empty
ATX one of its level, which Markdown holds (its underline would be text under no title), as block
apps keep an emptied heading.

```yaml
tags: rare
```

```markdown
Title┃
---

para
```

> deleteSoftLineBackward

```markdown
## ┃

para
```

## Regression136

Cmd-Backspace at the end of a setext title's last line, below another: that line goes with its line
break, the title the line above it.

```yaml
tags: rare
```

```markdown
Ti
tle┃
===
```

> deleteSoftLineBackward

```markdown
Ti┃
===
```

## Regression137

Enter at the end of an ATX title with a closing sequence, the caret before its blank: as at any
title's end, an empty paragraph after it, the closing `#`s staying the title's, not the new text.

```yaml
tags: rare markup-heading
```

```markdown
## title┃ ##
```

> enter

```markdown
## title ##

┃◌
```

## Regression138

Backspace joining a paragraph that ends in ` #` onto an ATX title: its `#` the title's text still,
escaped, not the title's closing sequence.

```yaml
tags: rare
```

```markdown
# h

┃x #
```

> deleteContentBackward

```markdown
# h┃x \̬#
```

## Regression139

A paste at an ATX title's end of text ending in ` #`: the `#` escaped, text, not a closing sequence.

```yaml
tags: rare
clipboard: "b #"
```

```markdown
# a┃
```

> paste

```markdown
# ab \̬#┃
```

## Regression140

A paste of text starting with a space at the start of an item's text, the item with children: the
space goes, as a pasted first line's leading blanks do at a text's start (as padding they would
move the item's text past its children's column, which would leave it).

```yaml
tags: common
clipboard: " x"
```

```markdown
- ┃bravo
  - charlie
```

> paste

```markdown
- x┃bravo
  - charlie
```

## Regression141

A plain paste of one line starting with a space at an item's text start: the space goes, as for
several lines.

```yaml
tags: common
clipboard: " x"
```

```markdown
- ┃bravo
  - charlie
```

> pastePlain

```markdown
- x┃bravo
  - charlie
```

## Regression142

Enter at the end of an item numbered 999999999: the next number has ten digits, no list marker's,
so the new item would be text: refused.

```yaml
tags: rare
```

```markdown
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

```markdown
007. a┃
```

> enter

```markdown
007. a
8. ┃
```

## Regression144

Tab on a heading after a blank line: it goes into the section above, the blank line staying between
the two, where the author wrote it, not moving after it.

```yaml
tags: common markup-heading
```

```markdown
## B

## ┃C
```

> indent

```markdown
## B

### ┃C
```

## Regression145

Shift-Tab on the last heading, after a blank line, the text ending with no line ending: no blank
lines move or come at the end.

```yaml
tags: common markup-heading
```

```markdown
# A

## B

### ┃C
```

> outdent

```markdown
# A

## B

## ┃C
```

## Regression146

Backspace at a heading's start making it a paragraph, a blank line above it: the blank line stays,
the text gaining none at its end.

```yaml
tags: common markup-heading
```

```markdown
# h

# ┃n
```

> deleteContentBackward

```markdown
# h

┃n
```

## Regression147

Backspace in the closing fence of an empty block, the text's last, a blank line above it: the block
goes, the text ending where the paragraph above does, as the block's end did.

```yaml
tags: rare markup-fence
```

````markdown
alpha

```
``┃`
````

> deleteContentBackward

```markdown
alpha┃
```

## Regression148

Cmd-Backspace emptying the only paragraph, a blank line above it: the paragraph stays, empty, held
on its own line, the blank line above it.

```yaml
tags: rare
```

```markdown

a┃
```

> deleteSoftLineBackward

```markdown

┃◌
```

## Regression149

Enter on the only item, empty, a blank line above it: a paragraph, held on the item's line.

```yaml
tags: rare
```

```markdown

- ┃
```

> enter

```markdown

┃◌
```

## Regression150

Enter at the end of an unclosed math block, the text's last line: a new line of the block, as in an
unclosed fence.

```yaml
tags: rare enter-in-fence
flavor: obsidian
```

```markdown
$$
a┃
```

> enter

```markdown
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

````markdown
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

````markdown
-⟦selected⟧
  ```
  X
  ```
````

> selectNode

````markdown
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

```markdown
-┃-
```

> indent

```markdown
- \̬-┃-
```

## Regression154

A line break pasted in indented code whose lines end with a lone CR: a blank line of the code, its
ending a CRLF, as the old line's LF after the CR alone would read the two as one.

```yaml
tags: rare
clipboard: |+

```

```markdown
→k┃␍    :
```

> pastePlain

```markdown
→k␍┃␍
    :
```

## Regression155

Cmd-Backspace on a paragraph's last line after a lone CR: the line emptied, a blank line after the
paragraph, its ending no LF after the CR.

```yaml
tags: rare
```

```markdown
c␍~┃
```

> deleteSoftLineBackward

```markdown
c
┃
```

## Regression156

Shift-Enter at a later line's start, the line above ending with a lone CR, a blank line and a
paragraph below: two paragraphs, the blank line between them, the one below as it was.

```yaml
tags: rare
```

```markdown
a␍┃c

c
```

> shiftEnter

```markdown
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

```markdown
- Project
  -  ┃◌
- Inbox
```

> paste

```markdown
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

```markdown
>2) a
 ~┃
```

> outdent

```markdown
2) a
    ~┃
```

## Regression159

Backspace at the start of an item whose first child is a nested item on its line, after spaces: the
two one item, its later line, lazy, at the item's column now, not the column the spaces made.

```yaml
tags: rare
```

```markdown
┃1.  - d
e
```

> deleteContentBackward

```markdown
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

```markdown
-  y┃x
  y
```

> pastePlain

```markdown
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

```markdown
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

```markdown
 >┃a
>b
```

> indent

```markdown
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

```markdown
  - a⟦selected⟧
  - b⟦selected⟧
- c⟦selected⟧
```

> duplicateSubtree

```markdown
  - a
  - b
- c
- a⟦selected⟧
- b⟦selected⟧
- c⟦selected⟧
```

## Regression164

Tab on a fence between an empty item and an item indented two columns: an item, the fence its text;
the item below it lined up with it, which, as it was, would be its child.

```yaml
tags: rare markup-fence
```

````markdown
-
┃```
```
  -
````

> indent

````markdown
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

```markdown
┃[^1]:>
```

> indent

```markdown
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

```markdown
>┃a
=
```

> duplicateSubtree

```markdown
>a
=
>
>┃a
>\̬=
```

## Regression167

Duplicate of a paragraph indented two spaces that owns a list: the copy after the list, its first
line without those spaces, which there would make it the last item's content.

```yaml
tags: rare
```

```markdown
  ┃e
- g
  >y
```

> duplicateSubtree

```markdown
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
tags: rare markup-heading
```

```markdown
- # ┃g
  e
#
  y
```

> moveSubtreeDown

```markdown
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

```markdown
- [a]:u┃
T
```

> paste

```markdown
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

```markdown
1.
10. c┃
   a
```

> paste

```markdown
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

```markdown
>[a]:u┃
b
```

> outdent

```markdown
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

```markdown
>>-→┃]
```

> shiftEnter

```markdown
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

```markdown
┃ > +→]
`
```

> shiftEnter

```markdown
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

```markdown
+ b
- - ┃c
```

> moveSubtreeUp

```markdown
+ - ┃c
+ b
```

## Regression175

Alt-Up on a numbered item whose first block is a list on its line: renumbered, its number written
over the old one on that line.

```yaml
tags: rare
```

```markdown
1. a
2. - ┃b
```

> moveSubtreeUp

```markdown
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

```markdown
>
>[!e]┃a
```

> shiftEnter

```markdown
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

```markdown
 b⟦selected⟧
␠
```

> pastePlain

```markdown
 x┃
␠
```

## Regression178

With `` ` `` in `autoClose`, three backticks typed at once between a space and a backtick: a fence, as
they make typed one by one.

```yaml
tags: rare
autoClose: ['```', '~~~', '`']
```

```markdown
 ┃`
```

> "\`\`\`"

````markdown
```┃
`̬`̬`̬
````

## Regression179

A rule dropped under an item with no children: it is an item of a list of its own, whose bullet isn't
the rule's character (`- ---` would read as one rule).

```yaml
tags: rare
```

```markdown
- a
  ▸
---┃①
```

> moveSubtree ①

```markdown
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

```markdown
1. a┃
10. b

   c
```

> cut

```markdown
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

```markdown
[a]
[a]:s┃
```

> indent

```markdown
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

```markdown
[a]:u
-
- b┃
```

> outdent

```markdown
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

```markdown
>[^1]: a
>     #t┃
```

> outdent

```markdown
[^1]: a
    #t┃
```

## Regression184

Shift-Enter at the end of a line inside a quote's text: the quote holds two paragraphs, the blank
line between them quoted, the caret on it, the lines after it still quoted, as the text editors
keep them. Typed on, the two are one text again; Backspace on that line joins them back too.

```yaml
tags: common
```

```markdown
> a
> b┃
> c
```

> shiftEnter

```markdown
> a
> b
> ┃
> c
```

> "x"

```markdown
> a
> b
> x┃
> c
```

> deleteContentBackward

```markdown
> a
> b
> ┃
> c
```

> deleteContentBackward

```markdown
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

```markdown
- > a
  > b┃
  > c
```

> shiftEnter

```markdown
- > a
  > b
  > ┃
  > c
```

> deleteContentBackward

```markdown
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

```markdown
>>┃=
>→e
```

> outdent

```markdown
>┃=
  e
```

## Regression187

Shift-Tab on quoted indented code past two tabs, the quote taking a column of the first: the code
leaves the quote with its payload as it was, each tab the spaces it spanned where it was.

```yaml
tags: rare
```

```markdown
>→→%
┃
```

> outdent

```markdown
      %
┃
```

## Regression188

Shift-Tab on a quote nested after a tab the outer quote took a column of: out of it, its `>` after
the spaces that tab's rest spanned (a tab there would span four columns, the quote then code).

```yaml
tags: rare
```

```markdown
>→> ┃q
```

> outdent

```markdown
  > ┃q
```

## Regression189

Enter at the text start of an item on its parent's marker line, a tab after that marker: the new
empty item goes there, the marker's tab kept, and the text's item below it, at the content column.

```yaml
tags: rare
```

```markdown
-→- ┃->
```

> enter

```markdown
-→- ┃
    - ->
```

## Regression190

A duplicate of an item whose first block is a callout on its marker's line, renumbered: the copy's
quote is named where its `>` is written, after the new number.

```yaml
flavor: obsidian
tags: rare
```

```markdown
1. > [!note] T⟦selected⟧
```

> duplicateSubtree

```markdown
1. > [!note] T
2. > [!note] T⟦selected⟧
```

## Regression191

Tab with the caret on the blank line after a node, the last of a quote's children now: the blank
line, before the next quote, is written outside the quote, which would take that quote in.

```yaml
flavor: obsidian
quotes: text
tags: rare
```

```markdown
> ## h
  ---
┃
> ## h
```

> indent

```markdown
> ## h
>
>   ---
┃
> ## h
```

## Regression192

A duplicate of an item in a loose list whose subtree ends in a fence nothing closes: no blank line
after the original, which would be a line of its code, nor after the copy; the copy's item ends the
code.

```yaml
tags: rare
```

````markdown
- a┃

  b
  ```
````

> duplicateSubtree

````markdown
- a

  b
  ```
- a┃

  b
  ```
````

## Regression193

Typing at the end of a marker's line, the item's text starting on the line below: on the marker's
line, after a space, the text's first line (right after the marker, the line would be no item).

```yaml
tags: rare
```

```markdown
1.┃
   b
```

> "z"

```markdown
1. z┃
   b
```

## Regression194

Enter at the end of a folded item whose subtree ends in a fence nothing closes: the new item after
the subtree, the fence taking no blank line from it, which would be a line of its code.

```yaml
tags: rare
```

````markdown
- a┃

  b
  ```
````

> fold

> enter

````markdown
- a⟦folded⟧

  b
  ```
- ┃
````

## Regression195

A duplicate of a quote's last child that has children, another quote after the quote: the blank
line after the copy's subtree is written where what follows it is, outside the quote, which would
take the next quote in.

```yaml
flavor: obsidian
quotes: text
tags: rare markup-heading
```

```markdown
> ┃## h
>
> p

> q
```

> duplicateSubtree

```markdown
> ## h
>
> p
>
> ## ┃h
>␠
> p

> q
```

## Regression196

Deleting the first of two items whose first block is a callout on its marker's line: the item left,
renumbered, its quote named where its `>` is written, after the new number.

```yaml
flavor: obsidian
tags: rare
```

```markdown
1. > [!note] ┃T
2. > [!note] U
```

> deleteSubtree

```markdown
1. > [!note] ┃U
```

## Regression197

A paste of one line over a text's first word: the blank after the word stays, the pasted line in
the word's place (deleting the word alone takes the blank, a text starting with none).

```yaml
tags: common
clipboard: "Q"
```

```markdown
«p» qx
```

> paste

```markdown
Q┃ qx
```

## Regression198

A paste that puts a heading above a quote's lazy line: the line, now under the heading, is written
with the quote's `>` (after a heading a line isn't lazy: it would leave the quote).

```yaml
flavor: obsidian
tags: rare
clipboard: |-
  x

  # h
```

```markdown
>[a]:u┃
b
```

> paste

```markdown
>[a]:u
> x
>
> # h┃
>b
```

## Regression199

Cmd-Backspace at the end of a block-id line under a quote's empty item, the item's text a line
break and blank lines after it, hung: the writer's walk back over the text's blank last lines,
`lastIndexOf` from the line break at its start, found it again and again. Now refused, as an empty
line inside a text is (found by the view's exhaustive pass on Fold20's start); the caret having
left them, the placeholders settle after it, as in Fold20.

```yaml
flavor: obsidian
tags: rare
```

```markdown
◌
# h
> - ◌
> ^x┃
```

> deleteSoftLineBackward

```markdown
# h
> - ^x
```

```yaml
result: rejected not-expressible
```

## Regression200

Backspace at the start of a quote read as an atom, right after a folded item: the quote joins the
folded item's text, the text the reader sees above it, not its hidden child's (as Fold15); the fold
stays.

```yaml
tags: rare
quotes: atom
```

```markdown
- parent①⟦folded⟧
  - child

┃> quote
```

> deleteContentBackward

```markdown
- parent┃> quote①⟦folded⟧
  - child
```

## Regression201

Backspace at the opening fence of an item whose text is code, right after a folded item: the code
goes to the folded item, the one the reader sees above it, after its children, not under its hidden
child; what the fold hides changed, so it opens (as Fold15b).

```yaml
tags: rare markup-fence
```

````markdown
- parent①⟦folded⟧
  - child
- ┃```
  code
  ```
````

> deleteContentBackward

````markdown
- parent┃
  - child
  ```
  code
  ```
````

## Regression202

Delete at the end of a folded item whose text is a quote read as an atom: its first child is hidden,
so nothing joins (as Fold7).

```yaml
tags: rare
quotes: atom
```

```markdown
- > quote┃①⟦folded⟧
  - child
- next
```

> deleteContentForward

```yaml
result: rejected folded
```

## Regression203

Enter after the closing fence of a folded item whose text is code: a new item after its subtree, not
a first child among the hidden ones; the fold stays (as Fold1). The same for a table's last row and,
with `enterInQuote: split`, a quote read as an atom.

```yaml
tags: rare markup-fence
```

````markdown
- ```①⟦folded⟧
  code
  ```┃
  - child
- next
````

> enter

````markdown
- ```①⟦folded⟧
  code
  ```
  - child
- ┃
- next
````

## Regression204

```yaml
tags: rare
```

```markdown
- | A |①⟦folded⟧
  | - |┃
  - child
- next
```

> enter

```markdown
- | A |①⟦folded⟧
  | - |
  - child
- ┃
- next
```

## Regression205

```yaml
tags: rare
quotes: atom
enterInQuote: split
```

```markdown
- > quote┃①⟦folded⟧
  - child
- next
```

> enter

```markdown
- > quote①⟦folded⟧
  - child
- ┃
- next
```

## Regression206

Shift-Enter at the end of a folded item: the new line is a line of the item's text, held by a
placeholder, on the row the fold shows, so the fold stays closed and typing goes on the new line.

```yaml
tags: common
```

```markdown
- parent┃①⟦folded⟧
  - child
- next
```

> shiftEnter "x"

```markdown
- parent①⟦folded⟧
  x┃
  - child
- next
```

## Regression207

Enter in a folded paragraph that has a list, with `enterMidItem: child`: the option is an item's, so
the paragraph splits as it does with any `enterMidItem`, its rest taking the list and the fold.

```yaml
tags: rare
enterMidItem: child
```

```markdown
hello ┃world①⟦folded⟧
- child
```

> enter

```markdown
hello␠

┃world②⟦folded⟧
- child
```

## Regression208

Zoomed into an item, a move that writes no characters, two identical items swapped, would take the
root out of its place: refused, as any move of the root is.

```yaml
tags: rare
```

```markdown
- a┃①⟦zoomed⟧
- a
```

> moveSubtreeDown

```yaml
result: rejected outside-zoom
```

## Regression209

Zoomed into code where markup is decorated, the caret entering the zoom goes to the code's first
character, not onto its opening fence, which is markup.

```yaml
tags: rare
markup: decorated
```

````markdown
┃p

```②
x
```
````

> zoomIn ②

````markdown
p

```②⟦zoomed⟧
┃x
```
````

## Regression210

Backspace on the blank line after a folded item's hidden last line: the host's default would delete
the line break and leave the caret at the end of the hidden line; ourus deletes it and puts the
caret at the end of the folded row, where the reader sees it, the fold kept.

```yaml
tags: common
```

```markdown
- a①⟦folded⟧
  - b
┃
```

> deleteContentBackward

```markdown
- a┃①⟦folded⟧
  - b
```

## Regression211

A cut of the paragraph above a fenced code block, nothing above it: the caret goes before the
opening fence, not to the code's first line, where the next paste, the cut put back, would become
code. Math's `$$` and a comment's `%%` the same.

```yaml
tags: common markup-fence
```

````markdown
«first

»```
code
```
````

> cut

````markdown
┃```
code
```
````

## Regression212

A caret alone in a one-paragraph quote copies the quote, its `>` with it: the quote is the node's own
text (`quotes: text`, the default), as a callout's is (Copy8). The paragraph's text alone lost the
first line's `>` and pasted unquoted.

```yaml
tags: common
```

```markdown
> a ┃quote
> more
```

> copy

```yaml
clipboard:
  text/plain: |
    > a quote
    > more
```

## Regression213

With `quotes: atom`, the copy kept the `>` of every line but the first, which pasted as a paragraph
and a quote after it.

```yaml
tags: rare
quotes: atom
```

```markdown
> a ┃quote
> over two lines
```

> copy

```yaml
clipboard:
  text/plain: |
    > a quote
    > over two lines
```

## Regression214

A plain paste of several lines right at a block id's `^`: what is pasted goes before the id, a blank
between, as typing puts it there, the id ending the last line. Left to the host, the last line was
glued to it (`b^blk`), no block id any more.

```yaml
tags: rare
flavor: obsidian
clipboard: |-
  a
  b
```

```markdown
Final ┃^blk
```

> pastePlain

```markdown
Final a
b┃ ^blk
```

## Regression215

A paste of a list with the caret at the end of a paragraph that ends in a block id: the list goes after
the paragraph, as without the id. Left to the host, it was written after the id on its line, the id
text and the list no list.

```yaml
tags: common
flavor: obsidian
clipboard: |-
  - x
  - y
```

```markdown
Final ^blk┃
```

> paste

```markdown
Final ^blk

- x
- y┃
```

## Regression216

Backspace before the `>` of a callout that is a list item's first block: its `[!type]` goes as a
unit, as at the top level (Quote57), the title the quote's first paragraph, a quoted blank line
before the body. The writer couldn't write the quote's line, whose `>` and the item's marker were
its title's, once the title was a paragraph of it.

```yaml
tags: rare
flavor: obsidian
quotes: container
```

```markdown
x

- ┃> [!note] Title
  > body text
```

> deleteContentBackward

```markdown
x

- > ┃Title
  >
  > body text
```

## Regression217

Enter at the end of the first line of a two-line quote that is an item's text, a blank line after the
item: the quote becomes two paragraphs, the item's text none now, and the blank line after it the
quote's last paragraph's. Left on the item, which has no text any more, the write failed.

```yaml
tags: rare
```

```markdown
- > quote┃
  > more

x
```

> enter

```markdown
- > quote
  > ┃
  > more

x
```

## Regression218

Shift-Enter on the quoted blank line between a quote's two paragraphs, written `>` as the writer
writes it, the caret after the `>`: another quoted blank line, the caret on it at the text's column.
The caret wasn't taken to be at the text's column (the space after `>` missing), so the key was the
host's, whose plain line break ended the quote.

```yaml
tags: rare
quotes: container
```

```markdown
> bo
>┃
> dy
```

> shiftEnter

```markdown
> bo
>
> ┃
> dy
```

## Regression219

Where markup is decorated, Backspace inside a checkbox, right after its character, deletes that
character, the brackets staying, as where markup is text (TaskBackspace8); and a character typed
there makes it a task again. It took the whole checkbox before.

```yaml
tags: rare markup-task
markup: decorated
```

```markdown
- [x┃] task
```

> deleteContentBackward

```markdown
- [┃] task
```

> "x"

```markdown
- [x┃] task
```

## Regression220

A section moved above an earlier one whose subsections are the same (a duplicated section, renamed):
the write was refused, the earlier section's paragraph read back as the moved one's. The change
replacing the lines from the start put the earlier subsection's old start inside the text it
replaced, which maps to the change's end, where that subsection was written now by chance: taken as
carried there, its descendants weren't named, and the line-by-line read gave them the other's ids.

```yaml
tags: common
```

```markdown
# Old①
## B
x
## C
# New┃②
## B
x
## C
```

> moveSubtreeUp

```markdown
# New┃②
## B
x
## C
# Old①
## B
x
## C
```

## Regression221

Deleting the last item of a loose list, a table after the list: the blank line that set the list off
from the table stays, now the item above's. It went with the item, the table's first line then a
lazy line of the item's text, and the write failed (a heading or code after it lost the blank line).

```yaml
tags: common
flavor: gfm
```

```markdown
- b

  c
- d┃

| a |
| - |
```

> deleteSubtree

```markdown
- b

  c┃

| a |
| - |
```

## Regression222

Backspace at the end of an empty code block's closing fence, the block holding the list after it
(`listParent: block`): the block goes, its list staying in its place. The list went with it.

```yaml
tags: rare markup-fence
listParent: block
```

````markdown
```js
```┃
- keep

q
````

> deleteContentBackward

````markdown
- ┃keep

q
````

## Regression223

Tab on a table with text of a cell selected: the table is an item's text, and the selection stays on
that text. It went to the paragraph after the table: the ends of a selection in a block of lines were
mapped by where they were, which the table, written again, no longer is.

```yaml
tags: rare
flavor: gfm
```

```markdown
| «Al»pha | Bravo |
| --- | --- |

After words
```

> indent

```markdown
- | «Al»pha | Bravo |
  | --- | --- |

After words
```

## Regression224

Shift-Tab on the paragraph of a quote that is an item's first block, text of it selected: the
paragraph is the item's text, and the selection stays on it. It was a caret at its start.

```yaml
tags: rare
quotes: container
```

```markdown
- > a«bc»d
```

> outdent

```markdown
- a«bc»d
```

## Regression225

Where markup is decorated, Escape over an empty code block whose code is a blank line puts the caret
on that line, where typing is code. It went to the opening fence's end, markup, where typing went
into its info string.

```yaml
tags: rare markup-fence
markup: decorated
```

````markdown
«```

```»
````

> selectNode

````markdown
```
┃
```
````

## Regression226

Enter at the end of a task in a quote read as an atom: the new quoted item is a task too, unchecked,
as a task's new item is (`enterTask: continue`); on an empty task, the line leaves the list. The
checkbox wasn't read as part of the marker. Obsidian and SilverBullet do the same.

```yaml
tags: rare markup-task
quotes: atom
```

```markdown
> - [x] task┃
```

> enter

```markdown
> - [x] task
> - [ ] ┃
```

> enter

```markdown
> - [x] task
> ┃
```

## Regression227

Enter on an empty nested item of a quoted list (`quotes: atom`): it becomes its parent's sibling, as
in Obsidian and SilverBullet; it left the list. (After a sibling: right under `parent`, `>   -` is
the setext underline making `parent` a heading, as the document reads it, no item.)

```yaml
tags: rare
quotes: atom
```

```markdown
> - parent
>   - child
>   - ┃
```

> enter

```markdown
> - parent
>   - child
> - ┃
```

## Regression228

Backspace at the start of a two-line quote read as an atom, below an ATX heading: refused, an ATX
title holds one line, as for a two-line paragraph there. The heading was escaped into a paragraph
with the quote's lines.

```yaml
tags: rare
quotes: atom
```

```markdown
# Heading

┃> first
> second
```

> deleteContentBackward

```yaml
result: rejected not-expressible
```

## Regression229

Delete at the end of a quote read as an atom, a heading below it: the heading's marks go first, as
after any text (`headingEditing: text`). The heading joined the quote, its `#` text.

```yaml
tags: rare
quotes: atom
markup: decorated
```

```markdown
> quote┃

# Heading
```

> deleteContentForward

```markdown
> quote┃

Heading
```

## Regression230

Delete at the end of a quote read as an atom, a task below it: the task's text joins, its checkbox
going with its marker (tasks.md rule 4), and an empty task just goes. The checkbox was joined as text.

```yaml
tags: rare
quotes: atom
markup: decorated
```

```markdown
> quote┃

- [ ] task
```

> deleteContentForward

```markdown
> quote┃task
```

## Regression231

A paste at the start of a table: the nodes go as at a text's start, before it (`pasteAtTextStart:
before`, the default), which puts a cut back where it was, or after it (`after`). It was refused, a table's
row holding one line; at a rule, HTML or a footnote's text, the host's, whose text before a rule
made it a setext underline.

```yaml
tags: rare
flavor: gfm
clipboard: |
  first
```

```markdown
┃| a | b |
|---|---|
```

> paste

```markdown
first┃

| a | b |
|---|---|
```

## Regression232

`joinWithChildren: refuse` holds for an item whose text is a quote read as an atom: Backspace at
its start would lift its child to its own level, as a paragraph item's join would, which refuses.
It was joined, the child lifted.

```yaml
tags: rare
quotes: atom
joinWithChildren: refuse
```

```markdown
- parent
  - ┃> quote
    - child
```

> deleteContentBackward

```markdown
- parent
  - ┃> quote
    - child
```

## Regression233

`joinWithChildren: refuse` holds where the text joins an empty task above, its parent: its own
child would be lifted. It was joined, the grandchild lifted.

```yaml
tags: rare
joinWithChildren: refuse
```

```markdown
- [ ] 
  - ┃child
    - grandchild
```

> deleteContentBackward

```markdown
- [ ] 
  - ┃child
    - grandchild
```

## Regression234

`backspaceAtItemStart: logseq`: the number goes first for an item whose text is a quote, as for a
paragraph item. It was joined into the parent.

```yaml
tags: rare
quotes: atom
backspaceAtItemStart: logseq
```

```markdown
- parent
  1. ┃> quote
```

> deleteContentBackward

```markdown
- parent
  - ┃> quote
```

## Regression235

`emptyItemWithChildren: refuse` holds where an empty task goes into a quote above: its child would
take its place. It was removed, the child lifted.

```yaml
tags: rare markup-task
quotes: atom
emptyItemWithChildren: refuse
taskEditing: block
```

```markdown
> quote

- [ ] ┃
  - child
```

> deleteContentBackward

```markdown
> quote

- [ ] ┃
  - child
```

## Regression236

A paste over selected whole nodes puts the caret as `quirkPasteCaret` says: at the first pasted
node's end with `roam`. It was always at the last one's end.

```yaml
tags: rare
quirkPasteCaret: roam
clipboard: |
  - x
  - y
```

```markdown
- «a
- b»
- c
```

> paste

```markdown
- x┃
- y
- c
```

## Regression237

Enter between bold's closing stars, then Backspace, gives the bold back: the backslash the split
gave the new item's `*` (which alone would read as a marker) is ours, and goes where the two texts
join again. It stayed, the bold broken for good. Roam, WorkFlowy, Dynalist and Tine join so.

```yaml
tags: rare
```

```markdown
- **bold*┃*
```

> enter deleteContentBackward

```markdown
- **bold*┃*
```

## Regression238

Backspace inside `$$┃$$` in GFM is one character: the flavor reads no math, so the four are text,
which typing pairs none of. It took three, as an empty pair of ours.

```yaml
tags: rare
flavor: gfm
```

```markdown
p $$┃$$
```

> deleteContentBackward

```markdown
p $┃$$
```

## Regression239

The third backtick in a one-line quote opens a closed block, as everywhere else: the quote holds it.
It was the host's, unclosed, the quote's lines below it code.

```yaml
tags: rare
```

````markdown
> ``┃
````

> "\`"

````markdown
> ```┃
> `̬`̬`̬
````

## Regression240

`<!--` typed alone on a line is a comment, closed, the closer ours; typing `-->` steps over it.
It was typed after it, `<!---->-->`.

```yaml
tags: rare markup-fence
```

```markdown
┃
```

> "<" "!" "-" "-" "-" "-" ">"

```markdown
<!---->┃
```

## Regression241

Expand selection never shrinks what is selected: the blank line selected after `p` is past `p`'s
own range, so the next rung, both paragraphs, is taken. It selected `p` and one line break.

```yaml
tags: rare
```

```markdown
p«

»q
```

> expandSelection

```markdown
p⟦selected⟧

q⟦selected⟧
```

## Regression242

Indent of a paragraph that is a checkbox alone, a list after it apart: an item, the checkbox its
text, the list its children. It was refused, the writer asked for a placeholder `- [x]` needs no
more than `- [x] a` does: with no blank after the box, the line is the item's text.

```yaml
tags: rare
```

```markdown
[x]┃

- a
```

> indent

```markdown
- [x]┃

  - a
```

## Regression243

Enter in a quoted numbered list counts the items after it on, as Obsidian and SilverBullet do. Their
numbers stayed, two items numbered 2.

```yaml
tags: rare
quotes: atom
```

```markdown
> 1. First┃
> 2. Second
> 3. Third
```

> enter

```markdown
> 1. First
> 2. ┃
> 3. Second
> 4. Third
```

## Regression244

Enter at the start of a quote's later line, past its `> `: a quoted blank line above it, the line
staying quoted with the caret. It left the quote, two blank lines before it, a quoted line after
it turned to text.

```yaml
tags: common
```

```markdown
> q
> ┃r
> s
```

> enter

```markdown
> q
>
> ┃r
> s
```

## Regression245

Enter in a quoted item whose text continues on a line short of its column: the continuation goes
with the second half, written at its column there. It failed to write, the line copied as it was
(in the new item's column, its spaces the item's).

```yaml
tags: rare
```

```markdown
> -  lis┃t
>   last
```

> enter

```markdown
> -  lis
> - ┃t
>     last
```

## Regression246

Enter before an indented quote read as an atom, past its indentation: an empty paragraph above it,
as before any quote. It wrote a line of the quote there, refused.

```yaml
tags: rare
quotes: atom
```

```markdown
> More details

 ┃> > A nested quote
```

> enter

```markdown
> More details

┃◌

 > > A nested quote
```

## Regression247

Enter splitting a quoted list's heading item, a paragraph after the quote: the blank line that keeps
the paragraph out of the quote's new last item, as at any indentation. It was refused, the atom's
later line written with its own prefix twice.

```yaml
tags: rare
quotes: atom
```

```markdown
>   * # ┃a
next
```

> enter

```markdown
>   * # 
>   * ┃a

next
```

## Regression248

Shift-Enter in a quote read as an atom, in a nested quote or a list in it: the new line's prefix is
the caret's line's, its markers as spaces, so it is in what that line is in (Obsidian's). It was
`> ` alone, the line out of the nested quote.

```yaml
tags: rare
quotes: atom
```

```markdown
> > a┃
```

> shiftEnter

```markdown
> > a
> > ┃
```

## Regression249

`quirkEnterMidHeading: workflowy` before the rest of a title that starts with a literal `#`: the
text before it a paragraph above, its `#` escaped there. It failed to write, the paragraph read as a
heading.

```yaml
tags: rare
quirkEnterMidHeading: workflowy
```

```markdown
# \# ┃Plan
```

> enter

```markdown
\#␠
# ┃Plan
```

## Regression250

Unwrapping a task whose text goes on in a `- ` line: the paragraph keeps the line, escaped, no
setext underline. It failed to write, the paragraph read as a heading.

```yaml
tags: rare markup-task
taskEditing: unwrap
```

```markdown
- [ ] ┃task
  - 
```

> deleteContentBackward

```markdown
┃task
\̬- 
```

## Regression251

An item moved into a list of another bullet, its text a run of that bullet's character: escaped, so
it stays an item (`- \--`), across a heading too. Across one it failed to write (`- --` a rule); in
the same section it was refused.

```yaml
tags: rare
```

```markdown
- a
# H
+ ┃--
```

> moveSubtreeUp

```markdown
- a
- \̬┃--
# H
```

## Regression252

Indenting a setext heading under a note's first `---` in Obsidian: its new `---` underline would
close front matter, so a blank line goes before the first one. It failed to write, the note read as
front matter.

```yaml
tags: rare
flavor: obsidian
```

```markdown
---
p
H┃
===
```

> indent

```markdown

---
p
H┃
---
```

## Regression253

Backspace in a closing fence longer than its opening one: that run alone shortens, the block as it
was. Both shortened, the opening one to two backticks, refused.

```yaml
tags: rare markup-fence
```

````markdown
```
x
````┃
````

> deleteContentBackward

````markdown
```
x
```┃
````

## Regression254

Unmaking an empty block's opening fence, its list after it (`listParent: block`): the paragraph past
the list stays there. It was pulled ahead of the list into the block's line.

```yaml
tags: rare markup-fence
listParent: block
```

````markdown
`┃``
```
- keep

q
````

> deleteContentBackward

````markdown
┃``
- keep

q
````

## Regression255

Backspace joining a paragraph into a quote read as an atom ending in `^x`, in GFM: no block id
there, `^x` is text, and the paragraph joins at its end. It went in before `^x`.

```yaml
tags: rare
flavor: gfm
quotes: atom
```

```markdown
> a ^x

┃p
```

> deleteContentBackward

```markdown
> a ^x┃p
```

## Regression256

Indent of a paragraph with a loose list of its own into the quote above it: the blank line after
the list is where what follows is, out of the quote, so the next quote stays its own. It was
quoted, the two quotes one, refused.

```yaml
tags: rare
quotes: container
```

```markdown
> q

┃p

- a

  b

> r
```

> indent

```markdown
> q
>
> ┃p
>
> - a
>
>   b

> r
```

## Regression257

Moving an item up past one whose list it would join, at its column, its own text going on in a
line that could start a block (`1.`): its text spelled where it lands, the line its text's. It
was refused, the writer shifting no such line.

```yaml
tags: rare
```

```markdown
- x
1. ┃a
  - a
    1.
```

> moveSubtreeUp

```markdown
1. ┃a
- x
- a
  1.
```

## Regression258

Delete on an empty quote that is an item's text, the host's deletion having left it so: the empty
paragraph goes with the quote and the item it is all of, the caret to the text below. It failed to
write, the item's marker line gone with the quote.

```yaml
tags: rare
quotes: container
```

```markdown
- > qu┃ote

- task
```

> expandSelection deleteSoftLineBackward deleteContentForward

```markdown
- ┃task
```

## Regression259

A one-line paragraph cut as a node, then pasted back where the cut leaves the caret: the clipboard
is whole nodes ourus copied, so it pastes as a node, the paragraph back in its place. It was pasted
as text into the paragraph above (`beforefirst`).

```yaml
tags: common
```

```markdown
before

fi┃rst

after
```

> selectNode cut paste

```markdown
before

first┃

after
```

## Regression260

Enter after a blank in an ATX heading with closing `#`s: the title keeps its closing sequence, the
blank before the caret with the blanks before the `#`s. It was escaped, `\#`, a `#` in the title.

```yaml
tags: rare markup-heading
```

```markdown
# abc ┃title #
```

> enter

```markdown
# abc  #

┃title
```

## Regression261

A plain paste of paragraphs inside a word, the last ending in a block id: the rest of the word goes
before the id, which ends the last paragraph still. It was glued after it, `y ^zzzl`, no block id.

```yaml
tags: rare
flavor: obsidian
clipboard: |-
  x

  y ^zzz
```

```markdown
Fina┃l
```

> pastePlain

```markdown
Finax

y┃l ^zzz
```

## Regression262

Text cut from inside one paragraph into the next, then pasted back where the cut leaves the caret:
ourus copied text, not whole nodes, so it pastes into the text, and the two paragraphs come back.
Read as whole nodes for ending with a line break (Regression259's rule), it was pasted as a
paragraph after `fisecond`.

```yaml
tags: common
```

```markdown
fi«rst

»second
```

> cut paste

```markdown
first

┃second
```

## Regression263

Enter right after an item's leading `[x]` that is no checkbox (no blank after it): the part left
would read as an empty task, so its `[` is escaped, as the split `[a]:` of
[Enter48](enter.md#enter48) is. It was a checkbox, and Backspace back, into an empty task, dropped
it. The escape stays after Backspace, as one before `[` does.

```yaml
tags: rare markup-task
```

```markdown
- [x]┃y z
```

> enter

```markdown
- \̬[x]
- ┃y z
```

> deleteContentBackward

```markdown
- \̬[x]┃y z
```

## Regression264

A code item indented whose blank line holds a space of its code (past the item's two columns): the
line is shifted with the code's other lines, the space still the code's. Copied as it was, under the
deeper prefix, the space was the indentation's, and the code lost it.

```yaml
tags: rare markup-fence
```

````markdown
- a
- ```j┃s
␠␠␠
  ```
````

> indent

````markdown
- a
  - ```j┃s
␠␠␠␠␠
    ```
````

> outdent

````markdown
- a
- ```j┃s
␠␠␠
  ```
````

## Regression265

An item whose marker shares its line with its quote (`9. > q`), moved across 9/10: its marker
renumbered wider, that line and its later ones are as many columns wider, the line copied with the
new marker over the old one, as a renumbered item's is where nothing moves. Back up, narrower
again. Refused before (the marker's line, which goes).

```yaml
tags: rare
quotes: container
```

```markdown
9. > ┃q
   > r
10. b
```

> moveSubtreeDown

```markdown
9. b
10. > ┃q
    > r
```

> moveSubtreeUp

```markdown
9. > ┃q
   > r
10. b
```

## Regression266

A paragraph lazy after an item's reference definition (`[a]:u`, its line not indented), its text
rewritten: written at the item's content column, without the space the lazy line started with, so
it starts where its content does and stays the node it was. Kept, past the prefix, the space put
its start one column further in than the paragraph read back, a new node: Enter, Shift-Enter, a
paste, removing its block id were refused.

```yaml
tags: rare
```

```markdown
- [a]:u
 x┃ y
```

> enter

```markdown
- [a]:u
  x

  ┃y
```

> deleteContentBackward

```markdown
- [a]:u
  x┃y
```

## Regression267

Shift-Enter at the start of a padded item's text (`-  a`) with a loose paragraph under it: the text
goes below the marker, at one column past it, so the item's content column narrows by the padding.
The paragraph's line, copied as it was, now starts its content that much sooner; it is named there,
and stays the node it was (refused before, the paragraph read back as a new one).

```yaml
tags: rare
```

```markdown
-  ┃a

     b
```

> shiftEnter

```markdown
-
  ┃a

     b
```

> deleteContentBackward

```markdown
- ┃a

     b
```

## Regression268

A padded item's text deleted to its marker (`-  a`, deleteSoftLineBackward), a loose paragraph under
it: the item is written `- `, its content column one past the marker, narrower by the padding. The
paragraph's line, copied as it was, is named where its content starts now, and stays the node it
was (refused before, as [Regression267](#regression267)'s Shift-Enter was).

```yaml
tags: rare
```

```markdown
-  a┃

     b
```

> deleteSoftLineBackward

```markdown
- ┃◌

     b
```

> "c"

```markdown
- c┃

     b
```

## Regression269

Shift-Down shrinking an upward selection in a zoom, to the last node there: it reads as that node, whose
end is the zoom's, before the line break after it. It threw.

```yaml
tags: rare
```

```markdown
# h①⟦zoomed⟧

┃a⟦selected⟧

b⟦selected⟧
```

> selectNodeDown

```markdown
# h①⟦zoomed⟧

a

b⟦selected⟧
```

## Regression270

Selecting a folded last child in a zoom takes its hidden lines to the zoom's end, as a fold ending the
document does: they were left out, which is no selection of the node.

```yaml
tags: rare
```

```markdown
- p①⟦zoomed⟧
  - a┃⟦folded⟧
    - c
- q
```

> selectNode

```markdown
- p①⟦zoomed⟧
  - a⟦folded⟧⟦selected⟧
    - c
- q
```

## Regression271

Paste on the blank line after a folded item holding a quote: after its subtree, the fold kept, as after
any folded item. Its quote is its text, so it isn't an empty item to fill: that threw.

```yaml
tags: rare
quotes: container
clipboard:
  text/plain: |
    x
  text/markdown: |
    x
  text/html: '<!-- ourus --><p>x</p>'
```

```markdown
- > a⟦folded⟧
  > b
┃
c
```

> paste

```markdown
- > a⟦folded⟧
  > b
- x┃

c
```

## Regression272

A plain paste of paragraphs ending in a line break, at the end of a text a block id ends: that line goes,
as where no block id ends it, and the id stays on the first paragraph's line. It was left on a line of
its own, the caret past the text's end where no line break ended the note.

```yaml
tags: rare
flavor: obsidian
clipboard: |
  a

  b
```

```markdown
Final line┃ ^blk
```

> pastePlain

```markdown
Final linea ^blk

b┃
```

## Regression273

A bracket `autoClose` lists, typed on a blank line, where no text is yet: with its closer, as in a text.

```yaml
tags: rare
autoClose: ['(']
```

```markdown
a

┃

b
```

> "("

```markdown
a

(┃)̬

b
```

## Regression274

`$` paired at an item's start: `$$` alone would open a math block, so a backslash of ours keeps it text.
With something in it the pair is inline math, and the backslash goes. It stayed, so the math never was.

```yaml
tags: rare
flavor: obsidian
autoClose: ['$']
```

```markdown
- ┃
```

> "$"

```markdown
- \̬$┃$̬
```

> "x"

```markdown
- $x┃$̬
```

> "$"

```markdown
- $x$┃
```

## Regression275

Tab over part of a quote from its line's start: the selection stays on the quote, its start at the
line's start. That end, on the `>`, went through the rewritten line and landed on the paragraph below.

```yaml
tags: rare
```

```markdown
«> on»e

q
```

> indent

```markdown
«- > on»e

q
```

## Regression276

Duplicate over part of an item from its line's start: the copy selected the same way, its marker too.

```yaml
tags: rare
```

```markdown
«- on»e
- two
```

> duplicateSubtree

```markdown
- one
«- on»e
- two
```

## Regression277

Enter after a heading right above a table, the caret then gone: the blank line stays, a separator the
author made, where nothing set the two apart. It went with the empty paragraph as it settled.

```yaml
tags: common
flavor: gfm
```

```markdown
## h┃
| a |
| --- |
```

> enter cursorDocEnd

```markdown
## h

| a |
| --- |
```

## Regression277b

The same with Shift-Enter, above a paragraph.

```yaml
tags: common
```

```markdown
# h┃
p
```

> shiftEnter cursorDocEnd

```markdown
# h

p
```

## Regression277c

At a section's end, the next heading of the same level after it: the blank line stays there too. The
empty paragraph had no sibling after it, which made it seem the last thing in the document.

```yaml
tags: common
```

```markdown
# a┃
# b
```

> enter cursorDocEnd

```markdown
# a

# b
```

## Regression278

Where a blank line sets the two apart already, an empty paragraph left there adds none: blank lines
don't pile up.

```yaml
tags: common
```

```markdown
# h┃

p
```

> enter cursorDocEnd

```markdown
# h

p
```

## Regression279

Enter in a quote read as an atom (`quotes: atom`) continues what the caret's line is in as the
document reads it, not as one regex over the line guessed it: in a nested quote's item, the next
item of that quote's list, both `>`s kept; it was a line of the outer quote (B198).

```yaml
tags: rare
quotes: atom
```

```markdown
> > - a┃
```

> enter

```markdown
> > - a
> > - ┃
```

## Regression279b

A nested quote written with no blank between its `>`s (`>>`) continues as it is written (B198).

```yaml
tags: rare
quotes: atom
```

```markdown
>> a┃
```

> enter

```markdown
>> a
>> ┃
```

## Regression280

Enter on a line of code in a quote atom is a line of the code: no list marker, though the line reads
like an item (B198).

```yaml
tags: rare
quotes: atom
```

````markdown
> ```
> - a┃
> ```
````

> enter

````markdown
> ```
> - a
> ┃
> ```
````

## Regression281

Enter on a quoted item's continuation line makes the item's next sibling: the line is the item's
(B198); it was a plain quoted line.

```yaml
tags: rare
quotes: atom
```

```markdown
> 1. a
>    more┃
```

> enter

```markdown
> 1. a
>    more
> 2. ┃
```

## Regression282

A quoted task with Obsidian's status (`[-]`) continues as a task, its new checkbox unchecked (B198):
the outline reads any one character between the brackets as a task's status, in a quote atom as in
any item.

```yaml
tags: rare markup-task
quotes: atom
flavor: obsidian
```

```markdown
> - [-] a┃
```

> enter

```markdown
> - [-] a
> - [ ] ┃
```

## Regression283

A quoted list's next number past nine digits is refused, as for any list: such a marker is no list
item (B198); it wrote `1000000000.`.

```yaml
tags: rare
quotes: atom
```

```markdown
> 999999999. a┃
```

> enter

```markdown
> 999999999. a┃
```

```yaml
result: rejected not-expressible
```

## Regression284

`orderedLists: shift` holds in a quote atom as in any list: the new item numbered on from the one above
it, an item that counted on from that one counting on still (B199; it renumbered whatever followed,
not by the option).

```yaml
tags: rare
quotes: atom
orderedLists: shift
```

```markdown
> 2. a┃
> 3. b
> 3. c
```

> enter

```markdown
> 2. a
> 3. ┃
> 4. b
> 3. c
```

## Regression285

The list renumbered is the caret's: a list after a paragraph in the quote is another list, its
numbers as they were (B199).

```yaml
tags: rare
quotes: atom
```

```markdown
> 1. a┃
> 2. b
>
> q
>
> 3. c
```

> enter

```markdown
> 1. a
> 2. ┃
> 3. b
>
> q
>
> 3. c
```

## Regression286

A quoted number that widens (`9.` to `10.`) moves its item's other lines right as far, so a child
stays its child (B199; it left the list, a line of code under the new marker's column).

```yaml
tags: rare
quotes: atom
```

```markdown
> 8. a┃
> 9. parent
>    - child
```

> enter

```markdown
> 8. a
> 9. ┃
> 10. parent
>     - child
```

## Regression286b

Renumbered from the list's first, as any list under `orderedLists: renumber`: a number written out of
order before the caret's item is renumbered too, its marker narrower and its other lines moved left
as far.

```yaml
tags: rare
quotes: atom
```

```markdown
> 1. a
> 10. b┃
>     c
```

> enter

```markdown
> 1. a
> 2. b
> 3. ┃
>    c
```

## Regression287

An empty nested item in a quote atom becomes its parent's next item, and the items after the parent
in its list are numbered on (B199; two items `2.`).

```yaml
tags: rare
quotes: atom
```

```markdown
> 1. p
>    - a
>    - ┃
> 2. q
```

> enter

```markdown
> 1. p
>    - a
> 2. ┃
> 3. q
```

## Regression288

A marker right under an item's text is its setext underline, as the document reads it, no empty
item: Enter there is on the item's last line, its next sibling after it, the heading as written.

```yaml
tags: rare
quotes: atom
```

```markdown
> - parent
>   -┃
```

> enter

```markdown
> - parent
>   -
> - ┃
```

## Regression289

Splitting a quote atom (`enterInQuote: split`) takes the spaces at the caret as `enterSplitSpace`
says, as a text's Enter does: under `drop`, the default, those before the caret end the first half,
so Backspace joining the halves gives them back (B200; they went).

```yaml
tags: rare
quotes: atom
enterInQuote: split
```

```markdown
> a ┃b
```

> enter

```markdown
> a␠

┃b
```

## Regression289b

Under `enterSplitSpace: trim` the spaces before the caret go too (B200).

```yaml
tags: rare
quotes: atom
enterInQuote: split
enterSplitSpace: trim
```

```markdown
> a ┃b
```

> enter

```markdown
> a

┃b
```

## Regression289c

Under `enterSplitSpace: start` the spaces after the caret start the second half, its padding, the
caret before them (B200).

```yaml
tags: rare
quotes: atom
enterInQuote: split
enterSplitSpace: start
```

```markdown
> a┃ b
```

> enter

```markdown
> a

┃ b
```

## Regression290

A line break pasted in the spaces an atom quote is indented by is at the quote's start, refused as
there (PastePlain27): before its `>`; it split the indentation, a second `>` written (B201).

```yaml
tags: rare
quotes: atom
clipboard: |+

```

```markdown
 ┃ > a
```

> pastePlain

```markdown
 ┃ > a
```

```yaml
result: rejected not-expressible
```

## Regression291

A table pasted into an empty item that a blank line ends, its next item indented two columns: under
an item with text those columns make that item its child, so the next item is lined up with the
filled one, the next item of the list still, as the outliners keep it (B193). The table, an atom,
didn't count as giving the item text once: the draft kept the next item's line as written, and the
text written read otherwise (write-failed; found by the differential run).

```yaml
tags: rare
flavor: gfm
clipboard: |
  | a |
  | - |
  | 1 |
```

```markdown
- ┃

  - c
```

> paste

```markdown
- | a |
  | - |
  | 1 |┃

- c
```

## Regression292

Enter zoomed into an empty item that a blank line ends, its next item indented two columns: the
new first child gives the item a content column, which takes that item in; lining that item up, as
Regression291 does, writes a line outside the zoom, so Enter is refused. The seam check asked only
whether an empty item gained text, not a child, and the text written read otherwise (write-failed;
found by the view's exhaustive pass on Regression291's start).

```yaml
tags: rare
```

```markdown
- ┃⟦zoomed⟧

  - c
```

> enter

```yaml
result: rejected outside-zoom
```

## Regression293

Backspace at a fence's start after HTML that a blank line ends: taking the blank line out, the
fence would be a line of the HTML (an HTML block of `<div>`'s kind runs on to a blank line), so it is
refused. Asked of the parser (`MdTree.takesIn`), where the command read its own text before; an HTML
block its end condition closed (a comment) takes in nothing, and the fence joins it.

```yaml
tags: rare
```

````markdown
<div>

┃```
code
```
````

> deleteContentBackward

```yaml
result: rejected not-expressible
```

## Regression293b

```yaml
tags: rare
```

````markdown
<!-- c
-->

┃```
code
```
````

> deleteContentBackward

````markdown
<!-- c
-->
┃```
code
```
````

## Regression294

Enter at a heading's start right after a quote in an indented item: an empty paragraph between
them, set off from both by blank lines; typed on, a paragraph (B365: the seam check read the
quote's blank line as a `>` at column 0, which ends the item).

```yaml
tags: rare
```

```markdown
  - > a
    >
    > x
┃# h
```

> enter "y"

```markdown
  - > a
    >
    > x

y┃

# h
```

## Regression295

Deleting the paragraph between an item's quote and a quote two columns in at the root, which would
then be the item's: the quote, which the command doesn't touch, kept a block of its own, written at
the root's column, as the outliners keep it (B193); the caret at the end of the text above, past the
empty item's bare `-`, whose end is its markup. The seam check read the blank quoted line in the
item's quote as a `>` at column 0 (B350), and the edit failed to write.

```yaml
tags: rare
```

```markdown
- a
  > q
  >
  > -
x┃
  > l
```

> deleteSubtree

```markdown
- a
  > q┃
  >
  > -
> l
```

## Regression296

Backspace joining a paragraph into an empty item, an indented paragraph at the root after it: that
paragraph, which the command doesn't touch, would be the item's, so it is kept a block of its own,
written at the root's column, a blank line raised before it, as the outliners keep it (B193: the
seam check read the empty item as its marker with the text right after it, `-x`, no item).

```yaml
tags: rare
```

```markdown
-
┃x

  a
```

> deleteContentBackward

```markdown
- ┃x

a
```

## Regression297

Backspace joining a paragraph into an empty item, indented code at the root after it: no blank line
keeps indented code out of an item above it, so it is kept a block of its own as fenced code (B328).

```yaml
tags: rare markup-fence
```

```markdown
-
┃x

    c
```

> deleteContentBackward

````markdown
- ┃x
```
c
```
````

## Regression298

Backspace joining a paragraph into an empty numbered item, a quote padded to its content column at
the root after it: the quote, which the command doesn't touch, kept a block of its own at the root's
column, as the outliners keep it (B352).

```yaml
tags: rare
```

```markdown
2.
┃x
   > more
```

> deleteContentBackward

```markdown
2. ┃x
> more
```

## Regression299

A paragraph moved up above a loose numbered list, an item of its own after it padded to the list's
content column (`listParent: container`): that item, which the move doesn't touch, would be the
list's last item's child, so it is written at the root's column, an item of its own still, as the
outliners keep it (B54, P2: refused before, and before that a write failure).

```yaml
tags: rare
listParent: container
```

```markdown
1. First

   Another paragraph

┃Second

   - A child
```

> moveSubtreeUp

```markdown
┃Second

1. First

   Another paragraph

- A child
```

## Regression300

Enter at a fence's start, right after an item's fence that nothing closes: no blank line can be
between them, every line there being the open code's, so the new line is an empty line of that code,
as a text editor writes the line break (B205: the draft asked for a blank line, and failed to write).

```yaml
tags: rare markup-fence
```

````markdown
- ```
┃```
````

> enter

````markdown
- ```

┃```
````

## Regression301

The text of the third of three items sharing a marker line cleared: the line would be `- - - `,
a thematic break, so the nested empty items are written each on a line of its own, as the outliners
show them (B209: the draft's three items read back as a rule).

```yaml
tags: rare
```

```markdown
- - - a┃
```

> deleteSoftLineBackward

```markdown
-␠
  -␠
    - ┃
```

## Regression302

The inner item of an indented shared marker line deleted, its child led by a tab, the block's items
indented with spaces and with a tab: the block, which the command changes, is written anew in normal
form, at the root's column, in spaces (B348: the writer couldn't write a marker over a tab, nor carry
both spellings through a move).

```yaml
tags: rare
```

```markdown
  - - ┃
→- x
```

> deleteSubtree

```markdown
- - ┃x
```

## Regression303

A quoted paragraph with no space after its `>` moved up, onto the item's marker line its quote
shares: its line written with a space after the `>`, the edited block re-spelled where the marker
can't be written over it as it is (B349).

```yaml
tags: rare
```

```markdown
- > a
  >
  >x┃ t
```

> moveSubtreeUp

```markdown
- > x┃ t
  >
  > a
```

## Regression304

The third shared marker's text cleared under a paragraph that owns the list: the nested empty items,
each on a line of its own (B209), set off from the paragraph by a blank line, ours: a bare marker's
line right under it would be its setext underline, the paragraph a heading.

```yaml
tags: rare
```

```markdown
p
- - - a┃
```

> deleteSoftLineBackward

```markdown
p

-␠
  -␠
    - ┃
```

## Regression305

In Obsidian, a paste ending in `---` after the `---` the note opens with (`pasteAtTextStart:
after`): the two would open front matter, so a blank line goes before the first, as where a rule
comes first (DeleteSubtree9; B387).

```yaml
tags: rare
flavor: obsidian
pasteAtTextStart: after
clipboard: |
  a

  ---
```

```markdown
┃---
```

> paste

```markdown

---

a

---┃
```

## Regression306

Enter on an empty item padded past its marker, the item after it two columns in, its sibling: the
empty item is written `- `, its padding gone, narrower, so the item after it is lined up with it, a
sibling still, not the new item's child (B378).

```yaml
tags: rare
```

```markdown
-  ◌┃
  - item
```

> enter "x"

```markdown
-␠
- x┃
- item
```

## Regression307

A quote's paragraph on an item's marker line moved down past the quote's heading: into the heading's
section, the heading first in the quote now, on the marker line, the paragraph after it in the quote
(B53, P2, and B360: the paragraph's line, the marker's, was copied as it was, a second item).

```yaml
tags: rare
```

```markdown
- > a┃
  > # b
```

> moveSubtreeDown

```markdown
- > # b
  > a┃
```

## Regression308

A line joined into an empty numbered item padded past its marker, a quote after the line padded to
that padding's column: the item, given text, is written past its marker and a space, its content
column narrower, so the quote, which the command doesn't touch, would be the item's: kept a block of
its own, at the root's column (B390: the seam check read the item with the padding it had).

```yaml
tags: rare
```

```markdown
2.␠␠
┃ x
   > more
```

> deleteContentBackward

```markdown
2. ┃x
> more
```

## Regression309

Shift-Tab on a top-level item after an item whose last child, after a quote, is a tab-led empty item
with a paragraph: the paragraph it becomes would be that paragraph's lazy line, so a blank line goes
between them (B386: the seam check read the item's lines without the quote, its empty item's line a
setext underline under `a`).

```yaml
tags: rare
```

```markdown
- a
  > q
→-
→  b
- ┃c
```

> outdent

```markdown
- a
  > q
→-
→  b

┃c
```

## Regression310

A quote's items written `>-`, no space after the `>`, one moved up: the quote, which the command
changes, written in normal form, a space after each `>`, rather than the move's `> ` reconciled with
the line's `>` (B349, B289; decided 2026-11-11, as Quote3).

```yaml
tags: rare
```

```markdown
> a
>- b
>- c┃
```

> moveSubtreeUp

```markdown
> a
> - c┃
> - b
```


## Regression311

A tab-led child moved down onto the next item, whose first block is a callout: written on the item's
marker line, the child's marker where it is written (B392).

```yaml
tags: rare
flavor: obsidian
```

```markdown
- a
→- b┃
- > [!note] c
```

> moveSubtreeDown

```markdown
- a
- - b┃
  > [!note] c
```

## Regression312

Backspace at the start of an item's quote, the quote's next line `>-` with no space after its `>`:
the quote's first paragraph unquoted, the quote's new first line spelled with its space (B393, B349's
shape under a shift).

```yaml
tags: rare
```

```markdown
- > ┃a
  >- b
```

> deleteContentBackward

```markdown
- ┃a
  > - b
```

## Regression313

Backspace at the start of a numbered item's quote, the item padded past its marker and a second quote
below it: the first quote's paragraph the item's text, the second quote kept where it is, its line
indented a column past the item's narrower content now (B394).

```yaml
tags: rare
quotes: container
```

```markdown
2.  > ┃q

    > r
```

> deleteContentBackward

```markdown
2. ┃q
    > r
```

## Regression314

A list pasted at the end of a paragraph, a padded heading after it: the heading kept apart, out of the
new item, its padding gone, as the outliners keep it (B395, B193).

```yaml
tags: rare
listParent: container
clipboard: |
  - a
```

```markdown
x┃
  ## N
```

> paste

```markdown
x
- a┃
## N
```

## Regression315

Enter in a quote's list, the quote padded three spaces before its first line's `>` and none before
the next: the quote, which the command changes, written anew in normal form, its `>`s at its column
(B396; an edited block is normalized, decided 2026-11-10).

```yaml
tags: rare
```

```markdown
   > mor
> - ┃e
```

> enter

```markdown
> mor
>
> - ┃
> - e
```

> "x"

```markdown
> mor
>
> - x┃
> - e
```

## Regression316

Enter before the text of the third of three items sharing a marker line padded past its first
marker, an item of the list after it: each item written on a line of its own (B209), and the item
after them, which the first item's content column, now its marker's and a space, would take in,
written at the list's column (B388).

```yaml
tags: rare
```

```markdown
-   - - ┃outline
  - [ ] draft
```

> enter

```markdown
- 
    - 
      - ┃
      - outline
- [ ] draft
```

## Regression317

Alt-Up on an empty item under a textless one, moving them above the item that shared its parent's
marker line: the three markers, which would read as a rule on one line, each on a line of its own,
under the task's checkbox with no blank line, which would end its item (B388). In CommonMark, which
reads no task, `[ ]` is a paragraph a bare `-` under it would underline: a blank line between them.

```yaml
tags: rare
flavor: gfm
```

```markdown
- [ ] 
  - - x
    - - ┃
    - [ ] review
```

> moveSubtreeUp

```markdown
- [ ] 
  - 
    - 
      - ┃
    - x
    - [ ] review
```

## Regression318

A section's last node moved down to the document's end, into the next section, and back: the
paragraph it comes back after keeps the blank line it had. The node's gap at the document's end is
none between blocks; the old end takes the one before it there, the heading's (B183).

```yaml
tags: common
```

```markdown
## B

para

- ┃item

## C
```

> moveSubtreeDown

```markdown
## B

para

## C

- ┃item
```

> moveSubtreeUp

```markdown
## B

para

- ┃item

## C
```

## Regression319

Enter before the third marker of a padded shared marker line whose last item holds a quote, the
root's quote after it two spaces in: the quote, which the first item's content column, now its marker's and a space,
would take in, written at the root's column (B388).

```yaml
tags: rare
```

```markdown
-  - ┃- > quoted in item
  > over two lines
```

> enter

```markdown
- 
   - 
     - ┃
     - > quoted in item
> over two lines
```

## Regression320

The same with the split items' last a sibling read as it was, not the split one: what follows the
first item's subtree is checked too, its content column narrowed (B388).

```yaml
tags: rare
```

```markdown
-   - - ┃outline
    - outline
  - [ ] draft
```

> enter

```markdown
- 
    - 
      - ┃
      - outline
    - outline
- [ ] draft
```

## Regression321

An item's quote ending in an empty quoted line pasted into an empty note: the note's old end was its
root, no node before the paste to give the paste's blank lines to (B380). The empty quoted line is
the item's blank line after it.

```yaml
tags: rare
clipboard: |
  - > a
    > 
```

```markdown
┃
```

> paste

```markdown
- > a┃

```

## Regression322

In Obsidian, a paste into an empty note that starts and ends with a `---` rule: written as it is, the
two would open and close front matter, the paste in it. A blank line goes before the first, as where
a rule the draft moves first has another below it (DeleteSubtree9).

```yaml
tags: rare
flavor: obsidian
clipboard: |
  ---

  text

  ---
```

```markdown
┃
```

> paste

```markdown

---

text

---┃
```

## Regression323

Shift-Tab on the child sharing a padded item's marker line, the parent's next item two spaces in:
the child moved out to the root after its parent, which would take the next item in at its content
column, two now, as the moved one does. The next item lifted to the list's column, the moved one
lined up with it where it is lifted to (found by the volume run, seed 101).

```yaml
tags: rare
```

```markdown
- ┃  - child two
  - child three
```

> outdent

```markdown
- 
- ┃child two
- child three
```

## Regression324

Backspace at the start of the child sharing a padded item's marker line, the parent's next item two
spaces in: the child's text joined into the parent, which had none, its content column its marker's
and a space now. The next item, which it would take in, lifted to the list's column.

```yaml
tags: rare
```

```markdown
-   - ┃child two
  - child three
```

> deleteContentBackward

```markdown
- ┃child two
- child three
```

## Regression325

Delete subtree on the first of two numbered items, the second an empty quote's held line at the
note's end, with no line ending after it: the held line kept where it is written, at the end, the
item renumbered (found by the volume run, seed 101).

```yaml
tags: rare
```

```markdown
2. ┃
3. > ◌
```

> deleteSubtree

```markdown
2. > ┃◌
```

## Regression326

Tab on an empty item after a padded empty one, a blank line between them, a quote two spaces in
after it: the item under the empty one with no blank line between, which would end it, and the
quote, which the item above, open now, would take in at its content column, lifted to the root's.
The seam check read the empty item's blank line the writer doesn't write (found by the volume run,
seed 101).

```yaml
tags: rare
```

```markdown
-  

- ┃

  > quoted in item
```

> indent

```markdown
-  
  - ┃

> quoted in item
```

## Regression327

Enter in a numbered item before an empty quoted one held at the note's end, with no line ending
after it: the items renumbered, the held quote's item keeping its held line (B358).

```yaml
tags: rare
```

```markdown
1. n┃um
2. > ◌
```

> enter

```markdown
1. n
2. ┃um
3. > ◌
```

## Regression328

Delete subtree on a padded item sharing its marker line with an empty one: the item after it,
which would be the first item's child at its column, lined up with it, and its lazy line, indented
past the column its content starts at now, written past that column, its text as it was (B382).

```yaml
tags: rare
```

```markdown
- [ ] write spec
-  - ┃
  -  itle
    body text
```

> deleteSubtree

```markdown
- [ ] write spec┃
-  itle
       body text
```

## Regression329

Duplicating a padded item before two others of its list two spaces in: the list lined up at its
column, the last item's lazy line, `- grandchild`, written past its content column, its text as it
was, not a list (B162).

```yaml
tags: rare
```

```markdown
-  ┃parent
  - chil
  -  child
    - grandchild
```

> duplicateSubtree

```markdown
-  parent
-  ┃parent
- chil
-  child
       - grandchild
```

## Regression330

Cmd-Backspace on a held space at the start of an item led by four spaces past its marker, after an
empty item: its text joined into the empty item, the spaces not its padding, which would put its content column
past the child it takes in (B381).

```yaml
tags: rare
```

```markdown
- parent
  - child one
  - 
- ┃◌   second paragraph of child two
  - child three
```

> deleteSoftLineBackward

```markdown
- parent
  - child one
  - ┃second paragraph of child two
    - child three
```

## Regression331

With `listParent: container`, Tab on a paragraph after an item, a list after it whose item's text
goes on four columns past its content: the paragraph and the list joined to the list above, the
continuation line `- grandchild` shifted with its item, four columns in still, no list (B383).

```yaml
tags: rare
listParent: container
```

```markdown
- parent

x┃
  - \- hild one
        - grandchild
```

> indent

```markdown
- parent
- x┃
- \- hild one
      - grandchild
```

## Regression332

Backspace on the blank line after an item's footnote definition, its second line lazy: the item
written again, the definition's later line four columns past the item's, as a definition reads its
lines, not past its label (B298).

```yaml
tags: rare
flavor: gfm
```

```markdown
- [^a]: first
  second
  ┃␄
```

> deleteContentBackward

```markdown
- [^a]: first
      second┃␄
```

## Regression333

Alt-Down on a padded footnote definition with a lazy later line, past a paragraph that owns a quoted
list: the definition written at the root's column, its later line four columns in, as a definition
reads them (B164).

```yaml
tags: rare
flavor: gfm
```

```markdown
 [^1]: a
 ┃footnote

| a |
- > q
```

> moveSubtreeDown

```markdown
| a |
- > q

[^1]: a
    ┃footnote
```

## Regression334

With `quotes: container`, Enter on an empty item padded past its marker, held, right after a quote's
`>` with no space (`>-`): the item leaves its list, an empty paragraph in the quote, held. Its line
is the quote's as written, `- >`, and the paragraph is named there, not past a space it doesn't have
(B355).

```yaml
tags: rare
flavor: commonmark
quotes: container
```

```markdown
- >-  ┃◌
```

> enter

```markdown
- >┃◌
```

## Regression335

Backspace at the start of a quoted heading's title, its title a callout's spelling, the quote's next line its
paragraph: the heading a paragraph now, which would take that line in as its own, set apart from it by
a blank quoted line ourus raises (B362).

```yaml
tags: rare
flavor: commonmark
```

```markdown
- >#  ┃[!note] Title
  > more
```

> deleteContentBackward

```markdown
- >┃[!note] Title
  >
  > more
```

## Regression336

Typing `$` in an empty heading item padded past its marker, `autoClose` on: the item written again,
its padding gone, `- # $$`, its content column narrower, and the item after it, which it would take in
at its old column, lined up with it (B208).

```yaml
tags: rare
autoClose: ['$']
```

```markdown
-  # ┃
  - other
```

> "$"

```markdown
- # $┃$̬
- other
```

## Regression337

A task item pasted after an item, padded past its marker, its text below its checkbox: its later
line at the column the spaces before the box give, three, as it was in the clipboard (B400).

```yaml
tags: rare
clipboard: |
  -  [ ]
     task
```

```markdown
- item┃
```

> paste

```markdown
- item
-  [ ]
   task┃
```

## Regression338

With `quotes: atom`, Shift-Tab on a nested numbered item whose text is a quote holding a list, the
quote's second line lazy for the list's item: the item out to its parent's list, the quote's lines at
its new content column, the lazy one too, which has the item's own prefix, not at column 0 (B379).

```yaml
tags: rare
quotes: atom
```

```markdown
1. num
   1. > - qu┃ote
      > more
```

> outdent

```markdown
1. num
2. > - qu┃ote
   > more
```

## Regression339

Under `indentUnit: tab`, Shift-Tab on a padded item sharing its marker line with a quote's list: the
list's item out of the quote, under the item still, first on its marker line, which the item's
marker is written over: its indentation in spaces, not a tab the marker can't go over (B389).

```yaml
tags: rare
indentUnit: tab
```

```markdown
- ┃  > - list in quote
```

> outdent

```markdown
-   - ┃list in quote
```

## Regression340

Under `indentUnit: tab`, Shift-Tab on a quote nested in an item's quote, spaces after the outer
`>`: the inner quote out to the item, written at its column with a tab, and named at its `>`, as the
reader names a quote, not at the space after it (B356, B391).

```yaml
tags: rare
indentUnit: tab
```

```markdown
- > a quote
  >   > ┃over two lines
```

> outdent

```markdown
- > a quote

→> ┃over two lines
```

## Regression341

With `quotes: container`, cutting a quote's first paragraph, nested quotes after it on the next line:
the nested quotes first in the quote now, their line its first, named where they are written, each
keeping its node (B37).

```yaml
tags: rare
quotes: container
```

```markdown
>→┃$
> > > q
```

> cut

```markdown
> > > ┃q
```

## Regression342

In Obsidian, Shift-Enter over a selection from a callout title's end to the start of the lazy line
after it: refused, as at a caret in the title, a callout's title being a line of its own (B55).

```yaml
tags: rare
flavor: obsidian
```

```markdown
>[!e]T«
»a
```

> shiftEnter

```yaml
result: rejected not-expressible
```

```markdown
>[!e]T«
»a
```

## Regression343

Delete subtree on an empty nested quote, the quote's paragraph past a tab after its `>`, an empty item
above: the quote left holding the paragraph alone, its text now, `> a`, the tab's rest past the `>`
the quote's, not padding before it, which the empty item would take in (B69).

```yaml
tags: rare
```

```markdown
-
>→a
>>┃␄
```

> deleteSubtree

```markdown
-
> a┃␄
```

## Regression344

Tab over a selection from a paragraph through a quote's two paragraphs, at another depth: levelling
them after the first would leave the quote, which has no text of its own, holding nothing. Refused,
as for one root that is all of such a container (B40).

```yaml
tags: rare
```

```markdown
«
a
>a
>>b»
```

> indent

```yaml
result: rejected not-expressible
```

```markdown
«
a
>a
>>b»
```

## Regression345

Tab over a selection from an empty item through the two empty items under the next, the first on its
parent's marker line: levelling them would leave that parent, with no text of its own, holding
nothing, its marker's line gone with them. Refused (B41).

```yaml
tags: rare
```

```markdown
-┃«
- -
  -»
```

> indent

```yaml
result: rejected not-expressible
```

```markdown
-┃«
- -
  -»
```

## Regression346

Cut the paragraph above indented code, then Paste: the caret left at the code's text start, past its
indentation, the paragraph pasted beside the code, not into it, before it as at any text's start
(`pasteAtTextStart: before`), back where it was, as Obsidian and SilverBullet paste a cut line back
(B21).

```yaml
tags: rare
```

```markdown
fi┃rst

    indented code
```

> cut

```markdown
    ┃indented code
```

> paste

```markdown
first┃

    indented code
```

## Regression347

Shift-Tab on a nested item whose held space starts its text, its text a fence's opening then, the
fence's closing line after it: the item out to the root, its held space its padding, its text
escaped, no fence, and the closing line, its child now, at the column that padding gives it (B398).

```yaml
tags: rare
```

````markdown
- item
  - ┃◌ ```js
  ```
````

> outdent

````markdown
- item
-  \̬┃```js
   ```
````

## Regression348

Pasting an item whose text is a heading over a paragraph after another: written, the item kept here
(the note ending with a line break); where the item is fitted as the paragraph it replaces, a heading,
its text one, not a paragraph its `#` would make one (B301, `bugs.ts`'s case).

```yaml
tags: rare
clipboard: |
  - # title
```

```markdown
m

«x»
```

> paste

```markdown
m

- # title┃
```

## Regression349

In Obsidian, Tab on a paragraph starting `-- `, its last line a block id: an item now, whose bullet
and the text's dashes would read as one rule, `- -- `: the text's first dash escaped, ours, as where
the text has no block id (B368).

```yaml
tags: rare
flavor: obsidian
```

```markdown
┃-- 
Final line ^blk
```

> indent

```markdown
- \̬┃-- 
  Final line ^blk
```

## Regression351

In Obsidian, Tab on a footnote whose body starts below a blank line, after an empty quote: in the
quote, the blank line would be `>`, which ends the definition there, its body the quote's then.
Refused (B309).

```yaml
tags: rare
flavor: obsidian
```

```markdown
>
[^n]:

    ┃c
```

> indent

```yaml
result: rejected not-expressible
```

```markdown
>
[^n]:

    ┃c
```

## Regression352

Cut the paragraph above a fence, then Paste: the caret left at the fence's start, before its opening
delimiter, where a paste would break it, the paragraph goes before the fence, as at any text's start
(`pasteAtTextStart: before`), back where it was. It was deferred, the host's (B21).

````yaml
tags: common
````

````markdown
fi┃rst

```
code
```
````

> cut

````markdown
┃```
code
```
````

> paste

````markdown
first┃

```
code
```
````

## Regression353

The same with `pasteAtTextStart: after`: the paragraph goes after the fence, as after indented code
(Regression346's).

````yaml
tags: rare
pasteAtTextStart: after
````

````markdown
fi┃rst

```
code
```
````

> cut

````markdown
┃```
code
```
````

> paste

````markdown
```
code
```

first┃
````

## Regression354

Shift-Tab under `indentUnit: tab` on a callout's held line whose text is a `>` after spaces the
placeholder holds: out of the callout, a paragraph of the item, `\>` (an escape of ours) past the
tab that spells its indentation. It was named past its escape, where the reader names it at the
line's content (B356).

```yaml
tags: rare
flavor: obsidian
indentUnit: tab
```

```markdown
- > [!note] Title
  > ┃◌  >
```

> outdent

```markdown
- > [!note] Title
→\̬┃>
```

## Regression355

Alt-Up on a quote's paragraph padded past its `>`, the quote on a tab-led item's marker line: the
paragraph goes onto the marker's line, its padding kept, the marker written over its prefix,
which spells the same columns with a tab (B385).

```yaml
tags: rare
```

```markdown
- x
→- > a
→  >
→  >  b┃
```

> moveSubtreeUp

```markdown
- x
→- >  b┃
→  >
→  >→a
```

## Regression356

Plain paste into a quote of lines with a blank line, the line after it led by a tab: the quote splits
into two, the second's first line without its leading blanks, as a paragraph's after a blank line at
the root (rule 5). The tab was kept in the text, read as padding (B400).

```yaml
tags: rare
clipboard: |-
  x

  →y
```

```markdown
> a┃b
```

> pastePlain

```markdown
> ax

> y┃b
```

## Regression357

A paste over the `-` after an escape of ours (`\̬-`): the paste goes in, the escape, no longer
needed, goes, and the space after the `-` stays, as every app keeps it. Deleted first, the selection
took the escape and that space with it, and the paste failed (B400).

```yaml
tags: rare
clipboard: "y"
```

```markdown
\̬«-» x
```

> paste

```markdown
y┃ x
```

## Regression358

As Regression107, a blank line between the marker and the fence, its spaces keeping the item open: the lines below the marker go with
it, the fence a block of its own at the note's start. They were written as a blank line before it,
read as no line of the code (B405).

```yaml
tags: rare markup-fence
```

````markdown
-
␠␠
  ┃```
````

> outdent

````markdown
┃```
````

## Regression359

Cut a fence right before a list, then Paste: the caret left at the first item's text start, the
fence goes before that item (`pasteAtTextStart: before`), an item of the list as a paragraph pasted
there is, not back before the list (decided 2026-11-12: RemNote makes it an item, SiYuan the first
item's; no app puts it before the list; B21).

````yaml
tags: rare
````

````markdown
```
co┃de
```

- a
- b
````

> cut

````markdown
- ┃a
- b
````

> paste

````markdown
- ```
  code┃
  ```
- a
- b
````

## Regression360

A paste at a heading's text start: the nodes go before it (`pasteAtTextStart: before`), the last of
the section above, as typed there; a pasted heading takes the heading after it into its section
where its level is higher. It was the host's (not done).

```yaml
tags: common
clipboard: |
  x

  y
```

```markdown
# A

para

## ┃B

b text
```

> paste

```markdown
# A

para

x

y┃

## B

b text
```

## Regression361

With `quotes: atom`, a paste of items at the start of an item whose text is a quote, past its `>`:
before it, as at any text's start. They went after it.

```yaml
tags: rare
quotes: atom
clipboard: |-
  - x
  - y
```

```markdown
- a
- > ┃q
```

> paste

```markdown
- a
- x
- y┃
- > q
```

## Regression362

Backspace right after a space at a later line's start, past its indentation: the space goes, as a
space typed there is taken back; the lines join only from the line's start (ShiftEnter21). They
joined (B204).

```yaml
tags: common
```

```markdown
- a
   ┃b
```

> deleteContentBackward

```markdown
- a
  ┃b
```

## Regression363

Backspace at the start of a rule after a paragraph: refused, as Delete refuses to take a rule in. No
text joins a rule, and the host's join, the blank line gone, would make the rule the paragraph's
setext underline, a heading. It was the host's (B202). A table the same.

```yaml
tags: rare
```

```markdown
p

┃---
```

> deleteContentBackward

```yaml
result: rejected not-expressible
```

```markdown
p

┃---
```

## Regression364

Cut the only paragraph under a heading, then Paste: the caret left at the heading's end, the paragraph
goes first in its section, the blank line after the heading kept between them, as it was. The heading
handed its blank line to the paste and kept none (`## B⏎b text`).

```yaml
tags: common
```

```markdown
## B

b t┃ext

## C
```

> cut

```markdown
## B┃

## C
```

> paste

```markdown
## B

b text┃

## C
```

## Regression365

Alt-Up on an item's quoted heading past the paragraph after it, a table after the item: the
paragraph, last in the item now, is set apart from the table by a blank line, which would else read
as its lazy lines. The seam check read the paragraph at the root's column, past the `>` on the
item's marker line, and saw them apart (found by the volume run, seed 151).

```yaml
tags: rare
flavor: gfm
```

```markdown
2. > quote

   x
   > # mo┃re

| a | b |
|---|---|
```

> moveSubtreeUp

```markdown
2. > quote

   > # mo┃re

   x

| a | b |
|---|---|
```

## Regression366

A paragraph right under a fence, its subtree selected and cut, then Paste: as a cut at a caret there
(DeleteSubtree15), an empty node held where it was, the caret in it, so the paste puts it back after
the code, not into its last line (found by the sweep's cut→paste; B406).

````yaml
tags: rare
````

````markdown
```
code
```

para⟦selected⟧
````

> cut

````markdown
```
code
```

┃◌
````

> paste

````markdown
```
code
```

para┃
````

## Regression367

Alt-Up on a tab-led child under a padded shared marker line, an item of the outer list after it at
two columns: the block written anew in normal form (B348's rule), its content column two, and the
items of its list after it with it, which at their old column would read into it (B410; seed 201).

```yaml
tags: rare
flavor: obsidian
indentUnit: tab
```

```markdown
 -  - child two
→- child ┃two
  - child three
```

> moveSubtreeUp

```markdown
- - child ┃two
  - child two
- child three
```

## Regression368

Enter at the end of a note's last item, the note ending with a blank line: the new item goes after
it, the blank line after the new one, the list still tight. The old item kept the blank line too, so
the list was loose and the blank lines twice as many (`- item⏎⏎- ⏎⏎`; found reading seed 151's marks
cases, B411).

```yaml
tags: common
```

```markdown
- item┃

```

> enter

```markdown
- item
- ┃

```

## Regression369

Tab on the paragraph that owns a list whose item holds a quote atom with a lazy line: the lazy
line's front spaces, short of the item's column, are the atom's text, so they move with the item,
the line still lazy (B297). Shift-Tab back undoes it.

```yaml
tags: rare
quotes: atom
```

```markdown
in┃tro
1. > quote
  continuation
   > more
```

> indent

```markdown
- in┃tro
  1. > quote
    continuation
     > more
```

## Regression370

Backspace at the start of a quote atom's later line held by a space (`◌`, the space a deleted first
character left, which keeps the line in the quote): the line joins the one above, its spaces mid-line
now, no longer held (B237).

```yaml
tags: rare
quotes: atom
```

```markdown
2. > quote
┃◌  > more
```

> deleteContentBackward

```markdown
2. > quote┃  > more
```

## Regression371

Shift-Tab on an item whose quote atom has a later line held by a space: the quote at the root, the
line written as it was, still held, still the quote's (B237).

```yaml
tags: rare
quotes: atom
```

```markdown
2. > quote
 ┃◌ > more
```

> outdent

```markdown
> quote
 ┃◌ > more
```

## Regression372

Alt-Up on a numbered item whose quoted paragraph has a lazy line held by a space: the item renumbered,
its paragraph written anew, the lazy line quoted now, its held space still where its text starts,
after the `> `, still held (B237).

```yaml
tags: rare
quotes: container
```

```markdown
1. num
2. > quote
┃◌  > more
```

> moveSubtreeUp

```markdown
1. > quote
   > ┃◌  \̬> more
2. num
```

## Regression373

Backspace on a quote atom's held empty last line in an item: the line goes, and its placeholder with
it (B237).

```yaml
tags: rare
quotes: atom
```

```markdown
- > quote
┃◌
```

> deleteContentBackward

```markdown
- > quote┃
```

## Regression374

Shift-Tab on an item whose table starts on its marker line after a held space: the table at the
root, the held space gone, as a prose text's goes where it holds nothing (B237).

```yaml
tags: rare
flavor: gfm
```

```markdown
- ┃◌ a | b |
  |---|---|
```

> outdent

```markdown
┃a | b |
|---|---|
```

## Regression375

Alt-Up on a paragraph whose held empty last line ends the note (Shift-Enter's, not yet settled): the
paragraph moves with its empty line, held still, where the paragraph is now (B237).

```yaml
tags: rare
```

```markdown
> a quote

> a quote
┃◌␄
```

> moveSubtreeUp

```markdown
> a quote
┃◌

> a quote
```

## Regression376

A paste over a setext title's first line, its second line padded: the rest of the title starts with
the padding, which Markdown reads as no part of it; written as the title's own (B327, fixed with
B237's setext held space).

```yaml
tags: rare
flavor: obsidian
markup: text
clipboard: |-
  - x
  - y
```

```markdown
«abc»
  def
-
  def
```

> paste

```markdown
- x
- y┃

def
-
  def
```
