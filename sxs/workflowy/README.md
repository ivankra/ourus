# WorkFlowy

[`driver.ts`](driver.ts) drives the live app, as WorkFlowy's "Try WorkFlowy Instantly" page
(https://beta.workflowy.com/demo/embed/) embeds it: https://beta.workflowy.com/guide/embed/, for an
anonymous user, with a demo outline and no login. It is the full app (4.3.2610131317 on 2026-10-13),
and nothing it sends reaches a server: its error reports and payment scripts are blocked, and
[`proxy.ts`](proxy.ts) refuses its "signal" WebSocket (which tells a signed-in user's other tabs about
changes) and answers its calls to save a setting.

**Markdown pasting is on.** WorkFlowy's "Recognize markdown pasting" (`markdown_pasting`:
"if the text you paste looks like Markdown, do our best to convert it to WorkFlowy formatting
options") turns pasted `> q`, `1. x` and `# h` into a quote's text, list items and a heading; without
it they are pasted as written. ourus's structured paste reads pasted Markdown, so the driver turns it
on (`WF.Features.enable`); the anonymous demo has it off. Turning it on saves it to the server
(`/change_settings`, `/features/enable/...`), which the proxy answers instead.

**The server's features are on.** The demo's settings carry only their own features, which replace
the ones WorkFlowy's server enables for the same anonymous user (`/get_enabled_features/`:
`numbered_list`, `dates`, `slash-command`, `table`, `check`, `calendar_node`, ...). Without them a numbered
item is drawn as a bullet (its layout kept), `1. ` typed makes nothing, and pasted numbers stay text:
not the WorkFlowy anyone signed in uses. `open` enables each (2026-10-18; numbered lists were off in
every run before). The calendar's feature shows a "NEW Calendar" tip in the top bar, which takes no
focus.

Not used: https://workflowy.com/wf-demo/, a widget of the landing page (`workflowy-demo-base.js`,
51 KB) that imitates a few keys with code of its own (Enter, Tab, Backspace on an empty item, Up and
Down): no undo, no moving, no paste, no joining. It isn't WorkFlowy.

## Keys (Linux)

From WorkFlowy's keymap (`wf-base.js`): on a Mac several are Cmd+Shift, and moving is Ctrl+Shift on
ChromeOS.

| action | keys |
| --- | --- |
| `enter` | Enter |
| `shiftEnter` | Shift+Enter (to the note and back) |
| `indent` | Tab |
| `outdent` | Shift+Tab |
| `moveSubtreeUp` | Alt+Shift+Up |
| `moveSubtreeDown` | Alt+Shift+Down |
| `deleteContentBackward` | Backspace |
| `deleteContentForward` | Delete |
| `deleteSoftLineBackward` | Shift+Home, Backspace |
| `deleteSubtree` | Ctrl+Shift+Backspace |
| `duplicateSubtree` | Alt+Shift+D |
| `pasteStructured` | Ctrl+V |
| `pastePlain` | Ctrl+Shift+V |
| `undo` | Ctrl+Z |
| `redo` | Ctrl+Y |

Other shortcuts (from the keymap, `n2[...]` in `wf-base`, the PC side; "measured" where played in the
demo, 2026-10-18):

| command | keys | what it does |
| --- | --- | --- |
| `complete` | Ctrl+Enter | completes the item (measured: then the caret goes to the next item) |
| `toggle_h1`, `_h2`, `_h3`, `toggle_paragraph` | Alt+Ctrl+1, 2, 3, 4 | the item's type: a heading, a paragraph (measured: 1, 4) |
| `toggle_code_block`, `toggle_quote_block` | Alt+Ctrl+6, 7 | a code block (its name the code, Enter a new line), a quote (measured) |
| `toggle_bullet`, `toggle_todo`, `toggle_numbered` | Alt+Ctrl+8, 9, 0 | a bullet, a to-do, numbered (measured: 9, 0) |
| `expand`, `collapse`, `expand_or_collapse` | Ctrl+Down, Ctrl+Up, Ctrl+Space | unfold, fold (measured: Ctrl+Up) |
| `move_up`, `move_down` | Ctrl+Shift+Up, Down | as Alt+Shift+Up and Down |
| `indent`, `outdent` | Alt+Shift+Right, Left | as Tab and Shift+Tab (measured: Left outdents logically) |
| `focus_next_sibling`, `focus_prev_sibling` | Alt+Ctrl+Down, Up | to the next or previous sibling (measured: Down) |
| `select_all` | Ctrl+A | the text, then (again) every item (measured) |
| `zoom_in`, `zoom_out` | Ctrl+., Ctrl+, (also Alt+Down, Alt+Up) | zoom into the item, out to its parent (Ctrl+Right and Left too, but in text they move by word) |
| `mirror`, `move_to`, `teleport` | Alt+Shift+M, Alt+Ctrl+M, Alt+; | a mirror of the item, move it by search |
| `toggle_bold`, `_italic`, `_underline`, `_strikethrough`, `_code`, `highlight_selected` | Ctrl+B, I, U, Ctrl+Shift+X, Ctrl+Shift+C, Ctrl+Shift+H | formats the selection |
| `navigate_home`, `navigate_to_today`, `show_or_hide_completed` | Ctrl+', Alt+T, Ctrl+O | |

Typed at an item's start (with the features on): `1. ` a numbered item, `` ``` `` a code block, `> ` a
quote, `- [ ] ` a to-do, `# ` a heading.

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
  heading's `#`s (they are the type, not text), so tests starting there are skipped (`holds`); so are
  tables and other atoms, and headings deeper than H3.
