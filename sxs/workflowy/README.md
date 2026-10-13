# WorkFlowy

[`driver.ts`](driver.ts) drives the live app, as WorkFlowy's "Try WorkFlowy Instantly" page
(https://beta.workflowy.com/demo/embed/) embeds it: https://beta.workflowy.com/guide/embed/, for an
anonymous user, with a demo outline and no login. It is the full app (4.3.2610131317 on 2026-10-13),
and nothing it sends reaches a server: its error reports and payment scripts are blocked, and
[`proxy.ts`](proxy.ts) refuses its "signal" WebSocket (which tells a signed-in user's other tabs about
changes) and answers its calls to save a setting. Last results: [`sxs.md`](sxs.md).

**Markdown pasting is on.** WorkFlowy's "Recognize markdown pasting" (`markdown_pasting`:
"if the text you paste looks like Markdown, do our best to convert it to WorkFlowy formatting
options") turns pasted `> q`, `1. x` and `# h` into a quote's text, list items and a heading; without
it they are pasted as written. ourus's structured paste reads pasted Markdown, so the driver turns it
on (`WF.Features.enable`); the anonymous demo has it off. Turning it on saves it to the server
(`/change_settings`, `/features/enable/...`), which the proxy answers instead.

Not used: https://workflowy.com/wf-demo/, a widget of the landing page (`workflowy-demo-base.js`,
51 KB) that imitates a few keys with code of its own (Enter, Tab, Backspace on an empty item, Up and
Down): no undo, no moving, no paste, no joining. It isn't WorkFlowy.

## Keys (Linux)

From WorkFlowy's keymap (`wf-base.js`): on a Mac several are Cmd+Shift, and moving is Ctrl+Shift on
ChromeOS.

| action | keys |
| --- | --- |
| `enter`, `shiftEnter` | Enter, Shift+Enter (to the note and back) |
| `indent`, `outdent` | Tab, Shift+Tab |
| `deleteContentBackward`, `deleteContentForward` | Backspace, Delete |
| `moveBlockUp`, `moveBlockDown` | Alt+Shift+Up, Alt+Shift+Down |
| `deleteSubtree` | Ctrl+Shift+Backspace |
| `duplicateNode` | Alt+Shift+D |
| `deleteSoftLineBackward` | Shift+Home, Backspace |
| `pasteStructured`, `pastePlain` | Ctrl+V, Ctrl+Shift+V |
| `undo`, `redo` | Ctrl+Z, Ctrl+Y |
| `cursorDocStart` | Ctrl+Home ("focus first"), which lands in the title of the item the test is zoomed into; then Down, to the first block; then Home |
| `cursorDocEnd` | Ctrl+End ("focus last"), then End |
| caret motions | arrows, Home, End; `select…` with Shift (Shift+Up and Down select items, not text) |

## Stack

A closed-source web app, one large bundle (`wf-base.<hash>.js`, about 4 MB: React, jQuery and Immer
in it) and a runtime bundle beside it, with web workers for search and tagging. An item's name and
note are each edited in a `contenteditable` of WorkFlowy's own, and items are changed through its
scripting API (`window.WF`) and Immer recipes on their metadata. The desktop and mobile apps wrap the
same web app.

## Setting up and reading a test

- **One item per page**, `ourus sxs`, at the top of the outline and zoomed into: a test deletes
  its children and makes its own, through WorkFlowy's scripting API (`window.WF`): `createItem`,
  `setItemName` and `setItemNote` (rich text: the text is escaped), the item type
  (`setMetadata`, `layoutMode`), `applyLocalComplete`. A new item's children show once it is expanded
  (`WF.expandItem`). The caret goes in by focusing the name or note and selecting there.
- **An item is a name and a note.** A block's first line is the name, the rest is the note, and the
  caret in the note is past the name and the line break. A note being edited exists even when empty
  (Shift+Enter opened it); an empty note has nothing to focus, so a test starting with the caret in
  one gets it as a user does, with Shift+Enter at the name's end, and the runner checks the outcome
  is the starting state.
