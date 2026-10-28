# Athens

[`driver.ts`](driver.ts) drives Athens's web build, https://athensresearch.github.io/athens/: an outliner of
Roam's kind (ClojureScript, re-frame, DataScript), open source, archived in 2022, whose last build still
runs on GitHub Pages for anyone, with no login. Its graph is a DataScript database in the page, saved
nowhere: a reload starts again from today's daily page and a welcome page. No version is compiled in
(Sentry's release is `athens@` and nothing); the bundle's date stands in: 2022-05-18 (`Last-Modified`
of `js/compiled/app.js`).

## Keys (Linux)

From Athens's help page (its table in the bundle, `mod` Control):

| action | keys |
| --- | --- |
| `enter` | Enter |
| `shiftEnter` | Shift+Enter (a line break in the block; twice, a blank line, the block holding paragraphs: an item's paragraphs right after its text are its block's (`paragraphsInBlock`, since 2026-10-25)) |
| `indent` | Tab ("Indent selected block") |
| `outdent` | Shift+Tab ("Unindent selected block") |
| `moveSubtreeUp` | *missing*: blocks move by drag and drop only (below); its tests are skipped |
| `moveSubtreeDown` | *missing*, as `moveSubtreeUp` |
| `move ②` | the mouse | a block dragged by its bullet, dropped where its drop line is (`athensDrop`, below) |
| `deleteContentBackward` | Backspace |
| `deleteContentForward` | Delete |
| `deleteSoftLineBackward` | Shift+Home, Backspace |
| `deleteSubtree` | Shift+Up on the block's first line (selects it: `textarea_keydown.cljs`), Backspace (deletes the selected blocks, children and all: `listeners.cljs`); after it no block is edited: the outline alone is judged (`noCaretAfter`). |
| `duplicateSubtree` | *missing* (no command): its tests are skipped |
| `pasteStructured` | Ctrl+V |
| `pastePlain` | Ctrl+Shift+V ("Paste without formatting") |
| `undo` | Ctrl+Z |
| `redo` | Ctrl+Shift+Z |

The moves: Athens's source has no move key (Alt+Shift+Up and Ctrl+Shift+Up select blocks, Ctrl+Up and
Down fold and unfold). A drag's drop is where the block goes, the behavior a move is tested for, so
playing one would test the drop chosen, not Athens. Checked again in the source (2026-10-18): the
editor's keys (`textarea_keydown.cljs`: Shift+arrows at a block's edge select, Ctrl+Up and Down fold)
and those for selected blocks (`listeners.cljs`: Enter, Backspace and Delete, Tab and Shift+Tab,
Shift+Up and Down, Up and Down) move nothing; `:block/move` is dispatched by a drop and by property
autocomplete only. A move could be emulated (that event, or a drag), but the driver would choose its
target, which a move is tested for.

Other shortcuts:

| shortcut | keys | what it does |
| --- | --- | --- |
| Convert to checkbox | Ctrl+Enter | `{{[[TODO]]}} `, then `{{[[DONE]]}} ` |
| Select previous block | Shift+Up | at a block's edge, the block selected whole, then the ones before |
| on selected blocks | Tab, Shift+Tab; Enter; Shift+Up, Shift+Down; Up, Down | indent or outdent them; edit the first; extend the selection; back to editing (`listeners.cljs`) |
| Select all blocks | Ctrl+A | |
| Fold block, Unfold block | Ctrl+Up, Ctrl+Down | |
| Zoom into current block | Ctrl+O | the block as the page |
| Zoom out of current block | Ctrl+Alt+O | |
| Open page or block link | Ctrl+O | |
| Autocomplete Menu | / | |
| Copy | Ctrl+C | |
| Bold, Italics | Ctrl+B, Ctrl+I | |
| Toggle Search | Ctrl+K | |
| Toggle Left Sidebar, Right Sidebar | Ctrl+\\, Ctrl+Shift+\\ | |
| Open Node in Sidebar | Shift+click | |

## Drag and drop

