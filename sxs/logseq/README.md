# Logseq

[`driver.ts`](driver.ts) drives Logseq's web demo, https://demo.logseq.com/: the file-based app
("OG", https://github.com/logseq/og) with a demo graph that lives in the browser and
saves nothing. The last full run is [`sxs.md`](sxs.md).

## Keys (Linux)

| action | keys |
| --- | --- |
| `enter`, `shiftEnter` | Enter, Shift+Enter |
| `indent`, `outdent` | Tab, Shift+Tab |
| `deleteContentBackward`, `deleteContentForward` | Backspace, Delete |
| `moveBlockUp`, `moveBlockDown` | Alt+Shift+Up, Alt+Shift+Down |
| `deleteSoftLineBackward` | Shift+Home, Backspace (no key of its own on Linux) |
| `deleteSubtree` | Escape (selects the block), Backspace (deletes the selection) |
| `pasteStructured`, `pastePlain` | Ctrl+V, Ctrl+Shift+V |
| `undo`, `redo` | Ctrl+Z, Ctrl+Shift+Z |
| caret motions | arrows, Home, End; `select…` with Shift |
| `cursorDocStart`, `cursorDocEnd` | Up (Down) until the caret stops, then Home (End) |

`duplicateNode` has no key in Logseq, and its tests are skipped.

## Stack

Logseq "OG", the file-based app: ClojureScript (built with shadow-cljs), its UI in Rum (React),
its graph in DataScript (an in-memory Datalog database), its pages Markdown or Org files. The desktop
app wraps the same frontend in Electron, the mobile apps in Capacitor; the web demo runs it in the
browser with a demo graph and nothing saved. Each block is edited in a textarea of its own.

Repo: https://github.com/logseq/og

## Setting up and reading a test

- **A page per test**, through Logseq's plugin API (`window.logseq.api`): `create_page`, the blocks
  by `insert_batch_block`, then any block whose content came out different by `update_block` (a
  batch insert drops a line's leading whitespace, so code loses its indentation), and the caret by
  `edit_block` and `setSelectionRange`. The last test's page is deleted first, since deleting a page
  takes Logseq to its home page; a run's first test deletes the `spec-*` pages earlier runs left.
- **Text Logseq would trim** (a trailing line break, spaces at a block's edge) is held only by the
  block being edited: its textarea gets the text as if typed (the value set, `input` dispatched).
  Other blocks can't start with such text, and those tests are skipped.
- **Reading**: `get_page_blocks_tree`, except for the block being edited, which is read from its
  textarea: Logseq stores what is typed about half a second after typing stops. Selected blocks
  come from `get_selected_blocks`.
- **Tasks** are Logseq's markers: `[ ]` is `TODO`, `[x]` is `DONE` (and `LATER`, `NOW`, `DOING`,
  ... read as tasks).
- **Undo** is Logseq's "page only" history (a setting of its right sidebar), so it stays within the
  test's page.
- **`outdent: logical`** is Logseq's "logical outdenting" (Settings › Editor,
  `:editor/logical-outdenting?`); every other test runs with it off, as ourus's default and Logseq's.
  The driver sets it in the graph's config as Logseq holds it (`set_state_from_store`), not as the
  Settings toggle does: the toggle also writes `config.edn`, and Logseq reinstalls its keys a second
  after that file changes, so a test starting meanwhile would race it (see below).

## What Logseq does that a driver has to know

- **Keys are lost right after startup.** Logseq installs its global keys, Tab among them, through
  `shortcut/refresh!`, debounced by a second after the app comes up. Until then Tab is the browser's
  own: it moves the focus out of the editor, and the key does nothing in Logseq. `open` is done once
  Tab indents a block. (The prototype's "warm-up edit" was a guess at this.)
- **Keys race what Logseq does after the last one.** A structural key is handled partly later: the
  editor re-renders and refocuses (a 50 and a 100 ms timer after Enter or Tab), and an insert opens
  the new block a moment after. Played with no pause, a sequence of keys comes out wrong; with a
  fixed pause, it comes out wrong whenever the machine is slow. The runner waits for the page to
  settle after every key instead ([`../lib/idle.ts`](../lib/idle.ts)), with `editor/op` (Logseq's flag for
  an insert, delete, indent, paste or undo in flight) as the driver's busy signal. This and the
  previous point are what ate keys in the prototype.
- **The database lags the editor.** Logseq stores what is typed about half a second after typing
  stops, or when the block is left; the block being edited is read from its textarea.
- **Inserting blocks opens one for editing**, a moment later: the driver lets that pass before
  choosing the block to edit, and checks it got the right one. On a busy machine (ten apps run at
  once) it came even later, after the driver had opened its block, and the text meant for that
  block's editor went into the last inserted block's (`block-up.md › BlockUp8`: `c1` held as `c`). So
  the driver writes only into the editor inside the target block (`.ls-block[blockid]`), opening the
  target again if the focus has moved, and the runner loads a start held wrong once more.
- **Plain lines paste as text.** Multi-line text pastes into the block, unless it reads as Markdown
  blocks (list items, headings) or has blank lines (`handler/paste.cljs`). So Paste7 and Paste10
  differ, though `spec/paste.md` says Logseq makes items there.
- **The caret moves by pixels**, in a proportional font: after Up or Down it lands at another column
  than the spec's monospace one.
- The demo doesn't say its version (`get_app_info` answers `1.0.0`, the plugin API's); its bundle's
  ETag stands in (`build b8f87af5`).

## Logseq bugs met on the way

Seen in the demo's build b8f87af5; source references are to Logseq's source
(https://github.com/logseq/og, the OG app as of 2026-05), which is close to it but not the same build.

1. **Backspace on an empty first block, with nothing above it, throws** (`TypeError: Cannot read
   properties of null (reading 'H')`, every time: `backspace.md › Backspace17`). The block is
   deleted, but no block is left in editing, and Logseq's `editor/op` stays `:delete`. From the
   source (`handler/editor/lifecycle.cljs`, `will-unmount`), an editor isn't saved when it unmounts
   while the op is `:delete`, so from then on, text typed less than the autosave delay before leaving
   a block would be lost; not observed. The driver clears the stuck op before the next test
   (`set_state_from_store`), and the runner reports the test as stuck.
2. **Tab right after startup leaves Logseq thinking it is still editing.** Before the global keys are
   installed (above), Tab moves the focus out of the block, but `check_editing` still answers that
   block; the typed text isn't lost (the autosave stores it). It hit the first test of every run
   until `open` waited for the keys, and one of three tries that typed a character before Tab.
3. **`indent-outdent` sets `editor/op` to `:nil`**, a keyword, instead of `nil`, after every Tab and
   Shift+Tab (`handler/editor.cljs`). Nothing Logseq checks treats it as an operation in flight, but
   `get_state_from_store('editor/op')` answers `"nil"`, which a reader checking for `null` takes
   for busy.
4. **The plugin API's `delete_page` goes to the home page** even when another page is open.
5. **The plugin API's `insert_batch_block` drops the leading whitespace of a block's lines**: code
   loses its indentation (`insert_block` and `update_block` keep it).
6. The demo requests `/js/eventemitter3.umd.min.js`, which the site doesn't have: a 404 page, which
   the browser refuses to run as a script.

Suspected and not seen: a key that lands while the focus is between editors goes to the page, where
Logseq's single-letter shortcuts (`t t` toggles the theme, `g a` opens All pages) would take it.
The runner's settling keeps keys out of that window, so it would only show with `--slow=0` and a
driver that doesn't settle.

## Internals

Logseq's plugin API, as the driver uses it (`window.logseq.api`): `create_page(name, {}, {redirect, createFirstBlock})`,
`insert_batch_block` (drops a line's leading whitespace), `update_block` (trims trailing), `remove_block`,
`delete_page` (goes to the home page: delete before creating), `get_page_blocks_tree`, `edit_block(uuid,
{pos})` (asynchronous; needs the block on screen), `check_editing`, `get_selected_blocks`,
`exit_editing_mode`, `get_all_pages`, `get_current_graph_configs`, and `get_state_from_store` /
`set_state_from_store` for the app's state (`editor/op`; `history/page-only-mode?`;
`['config', '@<repo>', 'editor/logical-outdenting?']`, the repo from `git/current-repo`). The block
being edited is the focused `TEXTAREA`.
