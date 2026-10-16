# Tine

[`driver.ts`](driver.ts) drives [Tine](https://tine.page/), an outliner of Logseq's kind (pages of
blocks, stored as Logseq's Markdown), through its live guide, https://tine.page/guide/app/: Tine's
own editor (SolidJS, its parser in WASM), the guide export of 2026-09-28 (bundle `app-BBSWYxDX`; the
desktop app is 0.7.1). The spec's buffers are projected onto blocks, as for Logseq (the `block`
model, [`../lib/outline.ts`](../lib/outline.ts)). Last results: [`sxs.md`](sxs.md).

## Keys (Linux)

From `src/keybindings.ts` and the block editor's handlers, checked in the app:

| action | keys |
| --- | --- |
| `enter`, `shiftEnter` | Enter (splits; at the text's start, an empty block above), Shift+Enter (a line break in the block) |
| `indent`, `outdent` | Tab, Shift+Tab (outdenting is direct by default; Settings › Editor has logical) |
| `moveSubtreeUp`, `moveSubtreeDown` | Alt+Shift+Up, Alt+Shift+Down: the block with its children |
| `deleteContentBackward`, `deleteContentForward` | Backspace, Delete (joining at a block's edge) |
| `deleteSoftLineBackward` | Alt+U ("kill line before") |
| `deleteSubtree` | Escape (the block selected), then Backspace |
| `pasteStructured`, `pastePlain` | Ctrl+V (`- ` outlines become blocks), Ctrl+Shift+V (as it is) |
| `undo`, `redo` | Ctrl+Z, Ctrl+Shift+Z |
| caret motions | arrows, Home, End (the visual line's); `select…` with Shift |
| `cursorDocStart`, `cursorDocEnd` | Up (Down) until the caret stops, then Ctrl+Home (End), the block's start (end) |

`duplicateSubtree` has no command; its examples are skipped.

## Stack

Tauri 2: a Rust core (crates
for the graph, storage and search) and a frontend in TypeScript with SolidJS, built with Vite. Its
parser of Logseq's Markdown is Rust, compiled to WebAssembly for the frontend (`lsdoc-wasm`), and it
reads and writes the same files as Logseq. On Linux, Tauri runs the frontend in WebKitGTK, which has
no DevTools protocol; the guide on its site is the same frontend in a browser, over a published
snapshot, or (the mock it ships) an in-memory backend.

Repo: https://github.com/martinkoutecky/tine

## A published guide, made editable

`/guide/` is a static export, and `/guide/app/` the editor, run over the export's `snapshot.json`
and marked so (`<meta name="tine-published" content="snapshot.json">`): the app then takes a backend
that refuses every write, and nothing opens for editing. Without the meta it takes its in-memory
backend (the mock it ships for running in a browser), editable, with the day's journal and a few
pages, saving nothing. So [`proxy.ts`](proxy.ts) drops the meta from the app's page, and names two
of the bundle's values on `globalThis`, which the bundle keeps to itself: the document store
(`__sxsDoc`, `[doc, setDoc]`) and the backend's pages (`__sxsPages`). Both patches are applied on
the way out, so the cache keeps what the site sent. A new bundle the patterns don't match leaves the
names out, and `open` stops the run saying so. The only traffic is GETs: the app, and the plugin
registry on raw.githubusercontent.com.

## Setting up and reading a test

- **A page per test**, `sxs-<run>-<n>`: pushed into the backend's pages as a page of blocks (each
  `{ id, raw, children }`, the id `<page>-<i>`), then opened as a user would, with the search (Ctrl+K,
  its name, Enter): the app has no route to a page. The name has the run in it: a tab outlives a run,
  and the next run of Tine takes it over with the last run's pages still there, so a name of its own
  per run is what keeps the search from opening an old page of the same name.
- **The caret**: a click on the block's text opens its editor, a `textarea.block-editor`, and the
  caret is set there until it stays. A fenced code block opens an editor of its code alone
  (`.code-edit`), so a caret in it is an offset in the code: the driver adds and takes off the
  opening fence's length. A caret on a fence has no place there, and the example is skipped.
- **Reading** is the store (`__sxsDoc[0]`: `pages[].roots`, `byId[id].raw` and `.children`), which
  the editor commits to as it is typed in, and the focused editor's selection; blocks selected as
  blocks are `.block-main.selected`.
- **Tasks** are `TODO` / `DONE` in a block's text, mapped to and from the spec's checkboxes as for
  Logseq.
- **Undo is "page only"**: `open` runs the command "Toggle undo/redo mode" (Ctrl+Shift+P) until its
  notice says "Page only". With the default, global history, Ctrl+Z in one test undid the last test's
  edit and went back to its page.
- **Version**: the app says none in a browser (its About reads it under Tauri only), so `open`
  reports the guide's export date and the bundle's name.

## What Tine does that a driver has to know

- Leaving a test's page sometimes throws `TypeError … reading 'page'` from the editor's blur, which
  reads the page of a block that is gone (`Block.tsx`): harmless, but a page error in the run's count.
- A notice ("New: in-app Guide") shows in the in-memory mode; it is in no one's way.
- Shift+Up and Down at a block's edge select blocks, not text.

## Internals

Tine's document store and backend, as the driver uses them, named by the proxy: `__sxsDoc` (the
store's `[doc, setDoc]`; `doc = { byId: { [id]: { raw, parent, children, page, collapsed } }, pages:
[{ name, roots }], feed, loaded }`) and `__sxsPages` (the in-memory backend's pages, as it serves
them: `{ name, kind: 'page', title, pre_block, format: 'md', read_only, guide, blocks: [{ id, raw,
collapsed, children, properties, tags }] }`). The backend is chosen in `src/backend.ts`: Tauri's
under Tauri, the published one for an export, else the mock (`src/mock.ts`). The blocks on screen are
`.ls-block[data-block-id]`, their text `.block-main .block-content`, the editor
`textarea.block-editor` (`.code-edit` for a code block's code); keys are in `src/keybindings.ts` and
`src/components/Block.tsx`.
