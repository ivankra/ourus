# Scenarios

Longer sequences of actions, as a user would perform them, with the states along the way: the daily
flows, where every `core` case of the command files shows up (each must-have feature of an outliner,
its most basic case), each flow naming the cases it walks through. A step's states are checked as they come, so one difference fails a whole flow in another
app. The format is in [README.md](README.md).

## Outliner flows

### Scenario1

Typing a new child: Enter at the end of an item, Tab on the new one, then text
([Enter2](enter.md#enter2), [Indent8](indent.md#indent8), [Indent1](indent.md#indent1)).

```yaml
tags: core
```

```markdown
- a┃
```

> enter indent "x"

```markdown
- a
  - x┃
```

### Scenario2

Enter on the empty child outdents it ([Enter5](enter.md#enter5)).

```yaml
tags: core
```

```markdown
- a┃
```

> enter indent enter

```markdown
- a
- ┃
```

### Scenario3

Backspace removes the empty child ([Backspace30](backspace.md#backspace30),
[Backspace7](backspace.md#backspace7)).

```yaml
tags: core
```

```markdown
- a┃
```

> enter indent deleteContentBackward

```markdown
- a┃
```

### Scenario4

Walking away keeps the empty child, set off by a blank line, and coming back to it, the text typed
there is the child's ([Placeholder1](placeholders.md#placeholder1)).

```yaml
tags: core
```

```markdown
- a┃
```

> enter indent

```markdown
- a
  - ┃◌
```

> cursorDocStart cursorLineBoundaryForward

```markdown
- a┃

  - 
```

> cursorLineDown cursorLineDown "b"

```markdown
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

```markdown
- a┃
```

> enter indent "b" enter "c" enter outdent "d"

```markdown
- a
  - b
  - c
- d┃
```

> cursorDocStart cursorLineBoundaryForward moveSubtreeDown

```markdown
- d
- a┃
  - b
  - c
```

> undo

```markdown
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

```markdown
Groceries┃
```

> enter

```markdown
Groceries

┃◌
```

> "- milk"

```markdown
Groceries

- milk┃
```

> enter "eggs"

> enter indent "brown"

```markdown
Groceries
- milk
- eggs
  - brown┃
```

> enter enter

```markdown
Groceries
- milk
- eggs
  - brown
- ┃
```

> enter "Done."

```markdown
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

```markdown
- buy milk┃ and eggs
- call Ann
```

> enter

```markdown
- buy milk
- ┃and eggs
- call Ann
```

> deleteContentBackward " "

```markdown
- buy milk ┃and eggs
- call Ann
```

> cursorLineBoundaryBackward

```markdown
- ┃buy milk and eggs
- call Ann
```

> enter "today:"

```markdown
- today:┃
- buy milk and eggs
- call Ann
```

> cursorLineDown cursorLineDown cursorLineBoundaryForward deleteContentBackward cursorCharLeft deleteContentForward

```markdown
- today:
- buy milk and eggs
- call A┃
```

> cursorLineUp cursorLineBoundaryForward deleteContentForward

```markdown
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

```markdown
- Inbox
- Work┃
  - email
- Home
  - plants
```

> moveSubtreeUp

```markdown
- Work┃
  - email
- Inbox
- Home
  - plants
```

> moveSubtreeDown moveSubtreeDown

```markdown
- Inbox
- Home
  - plants
- Work┃
  - email
```

> moveSubtreeUp indent

```markdown
- Inbox
  - Work┃
    - email
- Home
  - plants
```

> outdent

```markdown
- Inbox
- Work┃
  - email
- Home
  - plants
```

### Scenario8b

Reorganizing by dragging: `Home`, pressed by its bullet, goes to the top with its child
([MoveSubtree1](move-subtree.md#movesubtree1)), and the caret stays in the text it is in, where typing goes on
([MoveSubtree2](move-subtree.md#movesubtree2)).

```yaml
tags: core
```

```markdown
▸
- Inbox
- Work
  - email┃
- Home③
  - plants
```

> moveSubtree ③

```markdown
- Home③
  - plants
- Inbox
- Work
  - email┃
```

> "s"

```markdown
- Home
  - plants
- Inbox
- Work
  - emails┃
```

### Scenario8c

Dragged into the item above as its child ([MoveSubtree3](move-subtree.md#movesubtree3)), its own child with it, then
taken back out with Shift-Tab ([Outdent1](outdent.md#outdent1)).

```yaml
tags: core
```

```markdown
- Inbox
  ▸
- Work┃②
  - email
```

> moveSubtree ②

```markdown
- Inbox
  - Work┃②
    - email
```

> outdent

```markdown
- Inbox
- Work┃
  - email
```

### Scenario8d

A drag shows where it can go, its own place among them ([Drag1](drag.md#drag1)); set down where it
started, it changes nothing ([MoveSubtree8](move-subtree.md#movesubtree8)), and the keys go on from there
([MoveDown1](move-subtree-down.md#movedown1)).

```yaml
tags: core
```

```markdown
- Inbox
▸
- Work┃②
- Home
```

> drag ②

```yaml
dropPoints: |
  ▸
  - Inbox
  ▹ ▸
  - Work
  - Home
  ▸ ▸
```

> moveSubtree ②

```yaml
result: success
```

```markdown
- Inbox
- Work┃②
- Home
```

> moveSubtreeDown

```markdown
- Inbox
- Home
- Work┃
```

### Scenario9

Reorganizing across parents: an item moved down past its parent's end becomes the next item's first
child ([MoveDown7](move-subtree-down.md#movedown7)); a new sibling is typed after it and moved above it
([Enter2](enter.md#enter2), [MoveUp6](move-subtree-up.md#moveup6)); a whole parent moves past the other,
its child with it ([MoveDown1](move-subtree-down.md#movedown1)).

```yaml
tags: core
```

```markdown
- Inbox
  - call Ann
  - buy milk┃
- Errands
```

> moveSubtreeDown

```markdown
- Inbox
  - call Ann
- Errands
  - buy milk┃
```

> enter "post a letter" moveSubtreeUp

```markdown
- Inbox
  - call Ann
- Errands
  - post a letter┃
  - buy milk
```

> cursorDocStart cursorLineBoundaryForward moveSubtreeDown

```markdown
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
tags: core
```

```markdown
- a
  - b┃
    - b1
  - c
```

> outdent

```markdown
- a
- b┃
  - b1
  - c
```

> moveSubtreeUp

```markdown
- b┃
  - b1
  - c
- a
```

> deleteSubtree

```markdown
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

```markdown
- a┃
- b
```

> shiftEnter

```markdown
- a
  ┃◌
- b
```

> "more"

```markdown
- a
  more┃
- b
```

> cursorLineBoundaryBackward deleteContentBackward

```markdown
- a┃more
- b
```

> cursorLineBoundaryForward deleteContentForward

```markdown
- amore┃b
```

> undo

```markdown
- amore┃
- b
```

> redo

```markdown
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

```markdown
- a┃
  - b
- c
  - d
```

> enter

```markdown
- a
  - ┃◌
  - b
- c
  - d
```

> "x"

```markdown
- a
  - x┃
  - b
- c
  - d
```

> cursorLineBoundaryBackward deleteContentBackward

```markdown
- a┃x
  - b
- c
  - d
```

> cursorDocStart cursorLineBoundaryForward deleteContentForward

```markdown
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

```markdown
1. one
2. two┃
3. three
```

> moveSubtreeUp

```markdown
1. two┃
2. one
3. three
```

> moveSubtreeDown moveSubtreeDown

```markdown
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

```markdown
- a
  - b┃
- c
  - d
```

> moveSubtreeDown

```markdown
- a
- c
  - b┃
  - d
```

> moveSubtreeUp

```markdown
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

```markdown
- [ ] milk┃
```

> enter "bread" enter

```markdown
- [ ] milk
- [ ] bread
- [ ] ┃
```

> deleteContentBackward "two loaves" indent

```markdown
- [ ] milk
- [ ] bread
  - two loaves┃
```

> enter

```markdown
- [ ] milk
- [ ] bread
  - two loaves
  - ┃
```

> enter

```markdown
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
tags: common markup-task
```

```markdown
# Work
- email

# Home
- [x] ┃review
- water
```

> moveSubtreeUp

```markdown
# Work
- email
- [x] ┃review

# Home
- water
```

```yaml
result: success
```

> undo

```markdown
# Work
- email

# Home
- [x] ┃review
- water
```

### Scenario17

Pasting lines into a list as an outliner pastes them (`pasteLines: items`, as Roam,
WorkFlowy and Dynalist): on an empty item, they are items in its place
([Paste18](paste.md#paste18)); at the end of an item's text, items after it. By default they are
the item's text instead ([Paste1](paste.md#paste1)).

```yaml
tags: common
pasteLines: items
clipboard: |
  bread
  butter
```

```markdown
- milk┃
```

> enter

```markdown
- milk
- ┃
```

> paste

```markdown
- milk
- bread
- butter┃
```

> cursorDocStart cursorLineBoundaryForward paste

```markdown
- milk
- bread
- butter┃
- bread
- butter
```

### Scenario18

Pasting code at the end of an item's text and typing on: the code goes into the item, the caret at
the end of its last line, and the next item stays where it was ([PasteList12](paste-list.md#pastelist12)).

````yaml
tags: common
clipboard: |
  ```
  code
  ```
````

````markdown
- example┃
- next
````

> paste "!"

````markdown
- example
  ```
  code!┃
  ```
- next
````

### Scenario26

Folding a project away: Fold folds the item at the caret ([Fold9](fold.md#fold9)); Enter at its end
makes its next sibling, after the hidden children ([Fold1](fold.md#fold1)); the folded item moved
keeps its fold ([Fold4](fold.md#fold4)); Unfold opens it ([Fold12](fold.md#fold12)).

```yaml
tags: core
```

```markdown
- Work┃
  - email
  - report
- Home
```

> fold

```markdown
- Work┃⟦folded⟧
  - email
  - report
- Home
```

> enter

```markdown
- Work⟦folded⟧
  - email
  - report
- ┃
- Home
```

> "Errands"

```markdown
- Work⟦folded⟧
  - email
  - report
- Errands┃
- Home
```

> cursorDocStart cursorLineBoundaryForward moveSubtreeDown

```markdown
- Errands
- Work┃⟦folded⟧
  - email
  - report
- Home
```

> unfold

```markdown
- Errands
- Work┃
  - email
  - report
- Home
```

### Scenario27

Working inside one item: Zoom In zooms into the item at the caret ([Zoom6](zoom.md#zoom6)); Enter at
the zoom root's end makes its first child, inside the zoom ([Zoom1](zoom.md#zoom1)); Zoom Out leaves
it ([Zoom7](zoom.md#zoom7)).

```yaml
tags: core
```

```markdown
- Work
- Home┃
  - plants
```

> zoomIn

```markdown
- Work
- Home┃⟦zoomed⟧
  - plants
```

> enter

```markdown
- Work
- Home⟦zoomed⟧
  - ┃◌
  - plants
```

> "water"

```markdown
- Work
- Home⟦zoomed⟧
  - water┃
  - plants
```

> zoomOut

```markdown
- Work
- Home
  - water┃
  - plants
```

### Scenario28

Filing two items at once: Shift-Down selects the item at the caret, then the next
([Select11](select.md#select11)); Tab indents them together ([Indent9](indent.md#indent9)); Alt-Up
moves them up together ([MoveUp10](move-subtree-up.md#moveup10)); Backspace deletes them
([SubtreeEdit1](subtree-selection.md#subtreeedit1)), and Undo brings them back ([Undo1](undo.md#undo1)).

```yaml
tags: core
```

```markdown
- Inbox
  - post a letter
- call Ann┃
- buy milk
- Home
```

> selectNodeDown selectNodeDown

```markdown
- Inbox
  - post a letter
- call Ann⟦selected⟧
- buy milk⟦selected⟧
- Home
```

> indent

```markdown
- Inbox
  - post a letter
  - call Ann⟦selected⟧
  - buy milk⟦selected⟧
- Home
```

> moveSubtreeUp

```markdown
- Inbox
  - call Ann⟦selected⟧
  - buy milk⟦selected⟧
  - post a letter
- Home
```

> deleteContentBackward

```markdown
- Inbox┃
  - post a letter
- Home
```

> undo

```markdown
- Inbox
  - call Ann⟦selected⟧
  - buy milk⟦selected⟧
  - post a letter
- Home
```

### Scenario29

Moving an item with its children by cut and paste: the item selected is cut with them
([SubtreeEdit6](subtree-selection.md#subtreeedit6)); pasted at the end of an item's text, it goes
after that item ([PasteList1](paste-list.md#pastelist1)); pasted into an empty item, it takes its
place ([PasteList5](paste-list.md#pastelist5)).

```yaml
tags: core
```

```markdown
- Today┃
- Inbox
  - call Ann
- Later
```

> cursorLineDown selectNodeDown

```markdown
- Today
- Inbox⟦selected⟧
  - call Ann
- Later
```

> cut

```markdown
- Today┃
- Later
```

> cursorDocStart cursorLineBoundaryForward paste

```markdown
- Today
- Inbox
  - call Ann┃
- Later
```

> cursorLineDown cursorLineBoundaryForward enter

```markdown
- Today
- Inbox
  - call Ann
- Later
- ┃
```

> paste

```markdown
- Today
- Inbox
  - call Ann
- Later
- Inbox
  - call Ann┃
```

### Scenario30

Moving a word: a cut in an item's text takes it out ([Cut1](copy.md#cut1)); pasted at another item's
end it is text there; a copy of a selection in an item's text is its text ([Copy1](copy.md#copy1)).

```yaml
tags: core
```

```markdown
- call Ann «tomorrow»
- buy milk
```

> cut

```markdown
- call Ann ┃
- buy milk
```

> cursorLineDown cursorLineBoundaryForward " " paste

```markdown
- call Ann␠
- buy milk tomorrow┃
```

> selectLineBoundaryBackward copy

```markdown
- call Ann␠
- ┃«buy milk tomorrow»
```

## Notes and sections

### Scenario19

Notes under a heading: Enter after the heading starts its first paragraph
([Gap12](gaps.md#gap12)), Enter in a paragraph starts another ([Enter12](enter.md#enter12)), and
paragraphs move among themselves ([MoveUp4](move-subtree-up.md#moveup4)).

```yaml
tags: core
```

```markdown
# Notes┃
```

> enter "first idea"

```markdown
# Notes
first idea┃
```

> enter "second"

```markdown
# Notes
first idea

second┃
```

> moveSubtreeUp

```markdown
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

```markdown
# Trip┃
```

> enter "Pack light." enter "Book the train."

```markdown
# Trip
Pack light.

Book the train.┃
```

> shiftEnter "Seat 42."

```markdown
# Trip
Pack light.

Book the train.
Seat 42.┃
```

> moveSubtreeUp

```markdown
# Trip
Book the train.
Seat 42.┃

Pack light.
```

> undo

```markdown
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
tags: core
```

```markdown
one┃two
```

> enter

```markdown
one

┃two
```

> deleteContentBackward

```markdown
one┃two
```

> enter cursorDocStart cursorLineBoundaryForward

```markdown
one┃

two
```

> deleteContentForward

```markdown
one┃two
```

### Scenario21b

The same at a sentence boundary: the space at the split goes from both paragraphs, and the join
glues the sentences, the default's cost ([Enter44](enter.md#enter44)).

```yaml
tags: core
```

```markdown
One.┃ Two.
```

> enter

```markdown
One.

┃Two.
```

> deleteContentBackward

```markdown
One.┃Two.
```

### Scenario22

Reordering sections: a heading moves with its section, past one of its level and back
([MoveDown4](move-subtree-down.md#movedown4), [MoveUp3](move-subtree-up.md#moveup3)), its gaps with it
([Gap1](gaps.md#gap1), [Gap2](gaps.md#gap2)).

```yaml
tags: core
```

```markdown
# Work┃

- email

# Home

- plants
```

> moveSubtreeDown

```markdown
# Home

- plants

# Work┃

- email
```

> moveSubtreeUp

```markdown
# Work┃

- email

# Home

- plants
```

### Scenario23

Typed text in a section stays text: Enter splits a heading, its rest a paragraph with `2.`
escaped ([Enter41](enter.md#enter41)); Shift-Enter breaks the line, where the escape ourus wrote is no
longer needed (`2.` can't interrupt the paragraph) and goes; undo takes each step back
([Undo1](undo.md#undo1)).

```yaml
tags: rare
```

```markdown
# Plan┃2. draft
```

> enter "revise "

```markdown
# Plan
revise ┃2\̬. draft
```

> shiftEnter

```markdown
# Plan
revise 
┃2. draft
```

> undo undo undo

```markdown
# Plan┃2. draft
```

### Scenario24

Making a list out of a paragraph's lines, typing `- ` at the start of each: the first makes the
line an item of the paragraph's list, and the line below reads as more of that item, until it gets
a marker of its own ([Typing3](typing.md#typing3)).

```yaml
tags: common free-form
```

```markdown
Shopping:
┃milk
bread
```

> "- "

```markdown
Shopping:
- ┃milk
bread
```

> cursorLineDown cursorLineBoundaryBackward "- "

```markdown
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

```markdown
- [ ] milk
- [ ] bread
  - two loaves
- ┃
```

> enter "Shop closes at six."

```markdown
- [ ] milk
- [ ] bread
  - two loaves

Shop closes at six.┃
```