- **A numbered item** is the item's type, its number its run's: a run of numbered siblings counts on
  from its first item's `numbered_start` (1 by default). Read as WorkFlowy draws it (the number in the
  name's prefix); a list starting at another number loads with its start; one that skips is declined.
- **A code block** is an item of type `code-block`, its name the code, lines and all: a fenced block of
  backticks loads as one and reads back with the shortest fence that holds its code (WorkFlowy's own
  export writes three); WorkFlowy keeps no language, so fences with one are declined, as are tildes, a
  fence longer than needed, a fence in a longer item, and a caret on a fence line. A `quote-block` reads
  as `> ` and its text (one item's quote, as typed `> ` makes; the spec's quotes, containers, are
  skipped by the projection).
- **The test's item is kept by its id**, and its name set back each test: a caret left in its title
  (Up from the first block, Backspace at an empty first one) types into it, and found by name a
  renamed one was lost and a new one made, test after test (2026-10-18).
- **Notes are drawn by zooming out and back in**: a note set through `setItemNote` is stored but not
  drawn (its line kept empty, its editor empty) until the item is drawn again (2026-10-18; before, every
  test starting with a block of two lines had its second line invisible).
- **Reading**: the item tree from `WF`, except the name or note being edited, which is read from its
  editor (`.editor.plainText`, and the caret from `WF.DomEditableText.selectedIn`): WorkFlowy stores
  what is typed half a second after typing stops (`WF.Editor.saveLater`).

## What WorkFlowy does that a driver has to know

- **Outdenting is logical**: Shift+Tab moves an item past its parent, and its later siblings stay with
  the parent (ourus's `outdent: logical`, which the driver declares: those examples run, and the
  direct-outdent ones disagree).
- **Backspace joins siblings, not a child into its parent**: at the start of an item it merges into
  the previous sibling, but at the start of a first child it does nothing.
- **Only items of one type join**: two headings, two to-dos, two bullets; Backspace or Delete between a
  bullet and a heading or a to-do does nothing (`backspace.md › Backspace18e`, `delete.md › Delete13`,
  `tasks.md`). The driver refuses no `markup-` tag since (2026-10-18): those cases are played.
- **A list's start belongs to its first item**: split, moved or joined away, the start goes with it or
  is lost, and the list counts from 1 (`enter.md › Enter3c`, `move-subtree-down.md › MoveDown23`).
- **Item types don't reset**: Backspace at the start of an H1 or a to-do leaves the type.
- **The test is zoomed into an item, whose title is editable** and comes before the first block:
  Ctrl+Home ("focus first") goes there, and so does Up from the first block (`cursorDocStart` is
  emulated so: Ctrl+Home, Down to the first block, Home). That is an artifact of the setup, and two
  examples show it (`cursor.md › CursorUp1`, `zzz.md › H2`: the caret leaves the blocks).
- **Shift+Enter goes between the name and the note.** From the name it opens the note (the text
  stays in the name); from the note it goes back, and an empty note goes away.
- **Tab in a note types a tab**; it indents only from the name.
- **Pasted lines are items**, with Ctrl+Shift+V too, which WorkFlowy's paste handles as Ctrl+V's. Only
  a note, or an item laid out as a code block or a quote block (`multiline` among its classes), takes
  them as text (`WF.GuiPaste.intoContent`). A name holds no line break, so paste-plain.md's cases
  measure an item per line: the first joins the text before the caret, the text after it goes to an
  item of its own, a line's indentation nests it, a blank line is dropped (probes, 2026-10-21).
- **Enter in a name with a note** makes a new item after it, and the note stays where it was.
- **The note doesn't join the name**: Delete at the end of a name, or Backspace at the start of a
  note, leave them apart.
- **Animations are counted** (`WF.GuiAnimate.animationsAreInProgress()`), which is the driver's busy
  signal; a structural key settles in about 350 ms, mostly a 300 ms timer of WorkFlowy's.
- `setMetadata` takes an Immer recipe: it changes the draft and returns nothing (an arrow function
  that returns the assignment throws "Immer error 4").
- The live demo logs `can't create uuidv5 for anonymous user` while loading: something of a signed-in
  user's, and harmless here.
- **Undo groups by time**: what two or three undos take back after typing depends on how far apart the
  keys came. Between 2026-10-18's full runs, `scenarios.md › Scenario16` and `Scenario23` came back with
  their undone text cut in other places (disagreeing either way), and one verdict flipped once; the
  rest of the verdicts were the same to the example.

## WorkFlowy bugs met on the way

1. **Backspace at the start of a note adds a line break to it.** The note's editor gets `two\n`
   where it had `two`, and that is what is stored once the caret leaves the note (measured again
   2026-10-18: stored `more` while editing, `more\n` after); it shows nothing (`backspace.md ›
   Backspace9`, `scenarios.md › Scenario11`).
2. **Enter at the end of a code block stores two line breaks**: the editor's placeholder line break is
   saved with the one typed (`code\n\n`, kept after the caret leaves), one empty line on screen
   (`fences.md › Fence1`, `Fence5`).
3. **Pasting `1. ` text into an item's middle numbers the item** (with numbered lists on): `see ┃here`
   with `1. Introduction` gives the numbered item `see Introduction┃here` (`paste-old.md › PasteOld31`).

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
