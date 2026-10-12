# Enter

Command: `enter`.

Enter splits an item at the caret. The text after the caret becomes a new item below it.

## Enter1

Splits item at the caret.

```buffer
- one two┃ three
- next
```

> enter

```buffer
- one two
- ┃three
- next
```

## Enter2

Ordered item counts on at end.

At the end of an item, Enter makes an empty sibling. Ordered items count on.

```buffer
1. one┃
```

> enter

```buffer
1. one
2. ┃
```

## Enter3

Becomes first child of parent item.

An item with children gets the new item as its first child.

```buffer
- a┃ b
  - c
```

> enter

```buffer
- a
  - ┃b
  - c
```

## Enter4

Empty first child is held by a placeholder.

At the end of such an item the new child is empty, right after the parent's text, where Markdown
can't hold it: a placeholder holds it until something is typed.

```buffer
- a┃
  - b
```

> enter

```buffer
- a
  - ┃◌
  - b
```

## Enter5

Empty nested item outdents.

Enter on an empty nested item that is the last child outdents it. On an empty top-level item it
leaves the list: the item becomes an empty paragraph, held by a placeholder and set off from the
items around it by blank lines. So Enter twice ends a list. Workflowy, Logseq, Roam and Dynalist
all outdent here.

```buffer
- a
  - b
  - ┃
```

> enter

```buffer
- a
  - b
- ┃
```

## Enter6

Empty top-level item leaves the list.

```buffer
- a
- ┃
```

> enter

```buffer
- a

┃◌
```

## Enter7

Leaving mid-list splits the list.

In the middle of a list, leaving it splits the list in two.

```buffer
- a
- ┃
- b
```

> enter

```buffer
- a

┃◌

- b
```

## Enter8

A list marker after the caret stays text in the new item.

Text after the caret that would start a block stays text: it is escaped. That includes a list
marker: the new item's text is `- def`, as Workflowy, Logseq, Roam and Dynalist keep it, written
`\- def` since `- - def` would be a nested item.

```buffer
- abc ┃- def
```

> enter

```buffer
- abc
- ┃\- def
```

## Enter9

Trailing heading marker escaped.

```buffer
- abc ┃# def
```

> enter

```buffer
- abc
- ┃\# def
```

## Enter10

HTML block tag escaped.

That includes an HTML block's opening tag, and a link reference definition.

```buffer
- abc ┃<div>
```

> enter

```buffer
- abc
- ┃\<div>
```

## Enter11

Link reference definition escaped.

```buffer
see ┃[a]: /url
```

> enter

```buffer
see

┃\[a]: /url
```

## Enter12

Paragraph splits in two.

Enter in a paragraph makes two paragraphs, a blank line between them.

```buffer
some┃ text
```

> enter

```buffer
some

┃text
```

## Enter14

Repeated Enter walks out of the list.

Enter repeatedly walks out of a nested list and then out of the list.

```buffer
- a
  - b┃
```

> enter enter enter "p"

```buffer
- a
  - b

p┃
```

## Enter15

Leaving a loose list in the middle.

In a loose list, leaving it in the middle needs no extra blank lines.

```buffer
- a

- ┃

- b
```

> enter

```buffer
- a

┃◌

- b
```

## Enter16

Lazy line goes with the second half.

A lazy continuation line is part of the item's text, so it goes with the second half.

```buffer
- a┃
lazy
```

> enter

```buffer
- a
- ┃lazy
```

## Enter17

Enter copies the CRLF of the split line.

New lines take the ending of the line they split.

```buffer
- a┃␍
- b␍
```

> enter

```buffer
- a␍
- ┃␍
- b␍
```

## Enter18

CRLF line in an LF document.

New lines take the ending of the line they split.

```buffer
- a
- b┃␍
- c
```

> enter

```buffer
- a
- b␍
- ┃␍
- c
```

## Enter21

Enter on an empty item with children makes a new empty first child, the caret going into it.

