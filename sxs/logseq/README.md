# Logseq OG

[`driver.ts`](driver.ts) drives [Logseq OG](https://github.com/logseq/og) on [demo.logseq.com](https://demo.logseq.com/):
the file-based app ("OG") with a demo graph that lives in the browser and saves nothing. The driver is
both Logseqs' (`logseqDriver`): the database version runs on it too ([`../logseq-db/`](../logseq-db/)),
a flavor of its own deciding how a block's text is held (OG's: all of it in the text).

## Keys (Linux)

| action | keys |
| --- | --- |
| `enter` | Enter |
| `shiftEnter` | Shift+Enter (a line break in the block; twice, a blank line, the block holding paragraphs: an item's paragraphs right after its text are its block's (`paragraphsInBlock`, since 2026-10-25)) |
| `indent` | Tab |
| `outdent` | Shift+Tab |
| `moveSubtreeUp` | Alt+Shift+Up |
| `moveSubtreeDown` | Alt+Shift+Down |
| `deleteContentBackward` | Backspace |
| `deleteContentForward` | Delete |
| `deleteSoftLineBackward` | Alt+U ("kill line before": from the start of the caret's line; nothing at a line's start) |
| `deleteSubtree` | Escape (selects the block), Backspace (deletes the selection); in a block with a code fence, which Escape never selects, Ctrl+A until the block is (its text, then the block); after it no block is edited (when the first block goes): the outline alone is judged (`noCaretAfter`). |
| `duplicateSubtree` | *missing* |
| `move ②` | the mouse: a block dragged by its bullet and dropped (`logseqDrop` in [`driver.ts`](driver.ts), below) |
| `pasteStructured` | Ctrl+V |
| `pastePlain` | Ctrl+Shift+V |
| `undo` | Ctrl+Z |
| `redo` | Ctrl+Shift+Z |

Other shortcuts:

