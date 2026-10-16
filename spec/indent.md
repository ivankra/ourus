# Indent

Command: `indent` (Tab). Its inverse is [`outdent`](outdent.md).

Indent takes the selected nodes (contiguous siblings of one kind) one level deeper, with their
subtrees. The rules, in order; the first that applies wins:

1. **On a code line**, Tab is the host's: it indents the code ([Fence21](fences.md#fence21)).
2. **A heading goes one level deeper**, the headings in its section with it, even past a missing
   level (Indent12, Indent23); a setext heading stays setext where it can say the level (Indent16)
   and becomes ATX where it can't (Indent25); past `######` it is refused (Indent24).
3. **A paragraph becomes an item**: the first item of the paragraph above (Indent18, Indent21), or
   of an item above (as its child); with nothing above to hold it, an item in place (Indent22). Into
   a quote above, it is the quote's last child ([quotes.md](quotes.md)).
4. **An item becomes the last child of its previous sibling**, its subtree coming along (Indent1,
   Indent2, Indent9): it lines up with the children there, adopting their marker (Indent3); a new
   ordered list starts at 1, so it can't read as more of the text above (Indent4); one joining an
   ordered list continues its numbers (Indent5). Outdent gives it back (Indent26, Indent27). The
   caret ends in its text, even from before its marker (Indent28). Under an empty item it comes
   right after the marker's line, the blank lines between going: an item can start with one blank
   line, no more, and with one it ends (Indent30).
5. **With nothing above it at its level, it is refused** (`no-previous-sibling`, Indent10,
   Indent11).
6. **Indentation follows the document**: tabs where the list has tabs (Indent6, Indent7). What the
   command isn't about stays byte for byte: code payload, hard-break spaces, a tab after a marker,
   CRLF, the numbers of untouched lists (Indent13, Indent14, Indent15, Indent17, Indent19,
   Indent20).

Bare Obsidian's Tab indents the caret's line by a tab (Live Preview the same): an item's children
stay where they are (they become siblings), a heading gets spaces in front of its `#`s, and a
paragraph becomes indented code. Obsidian's Outliner indents an item with its children, as the
outliners and ourus do.

## Indent1

Item becomes last child of previous sibling.

```yaml
rank: core
```

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

Bare Obsidian indents only the line, so `c` stops being `b`'s child.

```yaml
rank: core
```

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

When the parent already has children, the item lines up with them and adopts their bullet: a
different bullet would start a second list under `a`.

Bare Obsidian and the text editors indent the line by their own unit, which leaves `b` a level
below `x`, a child of nothing it can be.

```yaml
rank: common
```

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

An ordered item that starts a new list is renumbered from 1, as only a list starting at 1 can
interrupt a paragraph: `   2. b` would read as more of `a`'s text. The list it left renumbers too.

```yaml
rank: common
```

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

```yaml
rank: common
```

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

```yaml
rank: common
```

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

```yaml
rank: edge
```

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

```yaml
rank: core
```

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

```yaml
rank: common
```

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

First item cannot indent: there is nothing above to nest under, and no tab is typed either.

```yaml
rank: common
```

```buffer
- a┃
- b
```

> indent

```result
rejected: no-previous-sibling
```

```buffer
- a┃
- b
```

## Indent11

First item of a paragraph's list cannot indent: the paragraph owns the list, and an item can't
nest under a paragraph's text.

```yaml
rank: edge
```

```buffer
Intro

- a┃
```

> indent

```result
rejected: no-previous-sibling
```

```buffer
Intro

- a┃
```

## Indent12

Subheadings shift with the heading, even with no heading above at its level: a heading's depth is
its level, and Markdown can skip one (as org-mode demotes a first subheading). Bare Obsidian puts
spaces before the `#`s, which leaves the heading as it was.

```yaml
rank: common
```

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

Its own relative indentation and blank lines are payload, kept there and back.

```yaml
rank: edge
```

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

> outdent

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

```yaml
rank: rare
```

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

```yaml
rank: edge
```

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

No app measured changes a setext heading's level.

```yaml
rank: rare
```

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

The lines keep their CRLF endings, there and back.

```yaml
rank: rare
```

```buffer
- a␍
- b┃␍
```

> indent

```buffer
- a␍
  - b┃␍
```

> outdent

```buffer
- a␍
- b┃␍
```

## Indent18

A paragraph indented under a paragraph becomes its first item, with the `bullet` option's bullet.

```yaml
rank: edge
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

```yaml
rank: edge
```

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

> outdent

```buffer
- a
- b  
  c┃
```

## Indent20

Code whitespace survives an indent.

```yaml
rank: edge
```

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

A paragraph indented under a paragraph becomes its list item, right under it: the blank line
separated two paragraphs, and a list needs none ([Gap6](gaps.md#gap6)). Outdented, it is a paragraph
again, set off by a blank line, and the text comes back as it was.

Bare Obsidian and its Outliner indent the paragraph by a tab, which makes it indented code.

```yaml
rank: common
```

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

## Indent22

A paragraph with nothing above to hold it becomes an item in place; outdented, it is a paragraph
again.

Bare Obsidian and its Outliner make it indented code, as in [Indent21](#indent21).

```yaml
rank: edge
```

```buffer
Para┃
```

> indent

```buffer
- Para┃
```

> outdent

```buffer
Para┃
```

## Indent23

A heading with a heading above at its level becomes that heading's last subheading, its own
subheadings going one level deeper with it.

```yaml
rank: common
```

```buffer
# A
## B
## C┃
### D
```

> indent

```buffer
# A
## B
### C┃
#### D
```

## Indent24

A level-6 heading can't go deeper (Outdent5's mirror).

```yaml
rank: rare
```

```buffer
# A
###### B┃
```

> indent

```result
rejected: at-h6-bound
```

```buffer
# A
###### B┃
```

## Indent25

A setext level-2 heading indents to ATX `###`, the only way to write level 3.

```yaml
rank: rare
```

```buffer
Title┃
-----

### Sub
```

> indent

```buffer
### Title┃

#### Sub
```

## Indent26

Indent, then outdent: the item and its subtree are back as they were.

```yaml
rank: common
```

```buffer
- a
- b┃
  - c
- d
```

> indent

```buffer
- a
  - b┃
    - c
- d
```

> outdent

```buffer
- a
- b┃
  - c
- d
```

## Indent27

Indent, then outdent, on a selection: back as it was (Indent9's inverse).

```yaml
rank: common
```

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

```result
applied
```

> outdent

```buffer
- a
- «b
- c»
- d
```

## Indent28

From before the marker, Tab indents the item and the caret ends in its text, where typing can't
break the marker.

```yaml
rank: rare
```

```buffer
- a
┃- b
```

> indent

```buffer
- a
  - ┃b
```

## Indent29

A paragraph indented under an item becomes its child item, without the blank line above it: that
separated the item from a paragraph, and kept, it would make the list loose.

```yaml
rank: edge
```

```buffer
- a

para┃
```

> indent

```buffer
- a
  - para┃
```

## Indent30

An item indented under an empty item set off by a blank line: the blank line goes, since an empty
item followed by one ends there and could hold no child. Outdent gives the outline back, the list
tight now.

```yaml
rank: rare
```

```buffer
- a
- 

┃- b
```

> indent

```buffer
- a
- 
  - ┃b
```

> outdent

```buffer
- a
- 
- ┃b
```
