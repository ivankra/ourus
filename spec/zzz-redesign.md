# The redesign

Behaviour the redesign ([`09-redesign.md`](../09-redesign.md)) specifies, drawn as examples: the decisions it
takes, and the bugs and gaps the experiments and reviews found in the first prototype.

## Decisions of the redesign

Behaviour [`09-redesign.md`](../09-redesign.md) decides. Cases the first prototype already passes
pin the decision so the rewrite keeps it; cases it fails are `pending`.

### The guard

Native edits (the host's typing, deleting and pasting, which no ourus command handled) that change
structure pass only as a permitted transformation; the guard judges them before they apply, permits
them, repairs them, or refuses them (09-redesign, "The guard checks structural consequences"). Cases
the host's edit already gets right pin what the guard must permit; the rest are `pending`.

#### Deleting the space after a marker

Without the space, `-` is no list marker: the item's text becomes a paragraph, `-` included. On an
item with no children it is direct marker editing. With children, the guard permits it where they
stay under the same text ([Delete16](del.md#delete16)), and refuses it where they wouldn't.

##### Childless item becomes text

```buffer
-┃ a
```

> deleteContentForward

```buffer
-┃a
```

##### Nested item with children is refused

Inside an item, `-a` would be a continuation line of `p`'s text: the item would merge into `p`, and
`b` would become `p`'s child. Refused.

```config
status: pending
```

```buffer
- p
  -┃ a
    - b
```

> deleteContentForward

```buffer
- p
  -┃ a
    - b
```

#### Setext authoring

Typing an underline under a paragraph makes it a heading, as Markdown authoring.

##### Typing an underline makes a heading

```buffer
para
┃
```

> "---"

```buffer
para
---┃
```

##### Deleting to finish the underline

Deleting the rest of the line to finish the underline is setext authoring too.

```buffer
para
---x┃
```

> deleteContentBackward

```buffer
para
---┃
```

#### A list marker typed on a continuation line

Typing `- ` at the start of a paragraph's continuation line turns that line into a list item.

```buffer
para
┃more
```

> "- "

```buffer
para
- ┃more
```

#### Typing in a list marker

Typing in the marker lands at the text start, as Enter does. Today `-x a` is no item.

```config
status: pending
```

```buffer
-┃ a
```

> "x"

```buffer
- x┃a
```

### Obsidian: frontmatter is a preamble

Frontmatter is no node, so Enter in it is the host's newline. Today `a: b` / `---` reads as a
setext heading, and Enter writes a paragraph after the frontmatter instead.

```config
status: pending
```

```buffer
---
a: b┃
---
- x
```

> enter

```buffer
---
a: b
┃
---
- x
```

### Paragraphs own the list that follows them

A list that follows a paragraph in a section is that paragraph's children, so a paragraph indents,
outdents and moves like any node, taking the encoding its new place implies (09-redesign,
"Paragraphs own the list that follows them").

#### A paragraph owns consecutive lists

An ordered list and a bullet list right after a paragraph are two lists to CommonMark; both are the
paragraph's children.

```buffer
pa┃ra
1. a
- b
```

> shiftEnter

```buffer
pa
┃ra
1. a
- b
```

## Findings of the design experiments

Behaviour the design experiments ([`05-impl.md`](../05-impl.md), its Part VI) and the
reviews of the redesign ([`06-impl.md`](../06-impl.md)) found broken or missing in the first
prototype. Pending where the prototype fails them; the regression cases at the end pass and must keep
passing. Where an expected result depends on a decision still open in `09-redesign.md`, the prose says so.

### Empty tasks and empty items

#### B8: joining into an empty task

An empty task is an empty item. The text below moves up into it with its own checkbox, as it does
into an empty `- `. Today the upper, empty box wins and `[x]` is dropped.

```config
status: pending
```

```buffer
- [ ] 
- [x] ┃a
```

> deleteContentBackward

```buffer
- ┃[x] a
```

### Separators

#### Moves that would need a block re-encoded, not a separator

##### Leftover paragraph loses its four spaces

`    code` here is a paragraph (the rest of the paragraph the definition was taken from). Moved above
the definition it would start a document line with four spaces and become indented code. A
paragraph's leading indentation is not part of its text, so the writer may rewrite it, and the
paragraph needs a blank line before the definition, which can't interrupt it.

```config
status: pending
```

```buffer
[a]: /u
    ┃code
```

> moveBlockUp

```buffer
┃code

[a]: /u
```

### Escapes

#### Cmd-Backspace leaving a link reference definition

The rest of the line would become a definition at the line start; it is escaped.

```config
status: pending
```

```buffer
abc ┃[a]: tail
```

> deleteSoftLineBackward

```buffer
┃\[a]: tail
```

#### Cmd-Backspace in a setext title

```config
status: pending
```

```buffer
abc ┃- x tail
===
```

> deleteSoftLineBackward

```buffer
┃\- x tail
===
```

#### Text other readers would read differently

CommonMark reads one item with two lines here, because `2.` can't interrupt a paragraph; lezer
(CodeMirror, Live Preview) reads a nested item. The escape keeps every reader agreeing.

##### Ordered marker split onto a new line

```config
status: pending
```

```buffer
1. abc ┃2. x
```

> shiftEnter

```buffer
1. abc
   ┃2\. x
```

##### Table delimiter row split onto a new line

A delimiter row starts a table in GFM.

```config
status: pending
```

```buffer
a | b ┃|---|---|
```

> shiftEnter

```buffer
a | b
┃\|---|---|
```
