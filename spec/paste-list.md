# Paste into a list

Where [paste](paste.md) puts what it pastes into a list: lists and items, and what else lands
among them. The list's form the pasted items take is [paste-list-form.md](paste-list-form.md)'s.

- A list into a list: pasted items are whole nodes, placed between nodes; the item at the caret is left as it is, wherever
  in its text the caret is (`pasteSeams: closed`, as Logseq, Logseq DB, Tine, Roam, Athens, Tana,
  SiYuan and true-outliner paste).
- With open seams (`pasteSeams: open`, as BlockNote pastes), the paste's first text joins the text
  before the caret and its last the text after it, the item's children following the last.

## PasteList1

At the end of an item's text, the items go after it.

```yaml
tags: common
clipboard: |-
  - x
  - y
```

```buffer
- a┃
- b
```

> paste

```buffer
- a
- x
- y┃
- b
```

## PasteList2

In the middle of an item's text too: the item stays whole, its text after the caret with it.

```yaml
tags: common
clipboard: |-
  - x
  - y
```

```buffer
- a┃b
- c
```

> paste

```buffer
- ab
- x
- y┃
- c
```

## PasteList3

And at its text's start (`pasteAtTextStart: after`).

```yaml
tags: edge
clipboard: |-
  - x
  - y
```

```buffer
- ┃ab
- c
```

> paste

```buffer
- ab
- x
- y┃
- c
```

## PasteList4

On an item with children, the items go first among them (`pasteOnParent: children`).

```yaml
tags: common
clipboard: |-
  - x
  - y
```

```buffer
- a┃
  - kid
```

> paste

```buffer
- a
  - x
  - y┃
  - kid
```

## PasteList5

An empty item takes the paste in its place.

```yaml
tags: common
clipboard: |-
  - x
  - y
```

```buffer
- a
- ┃
- b
```

> paste

```buffer
- a
- x
- y┃
- b
```

## PasteList6

An empty item with children is a parent all the same: the paste goes first among its children, as
on any item with children, and the item stays (Logseq, Logseq DB, Athens; Tine, Tana and WorkFlowy
after its children, Roam before it; SiYuan, BlockNote, true-outliner and RemNote fill it).

```yaml
tags: edge
clipboard: |-
  - x
  - y
```

```buffer
- ┃
  - kid
```

> paste

```buffer
- 
  - x
  - y┃
  - kid
```

## PasteList7

An empty task is an empty item: the paste takes its place, and its checkbox goes to the first pasted
item (SiYuan, true-outliner, RemNote, Dynalist; Tana, BlockNote and WorkFlowy fill it without the
checkbox).

```yaml
tags: edge
clipboard: |-
  - x
  - y
```

```buffer
- [ ] ┃
```

> paste

```buffer
- [ ] x
- y┃
```

## PasteList7b

With `enterTask: plain`, where a task is a marker in its text, an empty task isn't empty: it stays,
and the paste goes after it (Logseq, Tine, Athens, Roam).

```yaml
tags: edge
enterTask: plain
clipboard: |-
  - x
  - y
```

```buffer
- [ ] ┃
```

> paste

```buffer
- [ ] 
- x
- y┃
```

## PasteList8

One item copied with its line break is a node, as a list is.

```yaml
tags: common
clipboard: |
  - x
```

```buffer
- a┃
- b
```

> paste

```buffer
- a
- x┃
- b
```

## PasteList9

One line without a line break, in the middle of a text, is inline text, put in at the caret, even
where it would be an item: a phrase copied from a sentence (`1. Introduction`).

```yaml
tags: edge
clipboard: "1. Introduction"
```

```buffer
- see ┃here
```

> paste

```buffer
- see 1. Introduction┃here
```

## PasteList10

A paragraph and its list, pasted into a list: the paragraph is an item, its list's items after it
(`pasteParagraphList: siblings`, as Logseq, Logseq DB, Tine and WorkFlowy paste it).

```yaml
tags: common
clipboard: |-
  Notes:
  - x
  - y
```

```buffer
- a┃
- b
```

> paste

```buffer
- a
- Notes:
- x
- y┃
- b
```

## PasteList11

A pasted paragraph is one item, its lines the item's text, as plain lines are text
(`pasteLines: text`; Logseq and Logseq DB).

```yaml
tags: edge
clipboard: |-
  one
  two

  - x
```

```buffer
- a┃
```

> paste

```buffer
- a
- one
  two
- x┃
```

## PasteList12

A code block pasted at an item's end goes into the item, after its text: placed after it, it would
end the list.

````yaml
tags: common
clipboard: |-
  ```
  c
  ```
````

```buffer
- a┃
- b
```

> paste

````buffer
- a
  ```
  c┃
  ```
- b
````

## PasteList13

After a pasted item, a pasted block is that item's.

````yaml
tags: edge
clipboard: |-
  - x

  ```
  c
  ```
