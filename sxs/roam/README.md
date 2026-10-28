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
| `moveSubtree` | mouse: the block's bullet dragged (HTML5 drag and drop) to its drop bar (`drop` in [`driver.ts`](driver.ts), [`../lib/drag.ts`](../lib/drag.ts)) |
| `deleteContentBackward` | Backspace |
| `deleteContentForward` | Delete |
| `deleteSoftLineBackward` | Shift+Home, Backspace |
| `deleteSubtree` | Escape (the block selected with its children: Roam's `init-or-cancel-selection`, of its bindings for selected blocks, `multiselect`), Backspace (the selection deleted); skipped, for want of a key, until 2026-10-18; after it, the page's every block deleted, no block is edited: the outline alone is judged (`noCaretAfter`) |
| `duplicateSubtree` | *missing*: its tests are skipped |
| `paste` | Ctrl+V |
| `pastePlain` | Ctrl+Shift+V |
| `undo` | Ctrl+Z |
| `redo` | Ctrl+Y (Cmd+Shift+Z on a Mac) |
| `fold` | Ctrl+Up: the block's children hidden |
| `unfold` | Ctrl+Down |
| `toggleFold` | Ctrl+Space |
| `zoomIn` | Alt+Right: the block as the page |
| `zoomOut` | Alt+Left: back to its parent's, or the page |
| `clearZoom` | *missing*: Alt+Left a level at a time |

Other shortcuts (Roam's Settings › Hotkeys, every default editable there; measured in the help graph):

| shortcut | keys | what it does |
| --- | --- | --- |
| toggle TODO | Ctrl+Enter | none, then `{{[[TODO]]}}`, `{{[[DONE]]}}`, none; on selected blocks, each of them |
| heading 1, 2, 3; none | Ctrl+Alt+1, 2, 3; Ctrl+Alt+0 | the block's heading attribute |
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

## Folds and the zoom, measured

[`fold.md`](../../spec/fold.md) and [`zoom.md`](../../spec/zoom.md), measured 2026-10-28 in the help
graph. A block's fold is loaded as `open: false` (`data.block.update`) once every block is on screen,
and read on screen: a drawn block with children whose first child isn't drawn. A key's fold here is
the view's, `:block/open` left `true` (in the help graph, at least), so the attribute is read only
for a block not drawn itself. A zoom is the block opened in the main window
(`ui.mainWindow.openBlock`, read as `getOpenPageOrBlockUid`), the test's page standing for none.
What is compared is what the reader sees: the folds in effect, and the zoom root.

- **Around a closed block it agrees**: Enter at its end, mid-text, on an empty one with children
  (`Fold1`, `Fold2`, `Fold5`), Backspace after it (`Fold3`), a move (`Fold4`), an indent under it
  (`Fold6`), unfold (`Fold12`).
- **Delete at a closed block's end does nothing** (`Fold7`), as ourus, which refuses it (`folded`).
- **Backspace right after a closed block joins into its text**, not its hidden last child's, still
  closed (`Fold15`), as ourus.
- **Toggle at a block without children does nothing** (`Fold11`); ourus toggles its parent's.
- **Zoomed, its edges hold as ourus's**: Enter at the root's end and mid-text makes its first child
  (`Zoom1`, `Zoom10`), Backspace at its start and an outdent out of it are refused (`Zoom2`,
  `Zoom11`), out a level at a time (`Zoom7`). Zoomed in, the caret goes to the end of the root's last
  child (`Zoom6`: `caret`).
- **The zoom root deleted ends the zoom** (`Zoom9`); ourus zooms out to its parent.

## Drag and drop, measured

A block's bullet (`.rm-bullet`) is an HTML5 drag source. While a block is dragged, every list of
children (the page's, a block's) gets a separator before its first child and after each child: a
band 11 pixels above it to 17 below, from its list's left, a deeper list's on top, where Roam draws its
drop bar. The driver aims a few pixels under the place's separator, at its list's column; Roam runs a
frame loop while dragging, so the drag has settled when the bar is at the place.

- **Every drop the cases play lands where ourus puts it** (MoveSubtree1, MoveSubtree2, MoveSubtree3, MoveSubtree9, MoveSubtree12,
  Scenario8, Scenario8c agree, stable over three runs).
- **No caret after a drop**: the block's editing ends with the drag; Scenario8b, which types after it,
  skips as it plays.
- **It drags the selected blocks where the pressed one is among them**, else the block pressed alone:
  the cover rule (MoveSubtree4, MoveSubtree5, MoveSubtree6, MoveSubtree19 land as ourus's), the selection gone after the drop
  (each `caret`). The driver selects blocks with Escape and Shift+Down, reading the highlight once
  Roam is idle (it is drawn late).

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
