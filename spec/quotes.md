# Quotes and callouts as containers

A quote is an outline container: its blocks are its children, and it has no text of its own, except
a callout, whose title line is its text. Item commands work inside quotes the way they work inside
items; outdent leaves a quote and indent enters the quote above, as for items. A move of everything
in a quote moves the quote.

## A quote as an item's first block

A quote is a container even when it is the first block of an item: it stays the item's child, and
the item has no text of its own. Only a paragraph, a heading, a code block or an HTML block can be
an item's head. (The quote experiment made the quote the item's head, and its items vanished from
the outline; found by an independent review.)

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

The item nests under its sibling, after the quote's `>`.

### Item nests after the quote marker

```buffer
> - a
> - b┃
```

> indent

```buffer
> - a
>   - b┃
```

### No space after the quote marker

Without a space after `>`: columns count from where the quote's content starts on each line, and a space written after `>` belongs to the quote, so the item needs three.

```buffer
>- a
>- b┃
```

> indent

```buffer
>- a
>   - b┃
```

### Tab-indented items in a quote

With tabs: the quote's `>` takes part of the tab.

```buffer
>→- a
>→- b┃
```

> indent

```buffer
>→- a
>→→- b┃
```

### Quote inside an item

A quote inside an item.

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

### Item in nested quotes

Nested quotes.

```buffer
> > - a
> > - b┃
```

> indent

```buffer
> > - a
> >   - b┃
```

### Item in a callout

In a callout.

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

### Lazy continuation line stays put

A lazy continuation line stays as it is: it still continues the paragraph.

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

## Outdent inside a quote

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

A quote is a container: outdenting its child makes it the quote's next sibling, below the quote's other children.

### Item becomes the quote's next sibling

```buffer
> - a
> - b┃
```

> outdent

```buffer
> - a
- b┃
```

### Item with a child leaves below its siblings

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

### Lazy continuation line goes along

A lazy continuation line goes along unchanged.

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

### From a quote inside an item

Out of a quote inside an item: the item's own child.

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

### Quoted blank lines lose their marker

A quote's blank lines lose their `>` with it.

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

Indent makes the item the last child of the quote above, written in the quote.

### Item joins the quote above

```buffer
> - a
- b┃
```

> indent

```buffer
> - a
> - b┃
```

### Children and blank lines enter the quote

Its children and blank lines come along, and the blank line before it joins the quote (a bare one would end it).

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

### Outdent undoes indent into a quote

Then back out: outdent undoes it.

```buffer
> - a
- b┃
```

> indent outdent

```buffer
> - a
- b┃
```

## Moving between quotes

Out of one quote, past another, into it. Outdent copies the separator its new neighbours use.

### Out of one quote and into the next

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

> moveBlockDown

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

### Adjacent quotes kept apart by a blank line

Two quotes moved together get a blank line between them: without one they would be one quote.

```buffer
> - x
- a┃

> - b
```

> moveBlockDown

```buffer
> - x

> - b

- a┃
```

## Moving inside a quote

### Swapping two quoted items

```buffer
> - a
> - b┃
```

> moveBlockUp

```buffer
> - b┃
> - a
```

### Loose list keeps its quoted blank line

In a loose list, the `>` blank line stays between them.

```buffer
> - a
>
> - b┃
```

> moveBlockUp

```buffer
> - b┃
>
> - a
```

### Quote moves past an item

A quote moves past an item.

```buffer
- a
> q┃
```

> moveBlockUp

```buffer
> q┃
- a
```

## A quote and a heading don't swap

A heading owns what follows it: a quote moved below one would join its section.

### A heading doesn't move above a quote

```buffer
> q
# H┃
```

> moveBlockUp

```result
rejected: not-expressible
```

### A quote doesn't move below a heading

```buffer
┃> q
## S
```

> moveBlockDown

```result
rejected: not-expressible
```

## Enter in a quote

A new item gets the quote's `>`.

### New item gets the quote marker

```buffer
> - a┃
```

> enter

```buffer
> - a
> - ┃
```

### New item in a quote inside an item

In a quote inside an item.

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

### At the end of a lazy line

At the end of a lazy continuation line.

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

### Empty item leaves the quote

On an empty item whose parent is a quote, Enter outdents it out of the quote, as it outdents a nested item.

```buffer
> - a┃
```

> enter enter

```buffer
> - a
- ┃
```

### Splitting a quoted paragraph

In a quoted paragraph: two paragraphs in the quote, the blank line between them quoted.

```buffer
> ab┃cd
```

> enter

```buffer
> ab
>
> ┃cd
```

### Splitting a callout title

In a callout's title: the rest starts the callout's body.

```buffer
> [!note] Ti┃tle
> body
```

> enter

```buffer
> [!note] Ti
> ┃tle
> body
```

### Empty body line after a lone title

At the end of a lone title: an empty body line to type into.

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

## Shift-Enter in a quote

### Line break in a quoted paragraph

```buffer
> ab┃cd
```

> shiftEnter

```buffer
> ab
> ┃cd
```

### Held-open empty line at the end

At the end: an empty line in the quote, held open until typed into.

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

### Line break in a quoted item

In a quoted item.

```buffer
> - ab┃cd
```

> shiftEnter

```buffer
> - ab
>   ┃cd
```

## Joining in a quote

### Backspace joins two quoted items

```buffer
> - a
> - ┃b
```

> deleteContentBackward

```buffer
> - a┃b
```

### Item joins a quoted paragraph above

An item joins the paragraph above it in the quote.

```buffer
> a
> - ┃b
```

> deleteContentBackward

```buffer
> a┃b
```

### Delete joins the item below

Delete at the end of a quoted paragraph joins the item below.

```buffer
> a┃
> - b
```

> deleteContentForward

```buffer
> a┃b
```

## Joining across a quote's edge

An item below a quote joins the quoted node above; its children enter the quote with it.

### Item below joins the quoted node

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

### Quote's first paragraph left to the host

Backspace at the start of a quote's first paragraph is the host's, as at any paragraph's start:
it deletes the space, then the `>`, unwrapping the line.

```buffer
- a

> ┃q
```

> deleteContentBackward

```result
notApplicable
```

### Quote's first item cannot leave

A quote's first item doesn't leave its quote either: there's nothing above it inside the quote.

```buffer
- a
> - ┃b
```

> deleteContentBackward

```result
rejected: not-expressible
```

## Pasting in a quote

Pasted items get the quote's `>`.

```clipboard
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

## Headings in a quote

A heading in a quote owns its section there.

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

A quote holds paragraphs as an item holds lines: the paragraph becomes the quote's last child.

### Paragraph becomes the quote's last child

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

### Paragraph back out with a blank line

And back out: a blank line goes between the quote and the paragraph, which would otherwise
continue the quote's paragraph lazily.

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

## A paragraph moves inside a quote without becoming its text

```buffer
> >     code
> a┃
```

> moveBlockUp

```buffer
> a┃
> >     code
```

## A whole quote moves

The caret is on the quote's only paragraph: the quote is what moves.

```buffer
> - x
> - y

> q┃
```

> moveBlockUp

```buffer
> q┃

> - x
> - y
```

## A paragraph outdented out of a nested quote

The caret is on the paragraph, which leaves the inner quote for the outer one; the inner quote,
empty, is gone. Right below `- a`, the paragraph would continue it lazily: a blank line between.

### Inner quote emptied and removed

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

### Paragraph above a quoted item

```buffer
> > q┃
> - a
```

> outdent

```buffer
> q┃
> - a
```
