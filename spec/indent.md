# Indent

Command: `indent` (Tab)

Makes a list item the last child of its previous sibling, carrying its subtree along.
New children nest at the parent's content column. A paragraph indented under a paragraph or an
item becomes an item there. A heading goes one level deeper, with the headings in its section.

## Indent1

Item becomes last child of previous sibling.

```buffer
- a
- b┃
```

> indent

```buffer
- a
  - b┃
```

## Indent2

The item's whole subtree moves with the item.

```buffer
- a
- b┃
  - c
    more c
```

> indent

```buffer
- a
  - b┃
    - c
      more c
```

## Indent3

When the parent already has children, the item lines up with them and adopts their bullet.

```buffer
- a
    * x
- b┃
```

> indent

```buffer
- a
    * x
    * b┃
```

## Indent4

An ordered item that starts a new list is renumbered from 1:
only a list starting at 1 can interrupt a paragraph, so `   2. b` would
read as more of `a`'s text. The list it left renumbers too.

```buffer
1. a
2. b┃
3. c
```

> indent

```buffer
1. a
   1. b┃
2. c
```

## Indent5

Items joining an existing ordered list continue its numbering.

```buffer
1. a
   1. x
2. b┃
```

> indent

```buffer
1. a
   1. x
   2. b┃
```

## Indent6

Tab-indented list keeps indenting with tabs.

```buffer
- a
→- b
- c┃
```

> indent

```buffer
- a
→- b
→- c┃
```

## Indent7

Tab nesting elsewhere in the list sets the indent.

```buffer
- a
- b┃
- c
→- d
```

> indent

```buffer
- a
→- b┃
- c
→- d
```

## Indent8

A new, empty item can be indented right away.

Due to `- a\n  -` parsing as a setext heading in commonmark,
it needs to open with a placeholder until something is typed.

```buffer
- a
- ┃
```

> indent

```buffer
- a
  - ┃◌
```

> "b"

```buffer
- a
  - b┃
```

## Indent9

Selected siblings indent together.

```buffer
- a
- «b
- c»
- d
```

> indent

```buffer
- a
  - «b
  - c»
- d
```

## Indent10

First item cannot indent.

```buffer
- a┃
- b
```

> indent

```result
rejected: no-previous-sibling
```

## Indent11

First item of a paragraph's list cannot indent.

```buffer
Intro

- a┃
```

> indent

```result
rejected: no-previous-sibling
```

## Indent12

Subheadings shift with the heading.

```buffer
# A
## B┃
### C
```

> indent

```buffer
# A
### B┃
#### C
```

## Indent13

Fenced code reindents with its item.

A fenced code block moves and reindents with its item; its own relative indentation and
blank lines are payload.

````buffer
- a
- b┃
  ```
  x

    y
  ```
````

> indent

````buffer
- a
  - b┃
    ```
    x

      y
    ```
````

## Indent14

Tab after the marker.

A tab after the marker: shifting the line changes how far the tab reaches, not where the text
starts.

```buffer
- a
-→b┃
```

> indent

```buffer
- a
  -→b┃
```

## Indent15

Untouched list keeps its numbers.

A list whose items a command leaves alone keeps its numbers, however they run.

```buffer
1. a
   - x
   - y┃
5. b
9. c
```

> indent

```buffer
1. a
   - x
     - y┃
5. b
9. c
```

## Indent16

Setext heading demoted with its subheading.

```buffer
Title┃
=====

## Sub
```

> indent

```buffer
Title┃
-----

### Sub
```

## Indent17

Indent keeps CRLF endings.

New lines take the ending of the line they split.

```buffer
- a␍
- b┃␍
```

> indent

```buffer
- a␍
  - b┃␍
```

## Indent18

A paragraph indented under a paragraph becomes its first item, with the `bullet` option's bullet.

```config
bullet: +
```

```buffer
intro

b┃
```

> indent

```buffer
intro

+ b┃
```

## Indent19

Hard-break spaces survive an indent.

A structural command may rewrite prefixes, never a node's own text.

```buffer
- a
- b  
  c┃
```

> indent

```buffer
- a
  - b  
    c┃
```

## Indent20

Code whitespace survives an indent.

````buffer
- a
- b┃
  ```
    x
  ```
````

> indent

````buffer
- a
  - b┃
    ```
      x
    ```
````

## Indent21

A paragraph indented under a paragraph becomes its list item; outdented, it is a paragraph again.

The text comes back as it was.

```buffer
para a

para b┃
```

> indent

```buffer
para a

- para b┃
```

> outdent

```buffer
para a

para b┃
```
