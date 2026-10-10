# Scenarios

Key sequences played the way an editor plays them: each key runs its ourus command, and the
host's own default runs where the command doesn't apply (`notApplicable`). Provisional places
the caret leaves are settled after every key. Keys: ⏎ Enter, ⇧⏎ Shift-Enter, ⇥ Tab, ⇧⇥
Shift-Tab, ⌥↑ ⌥↓ move, ⌫ Backspace, ⇱ Home, ↑ ↓ caret, `"text"` typing. `␍` is a carriage
return.

Cases marked *TO* come from obsidian-true-outliner's measured cases and catalogues
(`../repos/obsidian-true-outliner`, `e2e-tests/cases/` and
`docs/research/enter-and-shift-enter-catalogue.md`), with their issue or catalogue numbers.

## Outliner flows

New child, typed.

```````````````````````````````` example
- a┃
.
⏎ ⇥ "x"
.
- a
  - x┃
````````````````````````````````

Enter on the empty child outdents it; Backspace removes it; walking away settles it.

```````````````````````````````` example
- a┃
.
⏎ ⇥ ⏎
.
- a
- ┃
````````````````````````````````

```````````````````````````````` example
- a┃
.
⏎ ⇥ ⌫
.
- a┃
````````````````````````````````

```````````````````````````````` example
- a┃
.
⏎ ⇥ ↑
.
- a┃
````````````````````````````````

Enter repeatedly walks out of a nested list and then out of the list.

```````````````````````````````` example
- a
  - b┃
.
⏎ ⏎ ⏎ "p"
.
- a
  - b

p┃
````````````````````````````````

In a loose list, leaving it in the middle needs no extra blank lines.

```````````````````````````````` example
- a

- ┃

- b
.
⏎
.
- a

┃◌

- b
````````````````````````````````

Two paragraphs in one item.

```````````````````````````````` example
- one┃
.
⇧⏎ ⇧⏎ "p"
.
- one

  p┃
````````````````````````````````

A lazy continuation line is part of the item's text, so it goes with the second half.

```````````````````````````````` example
- a┃
lazy
.
⏎
.
- a
- ┃lazy
````````````````````````````````

A selection over a parent and its child moves the parent with its subtree.

```````````````````````````````` example
- «a
  - b»
- c
.
⌥↓
.
- c
- «a
  - b»
````````````````````````````````

## Enter (TO catalogue)

*TO E3*: an ordered list renumbers across the split.

```````````````````````````````` example
1. one┃
2. two
.
⏎
.
1. one
2. ┃
3. two
````````````````````````````````

*TO #228*: and leaves the next list, with the other delimiter, alone.

```````````````````````````````` example
1. a┃
1) b
2) c
.
⏎
.
1. a
2. ┃
1) b
2) c
````````````````````````````````

*TO E4*: on a continuation line of a multi-line item.

```````````````````````````````` example
- first
  second┃ line
.
⏎
.
- first
  second
- ┃line
````````````````````````````````

*TO E7, E8*: an item with tab-indented children gets the new item as its first child.

```````````````````````````````` example
- alpha┃ beta
→- child
.
⏎
.
- alpha
→- ┃beta
→- child
````````````````````````````````

```````````````````````````````` example
- alpha┃
→- child
.
⏎
.
- alpha
→- ┃◌
→- child
````````````````````````````````

*TO E26* (a defect there): at the start of an item with children, the new item goes above and
the text stays where it is.

```````````````````````````````` example
- ┃alpha
→- child
.
⏎
.
- 
- ┃alpha
→- child
````````````````````````````````

*TO E32*: a task's checkbox carries over, unchecked.

```````````````````````````````` example
- [ ] alpha┃ beta
.
⏎
.
- [ ] alpha
- [ ] ┃beta
````````````````````````````````

```````````````````````````````` example
- [x] done┃
.
⏎
.
- [x] done
- [ ] ┃
````````````````````````````````

*TO E33* (a defect there): a selection inside the text is replaced, then the item splits.

```````````````````````````````` example
- al«pha be»ta
.
⏎
.
- al
- ┃ta
````````````````````````````````

*TO #267, E5*: in a paragraph, Enter makes two paragraphs.

```````````````````````````````` example
# H
para┃ text
> q
.
⏎
.
# H
para

┃text
> q
````````````````````````````````

*TO E13, E16*: in a heading, the rest of the title becomes the section's first paragraph.

