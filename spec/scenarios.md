# Scenarios

Longer sequences of actions, as a user would perform them, with the states along the way: the daily
flows, where every `core` case of the command files shows up, each flow naming the cases it walks
through. A step's states are checked as they come, so one difference fails a whole flow in another
app. The format is in [README.md](README.md).

## Outliner flows

### Scenario1

Typing a new child: Enter at the end of an item, Tab on the new one, then text
([Enter2](enter.md#enter2), [Indent8](indent.md#indent8), [Indent1](indent.md#indent1)).

```yaml
tags: core
```

```buffer
- a┃
```

> enter indent "x"

```buffer
- a
  - x┃
```

### Scenario2

Enter on the empty child outdents it ([Enter5](enter.md#enter5)).

```yaml
tags: core
```

```buffer
- a┃
```

> enter indent enter

```buffer
- a
- ┃
```

### Scenario3

Backspace removes the empty child ([Backspace30](backspace.md#backspace30),
[Backspace7](backspace.md#backspace7)).

```yaml
tags: core
```

```buffer
- a┃
```

> enter indent deleteContentBackward

```buffer
- a┃
```

### Scenario4

Walking away keeps the empty child, set off by a blank line, and coming back to it, the text typed
there is the child's ([Placeholder1](placeholders.md#placeholder1)).

```yaml
tags: core
```

```buffer
- a┃
```

> enter indent

```buffer
- a
  - ┃◌
```

> cursorDocStart cursorLineBoundaryForward

```buffer
- a┃

  - 
```

> cursorLineDown cursorLineDown "b"

```buffer
- a

  - b┃
```

### Scenario5

Building a small outline: a parent, two children typed under it, a sibling after them; the parent
moves past it with its children, and the move is undone ([Enter2](enter.md#enter2),
[Indent8](indent.md#indent8), [Enter5](enter.md#enter5), [MoveDown1](move-subtree-down.md#movedown1),
[Undo1](undo.md#undo1)).

```yaml
tags: core
```

```buffer
- a┃
```

> enter indent "b" enter "c" enter outdent "d"

```buffer
- a
  - b
  - c
- d┃
```

> cursorDocStart cursorLineBoundaryForward moveSubtreeDown

```buffer
- d
- a┃
  - b
  - c
```

> undo

```buffer
- a┃
  - b
  - c
- d
```

### Scenario6

Writing a list under a paragraph, nesting in it, and walking out of it with Enter: a new paragraph
([Placeholder3](placeholders.md#placeholder3)), items ([Enter2](enter.md#enter2)), a child
([Indent8](indent.md#indent8)), out of the child ([Enter5](enter.md#enter5)) and out of the list
([Enter6](enter.md#enter6), [Enter14](enter.md#enter14)).

```yaml
tags: core free-form
```

```buffer
Groceries┃
```

> enter

```buffer
Groceries

┃◌
```

> "- milk"

```buffer
Groceries

- milk┃
```

> enter "eggs"

> enter indent "brown"

```buffer
Groceries

- milk
- eggs
  - brown┃
```

> enter enter

```buffer
Groceries

- milk
- eggs
  - brown
- ┃
```

> enter "Done."

```buffer
Groceries

- milk
- eggs
  - brown

Done.┃
```

### Scenario7

Splitting an item and joining it back, editing in between: Enter in the middle
([Enter1](enter.md#enter1)), the space at the split trimmed from both halves, Backspace at the start
joins it back, glued, and the space is typed again ([Backspace1](backspace.md#backspace1),
[Enter38](enter.md#enter38), [Enter44](enter.md#enter44)), Home goes to the text start
([CursorHome1](cursor.md#cursorhome1)), Enter there puts an item above
([Enter29](enter.md#enter29)), Backspace and Delete inside the text are the host's
([Backspace13](backspace.md#backspace13), [Delete8](delete.md#delete8)), Delete at the end joins the
next item ([Delete2](delete.md#delete2)).

```yaml
tags: core
```

```buffer
- buy milk┃ and eggs
- call Ann
```

> enter

```buffer
- buy milk
- ┃and eggs
- call Ann
```

> deleteContentBackward " "

```buffer
- buy milk ┃and eggs
- call Ann
```

> cursorLineBoundaryBackward

```buffer
- ┃buy milk and eggs
- call Ann
```

> enter "today:"

```buffer
- today:┃
- buy milk and eggs
- call Ann
```

> cursorLineDown cursorLineDown cursorLineBoundaryForward deleteContentBackward cursorCharLeft deleteContentForward

```buffer
- today:
- buy milk and eggs
- call A┃
```

> cursorLineUp cursorLineBoundaryForward deleteContentForward

```buffer
- today:
- buy milk and eggs┃call A
```

### Scenario8

Reorganizing an outline: an item moves with its subtree ([MoveUp1](move-subtree-up.md#moveup1),
[MoveDown1](move-subtree-down.md#movedown1)), indents and outdents with it
([Indent2](indent.md#indent2), [Outdent1](outdent.md#outdent1)). Bare Obsidian's Alt-Up moves
`Work`'s line without `email`.

```yaml
tags: core
```

```buffer
- Inbox
- Work┃
  - email
- Home
  - plants
```

> moveSubtreeUp

```buffer
- Work┃
  - email
- Inbox
- Home
  - plants
```

> moveSubtreeDown moveSubtreeDown

```buffer
- Inbox
- Home
  - plants
- Work┃
  - email
```

> moveSubtreeUp indent

```buffer
- Inbox
  - Work┃
    - email
- Home
  - plants
```

> outdent

```buffer
- Inbox
- Work┃
  - email
- Home
  - plants
```

### Scenario9

Reorganizing across parents: an item moved down past its parent's end becomes the next item's first
child ([MoveDown7](move-subtree-down.md#movedown7)); a new sibling is typed after it and moved above it
([Enter2](enter.md#enter2), [MoveUp6](move-subtree-up.md#moveup6)); a whole parent moves past the other,
its child with it ([MoveDown1](move-subtree-down.md#movedown1)).

```yaml
tags: core
```

```buffer
- Inbox
  - call Ann
  - buy milk┃
- Errands
```

> moveSubtreeDown

```buffer
- Inbox
  - call Ann
- Errands
  - buy milk┃
```

> enter "post a letter" moveSubtreeUp

```buffer
- Inbox
  - call Ann
- Errands
  - post a letter┃
  - buy milk
```

> cursorDocStart cursorLineBoundaryForward moveSubtreeDown

```buffer
- Errands
  - post a letter
  - buy milk
- Inbox┃
  - call Ann
```

### Scenario10

Outdenting a child with siblings after it, moving it, deleting it: its later sibling becomes its
child ([DirectOutdent1](outdent.md#directoutdent1)), the subtree moves whole
([MoveUp1](move-subtree-up.md#moveup1)) and goes whole ([DeleteSubtree1](delete-subtree.md#deletesubtree1)).

```yaml
tags: common
```

```buffer
- a
  - b┃
    - b1
  - c
```

> outdent

```buffer
- a
- b┃
  - b1
  - c
```

> moveSubtreeUp

```buffer
- b┃
  - b1
  - c
- a
```

> deleteSubtree

```buffer
- ┃a
```

### Scenario11

Lines in an item: Shift-Enter makes one ([ShiftEnter1](shift-enter.md#shiftenter1),
[ShiftEnter4](shift-enter.md#shiftenter4)), Backspace at its start joins it back
([Backspace9](backspace.md#backspace9)), Delete at the end joins the next item
([Delete2](delete.md#delete2)), and undo and redo step through it ([Undo1](undo.md#undo1)).

```yaml
tags: core
```

```buffer
- a┃
- b
```

> shiftEnter

```buffer
- a
  ┃◌
- b
```

> "more"

```buffer
- a
  more┃
- b
```

> cursorLineBoundaryBackward deleteContentBackward

```buffer
- a┃more
- b
```

> cursorLineBoundaryForward deleteContentForward

```buffer
- amore┃b
```

> undo

```buffer
- amore┃
- b
```

> redo

```buffer
- amore┃b
```

### Scenario12

A first child, typed and joined away: Enter at the end of an item with children makes its first
child ([Enter4](enter.md#enter4)), Backspace at the child's start joins it into the parent
([Backspace3](backspace.md#backspace3)), Delete at the parent's end joins the next child
([Delete1](delete.md#delete1)).

```yaml
tags: core
```

```buffer
- a┃
  - b
- c
  - d
```

> enter

```buffer
- a
  - ┃◌
  - b
- c
  - d
```

> "x"

```buffer
- a
  - x┃
  - b
- c
  - d
```

> cursorLineBoundaryBackward deleteContentBackward

```buffer
- a┃x
  - b
- c
  - d
```

> cursorDocStart cursorLineBoundaryForward deleteContentForward

```buffer
- ax┃b
- c
  - d
```

### Scenario13

Reordering a numbered list: moves renumber it ([MoveUp14](move-subtree-up.md#moveup14),
[MoveDown22](move-subtree-down.md#movedown22)).

```yaml
tags: core
```

```buffer
1. one
2. two┃
3. three
```

> moveSubtreeUp

```buffer
1. two┃
2. one
3. three
```

> moveSubtreeDown moveSubtreeDown

```buffer
1. one
2. three
3. two┃
```

### Scenario14

Moving a child across parents: at its parent's edge it crosses into the next parent, as its first
child, and back ([MoveDown7](move-subtree-down.md#movedown7), [MoveUp6](move-subtree-up.md#moveup6)).

```yaml
tags: core
```

```buffer
- a
  - b┃
- c
  - d
```

> moveSubtreeDown

```buffer
- a
- c
  - b┃
  - d
```

> moveSubtreeUp

```buffer
- a
  - b┃
- c
  - d
```

### Scenario15

A task list: Enter on a task makes the next task ([TaskEnter8](tasks.md#taskenter8)); Backspace on
the empty one removes its checkbox ([TaskBackspace2](tasks.md#taskbackspace2)), and the item typed
there is a note, nested by Tab; Enter on the empty child outdents it ([Enter5](enter.md#enter5)).
Leaving the list from there is [Scenario25](#scenario25).

```yaml
tags: core markup-task
```

```buffer
- [ ] milk┃
```

> enter "bread" enter

```buffer
- [ ] milk
- [ ] bread
- [ ] ┃
```

> deleteContentBackward "two loaves" indent

```buffer
- [ ] milk
- [ ] bread
  - two loaves┃
```

> enter

```buffer
- [ ] milk
- [ ] bread
  - two loaves
  - ┃
```

> enter

```buffer
- [ ] milk
- [ ] bread
  - two loaves
- ┃
```

### Scenario16

Moving a checked task to another section, then undoing it: the task crosses into the section above
([MoveUp22](move-subtree-up.md#moveup22)), its checkbox and the other section's item untouched, and
undo brings it back ([Undo1](undo.md#undo1)). (No typing in between: apps disagree on how many undo
steps typed text is.)

```yaml
tags: common
```

```buffer
# Work
- email

# Home
- [x] ┃review
- water
```

> moveSubtreeUp

```buffer
# Work
- email
- [x] ┃review

# Home
- water
```

```result
applied
```

> undo

```buffer
# Work
- email

# Home
- [x] ┃review
- water
```

### Scenario17

Pasting lines into a list as an outliner pastes them (`pasteStructuredLines: items`, as Roam,
WorkFlowy and Dynalist): on an empty item, they are items in its place
([Paste39](paste.md#paste39)); at the end of an item's text, items after it. By default they are
the item's text instead ([Paste7](paste.md#paste7), [Paste10](paste.md#paste10)).

```yaml
tags: core
pasteStructuredLines: items
clipboard: |
  bread
  butter
```

```buffer
- milk┃
```

> enter

```buffer
- milk
- ┃
```

> pasteStructured

```buffer
- milk
- bread
- butter┃
```

> cursorDocStart cursorLineBoundaryForward pasteStructured

```buffer
- milk
- bread
- butter┃
- bread
- butter
```

### Scenario18

Pasting code at the end of an item's text and typing on: the code goes into the item, the caret at
the end of its last line, and the next item stays where it was ([Paste1](paste.md#paste1)).

````yaml
tags: common
clipboard: |
  ```
  code
  ```
````

````buffer
- example┃
- next
````

> pasteStructured "!"

````buffer
- example
  ```
  code!┃
  ```
- next
````

## Notes and sections

### Scenario19

Notes under a heading: Enter after the heading starts its first paragraph
([Gap12](gaps.md#gap12)), Enter in a paragraph starts another ([Enter12](enter.md#enter12)), and
paragraphs move among themselves ([MoveUp4](move-subtree-up.md#moveup4)).

```yaml
tags: core
```

```buffer
# Notes┃
```

> enter "first idea"

```buffer
# Notes
first idea┃
```

> enter "second"

```buffer
# Notes
first idea

second┃
```

> moveSubtreeUp

```buffer
# Notes
second┃

first idea
```

### Scenario20

A note under a heading, with lines: Enter at the heading's end starts its first paragraph, Enter at
a paragraph's end the next, Shift-Enter a line inside one ([Gap12](gaps.md#gap12),
[Enter12](enter.md#enter12), [ShiftEnter1](shift-enter.md#shiftenter1)); the paragraph moves up, its
lines together ([MoveUp4](move-subtree-up.md#moveup4)), and the move is undone.

```yaml
tags: core
```

```buffer
# Trip┃
```

> enter "Pack light." enter "Book the train."

```buffer
# Trip
Pack light.

Book the train.┃
```

> shiftEnter "Seat 42."

```buffer
# Trip
Pack light.

Book the train.
Seat 42.┃
```

> moveSubtreeUp

```buffer
# Trip
Book the train.
Seat 42.┃

Pack light.
```

> undo

```buffer
# Trip
Pack light.

Book the train.
Seat 42.┃
```

### Scenario21

Splitting a paragraph and joining it back, from either side: Enter makes two paragraphs
([Enter12](enter.md#enter12)), Backspace at the second's start joins them, glued, in one press
([Backspace12](backspace.md#backspace12)), and so does Delete at the first's end
([Delete18](delete.md#delete18)).

```yaml
tags: core free-form
```

```buffer
one┃two
```

> enter

```buffer
one

┃two
```

> deleteContentBackward

```buffer
one┃two
```

> enter cursorDocStart cursorLineBoundaryForward

```buffer
one┃

two
```

> deleteContentForward

```buffer
one┃two
```

### Scenario21b

The same at a sentence boundary: the space at the split goes from both paragraphs, and the join
glues the sentences, the default's cost ([Enter44](enter.md#enter44)).

```yaml
tags: core free-form
```

```buffer
One.┃ Two.
```

> enter

```buffer
One.

┃Two.
```

> deleteContentBackward

```buffer
One.┃Two.
```

### Scenario22

Reordering sections: a heading moves with its section, past one of its level and back
([MoveDown4](move-subtree-down.md#movedown4), [MoveUp3](move-subtree-up.md#moveup3)), its gaps with it
([Gap1](gaps.md#gap1), [Gap2](gaps.md#gap2)).

```yaml
tags: core
```

```buffer
# Work┃

- email

# Home

- plants
```

> moveSubtreeDown

```buffer
# Home

- plants

# Work┃

- email
```

> moveSubtreeUp

```buffer
# Work┃

- email

# Home

- plants
```

### Scenario23

Typed text in a section stays text: Enter splits a heading, its rest a paragraph with `2.`
escaped ([Enter41](enter.md#enter41)); Shift-Enter breaks the line, and undo takes each step back
([Undo1](undo.md#undo1)).

```yaml
tags: common
```

```buffer
# Plan┃2. draft
```

> enter "revise "

```buffer
# Plan
revise ┃2\. draft
```

> shiftEnter

```buffer
# Plan
revise
 ┃2\. draft
```

> undo undo undo

```buffer
# Plan┃2. draft
```

### Scenario24

Making a list out of a paragraph's lines, typing `- ` at the start of each: the first makes the
line an item of the paragraph's list, and the line below reads as more of that item, until it gets
a marker of its own ([Typing3](typing.md#typing3)).

```yaml
tags: common free-form
```

```buffer
Shopping:
┃milk
bread
```

> "- "

```buffer
Shopping:
- ┃milk
bread
```

> cursorLineDown cursorLineBoundaryBackward "- "

```buffer
Shopping:
- milk
- ┃bread
```

### Scenario25

Leaving a task list after a note: Enter on its last, empty item leaves the list, and what is typed
next is a paragraph after it ([Enter6](enter.md#enter6)), where bare Obsidian's text would continue
the item above.

```yaml
tags: common free-form
```

```buffer
- [ ] milk
- [ ] bread
  - two loaves
- ┃
```

> enter "Shop closes at six."

```buffer
- [ ] milk
- [ ] bread
  - two loaves

Shop closes at six.┃
```
