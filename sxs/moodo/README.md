# Moo.do

[`driver.ts`](driver.ts) drives [Moo.do](https://www.moo.do/), an outliner (items in an infinite
hierarchy, each with a note, dates and tags; panes, boards, Gmail and Google Calendar sync), closed
source. It has since become Legend (legendapp.com); the site keeps the old app and its demo,
https://www.moo.do/demo/, which frames the app's own page in demo mode on its help document:
`https://www.moo.do/web/#demo=true&live=true&data=demo-help`, which the driver opens directly. No
account; nothing saved. Web build 1642203397223 (2022-01-14): the timestamp in its bundle's name
(`/web/js/app-1642203397223.js`), which `open` reads.

The spec's buffers are projected onto blocks (the `block` model, [`../lib/block.ts`](../lib/block.ts)),
every block an item. An item without a prefix is drawn without a bullet, so Moo.do's outline reads as
free text with indents; the driver plays it as an outliner, its items the blocks.

## Keys (Linux)

From Moo.do's hotkey table in its bundle (`Unindent: ["Sh+Tab"]`, … where `Pr` is Ctrl on Linux and
Windows, `Se` Alt, `Op` the Mac's Option, `win:` and `mac:` a platform's own), and pressing them in
the demo:

| action | keys |
| --- | --- |
| `enter` | Enter |
| `shiftEnter` | *missing*: Shift+Enter edits the item's note ("EditNote"), another action than a line break, which an item's text doesn't hold (its cases skip) |
| `indent` | Tab ("Indent": the item with its children, under the one before) |
| `outdent` | Shift+Tab ("Unindent") |
| `moveSubtreeUp` | Alt+Shift+Up ("MoveUp"; Ctrl+Shift+Up too) |
| `moveSubtreeDown` | Alt+Shift+Down ("MoveDown"; Ctrl+Shift+Down too) |
| `deleteContentBackward` | Backspace |
| `deleteContentForward` | Delete |
| `deleteSoftLineBackward` | Shift+Home, then Backspace (no command for it) |
| `deleteSubtree` | Ctrl+Shift+Backspace ("DeleteItem": the item with its children; Ctrl+Shift+K too), played by `act`, then Y where Moo.do asks to confirm (below) |
| `duplicateSubtree` | *missing* (no hotkey): its examples are skipped |
| `pasteStructured` | Ctrl+V |
| `pastePlain` | Ctrl+Shift+V |
| `undo` | Ctrl+Z |
| `redo` | Ctrl+Y (Ctrl+Shift+Z too) |
| `cursorDocStart`, `cursorDocEnd` | *emulated*: no hotkey for the outline's ends; Up (Down) until the caret stops, then Home (End) |

Other hotkeys in the table:

