
# Tasks

A task is an item with a checkbox: `- [ ] text`, or checked, `- [x] text`. The checkbox is markup
the item's text starts after (Home stops after it: [CursorHome8](cursor.md#cursorhome8)); an item
whose text is only a checkbox is empty. The rules a task adds to Enter's, Backspace's and Delete's:

1. **Enter on a task makes the new item a task too**, unchecked (TaskEnter3, TaskEnter4,
   TaskEnter7); on an empty task, Enter does what it does on an empty item (TaskEnter1, TaskEnter2,
   TaskEnter5, TaskEnter6).
2. **Backspace right after the checkbox removes it**, the text staying put: the markup in front of
   the text goes first, as a unit, as a heading's `#`s do (`taskEditing: checkbox`, the default;
   TaskBackspace2, TaskBackspace3). With `taskEditing: text`, one character goes, as a text editor
   and bare Obsidian delete it, ourus making the edit (TaskBackspace5); with `block`, the task joins
   the node above (TaskBackspace4, TaskBackspace7).
3. **Delete right before the checkbox removes it too** ([Delete19](del.md#delete19)).
4. **Before the checkbox, the task is an item**: Backspace there joins it as any item, and Delete
   before it joins its text, the checkbox going with the marker (TaskDelete1,
   [obsidian-true-outliner.md](obsidian-true-outliner.md#backspace-before-the-checkbox)). Into an
   empty item or an empty task, the task keeps its own checkbox (TaskBackspace1, TaskBackspace6,
   TaskDelete2). An empty task below goes as an empty item does (TaskDelete3).
5. **The caret ends after the checkbox**, never in it, where typing would break the task.

## TaskEnter1

Enter on an empty task at the top level leaves the list: `- [ ] ` is an empty item. The blank line
keeps what is typed next out of the item; bare Obsidian leaves none, so typed text continues `a`.

```yaml
tags: common free-form markup-task
```

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

```yaml
tags: common markup-task
```

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

No escape after a task's checkbox: `# x` doesn't start the item's content (the checkbox does), so
it can't be read as a heading. The space at the split goes, as at any split.

```yaml
tags: edge
```

```buffer
- [ ] abc ┃# x
```

> enter

```buffer
- [ ] abc
- [ ] ┃# x
```

## TaskEnter4

Enter at a task's text start makes an empty task above, the caret going into it, as at any item's
text start ([Enter29](enter.md#enter29)).

```yaml
tags: common markup-task
```

```buffer
- [ ] ┃abc
```

> enter

```buffer
- [ ] ┃
- [ ] abc
```

## TaskEnter5

Enter on an empty task in the middle of a nested list makes another empty task, as on any empty
item there ([Enter27](enter.md#enter27)).

```yaml
tags: edge markup-task
```

```buffer
- a
  - b
  - [ ] ┃
  - c
```

> enter

```buffer
- a
  - b
  - [ ] 
  - [ ] ┃
  - c
```

## TaskEnter6

The same on an empty task that is its parent's first child: the new empty task goes below, since
`  - [ ] ` right under `a`, unlike `  - `, is no setext underline.

```yaml
tags: edge markup-task
```

```buffer
- a
  - [ ] ┃
  - b
```

> enter

```buffer
- a
  - [ ] 
  - [ ] ┃
  - b
```

## TaskEnter7

Enter in the middle of a task with children: the rest is a new task, unchecked, which takes the
children ([Enter3](enter.md#enter3)).

```yaml
tags: edge
```

```buffer
- [x] a┃ b
  - c
```

> enter

```buffer
- [x] a
- [ ] ┃b
  - c
```

## TaskBackspace1

Before the checkbox, Backspace joins the task into the empty item above, which takes it whole,
checkbox and children. The caret lands after the checkbox, where typing edits the task's text.

```yaml
tags: rare markup-task
```

```buffer
- a
- 
  - ┃[ ] task
    - child
```

> deleteContentBackward

```buffer
- a
- [ ] ┃task
  - child
```

## TaskBackspace2

Backspace on an empty task removes its checkbox (`taskEditing: checkbox`, the default), never
leaving a broken `- [ ]`, and a second Backspace removes the empty item: Enter on a task, then two
Backspaces, is back where it started.

```yaml
tags: common markup-task
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

> deleteContentBackward

```buffer
- a┃
```

## TaskBackspace3

Backspace right after a task's checkbox removes the checkbox, checked or not, the text staying
put. Bare Obsidian deletes one character, leaving `[x]b`, plain text.

```yaml
tags: common markup-task
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

With `taskEditing: block`, Backspace right after a checkbox joins the task into the node above, as
outliners join any block; the checkbox goes with the marker.

```yaml
tags: rare markup-task
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

With `taskEditing: text`, Backspace right after a checkbox deletes one character, as plain text and
bare Obsidian do: the space, then the `]`. ourus makes the edit, the checkbox being markup; once it
is no checkbox, Backspace is in the item's text, the host's.

```yaml
tags: rare markup-task
taskEditing: text
```

```buffer
- [ ] ┃
```

> deleteContentBackward

```result
applied
```

```buffer
- [ ]┃
```

> deleteContentBackward

```buffer
- [ ┃
```

## TaskBackspace6

Before a task's checkbox, under an empty task: the task moves up into it, its own checkbox and all,
as into any empty item ([Backspace5](backspace.md#backspace5)); the empty task's `[ ]` doesn't
replace the `[x]`.

```yaml
tags: rare markup-task
```

```buffer
- [ ] 
- ┃[x] a
```

> deleteContentBackward

```buffer
- [x] ┃a
```

## TaskBackspace7

With `taskEditing: block`, the same from right after the checkbox.

```yaml
tags: rare markup-task
taskEditing: block
```

```buffer
- [ ] 
- [x] ┃a
```

> deleteContentBackward

```buffer
- [x] ┃a
```

## TaskDelete1

Delete at the end of an item's text before a task joins the task's text: its checkbox goes with its
marker, as Backspace before the checkbox has it.

```yaml
tags: common markup-task
```

```buffer
- a┃
- [ ] b
```

> deleteContentForward

```buffer
- a┃b
```

## TaskDelete2

Delete on an empty item above a task pulls the task up into it, checkbox and all, as on any empty
item ([Delete6](del.md#delete6)); the caret lands after the checkbox.

```yaml
tags: rare markup-task
```

```buffer
- ┃
- [x] a
```

> deleteContentForward

```buffer
- [x] ┃a
```

## TaskDelete3

Delete at the end of an item's text before an empty task: the empty task goes, as an empty item
below does ([Delete20](del.md#delete20)), the caret staying put.

```yaml
tags: rare markup-task
flavor: gfm
```

```buffer
- a┃
- [ ] 
```

> deleteContentForward

```buffer
- a┃
```
