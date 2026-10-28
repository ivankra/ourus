# BlockNote

[`driver.ts`](driver.ts) drives [BlockNote](https://www.blocknotejs.org/), a block editor of Notion's
kind (paragraphs, headings, list items, tasks and code are blocks, and any block can have children),
a React library on ProseMirror and Tiptap (`TypeCellOS/BlockNote`, MPL-2.0 for its core). It runs in
its site's minimal
example, https://www.blocknotejs.org/examples/basic/minimal: the library's default editor
(`useCreateBlockNote()` and `BlockNoteView`), built from BlockNote's main branch, whose
`@blocknote/core` is 0.55.0, on Tiptap 3 (the site's build `bk1iItOHquqUUmKjnjftf` on 2026-10-14; the
last release, v0.55.0, is of 2026-09-22). The spec's
buffers are projected onto blocks (the `block` model, [`../lib/block.ts`](../lib/block.ts)) in free form
(`freeForm`): a paragraph, a heading or code is a block outside every list (`¶` in the drawings), as
BlockNote's own blocks are, a list item an item.

## Keys (Linux)

BlockNote's defaults (its block keyboard shortcuts, and ProseMirror's and Tiptap's history beneath):

| action | keys |
| --- | --- |
| `enter` | Enter (splits a block; on an empty list item, makes it a paragraph) |
| `shiftEnter` | Shift+Enter (a line break in the block) |
| `indent` | Tab: nests the block, with its children, under the one before |
| `outdent` | Shift+Tab: unnests it |
| `moveSubtreeUp` | Ctrl+Shift+Up ("move block up": the block with its children) |
| `moveSubtreeDown` | Ctrl+Shift+Down ("move block down") |
| `move ②` | the mouse: the block hovered, its side menu's drag handle dragged (HTML5 drag and drop, ProseMirror's `drop`) to the place (`blockNoteDrop` in [`driver.ts`](driver.ts), [`../lib/drag.ts`](../lib/drag.ts)) |
| `deleteContentBackward` | Backspace (at a list item's start, makes it a paragraph first) |
| `deleteContentForward` | Delete |
| `deleteSoftLineBackward` | Shift+Home, then Backspace (no command for it) |
| `deleteSubtree` | *missing*: a block is deleted through its side menu (its drag handle), with the mouse; its examples are skipped |
| `duplicateSubtree` | *missing*: duplicated through the same menu; its examples are skipped |
| `pasteStructured` | Ctrl+V |
| `pastePlain` | Ctrl+Shift+V |
| `undo` | Ctrl+Z |
| `redo` | Ctrl+Shift+Z |

Other shortcuts (each block type's `keyboardShortcuts` in `@blocknote/core`, Tiptap's marks; each
pressed in the example, 2026-10-18):

| shortcut | keys | what it does |
| --- | --- | --- |
| Paragraph, Heading 1 to 6 | Ctrl+Alt+0, Ctrl+Alt+1 to 6 | the block's type |
| Numbered, bullet, check, toggle list | Ctrl+Shift+7, 8, 9, 6 | the block as a list item of that kind |
| Quote | Ctrl+Alt+Q | the block as a quote |
| Bold, italic, underline, strike, inline code | Ctrl+B, Ctrl+I, Ctrl+U, Ctrl+Shift+S, Ctrl+E | |
| Slash menu | `/` | insert or turn into a block (code has no key: its menu badge, Ctrl+Alt+C, does nothing here) |
| Select all | Ctrl+A | |

## Which page

The site's [demo](https://www.blocknotejs.org/demo) is collaborative: it opens a WebSocket to a Yjs
room on another server (`wss://yhub.teleportal.tools/api/ws/v1/blocknote/demo-…`), says "Share the
URL above to collaborate with others", and adds comments and AI, with Yjs's own undo. Edits there go
to that server and to whoever is in the room, so it isn't driven. The minimal example opens no
WebSocket, keeps its document in the page, and is BlockNote as a developer gets it.

## Stack

**Built on Tiptap 3, on ProseMirror**: BlockNote is a block layer over a Tiptap editor (its blocks a
ProseMirror schema of `blockGroup` and `blockContainer` nodes, its keys and commands Tiptap
extensions). Tana's document editor is a Tiptap editor too.

TypeScript, a set of npm packages: `@blocknote/core` (the editor, its block schema, its API),
`@blocknote/react` (the React view and UI), `@blocknote/mantine` (the default look); the site is
Next.js on Vercel. The editor's document is ProseMirror's; `editor.document` is it as BlockNote's
blocks (`{ id, type, props, content, children }`).

Repo: https://github.com/TypeCellOS/BlockNote

## Setting up and reading a test

- **The editor** is BlockNote's `BlockNoteEditor`, found through React: the `editor` prop of the view
  on `.bn-container`'s fiber (`__reactFiber$…`). Tiptap's editor is on `.ProseMirror` (`.editor`), and
  its `editorView` is ProseMirror's view.
- **A test's outline** goes in through BlockNote's API (`replaceBlocks` over the whole document): a
  free block a `paragraph`, or by its canonical text a `heading` (`## `, `level`) or a `codeBlock` (a
  fence, its `language`); an item a `bulletListItem`, a `numberedListItem` (`1. `; a run's first
  number its `start`) or a `checkListItem` (`[ ] `); `children` nest. What a free block owns in
  ourus's outline (a heading its section, a paragraph the list right after it) goes beside it, as
  Markdown has them and as a BlockNote user's blocks are (`lift`); the read nests it back, among each
  block's siblings (`own`), a block's own children staying its children (BlockNote nests any block).
- **The history is emptied** after loading: loading is a transaction, which undo would undo, so the
  view's state is made anew from the same document and plugins (`EditorState.create`), with no
  history. Undo after loading does nothing, as in a document just opened.
- **The caret** is a ProseMirror selection: a block, by its place in document order, and an offset in
  its content, past the prefix its canonical text has (`[ ] `, `## `, a fence's line).
- **Reading** is `editor.document`: each block's text as the canonical form has it, a heading as
  `#`s, a task as `[ ] ` or `[x] `, a code block as a fence (longer than any run of backticks
  starting a line of the code, as Markdown needs: `fences.md › Fence62`), any block but a list item
  free; and the caret from ProseMirror's selection, when the editor has the focus. A block's text
  holds a blank line (Shift+Enter twice), so an item's paragraphs right after its text are its
  block's text (`paragraphsInBlock`, since 2026-10-25: `obsidian-true-outliner.md › TO-S11`). A
  block's formatting (its content's `styles`: bold, italic, strike, code; its link nodes) is read as
  Markdown, the caret mapped into it (`runsAsMarkdown` in lib/block.ts, since 2026-10-25: 6
  disagreements that were the read's to agree).
- **Free form.** Every block had gone in as a bullet item, and a paragraph read as
  an item's text: BlockNote's commonest move, making an item a paragraph (Backspace at its start,
  Enter or Shift+Enter on an empty one), drew as nothing done, and the spec's paragraphs and
  headings were played as bullets, which BlockNote un-lists before it joins them. A heading's section
  went in as its children, so a move or a heading made a paragraph carried them, as no BlockNote user's
  heading does. Free form, with owned blocks beside their owner: 84 more examples run (the `free-form`
  cases: 135 skipped before, none now), 76 run without the paragraph and heading adaptations, and the
  verdicts that changed were each read in the app: the joins of paragraphs agree, moves of a heading
  or a paragraph disagree (BlockNote moves the block alone), Tab on a paragraph disagrees (it stays a
  paragraph).
- **Its error reporting** (Sentry, through the site's own `/monitoring`) is answered by the proxy
  ([`proxy.ts`](proxy.ts)): a run sends the site nothing.
- An example takes about 100 ms; the whole spec, under 40 s.

## Starts BlockNote won't hold

Measured (each was a start the load check found held otherwise), and skipped with the reason:

| reason | what BlockNote does | e.g. |
| --- | --- | --- |
| a caret in a task's checkbox | the checkbox is a widget; the caret goes to the text | `tasks.md › TaskBackspace1` |
| a caret on a code block's fence | the code block holds the code alone, its language a menu | `fences.md › Fence6`, `7`, `15` |
| a heading or a code block as a list item | a heading and a code block are blocks of their own, not a list item's content | `backspace.md › Backspace18e`, `fences.md › Fence5` |
| a numbered list right after another | BlockNote numbers a run of numbered blocks on from its first, whose `start` alone it draws | `obsidian-true-outliner.md › #228` |

A number that is text (`2\. y`) loaded without its `.` until 2026-10-18 (the escape's backslash and the
dot cut together): `paste-old.md › PasteOld81`, an error, now run.

## Drag and drop

A block is dragged by its side menu's handle, shown while the block is hovered (`blockDragStart`), an
HTML5 drag that Playwright's mouse makes in Chromium; the drop is ProseMirror's (`dropPoint`): beside
the block whose text the pointer is over, before it in the text's first half, after it in the second
(before it always where it has children), and below the last block, last at the top level. x picks no
depth. The driver hovers the block, waits for its menu (not one fading out, which keeps its handle
where the next is drawn), then presses the handle and drops at the place's block.

- **A drop beside a block lands where ourus's does** (Drag1, Drag2, Drag13 agree, stable over three
  runs).
- **No place inside a block with no children**: a drop into a leaf (Drag3, Drag8, Scenario8c) has no
  gesture here, and skips as it plays.
- **A heading moves alone**, its level kept: a heading owns no blocks in BlockNote, so what is under it
  in ourus's section stays where it was (Drag15: `### D` moved, `#### E` left under `# C`; Drag16).
- **No caret after a drop**: Scenario8b, which types after it, skips as it plays.
- **The cover rule is ourus's**: with text selected across blocks, a press on the handle of a block
  in it drags the blocks the selection is in (a node selection of them, `blockDragStart`), any other
  press the block alone. Drag4, Drag20, Drag5 and Drag5b land as ourus's, nothing selected after (the
  editor blurred, a collapsed selection: `caret`). There is no selection of blocks apart from text: the
  driver selects from the first block's content start to the end of the last one's subtree, and
  `read` reports a selection from a block's start to another's end, or a node selection, as blocks.
- **Tab on text selected across blocks goes to the formatting toolbar**, which a selection of text
  shows, nesting nothing, and Shift+Tab back out of the editor, unnesting nothing (Indent9, Indent27,
  Outdent8, Outdent10, Outdent12 disagree; its `nestBlock` would nest them).

## What BlockNote does

Each played in a probe and, where it decides, read in BlockNote's source (v0.55.0, `TypeCellOS/BlockNote`):

- **Backspace at a list item's start makes it a paragraph**, keeping it where it is, children and
  all; a second Backspace joins it to the block before (`backspace.md › Backspace1`, `3`). The
  driver declares it, `backspaceAtItemStart: unwrap` (since 2026-10-25). Delete at
  an item's end joins the next (`delete.md › Delete1` agrees). At a task's start, likewise a paragraph,
  where ourus keeps an item without its checkbox (`tasks.md › TaskBackspace2`).
- **Backspace at a paragraph's start joins it** to the block before (`backspace.md › Backspace10`
  agrees); after another paragraph, the text joined, where ourus, taking the blank line, makes one
  paragraph of two lines (`Backspace12`: Enter's inverse is two Backspaces in ourus, one here).
- **Enter on an empty list item makes it a paragraph** (`enter.md › Enter28`, `tasks.md ›
  TaskEnter2`), as Enter on an empty task does, and as **Shift+Enter** on one does too; where ourus
  makes a paragraph too, they agree (`tasks.md › TaskEnter1`). On an empty paragraph nested, Enter
  outdents it (`handleEnter`'s first command, `liftItem`). Declared, `enterOnEmptyItem: unwrap` (since
  2026-10-25: `Enter7`, `Enter21`, `Enter27`, `Enter28`); the last item of a nested list it makes a
  paragraph too, where ourus outdents it, with every value (`Enter5`, `TaskEnter2`).
- **Backspace right after a task's checkbox** makes the task a paragraph where it is, its checkbox
  gone with its marker (`TaskBackspace2`, `TaskBackspace3`, `SoftBackspace1`): declared,
  `taskEditing: unwrap` (since 2026-10-25).
- **A heading and a paragraph are one block each**: a move takes it alone, its section or the list
  after it staying (`move-subtree-down.md › MoveDown19`, `MoveDown24`); Tab nests a paragraph, a
  paragraph still (`indent.md › Indent21`), and Shift+Tab leaves an item under a paragraph an item
  (`outdent.md › Outdent15`).
- **Moves at a parent's edge leave it**: up from a first child, before the parent; down from a last
  child, after it; into a sibling with children as its first or last child (`getMoveUpPlacement`,
  `getMoveDownPlacement` in `moveBlocks.ts`): `MoveUp5`, `MoveDown7`, `scenarios.md › Scenario8`.
- **Numbering**: a run of numbered blocks counts on from its first's `start`; a later block's `start`
  isn't drawn (measured: the read's numbers are the ones drawn, `::before`), so a move that takes the
  first away numbers the run from 1 (`MoveDown23`).
