# Logseq DB

[`driver.ts`](driver.ts) drives Logseq's database version (2.0.2) on its test channel,
https://test.logseq.com/: the app with a demo graph (`logseq_db_Demo`) in the browser's own storage
(OPFS, through the app's database worker), no login, nothing saved elsewhere. Its banner says the test
channel "may be unstable" (app.logseq.com is the stable one). The driver is Logseq's
([`../logseq/driver.ts`](../logseq/driver.ts), `logseqDriver`), shared with the file-based app
([`../logseq/`](../logseq/), OG): the same plugin API, the same editor, the same keys. What differs is
how a block's text is held (below), and [`proxy.ts`](proxy.ts)'s patch.

## Keys (Linux)

Logseq OG's ([`../logseq/README.md`](../logseq/README.md#keys-linux)): the same shortcut table
(`src/main/frontend/modules/shortcut/config.cljs`), the same bindings for every action. But:

| action | keys |
| --- | --- |
| `deleteSubtree` | as OG's, but from a code block's editor two Escapes (the first leaves the code for the block, the second selects it), then Backspace; no fence keeps Escape from selecting, as in OG, a code block's text having none |

Other shortcuts, where they differ from OG's (measured on the test channel, 2026-10-20, but the
property keys, from the shortcut table; the rest are OG's, and measured the same: Alt+L, Alt+K, Alt+W,
Alt+D, Alt+A, Alt+E, Ctrl+Shift+A, Ctrl+Up, Alt+Right, `t n`):

| shortcut | keys | what it does |
| --- | --- | --- |
| cycle task | Ctrl+Enter | the block's status (a property, the block tagged `#Task`): Todo, then Doing, Done, none (OG: its text's marker) |
| select parent | Ctrl+A | the text, then the block; a third press selects nothing more (OG: then its parent) |
| copy embed | Ctrl+Shift+E | OG's Ctrl+E |
| add property | Ctrl+Alt+P | new: a property of the block |
| set tags, deadline, status, priority, icon | `p t`, `p d`, `p s`, `p p`, `p i` | new: the block's tags and those properties (the block selected) |

Typing a task's `TODO ` makes no task (it stays text); Ctrl+Enter does. Typing `1. ` at a block's start
numbers it (the editor takes the `1. ` away), and `## ` makes a heading when the block is saved (the
editor keeps the `## ` till then); ```` ``` ```` makes a code block at once.

## Stack

Logseq 2.x, the database version: the frontend ClojureScript (shadow-cljs) in Rum (React), each block
edited in a textarea of its own, a code block in CodeMirror 5; the graph SQLite (wasm) in OPFS, run by
a database worker (`js/db-worker.js`) that holds the undo history and does every outliner operation. In
this build the worker is OCaml, compiled to JavaScript by Melange (https://melange.re, an OCaml-to-JS
compiler of BuckleScript's line, built with dune): its errors are `MelangeError`s, its module names
OCaml's (`Outliner_op`, `Outliner_validate`), its source `deps/db-worker/`; the ClojureScript outliner
it replaces is `deps/outliner`. The page sends Sentry and PostHog its telemetry, which the proxy
answers. Its version from `get_app_info` (`2.0.2`), its bundle's ETag as the build (`9a10307e`).

Repo: https://github.com/logseq/logseq (OG lives on as https://github.com/logseq/og)

## How a block's text is held

The canonical text's markup is the block's properties, its text the rest, as the editor makes them:

| canonical | stored |
| --- | --- |
| `1. a` | `a`, `:logseq.property/order-list-type` `number` (a run of numbered siblings numbered from 1) |
| `[ ] a`, `[x] a` | `a`, `:logseq.property/status` Todo or Done (Backlog, Doing, In Review read as `[ ]`; Canceled as `[x]`), the block tagged `#Task` |
| `## a` | `a`, `:logseq.property/heading` 2 |
| ```` ```js ```` … ```` ``` ```` | the code, `:logseq.property.node/display-type` `code`, `:logseq.property.code/lang` `js` |
| `$$` … `$$` | the math, display type `math` |

