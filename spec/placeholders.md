# Placeholders

Some empty nodes have no Markdown of their own: an empty child right under an item's text (`- a` /
`  - ` reads as a setext heading), an empty paragraph, an empty line inside a node's text. While the
caret is in one, the document reads its line as if a character had been typed at its end, so the
node exists in the outline: that line end is a **placeholder**, drawn `◌`.

A placeholder can also stand in a deleted character's place. Deleting the first character of an
item's text can leave the space after it right after the marker (`-  b`), where it would widen the
item's padding and move its content column; that space, at the caret, is then the placeholder, read
as text, and the item keeps its column.

Only the editor makes a placeholder, and the document keeps it (each editor view has its own):

- **A command** that leaves the caret in an empty node the text can't hold makes one.
- **An edit that deletes** text makes one at the caret when the outline would otherwise change there:
  deleting a child's last character leaves the child, not a heading, and deleting an item's first
  character keeps its column. Typing never makes one: what is typed is text.
- **It lasts** while the text doesn't hold its node anyway: typing there ends it.
- **Leaving it**, the node stays when the text can hold it some other way: an empty item gets a blank
  line above it (`- a` / blank / `  - `), and a deleted character's place gives up its surplus space
  (`- b`). A node no text can hold, an empty paragraph or an empty line inside a node's text, goes.
  Either way it is one edit, verified, one undo step.
- **Undo and redo** bring it back with the rest: the host keeps the document, placeholders included,
  in its history ([undo.md](undo.md)).

A file never has placeholders: `- a` / `  - ` reads as a heading with an empty underline until
someone edits there. Leaving never changes what the rest of the text reads as.

## Transitions

| what happens | the placeholder | then |
| --- | --- | --- |
| a command leaves the caret in an empty node the text can't hold | made | |
| a command acts on that node and the caret stays in it (Tab, Shift-Tab) | carried along | |
| an edit deletes a node's last text on the caret's line | made at the line's end | |
| an edit deletes an item's first character, widening its padding | made on the space at the caret | |
| typing | none made; on its line, it ends: the node has text | |
| the caret leaves an empty item | ends | the item stays, a blank line above it |
| the caret leaves an empty paragraph, or an empty line in a node's text | ends | the node or line goes |
| the caret leaves a deleted character's place | ends | the surplus space goes |
| the caret leaves an empty node the text can hold | none was made | nothing changes |
| undo or redo | comes back with the document | |
| an edit from elsewhere (another plugin, sync) | mapped through the edit; ends if its line gets text | |
| the selection is not collapsed | kept | |

## Placeholder1

Enter, then Tab: an empty child under text.

A command makes one.

```buffer
- a┃
```

> enter

The text holds an empty item between items: no placeholder.

```buffer
- a
- ┃
```

> indent

Under `a`'s text, it would be a setext underline: a placeholder holds it.

```buffer
- a
  - ┃◌
```

> cursorDocStart cursorLineBoundaryForward

Left, it stays, with a blank line above it.

```buffer
- a┃

  - 
```

## Placeholder2

Enter twice leaves a list for an empty paragraph.

```buffer
- a┃
```

> enter

```buffer
- a
- ┃
```

> enter

```buffer
- a

┃◌
```

> cursorDocStart

No text holds an empty paragraph: it goes.

```buffer
┃- a
```

## Placeholder3

Enter at the end of a paragraph.

```buffer
para┃
```

> enter

```buffer
para

┃◌
```

> cursorDocStart

```buffer
┃para
```

## Placeholder4

Shift-Enter at the end of a paragraph opens an empty line in it.

```buffer
para┃
```

> shiftEnter

```buffer
para
┃◌
```

> cursorDocStart

An empty line inside a paragraph has no Markdown: it goes.

```buffer
┃para
```

## Placeholder5

Tab, Shift-Tab, Tab: the node is still the one written.

A command carries it.

```buffer
- a┃
```

> enter

```buffer
- a
- ┃
```