- **Pasted plain text is read as Markdown** (`plainTextAsMarkdown`, true by default, in
  `pasteExtension.ts`), with Ctrl+V and Ctrl+Shift+V alike: `1. Introduction` pasted mid-text is a
  list of one item, whose text alone joins the paragraph (`paste-old.md › PasteOld31`: the number lost).
- **Undo groups by time**: ProseMirror's history puts edits less than 500 ms apart in one undo step, so
  Enter, Tab and a typed `x` at the runner's pace (100 ms) undo at once (`undo.md › Undo5`; with 500 ms
  between keys, `--slow=400`, they undo one at a time and agree). And under a full run's load
  (seventeen apps at once), `scenarios.md › Scenario16` (a move, typing, two undos) once came out with
  the move not undone; alone it agreed five times of five: the one verdict that moved between
  2026-10-18's full runs.
- **A BlockNote bug: Shift+Enter keeps a selection**: the hard break goes in at its head
  (`tr.insert(tr.selection.head, hardBreak)` in `KeyboardShortcutsExtension.ts`), the selected text
  left (`obsidian-true-outliner.md › S13`; a selection made with Shift and the arrows the same).
- **Enter and Shift+Enter keep the space** at the split (`enter.md › Enter1`, `shift-enter.md ›
  ShiftEnter1`): most of the whitespace verdicts.
- **Tab nests a heading and keeps its level** (`indent.md › Indent12`), as Logseq does.
- **Shift+Tab at the top level** does nothing in the editor, and the browser takes the key: the focus
  leaves the editor (`outdent.md › DirectOutdent2`, `3`).
- **Pasted lines go into the block**, as line breaks, with either key (`paste-old.md › PasteOld3`, `PasteOld7`).
- **Moves carry the block's children** (`move-subtree-up.md › MoveUp1` agrees).