| shortcut | keys | what it does |
| --- | --- | --- |
| cycle task | Ctrl+Enter | none, then `LATER`, `NOW`, `DONE`, none (the demo's workflow; the other is `TODO`, `DOING`, `DONE`) |
| clear block | Alt+L | the block's text deleted, its children kept |
| kill line after | Alt+K | to the end of the caret's line |
| kill word backward, forward | Alt+W, Alt+D | |
| word forward, backward | Alt+F, Alt+B | |
| block start, end | Alt+A, Alt+E | the caret to the start or end of the block's text |
| select block up, down | Alt+Up, Alt+Down | the block being edited selected, then the selection extended; Shift+Up and Shift+Down too, from a block's first or last line |
| select parent, select all | Ctrl+A, Ctrl+Shift+A | Ctrl+A: the text, then (all of it selected) the block, then its parent (at the top, every block); Ctrl+Shift+A: every block |
| edit the selected block | Enter | the caret at its end |
| fold, unfold, toggle | Ctrl+Up, Ctrl+Down, Ctrl+; | a block's children hidden or shown |
| fold or unfold all | `t o` (not editing) | |
| zoom in, zoom out | Alt+Right, Alt+Left | a block as the page, and back |
| numbered list | `t n` (blocks selected) | toggled on the selected blocks (their `logseq.order-list-type` property); typing `1. ` in an empty block makes it numbered |
| copy, cut | Ctrl+C, Ctrl+X | selected blocks, in three formats (below) |
| copy as text | Ctrl+Shift+C | selected blocks as Markdown (`- a\n\t- b`) |
| copy embed | Ctrl+E | `{{embed ((<uuid>))}}` of the block |
| bold, italic, highlight, strikethrough | Ctrl+B, Ctrl+I, Ctrl+Shift+H, Ctrl+Shift+S | |
| insert link, follow link | Ctrl+L, Ctrl+O | |
| up, down | Ctrl+P, Ctrl+N | as Up and Down |

From Logseq's shortcut table (`modules/shortcut/config.cljs`), each measured in the demo but the
formatting and link keys. Headings have no key (a block's context menu, `/h1` ...).

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
- **A numbered block's editor shows its text alone.** The number is a property stored in the
  block's content (`a\nlogseq.order-list-type:: number`), one of Logseq's hidden ones
  (`hidden-built-in-properties`), which an editor never shows: the driver's editor holds `a`, as
  Logseq opens it. (It held the property line until 2026-10-18: Logseq's keys read the editor, and an
  empty numbered block wasn't empty to its paste, PasteOld16.)
- **Reading**: `get_page_blocks_tree`, except for the block being edited, which is read from its
  textarea (its number from the database): Logseq stores what is typed about half a second after
  typing stops. Selected blocks come from `get_selected_blocks`.
- **Tasks** are Logseq's markers: `[ ]` is `TODO`, `[x]` is `DONE` (and `LATER`, `NOW`, `DOING`,
  ... read as tasks).
- **Undo** is Logseq's "page only" history (a setting of its right sidebar), so it stays within the
  test's page, and it starts with the test: Logseq's history takes every transaction but an undo's
  (`listen-db-changes!`), the load's too, and keeps it in a module of its own, so
  [`proxy.ts`](proxy.ts) adds one statement to Logseq's bundle on the way to the browser (the cache
  keeps what the site sent), naming a function that empties the graph's undo and redo stacks
  (`__ourusLogseq.clearHistory`), which the load calls last. Before it, an undo past what a test did
  took back part of its load: three undos after a load emptied the page, and
  `scenarios.md › Scenario23`'s three undos came back with the page's first empty block one run in
  five. `open` reloads with the browser's cache cleared if the bundle came unpatched.
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
  block's editor went into the last inserted block's (`move-subtree-up.md › MoveUp8`: `c1` held as `c`). So
  the driver writes only into the editor inside the target block (`.ls-block[blockid]`), opening the
  target again if the focus has moved, and the runner loads a start held wrong once more.
- **What Ctrl+V pastes is the clipboard's HTML, where it has some** (`paste-copied-text`): the HTML
  converted to Markdown, else the text; then blocks if that reads as Markdown blocks (a line starting
  `-`, `+`, `*` or `#`: `markdown-blocks?`), else paragraphs if it has blank lines, else text into
  the block. So PasteOld7 and PasteOld10's plain lines paste as text, though `spec/paste-old.md` says Logseq
  makes items there; a numbered list pastes as blocks (from the runner's HTML, its numbers dropped),
  where as text alone it would go into the block as text; and a heading and a line come out of the
  conversion with a blank line between them (PasteOld19, PasteOld57). Measured with text alone against the
  runner's text and HTML, 2026-10-18.
- **Logseq's own copy** (Ctrl+C on selected blocks) writes three formats: `web application/logseq`,
  the blocks as EDN (DataScript's entities, properties and all), which a paste in Logseq takes
  first, restoring the blocks exactly; `text/plain`, the blocks as Logseq's Markdown, the hidden
  properties showing (`- a\n  logseq.order-list-type:: number\n\t- kid`), which pastes back exactly
  too; and `text/html`, an export through XSLT, which this Chromium prefixes with its notice that
  XSLT is going away: pasted alone, the notice is a block, the list under it. The runner writes
  neither the first nor such HTML, and reads an app's copy as text.
- **Escape never selects a block with a code fence** (`components/block.cljs`, the editor's
  `on-hide`: `select? (not (string/includes? value "```"))`): it leaves the editor, nothing selected.
  `deleteSubtree` selects such a block with Ctrl+A instead (DeleteSubtree8, Open2: Escape and
  Backspace did nothing).
- **Backspace at the first block's start does nothing** (`backspaceAtTopItem: refuse`, declared for both
  Logseqs: `backspace.md › Backspace34` agrees with it, played with `--ignore-options`).
- **Backspace at a numbered block's start takes its number first** (a property here), the block a
  bulleted one, the blocks after it numbered from 1 again (`backspace.md › Backspace29`,
  `obsidian-true-outliner.md › TO5`); declared for both, `backspaceAtItemStart: logseq` (since
  2026-10-25). ourus keeps the later items' numbers, so Backspace29 still differs in them.
- **A backtick in text is typed as a pair**, the caret between (`backtick.md › Backtick18`, `19`,
  `21`), in both: declared, `closeBackticks: all` (since 2026-10-25). Typed again before a closing
  run of two, it types another pair rather than step over it (Backtick32).
- **The caret moves by pixels**, in a proportional font: after Up or Down it lands at another column
  than the spec's monospace one.
- The demo doesn't say its version (`get_app_info` answers `1.0.0`, the plugin API's); its bundle's
  ETag stands in (`build b8f87af5`).

## Drag and drop, measured

[`drag.md`](../../spec/drag.md) and the scenarios' drops, played with the real mouse
(`logseqDrop`, [`../lib/drag.ts`](../lib/drag.ts)), aimed where Logseq's own geometry puts each place
(`block-drag-over` in `frontend/components/block.cljs`, read in the bundle):

- **A block is dragged by its bullet**, an HTML5 drag (`draggable` on `.bullet-container`;
  `dragover` and `drop` on each `.ls-block`), which Playwright's mouse plays. The innermost block under
  the pointer is the target, and where on it says the place: within 16 pixels of its top, before it
  (only the page's first block offers that); else more than 50 pixels right of the block's left, its
  first child; else its next sibling, after its children. Every place a case names is one of those:
  first under a block is its first child, first at the top level before the first block, after a
  block its next sibling. Drag1, Drag2, Drag3, Drag8, Drag13 and Scenario8 agree.
- **Headings keep their level**: a heading is its block's text, and a drop moves the block as it is,
  `### D` dropped after `## B` staying `### D`, its child `#### E` too (Drag15, Drag16; ourus
  re-levels it to its new siblings).
- **No block is edited after a drop**, and none is selected, even where the block dragged was the
  one being edited: the outline alone is judged (`noCaretAfter`), and a case that types after its drop
  skips (Scenario8b, Scenario8c). The DB version keeps the editor of the block dragged.
- **A selection of blocks is dragged whatever bullet is pressed**: a press on one of them takes them
  all, and they stay selected (the cover rule: Drag4, Drag20 agree), but so does a press on another
  block, which stays where it is (`a`, `b` selected, `c` pressed and dropped at the top: nothing
  moves; ourus moves `c` alone: Drag5, Drag5b disagree). The driver selects blocks as a user does,
  Escape then Shift+Down until the last is in (`selectsBlocks`).

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
7. **A paste into a numbered block takes its number away** (`paste-old.md › PasteOld2`, `PasteOld18`: `1. a┃`
   and a list pasted, `a` unnumbered after, the list numbered from 1). `paste-blocks` takes the
   editor's text (`a`) for unsaved edits when it differs from the stored content, which a numbered
   block's always does (`a\nlogseq.order-list-type:: number`: the editor shows no hidden property),
   and saves it over the block, its number with it; the pasted blocks take the number the block had.
   The same with the list typed (`1. ` makes a numbered block), with text alone, and after a pause.

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
