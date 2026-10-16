
# Shift-Enter

Command: `shiftEnter` (Shift-Enter).

Makes a line: the node stays one node; whereas [`enter`](enter.md) makes a node.
The rules, in order; the first that applies wins:

1. **In fenced code**, a new code line, as Enter ([Fence8](fences.md#fence8)).
2. **Where the node can't hold a second line, it is refused**: a heading (ShiftEnter14), a callout's
   title in the Obsidian flavor ([quotes.md](quotes.md)), an item's text start (ShiftEnter13). With
   the caret in the item's marker, the line break is the host's (`editInMarkup: host`, the default;
   ShiftEnter22), or refused (`refuse`; ShiftEnter22b).
3. **At the start of a continuation line**, a blank line above it: the line and the rest of the
   text become the node's next paragraph (ShiftEnter10). Markdown has no empty line inside a
   paragraph, so a blank line is what a line break there can be.
4. **On the empty line a Shift-Enter made**, a paragraph break, for the same reason: an empty
   paragraph inside the item, or after the paragraph (ShiftEnter11, ShiftEnter12, ShiftEnter15,
   ShiftEnter16).
5. **Otherwise the text breaks at the caret**, the new line at the node's content column
   (ShiftEnter1, ShiftEnter2, ShiftEnter3); at the end of the text the empty new line is held by a
   placeholder (ShiftEnter4). Text after the caret that would start a block there, or underline the
   paragraph into a heading, is escaped, in every flavor (ShiftEnter5, ShiftEnter6, ShiftEnter7,
   ShiftEnter8, ShiftEnter9, ShiftEnter18, ShiftEnter19).

Backspace takes a Shift-Enter back (ShiftEnter17, ShiftEnter20), up to the spaces at the break
(ShiftEnter21). The spaces at the break go with
neither line, as at Enter's split: a continuation line's leading spaces aren't text in Markdown, and
spaces left before the break could make it a hard break. Bare Obsidian and the text editors don't
escape what follows the caret, which turns `- def` into a list and `===` into a heading underline.

## ShiftEnter1

Continues at the content column. The space at the break goes with neither line, as at Enter's split,
and Backspace doesn't bring it back ([ShiftEnter21](#shiftenter21)).

```yaml
rank: core
```

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

```yaml
rank: common
```

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

```yaml
rank: edge
```

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

Empty new line is held by a placeholder: an empty new line would end the paragraph, so a
placeholder holds it until something is typed.

```yaml
rank: core
```

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

Leading bullet escaped: text that would start a block on its own line, or underline the paragraph
into a heading, is escaped.

```yaml
rank: common
```

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

```yaml
rank: edge
```

```buffer
- abc ┃1. def
```

> shiftEnter

```buffer
- abc
  ┃1\. def
```

## ShiftEnter7

Setext equals underline escaped. Bare Obsidian leaves `===` under `Title `, which makes the
paragraph a heading.

```yaml
rank: edge
```

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

```yaml
rank: edge
```

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

```yaml
rank: rare
```

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
the text: the line and the rest become the item's next paragraph, as in Logseq. Backspace takes it
back ([Backspace19](backspace.md#backspace19)).

```yaml
rank: edge
```

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

A second Shift-Enter, on the empty line the first one made, is a paragraph break: the line becomes a
blank line, and the caret moves to a new empty paragraph inside the item, its first child.

```yaml
rank: common
```

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

After a paragraph that isn't an item's, the new paragraph follows it.

```yaml
rank: common
```

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

Rejected at the start of text: the item's first line would be empty.

```yaml
rank: edge
```

```buffer
- ┃one
```

> shiftEnter

```result
rejected: not-expressible
```

```buffer
- ┃one
```

## ShiftEnter14

Rejected in a heading: a heading is one line (Enter splits it).

```yaml
rank: common
```

```buffer
# Title┃ more
```

> shiftEnter

```result
rejected: not-expressible
```

```buffer
# Title┃ more
```

## ShiftEnter15

Shift-Enter twice at an item's end, then typing: the text is the item's second paragraph.

```yaml
rank: common
```

```buffer
- one┃
```

> shiftEnter shiftEnter "p"

```buffer
- one

  p┃
```

## ShiftEnter16

Paragraph break in a CRLF item: new lines take the ending of the line they split.

```yaml
rank: rare
```

```buffer
- a┃␍
```

> shiftEnter shiftEnter "p"

```buffer
- a␍
␍
  p┃␍
```

## ShiftEnter17

Shift-Enter, then Backspace: the line break goes, and the text is as it was.

```yaml
rank: common
```

```buffer
- one┃two
```

> shiftEnter

```buffer
- one
  ┃two
```

> deleteContentBackward

```buffer
- one┃two
```

## ShiftEnter18

An ordered marker split onto a new line is escaped, though CommonMark reads one item with two lines
here (`2.` can't interrupt a paragraph): lezer (CodeMirror, Obsidian's Live Preview) reads a nested
item. The escape keeps every reader agreeing.

```yaml
rank: rare
```

```buffer
1. abc ┃2. x
```

> shiftEnter

```buffer
1. abc
   ┃2\. x
```

## ShiftEnter19

A table's delimiter row split onto a new line is escaped: under the text it would start a table in
GFM. It is escaped in every flavor, so the text is the same in each.

```yaml
rank: rare
```

```buffer
a | b ┃|---|---|
```

> shiftEnter

```buffer
a | b
┃\|---|---|
```

## ShiftEnter20

Shift-Enter, then Backspace, where the break escaped a marker: the join drops the escape, which
mid-line serves nothing ([Enter43](enter.md#enter43)'s mirror).

```yaml
rank: rare
```

```buffer
- abc┃- def
```

> shiftEnter

```buffer
- abc
  ┃\- def
```

> deleteContentBackward

```buffer
- abc┃- def
```

## ShiftEnter21

Shift-Enter at a space, then Backspace: the text comes back without the space, as after Enter
([Enter44](enter.md#enter44)). Most apps keep the space at the start of the new line, where Markdown
reads none (a continuation line's leading spaces aren't text); kept at the end of the first line, it
would be stripped by editors that trim whitespace, and two or more would make a hard break.

```yaml
rank: edge
```

```buffer
- one two┃ three
```

> shiftEnter

```buffer
- one two
  ┃three
```

> deleteContentBackward

```buffer
- one two┃three
```

## ShiftEnter22

In the marker, a line break can't be one in the item's text: the host makes it
(`editInMarkup: host`, the default), and the text reads as it then does, an empty item and a
paragraph.

```yaml
rank: rare
```

```buffer
-┃ a
```

> shiftEnter

```result
notApplicable
```

```buffer
-
┃ a
```

## ShiftEnter22b

With `editInMarkup: refuse`, it is refused.

```yaml
rank: rare
editInMarkup: refuse
```

```buffer
-┃ a
```

> shiftEnter

```result
rejected: not-expressible
```

```buffer
-┃ a
```