The load inserts the text, then sets the properties through `upsert_block_property` by their idents
(`logseq.property/status`, its value its title: `Todo`); a code or math block is inserted as written,
which Logseq makes one (`standalone-display-block`, `src/main/frontend/format/block.cljs`), its text set
again after (the insert drops a line's leading whitespace). An editor shows the text alone, every
property outside it, so a caret's offset shifts by the prefix. The read writes the properties back as
markup: a code block with ```` ``` ```` and its language (a longer fence where a line of the code
starts with a run of backticks, as Markdown needs: `fences.md › Fence62`), a math block with `$$`.

## Setting up and reading a test

- **A page per test**, as OG's: `create_page(name, {}, {redirect: false})` (a page shown while empty
  gets a block of its own), the blocks under it by `insert_batch_block`, `update_block` where a block's
  text came out otherwise, its properties, then `push_state('page', {name})`, and the caret by
  `edit_block` and the textarea's selection (a code block's: CodeMirror's `setSelection`).
- **Deleting a page puts it in the recycle bin**, which `get_all_pages` still lists: the last test's page
  is deleted, then deleted from the bin (`delete_recycled_page_permanently`); a run's first test sweeps
  the `spec-*` pages earlier runs left. Deleting doesn't leave the page shown.
- **Reading**: `get_page_blocks_tree` and the properties above (a status by its value's ident, read
  with `datascript_query`), the block being edited from its editor: its textarea, or a code block's
  CodeMirror, which is no block being edited to Logseq (`check_editing` answers false while it has the
  focus).
- **Undo** is the database worker's, per graph, and takes every transaction, the load's too: three undos
  after a load emptied the page. The app can empty it (`frontend.undo-redo/clear-history!`, which only
  its developer panel calls), so [`proxy.ts`](proxy.ts) adds one statement to the bundle naming that
  (`__ourusLogseq.clearHistory(repo)`), which the load calls last. Each name is found by Logseq's own
  code around it: the main thread's call into the worker that tolerates a worker not yet up, the
  `:thread-api/undo-redo-clear-history` keyword, the developer panel's own call for the argument list.
  There is no "page only" history, as OG's; a test's page is new, and its history starts with it.
- **Starts it can't hold**, declined: a line break at a stored block's edge (the insert and an update
  drop it; the block being edited holds it), a fence other than a block of ```` ``` ```` alone, a caret
  on a code block's fence or a math block's `$$`, code or math starting or ending with whitespace
  (Logseq trims them), a numbered run from another number than 1.

## What Logseq DB does that a driver has to know

- **Logical outdenting changes nothing**, a bug of the worker's port to OCaml. Settings › Editor has it,
  the config holds it, and the editor passes it with the outdent (`{:parent-original …
  :logical-outdenting? …}`). The worker's outliner honors it (`deps/db-worker/lib/outliner_core.ml`,
  `indent_outdent_blocks`'s `?logical_outdenting`), but the op that calls it never passes it on
  (`outliner_op.ml`, the `"indent-outdent-blocks"` case and the sync's: `?parent_original` passed,
  `~logical_outdenting` not, `resolve_indent_outdent_opts` reading `parent-original` alone), so every
  outdent is direct; the ClojureScript original passes the options whole
  (`deps/outliner/src/logseq/outliner/op.cljs`). Measured: the setting read back true through every
  reader (the plugin API's getter, `set_current_graph_configs`, the very keyword the editor reads), the
  outdent direct. The driver declares `outdent: direct` and no setting, and the logical examples are
  skipped.
- **Settling waits for the database worker**, whose messages no timer or DOM change shows: a paste
  waits on two or three of its requests, some 50 ms, before Logseq renders what it made, and a settle
  could end in between. The DB flavor's init script counts the page's requests of the worker
  (Comlink's, an `id` its answer echoes), busy while any is in flight (none stays open once idle:
  measured). CodeMirror 5 polls its input every 100 ms while focused (`pollInterval`), a timer always
  pending, so a focused code block didn't settle till the timeout: its poll goes to an hour (timing
  only: typing and pasting reach it by their events, read on its own fast poll). And `editor/op` left
  `undo` or `redo` (bug 8) counts as idle, the undo's work being the worker's request.
- **Up from the first block goes into the page's title**, which is editable: the caret leaves the
  blocks (`cursor.md › CursorUp1`). The emulated document start comes back down from it.
- **A code block's editor is CodeMirror's**: Shift+Enter there makes a new block after the code block
  (its key handler, `src/main/frontend/extensions/code.cljs`: "create new block"; `fences.md › Fence8`),
  Escape leaves the code for the block, Ctrl+V pastes into the code.
- **A math block's editor is a textarea with the math alone**, Enter there a new block
  (`fences.md › Fence42`).
- **Text is saved as markup is parsed**: a split-off `# def` becomes a heading on save
  (`enter.md › Enter9`, `tasks.md › TaskEnter3`), where ourus keeps the text, escaped (`\# def`); the
  projection drops that escape, so these read as caret verdicts or near ones, as SiYuan's do.
- **Paste**: a code block pasted at an item's end goes after it, not under it (`paste-old.md › PasteOld1`,
  `scenarios.md › Scenario18`); a heading and the text after it come apart by two blank lines
  (`PasteOld19`, `PasteOld57`); a paste into a numbered block keeps its number (OG's bug 7 isn't here).