As at the end of any item with children ([Enter3](#enter3)). Workflowy, Logseq and Roam do this.

```buffer
- ┃
  - a
```

> enter

```buffer
- 
  - ┃
  - a
```

## Enter22

Enter before a list marker in a paragraph opens the paragraph's list.

The rest of the text is an item: the paragraph keeps its list, and the item comes first in it.

```buffer
para ┃- x
- a
```

> enter

```buffer
para

- ┃x
- a
```

## Enter23

Enter in a heading above indented code sets the code apart.

The new paragraph needs a blank line before the code, or it takes the code in as a continuation.

```buffer
### H┃2
    - a
```

> enter

```buffer
### H
┃2

    - a
```

## Enter25

A marker that grows moves its item's other lines.

A new item before `9.` renumbers it to `10.`, which is a column wider, so the item's child moves
with its content column.

```buffer
8. z┃
9. a
   - child
10. b
```

> enter

```buffer
8. z
9. ┃
10. a
    - child
11. b
```

## Enter26

Enter at the start of a first child puts an empty item above, the caret going into it.

As at any item's start ([Enter29](#enter29)). Right after `a`'s text, an empty item would be a
setext underline, so a placeholder holds it while the caret is in it. Workflowy, Logseq, Roam and
Dynalist all do this.

```buffer
- a
  - ┃b
```

> enter

```buffer
- a
  - ┃◌
  - b
```

## Enter27

Enter on an empty item in the middle of a nested list makes another empty item.

Enter outdents an empty nested item only when it is the last child ([Enter5](#enter5)), to leave
the list at its end. In the middle of its list, Enter makes a new empty sibling and the caret goes
into it. Workflowy, Logseq and Dynalist do this. Roam outdents the item instead, logically, so the
caret jumps below `c` ([Enter30](#enter30): `enterOnEmptyItem: outdent`); so does obsidian-outliner.

```buffer
- a
  - b
  - ┃
  - c
```

> enter

```buffer
- a
  - b
  - 
  - ┃
  - c
```

## Enter28

Enter on an empty first child makes another empty item, above it, the caret going into the new one.

The same as [Enter27](#enter27), for the first child, and the outliners behave the same. Right
after `a`'s text an empty item exists only under the caret (held by a placeholder), so the new item
goes above, as in [Enter26](#enter26), and the caret goes into it.

```buffer
- a
  - ┃◌
  - c
```

> enter

```buffer
- a
  - ┃◌
  - 
  - c
```

## Enter29

Enter at the start of an item's text puts an empty item above, the caret going into it.

Workflowy, Logseq, Roam and Dynalist all do this. obsidian-true-outliner does it on an item with
children, but on a childless item it treats Enter at the start as a split, and the caret stays with
the text (its catalogue's E26 and E28).

```buffer
- a
  - b
  - ┃c
```

> enter

```buffer
- a
  - b
  - ┃
  - c
```

## Enter30

With `enterOnEmptyItem: outdent`, Enter on an empty item in the middle of a nested list outdents it.

Roam's behaviour, set with `enterOnEmptyItem: outdent` and `outdent: logical`: the item outdents as
Shift-Tab would, so with logical outdent it moves past its later siblings and the caret jumps below
`c`. With the default, Enter makes another empty item ([Enter27](#enter27)).

```config
enterOnEmptyItem: outdent
outdent: logical
```

```buffer
- a
  - b
  - ┃
  - c
```

> enter

```buffer
- a
  - b
  - c
- ┃
```

## Enter31

Enter at the start of an item with children puts the new item above, the caret going into it.

The item keeps its text and children. No placeholder is needed: an empty item can start a document,
or follow an item or a heading.

```buffer
- ┃a
  - b
```

> enter

```buffer
- ┃
- a
  - b
```

## Enter32

Enter at the start of a heading's text splits the heading there, as anywhere in it.

An empty heading stays above, and the text becomes a paragraph below it, the caret with it.
Obsidian and most plain text editors do this.

```buffer
# ┃H1
```

> enter

```buffer
# 
┃H1
```

## Enter33

Enter at the start of a paragraph opens a blank line above it, the text staying put.

An empty paragraph has no Markdown, so no node is made: the caret stays with the text.
Obsidian and most plain text editors do this.

```buffer
┃hello
```

> enter

```buffer

┃hello
```

## Enter34

Enter with the caret in an item's marker acts at its text start.

An empty item above, the caret going into it ([Enter29](#enter29)).

```buffer
-┃ alpha
```

> enter

```buffer
- ┃
- alpha
```

## Enter35

An ordered marker after the caret stays text too, escaped before its `.`.

A backslash before a digit escapes nothing, so the escape goes before the `.` (or `)`).

```buffer
1. abc ┃2. def
```

> enter

```buffer
1. abc
2. ┃2\. def
```

## Enter36

In a loose list (blank lines between its items), Enter sets the new item off as the others are.

```buffer
- a

- b┃
```

> enter

```buffer
- a

- b

- ┃
```

## Enter37

Enter on an empty line at the end of an item's content, the caret at its content column: the line
becomes the item's next sibling, numbered on.

As Enter on an empty nested item outdents it. With more of the item below the line, Enter there is
the host's.

```buffer
1. a
   text
   ┃
```

> enter

```buffer
1. a
   text
2. ┃
```
