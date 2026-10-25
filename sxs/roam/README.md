# Roam

[`driver.ts`](driver.ts) drives Roam Research's public help graph, https://roamresearch.com/#/app/help:
open to anyone without a login, editable in the session, and saved nowhere (Roam says "No changes to
the help database will be saved", and sends no writes: nothing goes over its Firebase connection
after loading). Roam 0.13.12 (commit 39a714f3, API 1.1.5) on 2026-10-13: the version and commit are
literals in its bundle (`main.js`), which the driver reads; `roamAlphaAPI.apiVersion` is the API's.

## Keys (Linux)

From Roam's bundle (`CV(isPC ? "alt-shift-up" : "cmd-shift-up", ...)`):

| action | keys |
| --- | --- |
| `enter` | Enter |
| `shiftEnter` | Shift+Enter (a line break in the block; twice, a blank line, the block holding paragraphs: an item's paragraphs right after its text are its block's (`paragraphsInBlock`, since 2026-10-25)) |
| `indent` | Tab (also Alt+Shift+Right) |
| `outdent` | Shift+Tab (also Alt+Shift+Left) |
| `moveSubtreeUp` | Alt+Shift+Up (Cmd+Shift+Up on a Mac) |
| `moveSubtreeDown` | Alt+Shift+Down (Cmd+Shift+Down on a Mac) |
| `deleteContentBackward` | Backspace |
| `deleteContentForward` | Delete |
| `deleteSoftLineBackward` | Shift+Home, Backspace |
| `deleteSubtree` | Escape (the block selected with its children: Roam's `init-or-cancel-selection`, of its bindings for selected blocks, `multiselect`), Backspace (the selection deleted); skipped, for want of a key, until 2026-10-18; after it, the page's every block deleted, no block is edited: the outline alone is judged (`noCaretAfter`, since 2026-10-25) |
| `duplicateSubtree` | *missing*: its tests are skipped |
| `pasteStructured` | Ctrl+V |
| `pastePlain` | Ctrl+Shift+V |
| `undo` | Ctrl+Z |
| `redo` | Ctrl+Y (Cmd+Shift+Z on a Mac) |

Other shortcuts (Roam's Settings › Hotkeys, every default editable there; measured in the help graph):

| shortcut | keys | what it does |
| --- | --- | --- |
| toggle TODO | Ctrl+Enter | none, then `{{[[TODO]]}}`, `{{[[DONE]]}}`, none; on selected blocks, each of them |
| fold, unfold, toggle | Ctrl+Up, Ctrl+Down, Ctrl+Space | a block's children hidden or shown |
| heading 1, 2, 3; none | Ctrl+Alt+1, 2, 3; Ctrl+Alt+0 | the block's heading attribute |
| zoom in, zoom out | Alt+Right, Alt+Left | a block as the page, and back |
| select blocks | Escape; then Shift+Up, Shift+Down | the block being edited, with its children; then more |
| select all | Ctrl+A, Ctrl+Shift+A | Ctrl+A: the text, then every block on the page; Ctrl+Shift+A: every block |
| on selected blocks | Tab, Shift+Tab, Alt+Shift+Up/Down, Backspace, Ctrl+C | indented, outdented, moved, deleted, copied |
| block versions | Ctrl+Comma, Ctrl+Period; Ctrl+Shift+Comma/Period | add a version, show them; cycle through them |
| bold, italics, highlight, strikethrough | Ctrl+B, Ctrl+I, Ctrl+H, Win+Y | |
| markdown link, follow link | Ctrl+K, Ctrl+O (Ctrl+Shift+O: in the sidebar) | |
| comment | Ctrl+Alt+= | a comment on the block |
| document view | Ctrl+M, then Ctrl+D | |
| command palette, search | Ctrl+P, Ctrl+U | |

"Delete current block" and "Add a new block below the current one" are commands with no key.
Formatting, links, versions, comments and document view are from the list, not measured.

The bundle branches on the platform for each binding, and the Mac's keys aren't the PC's: a first run
used Ctrl+Shift+Z for redo (the Mac's Cmd+Shift+Z, carried over), and `undo.md › Undo1` and `Undo4`
disagreed until it was Ctrl+Y.

## Stack

A closed-source web app in ClojureScript (its bundles `js/compiled/*.js`), its graph in DataScript (the
public API's `pull` takes Datalog patterns, `:block/uid`), synced through Firebase (App Check, Cloud
Functions and the realtime database). Code blocks are CodeMirror; drawings an Excalidraw chunk (React).
Each block is edited in a textarea. The desktop app wraps the same web app.

## Traffic

Pages and scripts are cached as any site's. Live, once per load of the app: Firebase's App Check
token exchange and three Cloud Functions (`backend-updateActiveGraphInList`, `graph-hasPayingAdmin`,
`storage-searchBackupUrl`), and the realtime database's WebSocket, which brings the graph. Tab reuse
keeps loads rare. Per test, creating blocks makes Roam ask its AI embeddings function for them
(`voyage-embed`), which its servers refuse an anonymous visitor (401): [`proxy.ts`](proxy.ts) answers
that with the same 401, so tests send Roam nothing. Analytics, Intercom and Stripe are blocked.

## Setting up and reading a test

- **A page per test**, `ourus sxs <uid>`, through Roam's public API (`window.roamAlphaAPI`):
  `data.page.create`, `data.block.create` (with `heading` for a heading's level, `open`), and
  `ui.mainWindow.openPage`; the caret by `ui.setBlockFocusAndSelection`, then `setSelectionRange` on
  the textarea. The last test's page is deleted first (`data.page.delete`).
- **Reading**: `pull` of the page (`:block/string`, `:block/heading`, `:block/order`, children,
  sorted by order), except the block being edited (`ui.getFocusedBlock`), read from its textarea.
  Roam's italic, `__i__` (strong to Markdown), is read as `*i*`, the caret moved with it
  (`italicsAsMarkdown` in lib/block.ts, since 2026-10-25).
- **Tasks** are Roam's `{{[[TODO]]}}` and `{{[[DONE]]}}` markers in the text; **headings** are the
  block's heading attribute (1 to 3), shown as `#` to `###` (a caret can't go into them, and deeper
  headings are skipped). Code blocks are skipped: Roam's are a format of its own. Math is a block's
  text, and Enter in it splits the block: the driver refuses `enter-in-fence` (since 2026-10-25:
  Fence42).
  Enter inside a heading's title gives the text before the caret to a new block above and keeps the
  heading on the rest (the block keeping its attributes): the driver declares
  `quirkEnterMidHeading: workflowy` (since 2026-10-25; `obsidian-true-outliner.md › TO-E13-E16`, `quirks.md › Quirk1`).

## What Roam does that a driver has to know

- **Outdenting is logical**: Shift+Tab moves a block past its parent and leaves its later siblings
  there (`outdent.md › Direct outdent › DirectOutdent1` disagrees, `Logical outdent ›
  LogicalOutdent1` agrees); and **Enter on an empty nested block outdents it**
  (`enter.md › Enter30` agrees, `Enter28` doesn't). The driver declares both (`behaves`). Neither is
  a setting: Roam's bundle has the commands (`unindent-block` on Shift+Tab and Alt+Shift+Left,
  `unindent-blocks` and `unindent-sibling-group` for a selection, `create-new-or-unindent` for Enter
  on an empty block) and no option near them; it calls outdenting "unindent".
- The page's title is editable and comes before the first block.
- **Backspace on a page's first block does nothing**, empty or not (`backspaceAtTopItem: refuse`,
  declared since 2026-10-18; ourus deletes an empty first block either way, so `backspace.md ›
  Backspace17` disagrees).
- **Enter splits a block by making a new one above**: the text before the caret goes into a new
  block, the original block (its uid, its heading, its children) keeps the rest, the caret with it.
  So a heading split mid-title leaves the heading on the second half (`- Hello` / `- # ┃ world`,
  the same 2 s later), and the spaces at the split stay on both halves.
- **A one-block clipboard pastes into the block's text**: with HTML, the block's text (`- x` pasted
  after `a` gives `ax`, `# h` gives `…h`); as text alone, the line as it is, its marker and its line
  break too (`a- x⏎`). Two blocks or more paste as blocks either way, the caret at the end of the
  first (checked in a headless Chromium of its own, typing after it: `- x!┃`), which the driver
  declares, `quirkPasteCaret: roam` (since 2026-10-25).
- **Typed text is stored about 600 ms after the last key** (a debounce: read back right after
  typing, the database still has the text before it). `scenarios.md › Scenario16` (a move, typing,
  two undos) once came out with the move not undone, in a full run with four workers; six runs of it
  alone, and nine plays at pauses of 0.75, 2.5 and 6 s, didn't. Open: which store an undo takes back
  under load.

## Internals

Roam's public API, as the driver uses it (`window.roamAlphaAPI`): `data.page.create({ page: { title, uid } })`, `data.page.delete`,
`data.block.create({ location: { 'parent-uid', order }, block: { string, uid, heading, open } })`,
`pull('[:block/uid :block/string :block/heading :block/order {:block/children ...}]', [':block/uid',
uid])` (children unordered: sort by `:block/order`), `ui.mainWindow.openPage({ page: { uid } })`,
`ui.setBlockFocusAndSelection({ location: { 'block-uid', 'window-id': 'main-window' }, selection })`,
`ui.getFocusedBlock()`, `util.generateUID()`, `apiVersion` (the API's, not Roam's). The block being
edited is the focused `TEXTAREA`; tasks are `{{[[TODO]]}}` / `{{[[DONE]]}}` in the string. Its key
bindings are `CV(isPC ? "<pc key>" : "<mac key>", ...)` calls in `route-app.js`.
