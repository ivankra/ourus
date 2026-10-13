# BlockNote

[`driver.ts`](driver.ts) drives [BlockNote](https://www.blocknotejs.org/), a block editor of Notion's
kind (paragraphs, headings, list items, tasks and code are blocks, and any block can have children),
a React library on ProseMirror and Tiptap (`TypeCellOS/BlockNote`, MPL-2.0 for its core). It runs in
its site's minimal
example, https://www.blocknotejs.org/examples/basic/minimal: the library's default editor
(`useCreateBlockNote()` and `BlockNoteView`), built from BlockNote's main branch, whose
`@blocknote/core` is 0.55.0, on Tiptap 3 (the site's build `bk1iItOHquqUUmKjnjftf` on 2026-10-14; the
last release, v0.55.0, is of 2026-09-22). The spec's
buffers are projected onto blocks (the `block` model, [`../lib/outline.ts`](../lib/outline.ts)). Last results:
[`sxs.md`](sxs.md).

## Which page

The site's [demo](https://www.blocknotejs.org/demo) is collaborative: it opens a WebSocket to a Yjs
room on another server (`wss://yhub.teleportal.tools/api/ws/v1/blocknote/demo-…`), says "Share the
URL above to collaborate with others", and adds comments and AI, with Yjs's own undo. Edits there go
to that server and to whoever is in the room, so it isn't driven. The minimal example opens no
WebSocket, keeps its document in the page, and is BlockNote as a developer gets it.

## Keys (Linux)

BlockNote's defaults (its block keyboard shortcuts, and ProseMirror's and Tiptap's history beneath):

| action | keys |
| --- | --- |
| `enter`, `shiftEnter` | Enter (splits a block; on an empty list item, makes it a paragraph), Shift+Enter (a line break in the block) |
| `indent`, `outdent` | Tab, Shift+Tab: nest the block, with its children, under the one before; unnest it |
| `moveBlockUp`, `moveBlockDown` | Ctrl+Shift+Up, Ctrl+Shift+Down ("move block up", "down": the block with its children) |
| `deleteContentBackward`, `deleteContentForward` | Backspace (at a list item's start, makes it a paragraph first), Delete |
| `deleteSoftLineBackward` | Shift+Home, then Backspace (no command for it) |
| `pasteStructured`, `pastePlain` | Ctrl+V, Ctrl+Shift+V |
| `undo`, `redo` | Ctrl+Z, Ctrl+Shift+Z |
| caret motions | arrows, Home, End, Ctrl+Home, Ctrl+End; `select…` with Shift |

`deleteSubtree` and `duplicateNode` have no key: deleting or duplicating a block goes through the
block's side menu (its drag handle), with the mouse. Their examples are skipped.

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
- **A test's outline** goes in through BlockNote's API (`replaceBlocks` over the whole document):
  each block a bullet list item at its depth (`children` nest), or by its canonical text a heading
  (`## `, `level`), a task (`[ ] `, a `checkListItem`) or a code block (a fence, `codeBlock` with
  its `language`).
- **The history is emptied** after loading: loading is a transaction, which undo would undo, so the
  view's state is made anew from the same document and plugins (`EditorState.create`), with no
  history. Undo after loading does nothing, as in a document just opened.
- **The caret** is a ProseMirror selection: a block, by its place in document order, and an offset in
  its content, past the prefix its canonical text has (`[ ] `, `## `, a fence's line).
- **Reading** is `editor.document`: each block's text as the canonical form has it, a heading as
  `#`s, a task as `[ ] ` or `[x] `, a code block as a fence; and the caret from ProseMirror's
  selection, when the editor has the focus. A paragraph reads as its text, as the projection has a
  paragraph. BlockNote makes one of a list item (Backspace at its start, Enter on an empty one), and
  marking it (`¶ `) was weighed: of the 52 differences that read a paragraph, it gave 3 more, all
  where ourus made a paragraph there too, and in none of the rest did a paragraph read as text agree
  where an item was expected.
- **Its error reporting** (Sentry, through the site's own `/monitoring`) is answered by the proxy
  ([`proxy.ts`](proxy.ts)): a run sends the site nothing.
- An example takes about 100 ms; the whole spec, under 40 s.

## Starts BlockNote won't hold

Measured (each was a start the load check found held otherwise), and skipped with the reason:

| reason | what BlockNote does | e.g. |
| --- | --- | --- |
| a caret in a task's checkbox | the checkbox is a widget; the caret goes to the text | `tasks.md › TaskBackspace1` |
| a caret on a code block's fence | the code block holds the code alone, its language a menu | `fences.md › Fence6`, `7`, `15` |

## What BlockNote does

- **Backspace at a list item's start makes it a paragraph**, keeping it where it is, children and
  all; a second Backspace joins it to the block before (`backspace.md › Backspace1`, `3`). Delete at
  an item's end joins the next (`del.md › Delete1` agrees).
- **Enter on an empty list item makes it a paragraph** (`enter.md › Enter28`, `tasks.md ›
  TaskEnter2`), as Enter on an empty task does; where ourus makes a paragraph too, they agree
  (`tasks.md › TaskEnter1`).
- **Enter and Shift+Enter keep the space** at the split (`enter.md › Enter1`, `shift-enter.md ›
  ShiftEnter1`): most of the whitespace verdicts.
- **Tab nests a heading and keeps its level** (`indent.md › Indent12`), as Logseq does.
- **Shift+Tab at the top level** does nothing in the editor, and the browser takes the key: the focus
  leaves the editor (`outdent.md › DirectOutdent2`, `3`).
- **Pasted lines go into the block**, as line breaks, with either key (`paste.md › Paste3`, `Paste7`).
- **Moves carry the block's children** (`block-up.md › BlockUp1` agrees).
