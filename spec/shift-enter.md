# Shift-Enter

Command: `shiftEnter` (Shift-Enter)

Breaks a line inside a node's text. The new line continues at the node's content
column, so the node stays one node.

## ShiftEnter1

Continues at the content column.

```buffer
- one two┃ three
```

> shiftEnter

```buffer
- one two
  ┃three
```

## ShiftEnter2

Nested item under ordered parent.

```buffer
1. a
   - b┃ c
```

> shiftEnter

```buffer
1. a
   - b
     ┃c
```

## ShiftEnter3

Tab-nested item breaks with tab.

```buffer
- x
→- a┃ b
```

> shiftEnter

```buffer
- x
→- a
→  ┃b
```

## ShiftEnter4

Empty new line is held by a placeholder.

An empty new line would end the paragraph, so a placeholder holds it until something is typed.

```buffer
- one┃
- two
```

> shiftEnter

```buffer
- one
  ┃◌
- two
```

## ShiftEnter5

Leading bullet escaped.

Text that would start a block on its own line, or underline the paragraph into a heading, is
escaped.

```buffer
- abc ┃- def
```

> shiftEnter

```buffer
- abc
  ┃\- def
```

## ShiftEnter6

Ordered marker escaped.

```buffer
- abc ┃1. def
```

> shiftEnter

```buffer
- abc
  ┃1\. def
```

## ShiftEnter7

Setext equals underline escaped.

```buffer
Title ┃===
```

> shiftEnter

```buffer
Title
┃\===
```

## ShiftEnter8

Setext dash underline escaped.

```buffer
Title ┃--
```

> shiftEnter

```buffer
Title
┃\--
```

## ShiftEnter9

HTML tag escaped on new line.

```buffer
- one ┃<div>
```

> shiftEnter

```buffer
- one
  ┃\<div>
```

## ShiftEnter10

Shift-Enter at the start of a continuation line opens a blank line above it, the caret staying with
the text.

A blank line ends a paragraph, so the line and the rest of the text become the item's next
paragraph. Logseq does this. Backspace takes it back ([Backspace19](backspace.md#backspace19)).

```buffer
- a
  ┃bc
```

> shiftEnter

```buffer
- a

  ┃bc
```

> "x"

```buffer
- a

  x┃bc
```

## ShiftEnter11

Second Shift-Enter starts a paragraph.

A second Shift-Enter, on the empty line the first one made, is a paragraph break: the line
becomes a blank line, and the caret moves to a new empty paragraph inside the item, its first
child. (Markdown has no empty line inside a paragraph, so this is what a blank line can mean.)

```buffer
- one
  ┃◌
- two
```

> shiftEnter

```buffer
- one

  ┃◌
- two
```

## ShiftEnter12

After a plain paragraph.

After a paragraph that isn't an item's, the new paragraph follows it.

```buffer
para
┃◌
```

> shiftEnter

```buffer
para

┃◌
```

## ShiftEnter13

Rejected at the start of text.

At the very start of the text, there's no line to break.

```buffer
- ┃one
```

> shiftEnter

```result
rejected: not-expressible
```

## ShiftEnter14

Rejected in a heading.

A heading is one line.

```buffer
# Title┃ more
```

> shiftEnter

```result
rejected: not-expressible
```

## ShiftEnter15

Two paragraphs in one item.

Two paragraphs in one item.

```buffer
- one┃
```

> shiftEnter shiftEnter "p"

```buffer
- one

  p┃
```

## ShiftEnter16

Paragraph break in a CRLF item.

New lines take the ending of the line they split.

```buffer
- a┃␍
```

> shiftEnter shiftEnter "p"

```buffer
- a␍
␍
  p┃␍
```
