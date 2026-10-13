# Roam

[`driver.ts`](driver.ts) drives Roam Research's public help graph, https://roamresearch.com/#/app/help:
open to anyone without a login, editable in the session, and saved nowhere (Roam says "No changes to
the help database will be saved", and sends no writes: nothing goes over its Firebase connection
after loading). Roam 0.13.12 (commit 39a714f3, API 1.1.5) on 2026-10-13: the version and commit are
literals in its bundle (`main.js`), which the driver reads; `roamAlphaAPI.apiVersion` is the API's.
Last results: [`sxs.md`](sxs.md).

## Keys (Linux)

From Roam's bundle (`CV(isPC ? "alt-shift-up" : "cmd-shift-up", ...)`):

| action | keys |
| --- | --- |
| `enter`, `shiftEnter` | Enter, Shift+Enter (a line break in the block) |
| `indent`, `outdent` | Tab, Shift+Tab (also Alt+Shift+Right and Left) |
| `moveBlockUp`, `moveBlockDown` | Alt+Shift+Up, Alt+Shift+Down (Cmd+Shift on a Mac) |
| `deleteContentBackward`, `deleteContentForward` | Backspace, Delete |
| `deleteSoftLineBackward` | Shift+Home, Backspace |
| `pasteStructured`, `pastePlain` | Ctrl+V, Ctrl+Shift+V |
| `undo`, `redo` | Ctrl+Z, Ctrl+Y (Cmd+Shift+Z on a Mac) |
| caret motions | arrows, Home, End; `select…` with Shift |
| `cursorDocStart`, `cursorDocEnd` | Up (Down) until the caret stops, then Home (End); Up from the first block goes into the page's title, so back down from there |

`deleteSubtree` and `duplicateNode` have no key here yet; their tests are skipped.

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
- **Tasks** are Roam's `{{[[TODO]]}}` and `{{[[DONE]]}}` markers in the text; **headings** are the
  block's heading attribute (1 to 3), shown as `#` to `###` (a caret can't go into them, and deeper
  headings are skipped). Code blocks are skipped: Roam's are a format of its own.

## What Roam does that a driver has to know

- **Outdenting is logical**: Shift+Tab moves a block past its parent and leaves its later siblings
  there (`outdent.md › Direct outdent › DirectOutdent1` disagrees, `Logical outdent ›
  LogicalOutdent1` agrees); and **Enter on an empty nested block outdents it**
  (`enter.md › Enter30` agrees, `Enter28` doesn't). The driver declares both (`behaves`). Neither is
  a setting: Roam's bundle has the commands (`unindent-block` on Shift+Tab and Alt+Shift+Left,
  `unindent-blocks` and `unindent-sibling-group` for a selection, `create-new-or-unindent` for Enter
  on an empty block) and no option near them; it calls outdenting "unindent".
- The page's title is editable and comes before the first block.

## Internals

Roam's public API, as the driver uses it (`window.roamAlphaAPI`): `data.page.create({ page: { title, uid } })`, `data.page.delete`,
`data.block.create({ location: { 'parent-uid', order }, block: { string, uid, heading, open } })`,
`pull('[:block/uid :block/string :block/heading :block/order {:block/children ...}]', [':block/uid',
uid])` (children unordered: sort by `:block/order`), `ui.mainWindow.openPage({ page: { uid } })`,
`ui.setBlockFocusAndSelection({ location: { 'block-uid', 'window-id': 'main-window' }, selection })`,
`ui.getFocusedBlock()`, `util.generateUID()`, `apiVersion` (the API's, not Roam's). The block being
edited is the focused `TEXTAREA`; tasks are `{{[[TODO]]}}` / `{{[[DONE]]}}` in the string. Its key
bindings are `CV(isPC ? "<pc key>" : "<mac key>", ...)` calls in `route-app.js`.
