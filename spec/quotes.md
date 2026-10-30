# Quotes and callouts

What a quote is in the outline is an option, `quotes` (`src/config.ts`):

- `text`, the default: a quote of one paragraph is that paragraph, framed by `> ` on each line, as a
  heading's title is by its `#`s ([Quotes as text](#quotes-as-text)).
- `atom`: every quote is one node, its lines as written, `>` included, as code is ([Quotes as
  atoms](#quotes-as-atoms)).
- `container`: a quote is a container, as below.

A quote holding more than one paragraph (or a list, a heading, a held empty line) is a container
under `text` too, and a callout is one but under `atom`: the rules below are a container's. The
cases of a quote of one paragraph among them say `quotes: container`.

A quote as a container is like an item: its blocks are its children, and it has no text of its own,
except a callout, whose title line is its text. Item commands work inside quotes the way they work
inside items, and the quote's `>` is written on every line a command makes in it, followed by its
space where indentation follows, even where the quote's first line has none (Quote86, Quote91). A
paragraph in a quote owns no list, as in an item: a list after it is the quote's. The rules quotes
add:

1. **Outdent leaves a quote**: with `outdent: direct` (the default) the node stays where it is in
   the text, the quote split around it, what followed it quoted after it (Quote12, Quote72), its
   lines without `>` (lazy continuations) as written, escaped where out of the quote they'd start a
   block (Quote87); with `logical` it follows the quote, below its other children (Quote12b). At the
   quote's end the two agree (Quote11, Quote14, Quote15, Quote16); a callout keeps its title
   (Quote13). **Indent enters the quote above**, as its last child (Quote17, Quote18, Quote19,
   Quote65, Quote66), a paragraph with the list it owned, which follows it there (Quote78); a quoted
   paragraph after a paragraph becomes an item in place (Quote9).
2. **A move of everything in a quote moves the quote** (Quote68), but a callout's title stays: its
   only child moves out of it as out of an item (Quote71); a node moves into and out of
   quotes as into and out of items, and back (Quote20, Quote21, Quote22, Quote23, Quote24, Quote25,
   Quote26). Two quotes that end up adjacent are kept apart by a blank line (Quote21).
3. **Enter makes a node in the quote**, its blank lines quoted (Quote29, Quote30, Quote31, Quote36,
   Quote37, Quote42). On an empty item it leaves the list, then the quote, as at the top level
   (Quote32, Quote33, Quote34, Quote35). In a callout's title (Obsidian flavor) the rest is a
   paragraph of its own, as a heading's is (Quote38, Quote39, Quote40, Quote41); in its `[!type]`,
   Enter is refused (Quote43), and outside the Obsidian flavor too (Quote79); at a lazy line of its
   title there, the rest is a paragraph of the callout (Quote84).
4. **Backspace peels the markup in front of a quote's first node, nearest first**: a callout's
   `[!type]` (Quote57, Quote58); then an item's marker, the item becoming a paragraph in the quote
   (`backspaceAtTopItem: unwrap`, the default; with `refuse`, nothing, Quote55); then the quote's
   `>`, the node leaving the quote, the rest of which stays quoted (Quote53, Quote54, Quote56).
   ([Backspace's rules](backspace.md).)
5. **A callout's title takes joins as a heading does**: its first node joins it by Backspace, the
   node below by Delete (Quote60, Quote61, Quote62).
6. **A join across a quote's edge brings the node into the quote** (Quote51, Quote52); Delete before
   a quote is refused ([Delete10](delete.md#delete10)).
7. **A callout's title is one line in the Obsidian flavor**: Shift-Enter there is refused (Quote47).
8. **A quote can be an item's first block** (`- > q`, `quotes: container`; under `text` it is the item's text): its lines go on at the item's column (`  > `),
   not after its marker, which would make each a new item (Quote73, Quote74, Quote76); an empty
   paragraph or line there is held on the marker's line as on any other (Quote80), and the item's
   marker stays on its first line whichever block is first (Quote81, Quote82, Quote88); out of it, by
   Backspace or outdent, its paragraph is the item's text, as on the marker's line it can only be
   (Quote75, Quote77), and on the line after an empty item's, an empty task's checkbox kept
   (Quote94).

Bare Obsidian and the text editors edit quotes as text: Tab inserts a tab after the `>`, Shift-Tab
out of a quote does nothing, Backspace and Delete delete a space or a `>`, which moves text between
containers without saying so. Obsidian's Outliner doesn't reach into quotes: there it does what bare
Obsidian does, or nothing.

## Quote1

A quote as an item's first block stays the item's child, and the item has no text of its own: only
a paragraph, a heading, a code block or an HTML block can be an item's head.

```yaml
tags: rare
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
tags: common
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
tags: rare
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
tags: rare
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

## Quote5

Indent in a quote inside an item.

```yaml
tags: edge
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
tags: rare
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
tags: edge
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
tags: edge
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
tags: edge
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
tags: common
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
tags: common
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
tags: edge
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
tags: edge
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
tags: edge
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
tags: edge
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

Out of a quote inside an item: the item's own child, unquoted, as outdent out of any container makes
the node its parent's (rule 1). Bare Obsidian unindents the line, `> - b` a quote of its own after
the item; its Outliner does nothing.

```yaml
tags: rare
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
tags: edge
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
tags: edge
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

Its children and blank lines come along, quoted; the blank line that set it apart from the quote
goes, as in the quote's list it would make the list loose.

```yaml
tags: edge
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
> - b┃
>   - c
>
>   d
```

### Quote19

Indent into a quote, then outdent: back as it was.

```yaml
tags: edge
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

```yaml
result: success
```

> outdent

```buffer
> - a
- b┃
```

## Moving between quotes

### Quote20

Out of one quote, past another, into it, with `outdent: logical`, where the item leaves below the
quote's other children; the item keeps its own blank lines as it goes, none, the blank line after
`x` staying `x`'s, and indent makes it the last of the quote's tight list.

```yaml
tags: edge
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
> - a┃
```

### Quote21

Two quotes moved together get a blank line between them: without one they would be one quote.

```yaml
tags: edge
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
tags: edge
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
tags: edge
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
tags: common
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
tags: edge
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
tags: edge
quotes: container
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
tags: edge free-form
```

```buffer
> q
# H┃
```

> moveSubtreeUp

```yaml
result: rejected would-reparent
```

```buffer
> q
# H┃
```

### Quote28

A quote moved down past a heading joins its section, as any node does
([MoveDown20](move-subtree-down.md#movedown20)); the caret ends after the `>`.

```yaml
tags: edge free-form
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
tags: common
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
tags: rare
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
tags: edge
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
tags: common free-form
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
tags: rare free-form
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
tags: edge free-form
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
tags: common
quotes: container
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
tags: common
quotes: container
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
tags: edge
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
tags: common
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
tags: common
flavor: obsidian
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
tags: common
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
tags: edge
flavor: obsidian
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
tags: edge
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
would unmake the callout. The `[!type]` is markup, so the edit is the host's (`markup: text`,
the default), and the callout is a quote of two lines.

```yaml
tags: rare
flavor: obsidian
```

```buffer
> [!ti┃p] Title
```

> enter

```yaml
result: deferredToHost
```

```buffer
> [!ti
┃p] Title
```

### Quote43b

With `markup: decorated`, it is refused, and the callout stays.

```yaml
tags: rare
flavor: obsidian
markup: decorated
```

```buffer
> [!ti┃p] Title
```

> enter

```yaml
result: rejected not-expressible
```

```buffer
> [!ti┃p] Title
```

## Shift-Enter in a quote

### Quote44

Line break in a quoted paragraph.

```yaml
tags: common
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
tags: edge
```

```buffer
> ab┃
```

> shiftEnter

```buffer
> ab
> ┃
```

> "c"

```buffer
> ab
> c┃
```

### Quote46

Line break in a quoted item.

```yaml
tags: edge
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
tags: edge free-form
flavor: obsidian
```

```buffer
> [!tip] Ti┃tle
> body
```

> shiftEnter

```yaml
result: rejected not-expressible
```

```buffer
> [!tip] Ti┃tle
> body
```

## Joining in a quote

### Quote48

Backspace joins two quoted items.

```yaml
tags: common
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
tags: edge
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
tags: edge
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
and the paragraphs are one, as outside a quote ([Delete18](delete.md#delete18)). Left to the host, the
blank line's `>` would become text: `> a┃>`.

```yaml
tags: edge free-form
```

```buffer
> a┃
>
> b
```

> deleteContentForward

```buffer
> a┃b
```

## Joining across a quote's edge

### Quote52

An item below a quote joins the quoted node above; its children enter the quote with it.

```yaml
tags: edge
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
a quote it was all of goes. Bare Obsidian and its Outliner get there in two presses, the space,
then the `>`.

```yaml
tags: common
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
tags: common free-form
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
tags: edge
backspaceAtTopItem: refuse
```

```buffer
- a
> - ┃b
```

> deleteContentBackward

```yaml
result: rejected nothing-above
```

```buffer
- a
> - ┃b
```

### Quote56

When a quote's first node leaves it, the rest stays quoted, the node standing before the quote.

```yaml
tags: edge
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
in the Obsidian flavor). Bare Obsidian and its Outliner delete the space, leaving `[!note]Title`,
still a callout.

```yaml
tags: edge
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
tags: rare
flavor: commonmark
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
> body
```

### Quote59

Backspace on a quote's only item, empty, with nothing above: it goes, as `- ┃` alone does, and the
quote it was all of goes with it, leaving an empty line to type on.

```yaml
tags: rare free-form
```

```buffer
> - ┃
```

> deleteContentBackward

```buffer
┃
```

### Quote89

Backspace on the empty paragraph Enter put above a quote's first paragraph takes it back, the quoted
blank line with it, as above the document's first paragraph
([Backspace43](backspace.md#backspace43)): with nothing above it in the quote, it has nothing to join.

```yaml
tags: rare
quotes: container
```

```buffer
> ┃q
```

> enter

```buffer
> ┃◌
>
> q
```

> deleteContentBackward

```buffer
> ┃q
```

### Quote90

After a closing fence that ends a quote, Enter makes an empty paragraph in the quote, held by a
placeholder, as after a fence elsewhere ([Fence59](fences.md#fence59)): left empty, it goes with its
`>`, where a bare `> ` line would stay behind.

```yaml
tags: rare markup-fence
```

````buffer
> ```
> code
> ```┃
````

> enter

````buffer
> ```
> code
> ```
> ┃◌
````

> cursorDocStart

````buffer
┃> ```
> code
> ```
````

## Joining into a callout's title

A callout's title is its text, a line of its own as a heading is: Backspace at the start of the
callout's first node joins it to the title, and Delete at the title's end joins the node below, as
with a heading. The quote's `>` goes with the line break. Left to the host, Backspace would delete
the space and Delete would leave the `>` in the title (`> [!note] Title┃> body`).

### Quote60

Backspace takes a callout title split back ([Quote38](#quote38)); the blank line before the body
stays.

```yaml
tags: common
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
tags: edge
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
tags: edge
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
tags: common
clipboard: |
  - x
    - y
```

```buffer
> - a┃
```

> paste

```buffer
> - a
> - x
>   - y┃
```

## Quote64

A heading in a quote owns its section there, and the items in it indent as anywhere.

```yaml
tags: edge
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
tags: edge
quotes: container
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
tags: edge
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
tags: rare
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
tags: edge
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
tags: rare
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
tags: rare
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

## Quote73

Enter in a quote that is an item's first block: the new paragraph is quoted at the item's column, as
Enter in a quote makes a node in the quote (rule 3). Backspace takes it back in one press, as between
paragraphs. Bare Obsidian and its Outliner make a new item instead, leaving the quote.

```yaml
tags: edge free-form
quotes: container
```

```buffer
- > a┃b
```

> enter

```buffer
- > a
  >
  > ┃b
```

> deleteContentBackward

```buffer
- > a┃b
```

## Quote74

Shift-Enter there: a line of the quote's paragraph, at the item's column; Backspace takes it back.

```yaml
tags: edge
```

```buffer
- > a┃b
```

> shiftEnter

```buffer
- > a
  > ┃b
```

> deleteContentBackward

```buffer
- > a┃b
```

## Quote75

Backspace at the start of such a quote: its `>` goes, and its paragraph is the item's text; the rest
of the quote stays quoted under it.

```yaml
tags: edge
```

```buffer
- a
- > ┃q
  >
  > r
```

> deleteContentBackward

```buffer
- a
- ┃q
  > r
```

## Quote76

Lines pasted as plain text there, at the item's column.

```yaml
tags: rare
clipboard: |
  x
  y
```

```buffer
- > a┃b
```

> pastePlain

```buffer
- > ax
  > y
  > ┃b
```

## Quote77

Outdent out of a quote that is an item's first block: the paragraph leaves the quote and, on the
marker's line, is the item's text, as Backspace makes it ([Quote75](#quote75)).

```yaml
tags: rare
quotes: container
```

```buffer
- a
  - > ┃q
```

> outdent

```buffer
- a
  - ┃q
```

## Quote78

A paragraph indented into the quote above takes its list along: in a quote a paragraph owns no
list, so the list follows it there.

```yaml
tags: rare
quotes: container
```

```buffer
> q

┃p
- x
```

> indent

```buffer
> q
>
> ┃p
> - x
```

## Quote79

Enter with a selection in a callout's `[!type]`, where its title is a paragraph (outside the
Obsidian flavor): the break would split the type, so it is refused, as in the Obsidian flavor
([Quote43](#quote43)).

```yaml
tags: rare
flavor: gfm
```

```buffer
> [«!note] q6»
```

> enter

```yaml
result: rejected not-expressible
```

```buffer
> [«!note] q6»
```

## Quote80

Enter at the start of a quote that is an item's first block: an empty paragraph above, in the
quote, held by a placeholder, as at a quote's start anywhere ([Enter33](enter.md#enter33)). The
marker's line holds it as any line does.

```yaml
tags: rare
quotes: container
```

```buffer
- > ┃q
```

> enter

```buffer
- > ┃◌
  >
  > q
```

> "x"

```buffer
- > x┃
  >
  > q
```

## Quote81

A move of the first paragraph of a quote that is an item's first block: the item's marker stays on
its first line, which the paragraph moving up takes ([Quote80](#quote80)); back, the same.

```yaml
tags: rare
```

```buffer
- > ┃p
  >
  > q
```

> moveSubtreeDown

```buffer
- > q
  >
  > ┃p
```

> moveSubtreeUp

```buffer
- > ┃p
  >
  > q
```

## Quote82

The first paragraph of a quote that is an item's first block deleted: the next comes up onto the
marker's line, its quoted blank line gone with it, as anywhere in a quote.

```yaml
tags: rare
```

```buffer
- > ┃p
  >
  > q
```

> deleteSubtree

```buffer
- > ┃q
```

## Quote88

Delete on an empty paragraph opening such a quote ([Quote80](#quote80)): it goes, and the next comes
up onto the marker's line, as [Quote82](#quote82) has it.

```yaml
tags: rare
```

```buffer
- > ┃◌
  >
  > q
```

> deleteContentForward

```buffer
- > ┃q
```

## Quote83

A list under a quote that is an item's first block, moved up past the quote: its item goes onto the
item's marker line, at the item's content column (`- - g`), and the quote below it. Back down, the
same in reverse.

```yaml
tags: edge
quotes: container
```

```buffer
- > q
  - ┃g
```

> moveSubtreeUp

```buffer
- - ┃g
  > q
```

> moveSubtreeDown

```buffer
- > q
  - ┃g
```

## Quote84

Outside the Obsidian flavor a callout's title is a paragraph, and lines below it that aren't quoted
continue it lazily. Enter at the start of one breaks there: the rest is a paragraph of the callout,
quoted, the lines after it staying as they were.

```yaml
tags: edge
flavor: gfm
```

```buffer
> [!note] Title
┃two
lines
```

> enter

```buffer
> [!note] Title
>
> ┃two
lines
```

## Quote85

Outdent of a quoted item that shares its line with the item holding the quote (`- > - a`): it leaves
the quote for that item, as its first block, the item's marker staying on the line.

```yaml
tags: edge
```

```buffer
- > - ┃a
  > - b
```

> outdent

```buffer
- - ┃a
  > - b
```

## Quote86

A quote written `>` without its space on its first line (`>- a`) still puts its content after `> `
on the lines below: a copy of its item lines up with what is below, its child under it.

```yaml
tags: edge
```

```buffer
┃>- a
>   - b
```

> duplicateSubtree

```buffer
>- a
>   - b
> - ┃a
>   - b
```

## Quote87

A quoted item whose text goes on in a line without `>` (a lazy continuation, `- g` text there, not an
item: four columns in, past the quote, it can start nothing) outdented out of the quote: the line
stays as written, but under the item it would start a child item, so it is escaped.

```yaml
tags: edge
outline: |
  quote
    item: q⏎- g
```

```buffer
> - ┃q
    - g
```

> outdent

```buffer
- ┃q
      - g
```

## Quote91

A quote written `>` without its space (`>- a`): a line Shift-Enter makes in its item puts the item's
text after `> `, as the lines below its first do (Quote86). After a bare `>`, the quote would take
one of the item's two columns as its own space, and the line would be lazy at best.

```yaml
tags: rare
```

```buffer
>- a┃b
```

> shiftEnter

```buffer
>- a
>   ┃b
```

## Quote91b

The same at the item's text start: there the text's line can't be lazy, as the item has no text
above it, so at two columns the text would be a paragraph of the quote, out of the item.

```yaml
tags: rare
```

```buffer
>- ┃a
>- b
```

> shiftEnter

```buffer
>-
>   ┃a
>- b
```

## Quote92

A quote in an item, its paragraphs apart by a quoted blank line: indented, the item's quote moves
whole, the blank line's `>` with it, or the quote would end there.

```yaml
tags: rare
```

```buffer
- a
- ┃b
  > q
  >
  > r
```

> indent

```buffer
- a
  - ┃b
    > q
    >
    > r
```

> outdent

```buffer
- a
- ┃b
  > q
  >
  > r
```

## Quote93

Backspace at a quoted heading's text start takes its `#`s, as anywhere: the title, now paragraph
text, is set apart from the quoted paragraph above by a quoted blank line, not a bare one, which
would end the quote.

```yaml
tags: rare markup-heading
```

```buffer
> a
> # ┃H
```

> deleteContentBackward

```buffer
> a
>
> ┃H
```

## A paragraph outdented out of a nested quote

The caret is on the paragraph, which leaves the inner quote for the outer one; the inner quote,
empty, is gone. Right below `- a`, the paragraph would continue it lazily: a blank line between.

### Quote69

Inner quote emptied and removed.

```yaml
tags: rare
quotes: container
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
tags: rare
quotes: container
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

## Quote94

A quote that is the first block of an empty task, on the line after its marker: Backspace at its
text takes the `>` away, and the paragraph, right under the checkbox, is the task's text, as on the
marker's line ([Quote75](#quote75)). The checkbox stays; outdent does the same.

```yaml
tags: rare markup-task
```

```buffer
- a
- [ ] 
  > ┃q
- b
```

> deleteContentBackward

```buffer
- a
- [ ] ┃q
- b
```

## Quote95

A quote written `>` without its space on its first line (`>- a`): an item outdented out of the
item above it is written in the quote's way, `>-`.

```yaml
tags: rare
```

```buffer
>- a
>   - ┃b
```

> outdent

```buffer
>- a
>- ┃b
```

## Quote96

Tab-indented items in a quote, its `>` taking part of the tab: a copy is written as its original
is.

```yaml
tags: rare
```

```buffer
┃>→- a
>→- b
```

> duplicateSubtree

```buffer
>→- a
>→- ┃a
>→- b
```

## Quote97

Tab-indented items in a quote: the first unwrapped into a paragraph of the quote, after `> `.

```yaml
tags: rare free-form
```

```buffer
>→- ┃a
>→- b
```

> deleteContentBackward

```buffer
> ┃a
>→- b
```

## Quotes as text

With `quotes: text` (the default), a quote of one paragraph is that paragraph, its lines framed by
`> ` as a heading's title is by its `#`s: `> q` is a paragraph, `- > q` an item whose text is `q`
(a lazy line, written without `>`, is one of its lines too). It moves, indents, joins and is deleted
as a paragraph or an item is (QuoteText3, QuoteText4, QuoteText5, QuoteText15, QuoteText18); a quote
holding more is a container, and a quote in it a framed paragraph there (QuoteText17).

1. **The frame goes as a unit**: Backspace at its text start (QuoteText1) and Delete before it
   (QuoteText6) take every line's `> ` off, the text a paragraph where it is; a second press joins.
   Home goes past it (QuoteText2).
2. **Enter makes a line of the quote**, as Shift-Enter does (QuoteText7, QuoteText11): on an empty
   last line it leaves the quote, an empty paragraph after it (an item, after an item: QuoteText8,
   QuoteText9); at the text's start, a node above (QuoteText10); on an emptied quote, its `> ` goes
   (QuoteText19). (Obsidian, SilverBullet and WorkFlowy do so: `enterInQuote: line`, the default.)
   With `enterInQuote: split` (BlockNote's), the rest is a paragraph after it, unquoted (QuoteText21,
   QuoteText22).
3. **Lines put in are the quote's**: plain paste's (QuoteText12), a blank line among them breaking it
   in two (QuoteText13); a line joined goes with its `> ` (QuoteText20).
4. **A quote is a block to paste**: on an empty item, its text (QuoteText14); items pasted at its end
   are its list (QuoteText16).

### QuoteText1

A quoted item's `> ` goes as a unit on Backspace at its text start, as a heading's `#`s do; a second Backspace joins it.

```yaml
tags: common
quotes: text
```

```buffer
- a
- > ┃q
```

> deleteContentBackward

```buffer
- a
- ┃q
```

> deleteContentBackward

```buffer
- a┃q
```

### QuoteText2

Home in a quoted item goes to its text's start, past the `> `.

```yaml
tags: edge
quotes: text
```

```buffer
- > quote┃
```

> cursorLineBoundaryBackward

```buffer
- > ┃quote
```

### QuoteText3

Shift-Tab on a quoted item outdents the item, as any item (under `container` the paragraph leaves the quote: Quote77).

```yaml
tags: edge
quotes: text
```

```buffer
- a
  - > ┃q
```

> outdent

```buffer
- a
- > ┃q
```

### QuoteText4

A quoted item's first child doesn't move above its parent's text, as under `- q` (Quote83 under `container`).

```yaml
tags: edge
quotes: text
```

```buffer
- > q
  - ┃g
```

> moveSubtreeUp

```buffer
- > q
  - ┃g
```

### QuoteText5

Deleting a quoted item's subtree deletes the item and its children (DeleteSubtree12 under `container`).

```yaml
tags: edge
quotes: text
```

```buffer
- a
- > q┃
  - g
- b
```

> deleteSubtree

```buffer
- a┃
- b
```

### QuoteText6

Delete before a quote takes its `> ` first, as before a heading; a second Delete joins it.

```yaml
tags: edge
quotes: text
```

```buffer
- a┃
> q
```

> deleteContentForward

```buffer
- a┃

q
```

> deleteContentForward

```buffer
- a┃q
```

### QuoteText7

Enter in a quote makes a line of it, as Shift-Enter does (Quote36 under `container`).

```yaml
tags: common
quotes: text
```

```buffer
> ab┃cd
```

> enter

```buffer
> ab
> ┃cd
```

### QuoteText8

At a quote's end Enter makes an empty line of it; Enter there leaves the quote, an empty paragraph after it.

```yaml
tags: common
quotes: text
```

```buffer
> ab┃
```

> enter

```buffer
> ab
> ┃
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

### QuoteText9

In a quoted item the same, the second Enter making a new item.

```yaml
tags: edge
quotes: text
```

```buffer
- > ab┃
```

> enter

```buffer
- > ab
  > ┃
```

> enter

```buffer
- > ab
- ┃
```

### QuoteText10

At a quote's text start, an empty paragraph goes above it (rule 6).

```yaml
tags: edge
quotes: text
```

```buffer
> ┃ab
```

> enter

```buffer
┃◌

> ab
```

### QuoteText11

Shift-Enter in a quoted item: its new line at the item's column, quoted.

```yaml
tags: common
quotes: text
```

```buffer
- > a┃b
```

> shiftEnter

```buffer
- > a
  > ┃b
```

### QuoteText12

Plain lines pasted into a quoted item, each a line of the quote.

```yaml
tags: edge
quotes: text
clipboard: |
  x
  y
```

```buffer
- > a┃b
```

> pastePlain

```buffer
- > ax
  > y
  > ┃b
```

### QuoteText13

A blank line among them breaks the quote in two.

```yaml
tags: edge
quotes: text
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

> y
> ┃here.
```

### QuoteText14

A quote pasted on an empty item is the item's text.

```yaml
tags: edge
quotes: text
clipboard: |
  > q
```

```buffer
- a
- ┃
```

> paste

```buffer
- a
- > q┃
```

### QuoteText15

A quote of one paragraph owns the list after it, as a paragraph does, and moves with it.

```yaml
tags: edge
quotes: text
```

```buffer
para
> q┃
- a
```

> moveSubtreeUp

```buffer
> q┃
- a

para
```

### QuoteText16

Items pasted at a quote's end follow it, its list (Paste9 under `container`).

```yaml
tags: edge
quotes: text
clipboard: |
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

- x
- y┃

after
```

### QuoteText17

A quote in a quote is a framed paragraph in a container: Shift-Tab takes it out of the outer quote, its own `>` with it (Quote69 under `container`).

```yaml
tags: edge
quotes: text
```

```buffer
> - a
> > q┃
```

> outdent

```buffer
> - a

> q┃
```

### QuoteText18

A quote below a list indents into an item in place, as a paragraph does.

```yaml
tags: edge
quotes: text
```

```buffer
- a
> ┃b
```

> indent

```buffer
- a
- > ┃b
```

### QuoteText19

Enter on an emptied quote takes its `> ` off.

```yaml
tags: edge
quotes: text
```

```buffer
> ┃◌
```

> enter

```buffer
┃◌
```

### QuoteText20

Backspace at a quote's later line joins it with the line above, its `> ` going with the break.

```yaml
tags: edge
quotes: text
```

```buffer
> ab
> ┃cd
```

> deleteContentBackward

```buffer
> ab┃cd
```

### QuoteText21

With `enterInQuote: split` (BlockNote's), Enter in a quote makes the rest a paragraph after it, unquoted.

```yaml
tags: edge
quotes: text
enterInQuote: split
```

```buffer
> ab┃cd
```

> enter

```buffer
> ab

┃cd
```

### QuoteText22

In a quoted item, the rest a new item.

```yaml
tags: edge
quotes: text
enterInQuote: split
```

```buffer
- > ab┃cd
```

> enter

```buffer
- > ab
- ┃cd
```

## Quotes as atoms

With `quotes: atom` (Logseq's, Tine's, Roam's, Athens's and Dynalist's: a block's text; the text
editors': lines of text), every quote is one node, its lines as written, `>` included, as code is: a
list or a blank `>` line in it is characters, and an item can have it as its text (QuoteAtom9,
QuoteAtom10). A callout too (QuoteAtom16, QuoteAtom17).

1. **Its `>` is text**: Home goes before it (QuoteAtom1), Backspace deletes it as the host does,
   and before it the quote joins the text above as it is written (QuoteAtom2), as Delete above it does
   (QuoteAtom3).
2. **Enter makes a line of it** (`enterInQuote: line`, the default, the text editors'): its `> `
   written, a quoted item's marker too, a number counted on (QuoteAtom11, QuoteAtom13, QuoteAtom14);
   on an empty item its marker goes, on an empty last line it leaves the quote (QuoteAtom12,
   QuoteAtom13); before the `>`, with `enterAtTextStart: stay`, a blank line above (QuoteAtom15).
   **With `split`** (the outliners') it splits the quote, the rest a paragraph after it, unquoted
   (QuoteAtom4), at an item's end a new item (QuoteAtom5), before the `>` an empty node above
   (QuoteAtom6); the quote's lines after the caret's a quote of their own, a lazy first one given
   its `>` (QuoteAtom18).
3. **Lines put in are the quote's**, their `>` written: Shift-Enter's (QuoteAtom7), plain paste's
   (QuoteAtom8). Shift-Enter's new line is lazy where the quote reads as one still with it so, else
   after a `> `: after an emptied quoted line (QuoteAtom19), before a block's start (QuoteAtom20).
4. **Tab makes it an item**, its text, as any atom ([indent.md](indent.md) rule 3): below a list, the
   list's next item (QuoteAtom21), as a quote of one paragraph under `text`.

### QuoteAtom1

Home goes to the line's start, before the `>`, which is text.

```yaml
tags: edge
quotes: atom
```

```buffer
- > quote┃
```

> cursorLineBoundaryBackward

```buffer
- ┃> quote
```

### QuoteAtom2

Backspace past the `>` deletes characters, as the host does; before it, the quote joins the item above as it is written.

```yaml
tags: common
quotes: atom
```

```buffer
- a
- > ┃q
```

> deleteContentBackward

```buffer
- a
- >┃q
```

> deleteContentBackward

```buffer
- a
- ┃q
```

> deleteContentBackward

```buffer
- a┃q
```

### QuoteAtom3

Delete before a quoted item joins it as it is written, `>` and all.

```yaml
tags: edge
quotes: atom
```

```buffer
- a┃
- > q
```

> deleteContentForward

```buffer
- a┃> q
```

### QuoteAtom4

Enter splits the quote, the rest a paragraph after it, unquoted.

```yaml
tags: common
quotes: atom
enterInQuote: split
```

```buffer
> ab┃cd
```

> enter

```buffer
> ab

┃cd
```

### QuoteAtom5

At a quoted item's end, a new item.

```yaml
tags: edge
quotes: atom
enterInQuote: split
```

```buffer
- > ab┃
```

> enter

```buffer
- > ab
- ┃
```

### QuoteAtom6

Before the `>`, an empty paragraph above.

```yaml
tags: edge
quotes: atom
enterInQuote: split
```

```buffer
┃> ab
```

> enter

```buffer
┃◌

> ab
```

### QuoteAtom7

Shift-Enter makes a line of the quote, its `>` written: an empty lazy line would end it.

```yaml
tags: common
quotes: atom
```

```buffer
> ab┃
```

> shiftEnter

```buffer
> ab
> ┃
```

> "c"

```buffer
> ab
> c┃
```

### QuoteAtom8

Plain lines pasted, each a line of the quote.

```yaml
tags: edge
quotes: atom
clipboard: |
  x
  y
```

```buffer
- > a┃b
```

> pastePlain

```buffer
- > ax
  > y
  > ┃b
```

### QuoteAtom9

A quote holding a list is one node, the item's text: Tab indents the item whole.

```yaml
tags: edge
quotes: atom
```

```buffer
- x
- > a
  >
  > - ┃b
```

> indent

```buffer
- x
  - > a
    >
    > - ┃b
```

### QuoteAtom10

Shift-Tab on an item whose quote holds a list outdents the item.

```yaml
tags: edge
quotes: atom
```

```buffer
- x
  - > - ┃b
```

> outdent

```buffer
- x
- > - ┃b
```

### QuoteAtom11

With `enterInQuote: line` (the default, the text editors'), Enter makes a line of the quote, its `> ` written.

```yaml
tags: edge
quotes: atom
```

```buffer
> ab┃cd
```

> enter

```buffer
> ab
> ┃cd
```

### QuoteAtom12

On its empty last line, Enter leaves the quote, an empty paragraph after it.

```yaml
tags: edge
quotes: atom
```

```buffer
> ab┃
```

> enter

```buffer
> ab
> ┃
```

> enter

```buffer
> ab

┃◌
```

### QuoteAtom13

In a quoted list's item, the line is a new item, its marker written; on an empty one its marker goes.

```yaml
tags: edge
quotes: atom
```

```buffer
> - a┃
```

> enter

```buffer
> - a
> - ┃
```

> enter

```buffer
> - a
> ┃
```

### QuoteAtom14

A numbered item's number counted on.

```yaml
tags: edge
quotes: atom
```

```buffer
> 1. a┃
```

> enter

```buffer
> 1. a
> 2. ┃
```

### QuoteAtom15

Before the `>`, with `enterAtTextStart: stay`, a blank line above the quote, the caret staying.

```yaml
tags: edge
quotes: atom
enterAtTextStart: stay
```

```buffer
para

┃> ab
```

> enter

```buffer
para


┃> ab
```

### QuoteAtom16

A callout is an atom too: Enter in its title makes a line of it.

```yaml
tags: edge
quotes: atom
flavor: obsidian
```

```buffer
> [!note] Title┃
> body
```

> enter

```buffer
> [!note] Title
> ┃
> body
```

### QuoteAtom17

Its `[!type]` is characters: Backspace deletes one, as the host does.

```yaml
tags: edge
quotes: atom
flavor: obsidian
```

```buffer
> [!note] ┃Title
> body
```

> deleteContentBackward

```buffer
> [!note]┃Title
> body
```

### QuoteAtom18

`split` with lines after the caret's: they are a quote of their own after the rest, a lazy first one given its `>`, which a quote's first line needs.

```yaml
tags: edge
quotes: atom
enterInQuote: split
```

```buffer
> a┃b
cd
```

> enter

```buffer
> a

┃b
> cd
```

### QuoteAtom19

Shift-Enter after an emptied quoted line: the empty `> ` line ends the quote's paragraph, so the new line can't be lazy; it gets a `> `.

```yaml
tags: edge
quotes: atom
```

```buffer
> a
> ┃b
```

> shiftEnter

```buffer
> a
> 
> ┃b
```

### QuoteAtom20

Shift-Enter before what would start a block out of the quote (a fence with an info string, HTML, a thematic break): a `> `, the line kept in the quote, as the parser says.

```yaml
tags: edge
quotes: atom
```

```buffer
> a┃```js
```

> shiftEnter

```buffer
> a
> ┃```js
```

### QuoteAtom21

Tab on a quote below a list: the list's next item, the quote its text, as code's (indent.md rule 3)
and as under `text`; outdented, a quote again.

```yaml
tags: edge
quotes: atom
```

```buffer
- a

> ┃q
> r
```

> indent

```buffer
- a
- > ┃q
  > r
```

> outdent

```buffer
- a
> ┃q
> r
```
