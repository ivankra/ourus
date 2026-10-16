
# Quotes and callouts as containers

A quote is an outline container: its blocks are its children, and it has no text of its own, except
a callout, whose title line is its text. Item commands work inside quotes the way they work inside
items, and the quote's `>` is written on every line a command makes in it. A paragraph in a quote
owns no list, as in an item: a list after it is the quote's. The rules quotes add:

1. **Outdent leaves a quote**: with `outdent: direct` (the default) the node stays where it is in
   the text, the quote split around it, what followed it quoted after it (Quote12, Quote72); with
   `logical` it follows the quote, below its other children (Quote12b). At the quote's end the two
   agree (Quote11, Quote14, Quote15, Quote16); a callout keeps its title (Quote13). **Indent enters the quote above**, as its last child (Quote17,
   Quote18, Quote19, Quote65, Quote66); a quoted paragraph after a paragraph becomes an item in
   place (Quote9).
2. **A move of everything in a quote moves the quote** (Quote68), but a callout's title stays: its
   only child moves out of it as out of an item (Quote71); a node moves into and out of
   quotes as into and out of items, and back (Quote20, Quote21, Quote22, Quote23, Quote24, Quote25,
   Quote26). Two quotes that end up adjacent are kept apart by a blank line (Quote21).
3. **Enter makes a node in the quote**, its blank lines quoted (Quote29, Quote30, Quote31, Quote36,
   Quote37, Quote42). On an empty item it leaves the list, then the quote, as at the top level
   (Quote32, Quote33, Quote34, Quote35). In a callout's title (Obsidian flavor) the rest is a
   paragraph of its own, as a heading's is (Quote38, Quote39, Quote40, Quote41); in its `[!type]`,
   Enter is refused (Quote43).
