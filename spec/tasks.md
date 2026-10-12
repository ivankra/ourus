# Tasks

A task is an item with a checkbox: `- [ ] text`, or checked, `- [x] text`. The checkbox is markup
the item's text starts after (Home stops after it: [CursorHome8](cursor.md#cursorhome8)); an item
whose text is only a checkbox is empty. Enter on a task makes the new item a task too, unchecked.
Backspace right after the checkbox deletes one character, as plain text (`taskEditing: text`, the
default: [TaskBackspace5](#taskbackspace5)); with `taskEditing: checkbox` it removes the checkbox
([TaskBackspace2](#taskbackspace2)), and with `taskEditing: block` it joins the task into the node above
([TaskBackspace4](#taskbackspace4)).

## TaskEnter1

Enter on an empty task at the top level leaves the list.

A task's checkbox is markup, so `- [ ] ` is an empty item, and Enter on it does what it does on
`- `.

```buffer
- a
- [ ] ┃
```

> enter

```buffer
- a

┃◌
```

## TaskEnter2

Enter on an empty nested task outdents it.

```buffer
- a
  - [ ] ┃
```

> enter

```buffer
- a
- [ ] ┃
```

## TaskEnter3

No escape after a task's checkbox.

The rest doesn't start the line's text, so it needs no escape.

```buffer
- [ ] abc ┃# x
```

> enter

```buffer
- [ ] abc
- [ ] ┃# x
```

## TaskBackspace1

Empty parent takes a task child.

```buffer
- a
- 
  - ┃[ ] task
    - child
```

> deleteContentBackward

```buffer
- a
- ┃[ ] task
  - child
```

## TaskBackspace2

With `taskEditing: checkbox`, Backspace on an empty task removes its checkbox: it is a plain empty
item.

A second Backspace then does what it does on an empty item.

```config
taskEditing: checkbox
```

```buffer
- a
- [ ] ┃
```

> deleteContentBackward

```buffer
- a
- ┃
```

## TaskBackspace3

With `taskEditing: checkbox`, Backspace right after a task's checkbox removes the checkbox, the text
staying put.

Checked or not, the checkbox goes.

```config
taskEditing: checkbox
```

```buffer
- a
- [x] ┃b
```

> deleteContentBackward

```buffer
- a
- ┃b
```

## TaskBackspace4

With `taskEditing: block`, Backspace right after a checkbox joins the task into the node above.

As outliners join any block; the checkbox goes with the marker. With the caret before the checkbox,
Backspace joins under either setting.

```config
taskEditing: block
```

```buffer
- a
- [ ] ┃b
```

> deleteContentBackward

```buffer
- a┃b
```

## TaskBackspace5

Backspace right after a checkbox deletes one character, as plain text (`taskEditing: text`, the
default).

It is the host's Backspace: the space after the checkbox goes, then the `]`.

```buffer
- [ ] ┃
```

> deleteContentBackward

```result
notApplicable
```

```buffer
- [ ]┃
```

> deleteContentBackward

```buffer
- [ ┃
```