````

```buffer
- a┃
- b
```

> paste

````buffer
- a
- x
  ```
  c┃
  ```
- b
````

## PasteList14

On an item with children, a block goes first among them, as items do.

````yaml
tags: edge
clipboard: |-
  ```
  c
  ```
````

```buffer
- a┃
  - kid
```

> paste

````buffer
- a
  ```
  c┃
  ```
  - kid
````

## PasteList15

In an empty item's place, code is the item's text.

````yaml
tags: edge
clipboard: |-
  ```
  c
  ```
````

```buffer
- ┃
- b
```

> paste

````buffer
- ```
  c┃
  ```
- b
````

## PasteList16

A heading pasted into a list is an item whose text is the heading, the rest of its section the
item's children.

```yaml
tags: edge
clipboard: |-
  # h
  text
```

```buffer
- a┃
- b
```

> paste

```buffer
- a
- # h
  text┃
- b
```

## PasteList17

A quote pasted on an empty item is its first block: the item has no text of its own.

```yaml
tags: edge
clipboard: |
  > q
```

```buffer
- a
- ┃
```

> paste

```buffer
- a
- > q┃
```

## PasteList18

With `pasteOnParent: after` (Tine, Tana, SiYuan, WorkFlowy, Dynalist), on an item with children the
paste goes after it and its children, as its next siblings.

```yaml
tags: edge
pasteOnParent: after
clipboard: |-
  - x
  - y
```

```buffer
- a┃
  - kid
- b
```

> paste

```buffer
- a
  - kid
- x
- y┃
- b
```

## PasteList19

With `pasteOnParent: after`, at the end of a paragraph owning a list, last in that list.

```yaml
tags: edge
pasteOnParent: after
clipboard: |-
  - x
  - y
```

```buffer
Notes┃
- z
```

> paste

```buffer
Notes
- z
- x
- y┃
```

## PasteList20

With `pasteAtTextStart: before` (Roam, SiYuan, WorkFlowy), at the start of an item's text the items
go before it, numbered from it.

```yaml
tags: edge
pasteAtTextStart: before
clipboard: |-
  - x
  - y
```

```buffer
1. ┃ab
2. c
```

> paste

```buffer
1. x
2. y┃
3. ab
4. c
```

## PasteList21

With `pasteParagraphList: children` (Roam, Athens, true-outliner, SiYuan, Dynalist), the paragraph's
list is its item's children, as an outliner's copy means it.

```yaml
tags: edge
pasteParagraphList: children
clipboard: |-
  Notes:
  - x
  - y
```

```buffer
- a┃
- b
```

> paste

```buffer
- a
- Notes:
  - x
  - y┃
- b
```

## PasteList22

With `pasteSeams: open` (BlockNote; WorkFlowy, RemNote and Dynalist each open a seam their own
way), the first pasted text joins the text before the caret, the text after it joins the last, and
the item's children follow the last pasted item.

```yaml
tags: edge
pasteSeams: open
clipboard: |-
  - x
  - y
```

```buffer
- a┃b
  - kid
```

> paste

```buffer
- ax
- y┃b
  - kid
```

## PasteList23

With `pasteSeams: open`, one item copied with its line break joins the text, as one line does.

```yaml
tags: edge
pasteSeams: open
clipboard: |
  - x
```

```buffer
- a┃b
```

> paste

```buffer
- ax┃b
```

## PasteList24

With `pasteSeams: open`, where the paste ends in a block that isn't text, the text after the caret
is an item of its own after it.

````yaml
tags: edge
pasteSeams: open
clipboard: |-
  - x

    ```
    c
    ```
````

```buffer
- a┃b
- d
```

> paste

````buffer
- ax
  ```
  c┃
  ```
- b
- d
````

## PasteList25

At a text's start, the line is escaped where it would read as a block there, as typed it would be
(the host's paste would make `1. Introduction` a list in the item).

```yaml
tags: edge
clipboard: "1. Introduction"
```

```buffer
- ┃here
```

> paste

```buffer
- 1\. Introduction┃here
```

## PasteList26

An item whose text is code, its fence closed in the item: pasted as it is, the fence closing the
item's code (a copy of the item, Copy4's way, reads so).

````yaml
tags: common
clipboard: |
  - ```
    code
    ```
````

````buffer
- a┃
- b
````

> paste

````buffer
- a
- ```
  code┃
  ```
- b
````

## PasteList27

A fence the clipboard leaves open in an item is closed in the item, at its content column, where the
clipboard ends. Open, it would still end with the item (Markdown ends a fence with its container, as
Logseq and Tine leave it), but whatever is put under the item later (a child, an item indented into
it) would read as code: closed, the document stays well-formed.

````yaml
tags: edge
clipboard: |-
  - ```
    code
````

````buffer
- a┃
- b
````

> paste

````buffer
- a
- ```
  code┃
  ```
- b
````