[`drag.md`](../../spec/drag.md), played with the real mouse (`athensDrop` in [`driver.ts`](driver.ts),
[`../lib/drag.ts`](../lib/drag.ts)), aimed where Athens's own drag puts each place (its block's
`on-drag-over` and `on-drop`, read in the bundle):

- **HTML5 drag and drop**, from a block's bullet (its anchor, `draggable`), which Playwright's mouse
  plays in Chromium. The place is read off the block whose container (its subtree's box) is
  innermost under the pointer: its upper half is before it; its lower half after it, left of 50 px
  from its left, and right of that its first child, where it has none (or is folded). So after a
  block is its container's bottom, left of its children (a level is 32 px); first under a parent the
  top of its first child, or a childless parent's lower half, right. Over the block dragged nothing
  moves (its own place).
- **A drop moves the blocks there** as ourus does (`Drag1`, `Drag2`, `Drag3`, `Drag8`, `Drag13` agree,
  the outline alone judged: below), checked besides by hand on places no case draws (out past a
  parent, after a nested block with children, down past siblings, first child before another).
- **No caret after a drop**: editing ends as the drag starts (the bullet takes the focus), and no
  block is edited after it. The outline alone is judged (`noCaretAfter`); where typing follows
  (`scenarios.md › Scenario8b`, `Scenario8c`) the example is skipped, its drop landing as ourus's
  does (played apart).
- **A heading keeps its `#`s**: a heading is text in its block, so a drop re-levels nothing (`Drag15`:
  `### D` / `#### E` after `## B`, ourus's `## D` / `### E`; `Drag16`).
- **It drags the block pressed, or the selected blocks whatever is pressed**: a press on one of them
  moves them all (Drag4, Drag20 land as ourus's, the selection gone: `caret`), and so does a press on
  another block, which stays where it is (`a`, `b` selected, `c` pressed: nothing moves; Drag5,
  Drag5b disagree). The driver selects blocks with Shift+Up on the first's first line, then
  Shift+Down.

## Reaching the graph

The bundle (`js/compiled/app.js`, 4.2 MB, shadow-cljs, compiled with every name shortened) keeps its
database to itself. [`proxy.ts`](proxy.ts) adds one statement to it on the way to the browser (the cache
keeps what the site sent), naming on `globalThis.__ourusAthens` what the driver needs, each found by
Athens's own code around it (and changing one number, the delay of a block's save, below):

| name | what | found by |
| --- | --- | --- |
| `conn()` | Athens's DataScript connection (`athens.db/dsdb`) | the graph's health check, `function …(){var a=<conn>;` ("Knowledge graph health check...") |
| `transact(conn, tx)` | DataScript's `transact!` | Athens's transaction wrapper, its tracing span `ds/transact!-wrap-span`, calling `<f>.j(a, tx)` |
| `deref(conn)` | `cljs.core/deref` | the same wrapper's `var f=<deref>(a)` |
| `read(json)` | transit's `read(reader(:json), json)`: ClojureScript data (keywords, maps, vectors) from JSON | Athens reading its settings, `read(reader(:json, null), localStorage.getItem(...))` |
| `volatile(v)` | a `Volatile` | its constructor, `function …(a){this.state=a;this.…=32768;…}` |

With them a test's page is transacted as transit (`["^ ", "~:block/uid", "…", …]` is a map), and read
back through DataScript's `Entity`, which the bundle exports (`datascript.impl.entity.Entity`) with its
JavaScript map interface intact (`get`, `key_set`; its `touched` and `cache` are volatiles). The driver
says so if the patch found nothing to name.

## The driver

- **A test is a page** (`ourus sxs <id>`), its blocks nested under it in one transaction, its entity id
  the driver's (from 1,000,000,000: above Athens's; counted in the page, which outlives a run and holds
  the graph), opened by its route (`#/page/<uid>`); the last test's
  page and its blocks are retracted in the same transaction. Transactions of the driver's don't reach
  Athens's undo, which is of its own events.
- **The caret**: a click opens the block for editing (its `textarea#editable-uid-<uid>`), as a user's
  does; then the textarea's selection.
- **Reading**: the page's entity, `:block/children` sorted by `:block/order`, each `:block/string`; the
  block being edited from its textarea. Blocks selected whole are `.block-container.is-selected`.
- **A block is its string**, Markdown and Roam's syntax as text: a heading is `## ` in it (rendered as
  one; the `:block/heading` and `:block/header` attributes the bundle names render nothing), a task
  Roam's `{{[[TODO]]}} ` / `{{[[DONE]]}} ` (Ctrl+Enter, "Convert to checkbox", writes it), code its
  fences. So the three `markup-` tags are refused. Athens numbers no blocks.
