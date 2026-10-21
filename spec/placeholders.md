# Placeholders

Some empty nodes have no Markdown of their own: an empty item right under an item's or a paragraph's
text (`- a` / `  - ` and `para` / `- ` read as setext headings), an empty paragraph, an empty line
inside a node's text. While the
caret is in one, the document reads its line as if a character had been typed at its end, so the
node exists in the outline: that line end is a **placeholder**, drawn `◌`.

A placeholder can also stand in a deleted character's place. Deleting the first character of a
line's text can leave the space after it at the text's start: right after an item's marker (`-  b`),
where it would widen the item's padding and move its content column, or anywhere the text after it
would then start another block (`-  ``` x` is code, ` # b` a heading, ` ``` x` a fence that takes
in the rest of the document). That space, at the caret, is then the placeholder, read as text, and
the node keeps its column and its text: an item's, a paragraph's, a quote's, on any line of the
text ([Placeholder17](#placeholder17), [Placeholder18](#placeholder18),
[Placeholder19](#placeholder19)). A command that rewrites the node (a move, a copy, an indent,
structured paste) settles the space first, as leaving it does.

Only the editor makes a placeholder, and the document keeps it (each editor view has its own):

- **A command** that leaves the caret in an empty node the text can't hold makes one.
- **An edit that deletes** text makes one at the caret when the outline would otherwise change
  there: deleting a child's last character leaves the child, not a heading, and deleting a text's
  first character keeps its column and its text. Typing never makes one: what is typed is text.
- **It lasts** while the text doesn't hold its node anyway: typing there ends it.
- **Leaving it**, the node stays when the text can hold it some other way: an empty item gets a
  blank line above it (`- a` / blank / `  - `), and a deleted character's place gives up its surplus
  space (`- b`), the text escaped where it would start a block there (`- \``` x`). A node no text
  can hold, an empty paragraph or an empty line inside a node's text, goes. Either way it is one
  edit, verified, part of the undo step before it, which made the empty node: one undo takes both
  back ([Undo3](undo.md#undo3)).
- **Undo and redo** bring it back with the rest: the host keeps the document, placeholders included,
  in its history ([undo.md](undo.md)).

A file never has placeholders: `- a` / `  - ` reads as a heading with an empty underline until
someone edits there. Leaving never changes the outline the rest of the text reads as, though the
blank line set above an empty child makes its list loose: there is no tighter Markdown for an empty
child under text.

## Transitions

| what happens | the placeholder | then |
| --- | --- | --- |
| a command leaves the caret in an empty node the text can't hold | made | |
| a command acts on that node and the caret stays in it (Tab, Shift-Tab) | carried along | |
| an edit deletes a node's last text on the caret's line | made at the line's end | |
| an edit deletes a line's first character, the space after it widening an item's padding or starting a block | made on the space at the caret | |
| typing | none made; on its line, it ends: the node has text | |
| the caret leaves an empty item | ends | the item stays, a blank line above it |
| the caret leaves an empty paragraph, or an empty line in a node's text | ends | the node or line goes |
| the caret leaves a deleted character's place | ends | the surplus space goes, the text escaped where it would start a block |
| Delete before the held space, or Backspace after it | ends | the same, the caret staying ([Delete32](delete.md#delete32), [Backspace48](backspace.md#backspace48)); other keys there act at the text's start |
| the caret leaves an empty node the text can hold | none was made | nothing changes |
| undo or redo | comes back with the document | |
| an edit from elsewhere (another plugin, sync) | mapped through the edit; ends if its line gets text | |
| a selection is made | its head counts as the caret: kept while the head is on its line | |

## Placeholder1

Enter, then Tab: an empty child under text.

A command makes one.

```yaml
tags: core
```

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

```yaml
outline: |
  item: a
    item
```

> cursorDocStart cursorLineBoundaryForward

Left, it stays, with a blank line above it.

```buffer
- a┃

  - 
```

## Placeholder2

Enter twice leaves a list for an empty paragraph, set off by the blank line a paragraph after a list
needs (bare Obsidian drops the marker too, but without it what is typed next continues `a`).

```yaml
tags: common free-form
```

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

Enter at the end of a paragraph makes a new, empty paragraph: it needs a blank line, and has no
text to hold it. Left, it goes. Bare Obsidian breaks the line instead, one paragraph to every reader,
which is Shift-Enter's ([Enter12](enter.md#enter12)).

```yaml
tags: core free-form
```

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

```yaml
tags: common free-form
```

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

A command acting on the empty node carries its placeholder along: Tab, Shift-Tab, Tab, and leaving
ends it as if the last Tab had been the only one.

```yaml
tags: common
```

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

Typing ends it: the node has text, and leaving changes nothing.

```yaml
tags: common
```

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

```yaml
tags: common
```

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

Delete at the text start keeps the item's column. Deleting a text's first character can leave the
space after it right after the marker (`-  b`): the wider padding moves the item's content column,
and its child would stop being one. The space at the caret, in the deleted character's place,
becomes the placeholder: read as text, it keeps the item's column. Typing fills the place; leaving,
the surplus space goes.

```yaml
tags: edge
```

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

The same with Backspace after the first character. SilverBullet leaves `-  b`, whose wider padding
makes `c` a sibling instead of a child; bare Obsidian and its Outliner re-indent `c` to keep it a
child, rewriting a line the edit isn't about.

```yaml
tags: edge
```

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

## Placeholder17

Backspace after the first character, before text that right after the marker would start a block:
bare editors leave `-  ``` x`, an item whose text is now a code fence. The space is held as text, and
leaving, it goes and the fence is escaped, so the item's text is still its text.

```yaml
tags: rare
```

```buffer
- a┃ ``` x
- b
```

> deleteContentBackward

```buffer
- ┃◌ ``` x
- b
```

> cursorDocEnd cursorCharLeft

```buffer
- \``` x
- b┃
```

## Placeholder10

An empty child typed out stays as typed: typing makes text, never a placeholder, and the text reads
as it reads.

```yaml
tags: edge
```

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

An empty item between items: the text holds it, so no placeholder is made, and leaving changes
nothing.

```yaml
tags: common
```

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

```yaml
tags: edge
```

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
the start of its text, after the `##` (never in markup): the heading isn't joined into the empty
paragraph, which would make it a paragraph and drop its `##`.

```yaml
tags: edge markup-heading
```

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

## ┃H2
```

## Placeholder14

The same before a paragraph: the empty paragraph goes, and the paragraph below stays as it was.

```yaml
tags: edge
```

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

```yaml
tags: common
```

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

## Placeholder16

A selection's head counts as the caret: selecting within the line keeps the placeholder, and a
selection whose head leaves the line ends it, as the caret leaving would.

```yaml
tags: rare
```

```buffer
- a┃
```

> enter indent selectCharLeft

```buffer
- a
  -┃« »◌
```

> cursorCharRight

```buffer
- a
  - ┃◌
```

> selectDocStart

```buffer
┃«- a

  - »
```

## Placeholder18

The same at a paragraph's start: deleting its first character before text that at the line's start
would start a block leaves ` # b`, a heading to bare editors. The space is held as text, as after an
item's marker ([Placeholder17](#placeholder17)), and leaving, it goes and the text is escaped.

```yaml
tags: rare
```

```buffer
a┃ # b

after
```

> deleteContentBackward

```buffer
┃◌ # b

after
```

> cursorDocEnd cursorCharLeft

```buffer
\# b

after┃
```

## Placeholder19

On a paragraph's later line too, where a fence would interrupt the paragraph and take in everything
after it: the text is escaped as a continuation line.

```yaml
tags: rare
```

````buffer
para
a┃ ``` x

after
````

> deleteContentBackward

````buffer
para
┃◌ ``` x

after
````

> cursorDocEnd cursorCharLeft

````buffer
para
\``` x

after┃
````

## Placeholder20

With `enterSplitSpace: start`, the space after a deleted first character, past the padding of the
item above, is the text's, as `start` reads such padding
([config](../src/config.ts)): nothing is held, and the text keeps its leading space, as most block
apps keep it.

```yaml
tags: rare
enterSplitSpace: start
```

```buffer
- z
- a┃ x
```

> deleteContentBackward

```buffer
- z
- ┃ x
```

> cursorDocStart

```buffer
┃- z
-  x
```
