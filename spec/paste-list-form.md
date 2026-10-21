# Paste: the list's form

Pasted items take the form of the list they land in ([paste-list.md](paste-list.md)), its bullet
or its numbering (`pasteListForm: destination`, as Logseq, Roam and WorkFlowy paste HTML lists).

## PasteListForm1

Numbered items pasted into a bullet list are bullets.

```yaml
tags: common
clipboard: |-
  1. x
  2. y
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

## PasteListForm2

Bullets pasted into a numbered list are numbered on, and the items after them renumbered.

```yaml
tags: common
clipboard: |-
  - x
  - y
```

```buffer
1. a┃
2. b
```

> paste

```buffer
1. a
2. x
3. y┃
4. b
```

## PasteListForm3

A list in a pasted item is a list of its own, and keeps its form.

```yaml
tags: edge
clipboard: |-
  - x
    1. x1
  - y
```

```buffer
- a┃
```

> paste

```buffer
- a
- x
  1. x1
- y┃
```

## PasteListForm4

A tight list takes the paste tight, whatever its spacing in the clipboard.

```yaml
tags: edge
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

## PasteListForm5

A loose list sets each pasted item apart, as its own are.

```yaml
tags: edge
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

## PasteListForm6

With `pasteListForm: own` (BlockNote, RemNote, true-outliner), items of the other kind keep their
form, a list of their own where they land.

```yaml
tags: edge
pasteListForm: own
clipboard: |-
  1. x
  2. y
```

```buffer
- a┃
- b
```

> paste

```buffer
- a
1. x
2. y┃
- b
```
