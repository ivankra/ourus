# Tasks

A task is an item with a checkbox: `- [ ] text`, or checked, `- [x] text`. The checkbox is markup
the item's text starts after (Home stops after it: [CursorHome8](cursor.md#cursorhome8)); an item
whose text is only a checkbox is empty. The rules a task adds to Enter's, Backspace's and Delete's:

1. **Enter on a task makes the new item a task too**, unchecked (`enterTask: continue`, the
   default; TaskEnter8, TaskEnter3, TaskEnter4, TaskEnter7), or a plain item (`plain`, TaskEnter9,
   TaskEnter9b, TaskEnter9c); on an empty task, Enter does what it does on an empty item
   (TaskEnter1, TaskEnter2, TaskEnter5, TaskEnter6).
2. **Backspace right after the checkbox removes it**, the text staying put: the markup in front of
   the text goes first, as a unit, as a heading's `#`s do (`taskEditing: checkbox`, the default;
   TaskBackspace2, TaskBackspace3), the text escaped where it would now start a block
   (TaskBackspace10). With `taskEditing: text`, one character goes, as a text editor
   and bare Obsidian delete it, ourus making the edit (TaskBackspace5); with `block`, the task joins
   the node above (TaskBackspace4, TaskBackspace7), or, with nothing above it, is a paragraph, its
   checkbox gone with its marker (TaskBackspace11).
3. **Delete right before the checkbox removes it too**, where the host decorates markup
   ([Delete19](delete.md#delete19)); where it shows markup as text, the caret there is in markup, and
   the key is the host's.
4. **Before the checkbox, the task is an item**: where the host decorates markup, Backspace there
   joins it as any item (where it shows markup as text, the key is the host's); and Delete before
   the item joins its text, the checkbox going with the marker (TaskDelete1,
   [TO1](obsidian-true-outliner.md#to1)). Into an
   empty item or an empty task, the task keeps its own checkbox (TaskBackspace1, TaskBackspace6,
   TaskDelete2). An empty task below goes as an empty item does (TaskDelete3).
5. **Inside the checkbox, Backspace and Delete edit its character**, as in text: the brackets stay,
   and the character typed between them checks the task or unchecks it (TaskBackspace8,
   TaskBackspace9, TaskDelete4). A host may show the checkbox as text, or decorate it and still let
   the user edit it, so this holds for both.
6. **Otherwise a command's caret ends after the checkbox**, never in it, where typing would break the
   task; in it, Enter acts at the text start ([Enter54](enter.md#enter54)).

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
children ([Enter3](enter.md#enter3)), as bare Obsidian, SiYuan and BlockNote split it. WorkFlowy and
Dynalist give the check to the rest, the first half unchecked; Roam keeps the first half checked and
makes the rest a plain item (`enterTask: plain`, [TaskEnter9b](#taskenter9b)).

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

## TaskEnter8

At a task's end, Enter makes the next task, unchecked, as WorkFlowy, Dynalist, RemNote, SiYuan and
every Obsidian setup do (`enterTask: continue`, the default).

```yaml
tags: core markup-task
```

```buffer
- [ ] milk┃
```

> enter

```buffer
- [ ] milk
- [ ] ┃
```

## TaskEnter9

With `enterTask: plain`, the new item is a plain one, as in Logseq and Roam, which keep a task as a
marker in a block's text (`TODO`), and Tine and Athens.

```yaml
tags: common markup-task
enterTask: plain
```

```buffer
- [ ] milk┃
```

> enter

```buffer
- [ ] milk
- ┃
```

## TaskEnter9b

With `enterTask: plain`, the rest of a task split mid-text is a plain item, its start escaped where
it would start a block there, as any item's rest is.

```yaml
tags: rare markup-task
enterTask: plain
```

```buffer
- [x] abc┃ # x
```

> enter

```buffer
- [x] abc
- ┃\# x
```

## TaskEnter9c

With `enterTask: plain`, at a task's text start the empty item above is a plain one, the task moving
down whole, as Tana makes it.

```yaml
tags: rare markup-task
enterTask: plain
```

```buffer
- [ ] ┃abc
```

> enter

```buffer
- ┃
- [ ] abc
```

## TaskEnter10

With `enterSplitSpace: start`, the space a split keeps follows the new task's checkbox, in its text:
the item's text starts at the column it did, so the children Enter hands over stay where they are.
Backspace joins it back.

```yaml
tags: rare markup-task
enterSplitSpace: start
```

```buffer
- [ ] a┃ b
  - c
```

> enter

```buffer
- [ ] a
- [ ] ┃ b
  - c
```

> deleteContentBackward

```buffer
- [ ] a┃ b
  - c
```

## TaskBackspace1

Before the checkbox, Backspace joins the task into the empty item above, which takes it whole,
checkbox and children. The caret lands after the checkbox, where typing edits the task's text.

```yaml
tags: rare markup-task
markup: decorated
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

```yaml
result: applied
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
markup: decorated
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
item ([Delete6](delete.md#delete6)); the caret lands after the checkbox.

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
below does ([Delete20](delete.md#delete20)), the caret staying put.

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

## TaskBackspace8

Inside the checkbox, Backspace deletes a character, as in text: the brackets stay, and the task is
an item whose text starts `[]` until a character is typed between them, which makes it a task again,
checked or not. So a task is checked or unchecked by hand, as in a text editor, where the checkbox
is shown as text.

```yaml
tags: rare markup-task
```

```buffer
- [ ┃] task
```

> deleteContentBackward

```buffer
- [┃] task
```

> "x"

```buffer
- [x┃] task
```

> deleteContentBackward " "

```buffer
- [ ┃] task
```

## TaskBackspace8b

The same in GFM, where a task is a task by its checkbox: emptied, `[]` is text, the item a plain
one; a character typed back makes it a task again.

```yaml
tags: rare markup-task
flavor: gfm
outline: |
  item [ ]: task
```

```buffer
- [ ┃] task
```

> deleteContentBackward

```buffer
- [┃] task
```

```yaml
outline: |
  item: [] task
```

> "x"

```buffer
- [x┃] task
```

```yaml
outline: |
  item [x]: task
```

## TaskBackspace9

The same below another item: inside the checkbox there is nothing to join.

```yaml
tags: rare markup-task
```

```buffer
- a
- [ ┃] task
```

> deleteContentBackward

```buffer
- a
- [┃] task
```

## TaskBackspace10

The checkbox gone, the text starts the item's, where `# x` would be a heading: it is escaped, as
any text a join or a split leaves at a line's start.

```yaml
tags: rare markup-task
```

```buffer
- [ ] ┃# x
```

> deleteContentBackward

```buffer
- ┃\# x
```

## TaskBackspace11

With `taskEditing: block`, the first task, with nothing above to join, loses its marker as any
first item does ([Backspace33](backspace.md#backspace33)), its checkbox with it, as a join drops it
(TaskBackspace4): a paragraph's text doesn't start with `[x]`. Its text is escaped where it would
start a heading.

```yaml
tags: rare markup-task
taskEditing: block
```

```buffer
- [x] ┃# x
- b
```

> deleteContentBackward

```buffer
┃\# x
- b
```

## TaskDelete4

Delete inside the checkbox deletes the character after the caret, as Backspace does the one before
it ([TaskBackspace8](#taskbackspace8)).

```yaml
tags: rare markup-task
```

```buffer
- [┃x] done
```

> deleteContentForward

```buffer
- [┃] done
```

> " "

```buffer
- [ ┃] done
```