```````````````````````````````` example
# Hello┃ world
.
⏎
.
# Hello
┃world
````````````````````````````````

```````````````````````````````` example
# He┃ad
## Sub
.
⏎
.
# He
┃ad
## Sub
````````````````````````````````

*TO E14, E20*: a paragraph under the heading stays its own paragraph.

```````````````````````````````` example
# Head┃line
Body.
.
⏎
.
# Head
┃line

Body.
````````````````````````````````

```````````````````````````````` example
# Head┃
Body.
.
⏎
.
# Head
┃◌

Body.
````````````````````````````````

*TO E27, E29* (E27 a defect there): at the start of a heading or paragraph, a blank line goes
above and the text stays put.

```````````````````````````````` example
# ┃Hello
.
⏎
.

# ┃Hello
````````````````````````````````

```````````````````````````````` example
┃thought
.
⏎
.

┃thought
````````````````````````````````

## Backspace (TO cases)

*TO #269*: on an emptied first item, with nothing above to join, nothing happens.

```````````````````````````````` example
1. ┃
2. b
3. c
.
⌫
.
1. ┃
2. b
3. c
````````````````````````````````

*TO #269*: twice on an emptied middle item: the text goes, then the item, and the list
renumbers.

```````````````````````````````` example
1. p
2. a┃
3. q
.
⌫ ⌫
.
1. p┃
2. q
````````````````````````````````

*TO #153*: right after Shift-Enter, Backspace takes the new line back.

```````````````````````````````` example
- one
  - kid
- foo┃
.
⇧⏎ ⌫
.
- one
  - kid
- foo┃
````````````````````````````````

Joining into a paragraph above a list, or a heading, works; into a code block it can't.

```````````````````````````````` example
para

- ┃a
.
⌫
.
para┃a
````````````````````````````````

```````````````````````````````` example
```
x
```
- ┃a
.
⌫
.
rejected: not-expressible
````````````````````````````````

## Indentation (TO cases and others)

*TO #255*: outdenting a later child leaves the quote above it alone.

```````````````````````````````` example
- item
  > quote

  - boo┃
.
⇧⇥
.
- item
  > quote

- boo┃
````````````````````````````````

A fenced code block moves and reindents with its item; its own relative indentation and
blank lines are payload.

```````````````````````````````` example
- a
- b┃
  ```
  x

    y
  ```
.
⇥
.
- a
  - b┃
    ```
    x

      y
    ```
````````````````````````````````

```````````````````````````````` example
- a
- b┃
  ```
  x

  y
  ```
.
⌥↑
.
- b┃
  ```
  x

  y
  ```
- a
````````````````````````````````

A tab after the marker: shifting the line changes how far the tab reaches, not where the text
starts.

```````````````````````````````` example
- a
-→b┃
.
⇥
.
- a
  -→b┃
````````````````````````````````

Outdenting from the middle of a loose list keeps it loose.

```````````````````````````````` example
- a

  - b┃

  - c

- d
.
⇧⇥
.
- a

  - c

- b┃

- d
````````````````````````````````

## Ordered lists

```````````````````````````````` example
1. a
2. b┃
.
⌥↑
.
1. b┃
2. a
````````````````````````````````

Renumbering past 9 widens the marker; children have to follow the content column.

```````````````````````````````` example pending
9. a
   - x
10. b┃
.
⌥↑
.
9. b┃
10. a
    - x
````````````````````````````````

## Headings

```````````````````````````````` example
Title┃
=====

## Sub
.
⇥
.
Title┃
-----

### Sub
````````````````````````````````

```````````````````````````````` example
# A
## a1
# B┃
## b1
.
⌥↑
.
# B┃
## b1
# A
## a1
````````````````````````````````

## Line endings

New lines take the ending of the line they split.

```````````````````````````````` example
- a␍
- b┃␍
.
⇥
.
- a␍
  - b┃␍
````````````````````````````````

```````````````````````````````` example
- a┃␍
- b␍
.
⏎
.
- a␍
- ┃␍
- b␍
````````````````````````````````

```````````````````````````````` example
- a
- b┃␍
- c
.
⏎
.
- a
- b␍
- ┃␍
- c
````````````````````````````````

```````````````````````````````` example
- a┃␍
.
⇧⏎ ⇧⏎ "p"
.
- a␍
␍
  p┃␍
````````````````````````````````