4. **Backspace peels the markup in front of a quote's first node, nearest first**: a callout's
   `[!type]` (Quote57, Quote58); then an item's marker, the item becoming a paragraph in the quote
   (`backspaceAtTopItem: unwrap`, the default; with `refuse`, nothing, Quote55); then the quote's
   `>`, the node leaving the quote, the rest of which stays quoted (Quote53, Quote54, Quote56).
   ([Backspace's rules](backspace.md).)
5. **A callout's title takes joins as a heading does**: its first node joins it by Backspace, the
   node below by Delete (Quote60, Quote61, Quote62).
6. **A join across a quote's edge brings the node into the quote** (Quote51, Quote52); Delete before
   a quote is refused ([Delete10](del.md#delete10)).
7. **A callout's title is one line in the Obsidian flavor**: Shift-Enter there is refused (Quote47).

Bare Obsidian and the text editors edit quotes as text: Tab inserts a tab after the `>`, Shift-Tab
out of a quote does nothing, Backspace and Delete delete a space or a `>`, which moves text between
containers without saying so.

## Quote1

A quote as an item's first block stays the item's child, and the item has no text of its own: only
a paragraph, a heading, a code block or an HTML block can be an item's head.

```yaml
rank: rare
```

```buffer
- > - a
  > - b┃
```

> indent

```buffer
- > - a
  >   - b┃
```

## Indent inside a quote

### Quote2

Item nests after the quote marker.

```yaml
rank: common
```

```buffer
> - a
> - b┃
```

> indent

```buffer
> - a
>   - b┃
```

### Quote3

No space after the quote marker: columns count from where the quote's content starts on each line,
and a space written after `>` belongs to the quote, so the item needs its own.

```yaml
rank: rare
```

```buffer
>- a
>- b┃
```

> indent

```buffer
>- a
>   - b┃
```

### Quote4

Tab-indented items in a quote: the quote's `>` takes part of the tab.

```yaml
rank: rare
```

```buffer
>→- a
>→- b┃
```

> indent

```buffer
>→- a
>→→- b┃
```

### Quote5

Indent in a quote inside an item.

```yaml
rank: edge
```

```buffer
- x
  > - a
  > - b┃
```

> indent

```buffer
- x
  > - a
  >   - b┃
```

### Quote6

Indent in nested quotes.

```yaml
rank: rare
```

```buffer
> > - a
> > - b┃
```

> indent

```buffer
> > - a
> >   - b┃
```

### Quote7

Indent in a callout.

```yaml
rank: edge
```

```buffer
> [!note] Title
> - a
> - b┃
```

> indent

```buffer
> [!note] Title
> - a
>   - b┃
```

### Quote8

A lazy continuation line stays as it is: it still continues the paragraph.

```yaml
rank: edge
```

```buffer
> - a
> - b┃
c
```

> indent

```buffer
> - a
>   - b┃
c
```

### Quote9

A quoted paragraph after a paragraph becomes an item, as outside a quote
([Indent21](indent.md#indent21)): owning no list, the paragraph keeps it as a next sibling.

```yaml
rank: edge
```

```buffer
> a
>
> b┃
```

> indent

```buffer
> a
>
> - b┃
```

## Quote10

Outdent inside a quote.

```yaml
rank: common
```

```buffer
> - a
>   - b┃
```

> outdent

```buffer
> - a
> - b┃
```

## Outdent out of a quote

### Quote11

An item outdented out of a quote becomes the quote's next sibling, as outdenting an item's child
makes it the item's next sibling. Bare Obsidian does nothing.

```yaml
rank: common
```

```buffer
> - a
> - b┃
```

> outdent

```buffer
> - a
- b┃
```

### Quote12

An item leaves the quote where it is (`outdent: direct`, the default), its child with it, and its
later siblings stay quoted after it: the document's order stays, as direct outdent keeps it
everywhere. No app outdents out of a quote; the text editors leave the line as it is.

```yaml
rank: edge
```

```buffer
> - a┃
>   - c
> - b
```

> outdent

```buffer
- a┃
  - c
> - b
```

### Quote12b

With `outdent: logical`, it leaves below its siblings, which stay quoted above it.

```yaml
rank: edge
outdent: logical
```

```buffer
> - a┃
>   - c
> - b
```

> outdent

```buffer
> - b
- a┃
  - c
```

### Quote13

A callout's title is its text, so a callout whose only child leaves stays: only a quote without text
goes when emptied.

```yaml
rank: edge
```

```buffer
> [!note] T
> - a┃
```

> outdent

```buffer
> [!note] T
- a┃
```

### Quote14

A lazy continuation line goes along unchanged.

```yaml
rank: edge
```

```buffer
> - a
> - b┃
c
```

> outdent

```buffer
> - a
- b┃
c
```

### Quote15

Out of a quote inside an item: the item's own child.

```yaml
rank: rare
```

```buffer
- x
  > - a
  > - b┃
```

> outdent

```buffer
- x
  > - a
  - b┃
```

### Quote16

A quote's blank lines lose their `>` with it.

```yaml
rank: edge
```

```buffer
> - a
> - b┃
>
>   c
```

> outdent

```buffer
> - a
- b┃

  c
```

## Indent into a quote

### Quote17

Indent makes the item the last child of the quote above, written in the quote. Bare Obsidian
indents the line, leaving the item outside the quote.

```yaml
rank: edge
```

```buffer
> - a
- b┃
```

> indent

```buffer
> - a
> - b┃
```

### Quote18

Its children and blank lines come along, and the blank line before it joins the quote (a bare one
would end it).

```yaml
rank: edge
```

```buffer
> - a

- b┃
  - c

  d
```

> indent

```buffer
> - a
>
> - b┃
>   - c
>
>   d
```

### Quote19

Indent into a quote, then outdent: back as it was.

```yaml
rank: edge
```

```buffer
> - a
- b┃
```

> indent

```buffer
> - a
> - b┃
```

```result
applied
```

> outdent

```buffer
> - a
- b┃
```

## Moving between quotes

### Quote20

Out of one quote, past another, into it, with `outdent: logical`, where the item leaves below the
quote's other children; outdent copies the separator its new neighbors use.

```yaml
rank: edge
outdent: logical
```

```buffer
> - a┃
> - x

> - b
```

> outdent

```buffer
> - x

- a┃

> - b
```

> moveSubtreeDown

```buffer
> - x

> - b

- a┃
```

> indent

```buffer
> - x

> - b
>
> - a┃
```

### Quote21

Two quotes moved together get a blank line between them: without one they would be one quote.

```yaml
rank: edge
```

```buffer
> - x
- a┃

> - b
```

> moveSubtreeDown

```buffer
> - x

> - b

- a┃
```

### Quote22

At a quote's end an item moves down into the quote's next sibling, as at the end of an item's
children; up from there takes it back into the quote.

```yaml
rank: edge
```

```buffer
> - a
> - b┃

- c
```

> moveSubtreeDown

```buffer
> - a

- c
  - b┃
```

> moveSubtreeUp

```buffer
> - a
> - b┃

- c
```

### Quote23

The mirror: at a quote's start an item moves up into the item above, as its last child, and down
from there goes back into the quote.

```yaml
rank: edge
```

```buffer
- c
> - a┃
> - b
```

> moveSubtreeUp

```buffer
- c
  - a┃
> - b
```

> moveSubtreeDown

```buffer
- c
> - a┃
> - b
```

## Moving inside a quote

### Quote24

Swapping two quoted items.

```yaml
rank: common
```

```buffer
> - a
> - b┃
```

> moveSubtreeUp

```buffer
> - b┃
> - a
```

### Quote25

In a loose list, the quoted blank line stays between the items.

```yaml
rank: edge
```

```buffer
> - a
>
> - b┃
```

> moveSubtreeUp

```buffer
> - b┃
>
> - a
```

### Quote26

A quote moves past an item.

```yaml
rank: edge
```

```buffer
- a
> q┃
```

> moveSubtreeUp

```buffer
> q┃
- a
```

## A quote and a heading don't swap

A heading owns what follows it: a heading doesn't move above a quote, and a quote moved down past a
heading joins its section, as any node does ([MoveDown20](move-subtree-down.md#movedown20)).

### Quote27

A heading doesn't move above a quote: as past a paragraph or an item, it would take the quote into
its section.

```yaml
rank: edge
```

```buffer
> q
# H┃
```

> moveSubtreeUp

```result
rejected: not-expressible
```

```buffer
> q
# H┃
```

### Quote28

A quote moved down past a heading joins its section, as any node does
([MoveDown20](move-subtree-down.md#movedown20)); the caret ends after the `>`.

```yaml
rank: edge
```

```buffer
> ┃q
## S
```

> moveSubtreeDown

```buffer
## S
> ┃q
```

## Enter in a quote

### Quote29

A new item gets the quote marker.

```yaml
rank: common
```

```buffer
> - a┃
```

> enter

```buffer
> - a
> - ┃
```

### Quote30

A new item in a quote inside an item.

```yaml
rank: rare
```

```buffer
- x
  > - a┃
```

> enter

```buffer
- x
  > - a
  > - ┃
```

### Quote31

Enter at the end of a lazy continuation line.

```yaml
rank: edge
```

```buffer
> - a
b┃
```

> enter

```buffer
> - a
b
> - ┃
```

### Quote32

Enter on an empty item in a quote leaves the list, as at the top level: the item becomes an empty
paragraph in the quote, a quoted blank line above it. Enter again leaves the quote. Bare Obsidian
does the same without the quoted blank line, so typed text would continue the item.

```yaml
rank: common
```

```buffer
> Quote:
> - one┃
```

> enter

```buffer
> Quote:
> - one
> - ┃
```

> enter

```buffer
> Quote:
> - one
>
> ┃◌
```

> enter

```buffer
> Quote:
> - one

┃◌
```

> "Back to text."

```buffer
> Quote:
> - one

Back to text.┃
```

### Quote33

In a quote inside an item: the empty paragraph that leaves the quote is the item's.

```yaml
rank: rare
```

```buffer
- x
  > - a┃
```

> enter enter

```buffer
- x
  > - a
  >
  > ┃◌
```

> enter

```buffer
- x
  > - a

  ┃◌
```

### Quote34

A quote holding only the empty paragraph goes, the paragraph in its place.

```yaml
rank: edge
```

```buffer
> - ┃
```

> enter

```buffer
> ┃◌
```

> enter

```buffer
┃◌
```

### Quote35

Enter at a quoted paragraph's end makes a new paragraph in the quote; Enter on it, empty and the
quote's last node, leaves the quote. Bare Obsidian takes the same steps with lines: its Enter
continues the paragraph, which is Shift-Enter's here.

```yaml
rank: common
```

```buffer
> ab┃
```

> enter

```buffer
> ab
>
> ┃◌
```

> enter

```buffer
> ab

┃◌
```

> "c"

```buffer
> ab

c┃
```

### Quote36

Splitting a quoted paragraph: two paragraphs in the quote, the blank line between them quoted. Bare
Obsidian breaks the line instead, which is Shift-Enter's here.

```yaml
rank: common
```

```buffer
> ab┃cd
```

> enter

```buffer
> ab
>
> ┃cd
```

### Quote37

Enter at a quoted paragraph's start: an empty paragraph above it in the quote, held by a
placeholder, the caret in it, as at any paragraph's start ([Enter33](enter.md#enter33)).

```yaml
rank: edge
```

```buffer
> a
>
> ┃b
```

> enter

```buffer
> a
>
> ┃◌
>
> b
```

### Quote38

Splitting a callout title: in the Obsidian flavor the title is a line of its own, as a heading is,
and Enter makes the rest a paragraph of its own, the callout's first, set off from the body by a
quoted blank line. Every text editor, Obsidian included, puts the rest on the body's first line,
where it becomes more of the body's paragraph. Backspace joins it back ([Quote60](#quote60)).

```yaml
rank: common
flavor: obsidian
```

```buffer
> [!note] Ti┃tle
> body
```

> enter

```buffer
> [!note] Ti
> ┃tle
>
> body
```

### Quote39

At the end of a lone title: an empty body line to type into.

```yaml
rank: common
```

```buffer
> [!tip] Title┃
```

> enter

```buffer
> [!tip] Title
> ┃◌
```

> "x"

```buffer
> [!tip] Title
> x┃
```

### Quote40

Enter at the end of a callout title before its body: the new paragraph is empty, held by a
placeholder until typed into, and set off from the body by a quoted blank line, as after a heading.

```yaml
rank: common
flavor: obsidian
```

```buffer
> [!note] Title┃
> body
```

> enter

```buffer
> [!note] Title
> ┃◌
>
> body
```

> "x"

```buffer
> [!note] Title
> x┃
>
> body
```

### Quote41

Splitting a callout title before a list marker: the rest is text, its marker escaped, as in an
item ([Enter8](enter.md#enter8)).

```yaml
rank: edge
```

```buffer
> [!tip] Title┃- x
> - y
```

> enter

```buffer
> [!tip] Title
> ┃\- x
> - y
```

### Quote42

Enter before a list marker in a quoted paragraph: the rest is a new paragraph, its `- x` escaped,
as outside a quote ([Enter22](enter.md#enter22)).

```yaml
rank: edge
```

```buffer
> para ┃- x
> - a
```

> enter

```buffer
> para
>
> ┃\- x
> - a
```

### Quote43

In the Obsidian flavor a callout's title is a line of its own, and a line break in its `[!type]`
would unmake the callout. The `[!type]` is markup, so the edit is the host's (`editInMarkup: host`,
the default), and the callout is a quote of two lines.

```yaml
rank: rare
flavor: obsidian
```

```buffer
> [!ti┃p] Title
```

> enter

```result
notApplicable
```

```buffer
> [!ti
┃p] Title
```

### Quote43b

With `editInMarkup: refuse`, it is refused, and the callout stays.

```yaml
rank: rare
flavor: obsidian
editInMarkup: refuse
```

```buffer
> [!ti┃p] Title
```

> enter

```result
rejected: not-expressible
```

```buffer
> [!ti┃p] Title
```

## Shift-Enter in a quote

### Quote44

Line break in a quoted paragraph.

```yaml
rank: common
```

```buffer
> ab┃cd
```

> shiftEnter

```buffer
> ab
> ┃cd
```

### Quote45

At the end: an empty line in the quote, held open until typed into.

```yaml
rank: edge
```

```buffer
> ab┃
```

> shiftEnter

```buffer
> ab
> ┃◌
```

> "c"

```buffer
> ab
> c┃
```

### Quote46

Line break in a quoted item.

```yaml
rank: edge
```

```buffer
> - ab┃cd
```

> shiftEnter

```buffer
> - ab
>   ┃cd
```

### Quote47

In the Obsidian flavor a callout's title is a single line, as a heading is: Shift-Enter is
refused.

```yaml
rank: edge
flavor: obsidian
```

```buffer
> [!tip] Ti┃tle
> body
```

> shiftEnter

```result
rejected: not-expressible
```

```buffer
> [!tip] Ti┃tle
> body
```

## Joining in a quote

### Quote48

Backspace joins two quoted items.

```yaml
rank: common
```

```buffer
> - a
> - ┃b
```

> deleteContentBackward

```buffer
> - a┃b
```

### Quote49

An item joins the paragraph above it in the quote.

```yaml
rank: edge
```

```buffer
> a
> - ┃b
```

> deleteContentBackward

```buffer
> a┃b
```

### Quote50

Delete at the end of a quoted paragraph joins the item below.

```yaml
rank: edge
```

```buffer
> a┃
> - b
```

> deleteContentForward

```buffer
> a┃b
```

### Quote51

Delete at a quoted paragraph's end before a quoted blank line takes the blank line, its `>` with it,
and the paragraphs are one, as outside a quote ([Delete18](del.md#delete18)). Left to the host, the
blank line's `>` would become text: `> a┃>`.

```yaml
rank: edge
```

```buffer
> a┃
>
> b
```

> deleteContentForward

```buffer
> a┃
> b
```

## Joining across a quote's edge

### Quote52

An item below a quote joins the quoted node above; its children enter the quote with it.

```yaml
rank: edge
```

```buffer
> - a
- ┃b
  - c
```

> deleteContentBackward

```buffer
> - a┃b
>   - c
```

## Backspace at a quote's start

Backspace peels the markup in front of a quote's first node, nearest first (rule 4).

### Quote53

Backspace at the start of a quote's first paragraph takes the `>` off it, and it leaves the quote;
a quote it was all of goes. Bare Obsidian gets there in two presses, the space, then the `>`.

```yaml
rank: common
```

```buffer
- a

> ┃q
```

> deleteContentBackward

```buffer
- a

┃q
```

### Quote54

Backspace at the start of a quote's first item peels the markup in front of its text, nearest first:
the item's marker, making it a paragraph in the quote, `c` staying the quote's; then the `>`, `b`
leaving the quote; then `b` joins the node above.

```yaml
rank: common
```

```buffer
- a
> - ┃b
> - c
```

> deleteContentBackward

```buffer
- a
> ┃b
> - c
```

> deleteContentBackward

```buffer
- a

┃b
> - c
```

> deleteContentBackward

```buffer
- a┃b

> - c
```

### Quote55

With `backspaceAtTopItem: refuse`, a quote's first item stays as it is.

```yaml
rank: edge
backspaceAtTopItem: refuse
```

```buffer
- a
> - ┃b
```

> deleteContentBackward

```result
rejected: nothing-above
```

```buffer
- a
> - ┃b
```

### Quote56

When a quote's first node leaves it, the rest stays quoted, the node standing before the quote.

```yaml
rank: edge
```

```buffer
- a

> ┃q
>
> r
```

> deleteContentBackward

```buffer
- a

┃q

> r
```

### Quote57

Backspace at the start of a callout's title takes its `[!type]` first: the callout is a plain quote,
the title its first paragraph, set off from the body by a quoted blank line (it is a line of its own
in the Obsidian flavor). Bare Obsidian deletes the space, leaving `[!note]Title`, still a callout.

```yaml
rank: edge
flavor: obsidian
```

```buffer
para

> [!note] ┃Title
> body
```

> deleteContentBackward

```buffer
para

> ┃Title
>
> body
```

### Quote58

Where the flavor reads the title as the start of the quote's first paragraph, the paragraph stays
one.

```yaml
rank: rare
flavor: commonmark
```

```buffer
para

> ┃[!note] Title
> body
```

> deleteContentBackward

```buffer
para

> ┃Title
> body
```

### Quote59

Backspace on a quote's only item, empty, with nothing above: it goes, as `- ┃` alone does, and the
quote it was all of goes with it, leaving an empty line to type on.

```yaml
rank: rare
```

```buffer
> - ┃
```

> deleteContentBackward

```buffer
┃
```

## Joining into a callout's title

A callout's title is its text, a line of its own as a heading is: Backspace at the start of the
callout's first node joins it to the title, and Delete at the title's end joins the node below, as
with a heading. The quote's `>` goes with the line break. Left to the host, Backspace would delete
the space and Delete would leave the `>` in the title (`> [!note] Title┃> body`).

### Quote60

Backspace takes a callout title split back ([Quote38](#quote38)); the blank line before the body
stays.

```yaml
rank: common
flavor: obsidian
```

```buffer
> [!note] Ti
> ┃tle
>
> body
```

> deleteContentBackward

```buffer
> [!note] Ti┃tle
>
> body
```

### Quote61

Delete at a callout title's end joins the body's first paragraph.

```yaml
rank: edge
flavor: obsidian
```

```buffer
> [!note] Title┃
> body
```

> deleteContentForward

```buffer
> [!note] Title┃body
```

### Quote62

A callout's first item joins its title, as a first item joins a heading above it.

```yaml
rank: edge
flavor: obsidian
```

```buffer
> [!note] Title
> - ┃a
```

> deleteContentBackward

```buffer
> [!note] Title┃a
```

## Quote63

Pasted items get the quote's `>`. Bare Obsidian pastes the first line onto the item's text and the
rest outside the quote.

```yaml
rank: common
clipboard: |
  - x
    - y
```

```buffer
> - a┃
```

> pasteStructured

```buffer
> - a
> - x
>   - y┃
```

## Quote64

A heading in a quote owns its section there, and the items in it indent as anywhere.

```yaml
rank: edge
```

```buffer
> # H
> - a
> - b┃
```

> indent

```buffer
> # H
> - a
>   - b┃
```

## Indenting a paragraph into a quote

### Quote65

A paragraph indented into a quote becomes its last child, as an item holds lines.

```yaml
rank: edge
```

```buffer
> q

para┃
```

> indent

```buffer
> q
>
> para┃
```

### Quote66

And back out: a blank line goes between the quote and the paragraph, which would otherwise
continue the quote's paragraph lazily.

```yaml
rank: edge
```

```buffer
> q
>
> para┃
```

> outdent

```buffer
> q

para┃
```

## Quote67

A paragraph moves inside a quote without becoming its text.

```yaml
rank: rare
```

```buffer
> >     code
> a┃
```

> moveSubtreeUp

```buffer
> a┃
> >     code
```

## Quote68

The caret is on the quote's only paragraph: the quote is what moves. Bare Obsidian moves the line,
which joins the quote above.

```yaml
rank: edge
```

```buffer
> - x
> - y

> q┃
```

> moveSubtreeUp

```buffer
> q┃

> - x
> - y
```

## Quote71

A callout's only child moves out of it, as an item at a quote's end does
([Quote22](#quote22)): into the next item, as its first child. The callout keeps its title, which
is its text, not a child. Moving the whole callout instead would make the child's move the title's.

```yaml
rank: rare
```

```buffer
> [!note] T
> - a┃

- b
```

> moveSubtreeDown

```buffer
> [!note] T

- b
  - a┃
```

## Quote72

In the middle of a quote, the item leaves it where it is, splitting it in two: what was above stays
in the first quote, what was below goes on in a second.

```yaml
rank: rare
```

```buffer
> - x
> - a┃
> - b
```

> outdent

```buffer
> - x
- a┃
> - b
```

## A paragraph outdented out of a nested quote

The caret is on the paragraph, which leaves the inner quote for the outer one; the inner quote,
empty, is gone. Right below `- a`, the paragraph would continue it lazily: a blank line between.

### Quote69

Inner quote emptied and removed.

```yaml
rank: rare
```

```buffer
> - a
> > q┃
```

> outdent

```buffer
> - a
>
> q┃
```

### Quote70

Paragraph above a quoted item.

```yaml
rank: rare
```

```buffer
> > q┃
> - a
```

> outdent

```buffer
> q┃
> - a
```