| keys | what it does |
| --- | --- |
| Ctrl+], Ctrl+[ (Alt+], Alt+[; Alt+Shift+Right, Left) | indents, unindents the item without its children |
| Ctrl+Enter | completes the item (a task done; completed items are hidden in the demo's pane) |
| Ctrl+. ; Ctrl+Shift+. ; Ctrl+Alt+. | collapses the item; recursively; every item |
| Alt+Enter, Alt+Shift+Enter (Alt+Right, Alt+Left) | zooms into the item, out |
| Ctrl+Shift+H (Ctrl+Shift+P, Ctrl+Shift+6, Ctrl+Shift+3) | the item a header (`# `) |
| Ctrl+Shift+[ (Alt+Shift+[, Ctrl+Shift+9) | the item a task (`[ `) |
| Ctrl+Shift+8, Ctrl+Shift+1 | a bulleted (`- `), a numbered (`1. `) item |
| Ctrl+1, 2, 3, 0 | a priority, none |
| Ctrl+8 (Ctrl+`) | stars the item |
| Ctrl+B, Ctrl+I, Ctrl+U, Ctrl+Shift+X, Ctrl+Shift+B, Ctrl+Shift+C | bold, italic, underline, strikethrough, highlight, inline code |
| Ctrl+Shift+Alt+C | a code block |
| Ctrl+K | a link |
| Ctrl+Shift+D | a date |
| Alt+L | selects the item |
| Ctrl+F, Alt+F, Ctrl+P | search, filter, search everywhere |
| Ctrl+/ (Alt+/) | the hotkeys |

## Stack

A closed-source web app (React, framer-motion, MobX-like observables of its own), built with webpack
(its runtime `webpackChunkLegend`: the app is Legend's). A document is a tree of items under a root
(`_documentOwner._rootItem`), each with its raw text (`getRawText()`: Markdown as written, with
Moo.do's prefixes), its parsed text and its children (`getChildren()`, a note first if it has one);
the pane draws them in a virtual list (`[data-id]`, `.itemInPaneText`). Moo.do draws the caret itself:
keys go to a hidden input in the pane (`.paneHiddenInput`), and its selection module keeps the
selection (start and end items and offsets). Items are made through its item registry
(`createVMLI`), with a change type (`ChangeType.Local`), inside its pane update batch.

None of these is on `window`: the driver reaches the modules through the webpack runtime
(`webpackChunkLegend.push`, which hands over the module loader), finding each by what it has
(`createVMLI`, `undoStack`, `setSelectionIndices`, `ChangeType`, `PaneUpdateBatcher`); the document
through React (any drawn item's props). Nothing in the bundle is patched.

## Traffic

Pages, bundles and the demo's document (`/data/demo-help.json`) are cached as any site's, and so is
Google's API client, which the app loads for its sync and a demo never signs in to. Google's
analytics and Rollbar's error reports (`api.rollbar.com`, which the app reports to after many keys)
are blocked hosts. With a warm cache, a run reaches no server.

## Setting up and reading a test

- **The demo's document**: each test's items replace the document's, in one pane update batch (the
  root's children deleted, the test's made with `createVMLI` and inserted), then the history emptied
  (`undoStack`, `redoStack`), so that undo stops where the test starts; and the last test's selection
  reset, both the text selection and the items selected whole.
- **The caret**: Moo.do's selection set by the pane's indices (`setSelectionIndices`), made valid and
  drawn, and the hidden input focused, which takes the keys.
- **Reading**: the document's items from the root (notes left out), each item's raw text with its
  prefix as the spec's canonical form has it (`[ ] `, `[x] ` from the item's completed flag, `## `,
  `1. `; a bullet's `- ` dropped); the selection from the selection module, while the hidden input has
  the focus: within one item a caret, across items the items selected whole.
- **Offsets**: Moo.do counts the caret in what it draws: the text after the prefix, formatting styled
  and its markup not drawn (`a **b** c` drawn `a b c`). The driver aligns the drawn text with the raw
  text, character by character, both ways.
- **What Moo.do can't start from** (`holds`): a block of more than one line (an item's later lines
  would be its note); text Moo.do reads as a prefix (`- `, `[ ` without `] `) or a Markdown escape; a
  done task (the demo's pane hides completed items); a backward selection (below); a numbered list not
  counting from 1 (Moo.do counts); a caret in a prefix.
- **Settling**: framer-motion's frame loop never stops in Moo.do (an animation repeating, drawing
  nothing), so the driver's settling doesn't count pending frames (`idle.frames: false`, a setting of
  [`../lib/idle.ts`](../lib/idle.ts) for such an app): timers and quiet.

## What Moo.do does that a driver has to know

- **Its selection has no direction**: from `ab┃`, Shift+Left selects `a«b»`, and a second Shift+Left
  takes it back from the right (`a┃b`), as if the selection always ran forward. A test starting with a
  backward selection is skipped.
- **Deleting more than one item asks first**: "Are you sure you want to delete 2 items?", Yes or No
  (a cut at a caret, or "DeleteItem", on an item with children; `menus.confirm` in the bundle), which
  Y answers. Unanswered, the dialog takes every key after it, and no delete in the pane finishes: a
  join leaves the joined item in place. That showed as state leaking between tests (20 Delete cases
  wrong after `delete-subtree.md` or `Cut4`, 3 when `delete.md` ran alone), found by running each spec
  file before `delete.md` in one worker. The driver plays `cut` and `deleteSubtree` itself, answering
  Y where Moo.do asks, as the user who asked for the delete would; a dialog another key left open
  (Backspace on items selected whole) is closed by loading the page anew before the next test
  (`reloadPage` in [`../lib/browser.ts`](../lib/browser.ts), which keeps the run's settling script).
- **Numbers are counted, not written**: Moo.do draws a run of numbered siblings 1, 2, 3, whatever the
  raw text's numbers (`5. three` third in a run is drawn `3.`); the driver reads the number drawn, and a
  list not counting from 1 isn't held.
- **The app reloads itself once** after its first load (its service worker taking over the page):
  `open` waits for it.
- **Completed items are hidden** in the demo's pane: a task completed by a key disappears from the
  outline the driver reads.

## Where Moo.do behaves as an option of ourus's

Measured with `--ignore-options` (2026-10-26), each value agreeing in its cases where ourus's default
didn't (the driver's `behaves`):

| option | Moo.do | cases |
| --- | --- | --- |
| `outdent` | `logical`: Shift+Tab takes the later siblings along | LogicalOutdent1, LogicalOutdent4, TO7 |
| `enterSplitSpace` | `start`: the space at the split starts the new item | Enter65 to Enter65d, Enter65h to Enter65j |
| `emptyItemWithChildren` | `refuse` | Backspace17f, Backspace17h, Delete5f |
| `backspaceAtTopItem` | `refuse` | Backspace34 |
| `headingEditing` | `block`: a header's prefix is the item's, kept through a join | Delete13b, Delete13f, Regression19 |
| `pasteLines` | `items` | Paste17g, Paste18, Paste19 |
| `pasteOnParent` | `after`: on an item with children, pasted items go after them | PasteList18, PasteList19 |

Left at ourus's default: `pasteSeams` (open: 1 of 5), `pasteOverSelection` (ignore: 3 of 7),
`pastePlainLines` (items: 2 of 5).