> indent

```buffer
- a
  - ┃◌
```

> outdent

```buffer
- a
- ┃
```

> indent

```buffer
- a
  - ┃◌
```

> cursorDocStart cursorLineBoundaryForward

```buffer
- a┃

  - 
```

## Placeholder6

The node has text: leaving changes nothing.

Typing ends it.

```buffer
- a┃
```

> enter

```buffer
- a
- ┃
```

> indent

```buffer
- a
  - ┃◌
```

> "x"

```buffer
- a
  - x┃
```

> cursorDocStart cursorLineBoundaryForward

```buffer
- a┃
  - x
```

## Placeholder7

Deleting a child's last character keeps the child.

An edit empties a node. The deletion is the host's, but read as written the emptied line `  - `
would be a setext underline: `a` would become a heading and the child would be gone. A placeholder
at the caret keeps the empty child the user is in.

```buffer
- a
  - b┃
```

> deleteContentBackward

```buffer
- a
  - ┃◌
```

> cursorDocStart cursorLineBoundaryForward

```buffer
- a┃

  - 
```

## Placeholder8

Delete at the text start.

A deletion at the text start keeps the item's column.

Deleting a text's first character can leave the space after it right after the marker (`-  b`):
the wider padding moves the item's content column, and its child would stop being one. The space
at the caret, in the deleted character's place, becomes the placeholder: read as text, it keeps the
item's column. Typing fills the place; leaving, the surplus space goes.

```buffer
- ┃a b
  - c
```

> deleteContentForward

```buffer
- ┃◌ b
  - c
```

> "x"

```buffer
- x┃ b
  - c
```

## Placeholder9

Backspace after the first character.

```buffer
- a┃ b
  - c
```

> deleteContentBackward

```buffer
- ┃◌ b
  - c
```

> cursorDocEnd cursorCharLeft

Leaving, the surplus space goes, and `c` is still a child.

```buffer
- b
  - c┃
```

## Placeholder10

An empty child typed out stays as typed.

Typing makes no placeholder.

Typing makes text, not a placeholder: the text reads as it reads.

```buffer
- a
┃
```

> "  - "

No `◌`: the line is text, and `a` reads as a heading with an empty underline.

```buffer
- a
  - ┃
```

> cursorDocStart cursorLineBoundaryForward

```buffer
- a┃
  - 
```

## Placeholder11

An empty item between items stays as it is.

Leaving where the text can hold the node.

```buffer
- a┃
- b
```

> enter

```buffer
- a
- ┃
- b
```

> cursorDocEnd cursorCharLeft

```buffer
- a
- 
- b┃
```

## Placeholder12

An empty child under text, never edited, is no placeholder.

A file reads as written.

```buffer
- a
  - ┃
```

> cursorDocStart cursorLineBoundaryForward

```buffer
- a┃
  - 
```

## Placeholder13

Delete on an empty paragraph's placeholder removes the paragraph.

The empty paragraph goes with its blank line. The node below keeps its kind, and the caret goes to
the start of its line: the heading isn't joined into the empty paragraph, which would make it a
paragraph and drop its `##`.

```buffer
# H1

┃a

## H2
```

> deleteContentForward

```buffer
# H1

┃◌

## H2
```

> deleteContentForward

```buffer
# H1

┃## H2
```

## Placeholder14

The same before a paragraph: the empty paragraph goes, and the paragraph below stays as it was.

```buffer
para

┃x

text
```

> deleteContentForward

```buffer
para

┃◌

text
```

> deleteContentForward

```buffer
para

┃text
```

## Placeholder15

Enter at the start of an item right after paragraph text: a placeholder holds the new empty item.

Right after `para`, an empty item would be a setext underline, so it exists only while the caret
is in it. Leaving, it stays, set off by a blank line.

```buffer
para
- ┃a
```

> enter

```buffer
para
- ┃◌
- a
```

> cursorDocEnd cursorCharLeft

```buffer
para

- 
- a┃
```
