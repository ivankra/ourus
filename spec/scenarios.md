# Scenarios

Longer sequences of actions, as a user would perform them, with the states along the way. The
format is in [README.md](README.md); obsidian-true-outliner's cases have a file of their own,
[obsidian-true-outliner.md](obsidian-true-outliner.md).

## Outliner flows

New child, typed.

### Typing a new child

```buffer
- a┃
```

> insertParagraph formatIndent "x"

```buffer
- a
  - x┃
```

### Enter outdents the empty child

Enter on the empty child outdents it; Backspace removes it; walking away settles it.

```buffer
- a┃
```

> insertParagraph formatIndent insertParagraph

```buffer
- a
- ┃
```

### Backspace removes the empty child

```buffer
- a┃
```

> insertParagraph formatIndent deleteContentBackward

```buffer
- a┃
```

### Walking away keeps the empty child, set off by a blank line

```buffer
- a┃
```

> insertParagraph

```buffer
- a
- ┃
```

> formatIndent

```buffer
- a
  - ┃◌
```

> cursorLineUp

```buffer
- a┃

  - 
```

### Repeated Enter walks out of the list

Enter repeatedly walks out of a nested list and then out of the list.

```buffer
- a
  - b┃
```

> insertParagraph insertParagraph insertParagraph "p"

```buffer
- a
  - b

p┃
```

### Leaving a loose list in the middle

In a loose list, leaving it in the middle needs no extra blank lines.

```buffer
- a

- ┃

- b
```

> insertParagraph

```buffer
- a

┃◌

- b
```

### Two paragraphs in one item

Two paragraphs in one item.

```buffer
- one┃
```

> insertLineBreak insertLineBreak "p"

```buffer
- one

  p┃
```

### Lazy line goes with the second half

A lazy continuation line is part of the item's text, so it goes with the second half.

```buffer
- a┃
lazy
```

> insertParagraph

```buffer
- a
- ┃lazy
```

### Selected parent moves with its subtree

A selection over a parent and its child moves the parent with its subtree.

```buffer
- «a
  - b»
- c
```

> moveDown

```buffer
- c
- «a
  - b»
```

## Backspace

Joining into a paragraph above a list, or a heading, works; into a code block it can't.

### Joining into a paragraph above a list

```buffer
para

- ┃a
```

> deleteContentBackward

```buffer
para┃a
```

### No joining into a code block

````buffer
```
x
```
- ┃a
````

> deleteContentBackward

```result
rejected: not-expressible
```

## Indentation

A fenced code block moves and reindents with its item; its own relative indentation and
blank lines are payload.

### Fenced code reindents with its item

````buffer
- a
- b┃
  ```
  x

    y
  ```
````

> formatIndent

````buffer
- a
  - b┃
    ```
    x

      y
    ```
````

### Fenced code with a blank line moves

````buffer
- a
- b┃
  ```
  x

  y
  ```
````

> moveUp

````buffer
- b┃
  ```
  x

  y
  ```
- a
````

### Tab after the marker

A tab after the marker: shifting the line changes how far the tab reaches, not where the text
starts.

```buffer
- a
-→b┃
```

> formatIndent

```buffer
- a
  -→b┃
```

### Outdent in a loose list stays loose

Outdenting from the middle of a loose list keeps it loose.

```buffer
- a

  - b┃

  - c

- d
```

> formatOutdent

```buffer
- a

  - c

- b┃

- d
```

## Ordered lists

### Moving renumbers the items

```buffer
1. a
2. b┃
```

> moveUp

```buffer
1. b┃
2. a
```

### Untouched list keeps its numbers

A list whose items a command leaves alone keeps its numbers, however they run.

```buffer
1. a
   - x
   - y┃
5. b
9. c
```

> formatIndent

```buffer
1. a
   - x
     - y┃
5. b
9. c
```

### Renumbering past 9 widens the marker

Renumbering past 9 widens the marker; children have to follow the content column.

```buffer
9. a
   - x
10. b┃
```

> moveUp

```buffer
9. b┃
10. a
    - x
```

## Headings

### Setext heading demoted with its subheading

```buffer
Title┃
=====

## Sub
```

> formatIndent

```buffer
Title┃
-----

### Sub
```

### Heading moves with its subheadings

```buffer
# A
## a1
# B┃
## b1
```

> moveUp

```buffer
# B┃
## b1
# A
## a1
```

## Line endings

New lines take the ending of the line they split.

### Indent keeps CRLF endings

```buffer
- a␍
- b┃␍
```

> formatIndent

```buffer
- a␍
  - b┃␍
```

### Enter copies the CRLF of the split line

```buffer
- a┃␍
- b␍
```

> insertParagraph

```buffer
- a␍
- ┃␍
- b␍
```

### CRLF line in an LF document

```buffer
- a
- b┃␍
- c
```

> insertParagraph

```buffer
- a
- b␍
- ┃␍
- c
```

### Paragraph break in a CRLF item

```buffer
- a┃␍
```

> insertLineBreak insertLineBreak "p"

```buffer
- a␍
␍
  p┃␍
```
