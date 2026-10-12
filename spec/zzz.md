# Sessions

Short editing sessions, as a user would type them, drawn as the buffers along the way. They exercise
the machinery end to end; each step's expectation was written before running it.

## H1

Logseq: a child typed and undone, step by step, through the placeholder.

```buffer
- a┃
```

> enter indent

```buffer
- a
  - ┃◌
```

> "b" undo

```buffer
- a
  - ┃◌
```

> undo

```buffer
- a
- ┃
```

> undo

```buffer
- a┃
```

## H2

Logseq: an empty child left, then the leaving undone.

```buffer
- a
  - ┃◌
```

> cursorLineUp

```buffer
- a┃

  - 
```

> undo

```buffer
- a
  - ┃◌
```

## H3

Obsidian: a list in a quote in an item, nested, then left level by level.

```buffer
- a
  > - q1┃
```

> enter "q2" indent

```buffer
- a
  > - q1
  >   - q2┃
```

> enter enter

```buffer
- a
  > - q1
  >   - q2
  > - ┃
```

> enter

```buffer
- a
  > - q1
  >   - q2
  >
  > ┃◌
```

> enter

```buffer
- a
  > - q1
  >   - q2

  ┃◌
```

## H4

Obsidian: a heading's section holding a code block moved below the next one.

````buffer
# A┃
```
x
```
# B
text
````

> moveBlockDown

````buffer
# B
text
# A┃
```
x
```
````

## H5

Obsidian: an item holding a code block moved down past a sub-heading, into its section.

````buffer
## S
- a┃
  ```
  x
  ```
## T
- b
````

> moveBlockDown

````buffer
## S
## T
- a┃
  ```
  x
  ```
- b
````

## H6

A selection from a paragraph into its list is the paragraph, its list with it: Tab makes it an item
in place ([Indent22](indent.md#indent22)), the list its children.

```buffer
pa«ra
- b»
```

> indent

```buffer
- pa«ra
  - b»
```

## H7

Two items selected, one holding a code block, moved down together.

````buffer
- «a
  ```
  x
  ```
- b»
- c
````

> moveBlockDown

````buffer
- c
- «a
  ```
  x
  ```
- b»
````

## H8

Logseq: Enter twice on a nested item, then Backspace back.

```buffer
- a
  - b┃
```

> enter enter

```buffer
- a
  - b
- ┃
```

> deleteContentBackward

```buffer
- a
  - b┃
```

## H9

Logseq: Backspace at the start of a first child with children: its children come along.

```buffer
- a
  - ┃b
    - c
```

> deleteContentBackward

```buffer
- a┃b
  - c
```

## H10

Leaving a quote, undone step by step.

```buffer
> - a┃
```

> enter enter enter

```buffer
> - a

┃◌
```

> undo

```buffer
> - a
>
> ┃◌
```

> undo

```buffer
> - a
> - ┃
```