- **Item types stand for Markdown**: a to-do is a task (`[ ] `, `[x] ` when completed), H1 to H3 are
  `#` to `###` headings, and a completed bullet reads as `[x] `. A caret can't go into a checkbox or a
  heading's `#`s (they are the type, not text), so tests starting there are skipped; so are code,
  tables and other atoms, and headings deeper than H3.
- **Reading**: the item tree from `WF`, except the name or note being edited, which is read from its
  editor (`.editor.plainText`, and the caret from `WF.DomEditableText.selectedIn`): WorkFlowy stores
  what is typed half a second after typing stops (`WF.Editor.saveLater`).

## What WorkFlowy does that a driver has to know

- **Outdenting is logical**: Shift+Tab moves an item past its parent, and its later siblings stay with
  the parent (ourus's `outdent: logical`, which the driver declares: those examples run, and the
  direct-outdent ones disagree).
- **Backspace joins siblings, not a child into its parent**: at the start of an item it merges into
  the previous sibling, but at the start of a first child it does nothing.
- **Item types don't reset**: Backspace at the start of an H1 or a to-do leaves the type.
- **The test is zoomed into an item, whose title is editable** and comes before the first block:
  Ctrl+Home goes there (hence the emulation above), and so does Up from the first block. That is an
  artifact of the setup, and two examples show it (`cursor.md › CursorUp1`, `zzz.md › H2`: the
  caret leaves the blocks).
- **Shift+Enter goes between the name and the note.** From the name it opens the note (the text
  stays in the name); from the note it goes back, and an empty note goes away.
- **Tab in a note types a tab**; it indents only from the name.
- **Enter in a name with a note** makes a new item after it, and the note stays where it was.
- **The note doesn't join the name**: Delete at the end of a name, or Backspace at the start of a
  note, leave them apart.
- **Animations are counted** (`WF.GuiAnimate.animationsAreInProgress()`), which is the driver's busy
  signal; a structural key settles in about 350 ms, mostly a 300 ms timer of WorkFlowy's.
- `setMetadata` takes an Immer recipe: it changes the draft and returns nothing (an arrow function
  that returns the assignment throws "Immer error 4").
- The live demo logs `can't create uuidv5 for anonymous user` while loading: something of a signed-in
  user's, and harmless here.

## WorkFlowy bugs met on the way

1. **Backspace at the start of a note adds a line break to it.** The note's editor gets `two\n`
   where it had `two`, and that is what is stored once it saves (`backspace.md › Backspace9`).

## Internals

WorkFlowy's scripting API and item internals, as the driver uses them (`window.WF`): `rootItem`, `createItem(parent, index)`, `setItemName` / `setItemNote`
(rich text: escape `&<>`), `editGroup(fn)` (batches edits; async), `zoomTo`, `currentItem`,
`deleteItem` (needs the item on screen), `expandItem` (a new item's children show only once expanded),
`completedVisible` / `toggleCompletedVisible`, `focusedItem`, `getSelection` / `setSelection` (items),
`getItemById`, `AppBuild.number`, `Features.enable`, `GuiAnimate.animationsAreInProgress`,
`Editor.saveLater` (the 500 ms save), `DomEditableText.selectedIn(el)`. An item's internals:
`item.data.projectReferenceOrThrow`, with `setMetadata(recipe)` (an Immer recipe: change the draft,
return nothing; `layoutMode` among `bullets todo h1 h2 h3 p numbered code-block board table divider
dashboard check`) and `getItem()` (`layoutMode`, `applyLocalComplete`). The editors are the
contenteditable `.name > .content` and `.notes > .content` of an item's element (`item.getElement()`),
each with an `editor` object. The keymap is the table `l2[...]` in `wf-base.<hash>.js`.