- **Code and math have no editor of their own**: a fenced block is shown as one (`<pre><code>`), but
  editing it is the block's textarea, fences and all, and Enter on a code or math line splits the
  block as on any text (Shift+Enter makes the new line). The driver refuses `enter-in-fence` (since
  2026-10-25: Fence1, 2, 3, 5, 42; checked by hand in a headless Chromium of its own).
- **A block's text is stored right after each change**, not two seconds after: Athens's block editor
  keeps an idle save, `(debounce #(save :idle) 2000)` in its state, and `proxy.ts` makes the 2000 a 0. A
  block the caret has left reads from the store, so for those two seconds it read as it was
  (`placeholders.md › Placeholder6` lost its typed `x`). Counting the timer in settling (timers up to
  2.1 s; a quiet page has none that long) gave the same verdicts, two seconds slower for every test that
  edits text.
- **Sentry is off**, by Athens's own opt-out (`localStorage.sentry = "off"`, read as it starts): else
  every transaction sends it a trace (448 in 70 tests, blocked). PostHog is blocked by the proxy.

## Camps declared

Each measured by playing its examples anyway (`run.ts athens --ignore-options`, 2026-10-18): the
examples skipped for a value declared disagree when played, those of the value agree in structure.

- `outdent: logical`, `enterOnEmptyItem: outdent`, `emptyItemWithChildren: refuse`, as Roam. (An empty
  block at the top level makes a sibling, `enter.md › Enter7`, `Enter15`: an option has one value.)
- **Paste** (`:paste-internal`, Athens's paste of anything but one line): what is pasted goes after
  the block, nothing split (`pasteStructuredMidText: after`); lines become blocks
  (`pasteStructuredLines: items`); a pasted number stays text, nested lists' too
  (`pasteStructuredListForm: literal`: Athens numbers no blocks); a paragraph's list goes under it
  (`pasteStructuredParagraphList: children`). The caret goes to the start of the first pasted block
  (its `focus-uid`, the first new block of the paste; checked in a headless Chromium of its own,
  typing after it: `- !┃x`), which the driver declares, `quirkPasteCaret: athens` (since 2026-10-25). Declared since 2026-10-18: 14 disagreements
  were these, and 6 examples of the values run instead.

## Athens bugs met on the way

1. **Backspace at the start of a page's first block deletes its text** (`backspace.md ›
   Backspace26`: `┃para` and the page is empty). For a page's first block, the block before it is
   the page (`db/prev-block-uid`), and `:backspace/delete-merge-block` merges the text into it: the page
   has a title and no string, so the text goes nowhere, the title unchanged (measured).
2. **A block dropped into its own subtree leaves the page**, with its children (`- a⏎  - b⏎- c`, `a`
   dropped as `b`'s child: `- c`). The drag skips a target inside `.dragging`, but the block dragged
   is `.is-dragging`, so nothing is skipped but the block itself, and `:block/move` makes a cycle.
   Unplayed: ourus refuses it (`drag.md › Drag12`), and the case has nothing to compare.

## Quirks

- **The browser's cache can hold the bundle unpatched** (GitHub Pages sends `max-age=600`): `open`
  clears it and loads again when the names aren't there.
- **The driver's `HEAD` for the bundle's date** is cached apart from the bundle (a key per method).