Against OG, example by example, most come out the same; most of the rest are the paste bug below, OG
caret verdicts the DB version agrees on (Home, Up and Down in `cursor.md`, the caret after some
pastes), and the points above.

## Logseq DB bugs met on the way

Seen on the test channel's build 9a10307e (2.0.2); source references are to
https://github.com/logseq/logseq as of 2026-10-19.

1. **A list pasted as HTML with line breaks between its items nests each under the one before**
   (`<ul>\n<li>x</li>\n<li>y</li>\n</ul>`, as commonmark renders a list and a copy of a rendered page
   carries it: `x`, then `y` under it); the same HTML without them pastes them as siblings, as OG does
   with either. The runner's clipboards had such HTML (rendered from each case's Markdown, until
   2026-10-21): `paste-old.md › PasteOld13b`, `15c`, `16`, `20`, `21`, `27`, `38`, `59`, `60`
   and `gaps.md › Gap13` agree when played with the text alone, as the cases now give it, and
   `PasteOld17c`, `18`, `49` nested so too.
2. **Logical outdenting does nothing** (above): the OCaml worker's op drops the option its outliner
   honors.
3. **Ctrl+Shift+V in a code block pastes nothing** (`paste-old.md › PasteOld22`); Ctrl+V does.
4. **A code block pasted as HTML loses its language** (`paste-old.md › PasteOld66`: ```` ```js ```` in, a code
   block with none out).
5. A longer fence's extra backticks go into the language (```` ````js ````: `` `js ``), and around code
   with ```` ``` ```` in it the block stays text: only ```` ``` ```` fences make code blocks.
6. `upsert_block_property` with a property's value given by its ident (`logseq.property/status.todo`)
   fails in the worker (`MelangeError: Failure`); by its title (`Todo`) it works. Setting
   `logseq.property.node/display-type` fails validation (`Outliner_validate.Notification`).
7. **A pasted code block gets its editor's focus only sometimes**: opening it for editing publishes
   `:editor/focus-code-editor` (`src/main/frontend/state.cljs`), whose handler focuses the block's
   CodeMirror only if it exists by then (`src/main/frontend/handler/events.cljs`: `(when-let [cm
   (util/get-cm-instance container)] …)`), and nothing tries again. Measured: of ten pastes, five left
   nothing focused; with the CPU slowed six times, all ten. What is typed next then goes nowhere
   (`paste-old.md › PasteOld1`, `PasteOld25`, `scenarios.md › Scenario18` come out otherwise from run to run).
8. Undo and redo leave `editor/op` set (`src/main/frontend/handler/history.cljs`, `undo-aux!`,
   `redo-aux!`: `:undo`, `:redo`, never cleared), where every other operation clears it.

## Internals

The plugin API (`window.logseq.api`), as the driver uses it beyond OG's: `create_page(name, {},
{redirect: false})`, `insert_batch_block(page uuid, blocks, {sibling: false})`, `upsert_block_property`
(qualified idents as they are), `push_state('page', {name})`, `get_page`,
`delete_recycled_page_permanently`, `datascript_query`, `get_app_info`. A block from
`get_page_blocks_tree` has its built-in properties as `:logseq.property/…` keys, a property's value an
entity (`{id}`) where it has values of its own (status, order-list-type). The block being edited is the
focused `TEXTAREA`, or the focused CodeMirror (`.CodeMirror`'s `CodeMirror`) in a code block.

## Tags and references in a loaded block

The batch insert (`insert_batch_block`) refuses a block whose text has a tag (`#a`, `#[[a b]]`): its
transaction is invalid (`MelangeError: Db_tx.Invalid_tx`), whether the tag exists or not. Such a
block is inserted empty and then written by `update_block`, which, as typing does, makes the tag.
The database stores a tag or a page reference by uuid (`#[[uuid]]`, `[[uuid]]`), in `content`,
`title` and `fullTitle` alike; the read gives the name back (`#a`, `#[[a b]]`, `[[a]]`), as the
editor shows it. Before this, every start with a tag failed to load (Enter57's `p⏎#a`, an error in
every run) and a page reference read back as a uuid.

