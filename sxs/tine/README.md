# Tine

[`driver.ts`](driver.ts) drives [Tine](https://tine.page/), an outliner of Logseq's kind (pages of
blocks, stored as Logseq's Markdown), through its live guide, https://tine.page/guide/app/: Tine's
own editor (SolidJS, its parser in WASM), the guide export of 2026-09-28 (bundle `app-BBSWYxDX`; the
desktop app is 0.7.1). The spec's buffers are projected onto blocks, as for Logseq (the `block`
model, [`../lib/block.ts`](../lib/block.ts)).

## Keys (Linux)

From `src/keybindings.ts` and the block editor's handlers, checked in the app:

| action | keys |
| --- | --- |
| `enter` | Enter (splits; at the text's start, an empty block above) |
| `shiftEnter` | Shift+Enter (a line break in the block; twice, a blank line, the block holding paragraphs: an item's paragraphs right after its text are its block's (`paragraphsInBlock`, since 2026-10-25)) |
| `indent` | Tab |
| `outdent` | Shift+Tab (outdenting is direct by default; Settings › Editor has logical) |
| `moveSubtreeUp` | Alt+Shift+Up: the block with its children |
| `moveSubtreeDown` | Alt+Shift+Down: the block with its children |
| `deleteContentBackward` | Backspace (joining at a block's start) |
| `deleteContentForward` | Delete (joining at a block's end) |
| `deleteSoftLineBackward` | Alt+U ("kill line before") |
| `deleteSubtree` | Escape (the block selected), then Backspace; blocks selected already, Backspace alone (Escape would clear them); after it no block is edited: the outline alone is judged (`noCaretAfter`). |
| `duplicateSubtree` | *missing* (no command): its examples are skipped |
| `paste` | Ctrl+V (`- ` outlines become blocks) |
| `pastePlain` | Ctrl+Shift+V (as it is) |
| `undo` | Ctrl+Z |
| `redo` | Ctrl+Shift+Z |
| `fold` | Ctrl+Up: the block's children hidden, `collapsed:: true` written into its text (read as its fold, the line left out) |
| `unfold` | Ctrl+Down |
| `toggleFold` | *missing* |
| `zoomIn` | *missing*: a click on the block's bullet only (below); the zoom's cases skip |
| `zoomOut` | *missing*, as `zoomIn` |
| `clearZoom` | *missing*, as `zoomIn` |
| `moveSubtree` | mouse: a block's bullet dragged to the place (`drop` in [`driver.ts`](driver.ts), [`../lib/drag.ts`](../lib/drag.ts)); after it no block is edited (`noCaretAfter`) |

Other shortcuts:

| shortcut | keys | what it does |
| --- | --- | --- |
| cycle task | Ctrl+Enter | none, then `TODO`, `DOING` (a clock entry added under it), `DONE`, none; on selected blocks, each of them |
| clear block | Alt+L | the block's text deleted, its children kept |
| kill line after | Alt+K | to the end of the caret's line |
| word backward, forward | Alt+B, Alt+F | |
| kill word backward, forward | Alt+W, Alt+D | |
| select blocks | Shift+Up, Shift+Down (from a block's first or last line) | the block and the one above (below), then more |
| select all | Ctrl+A | the text, then the block with its children, then its parent's |
| edit the selected block | Enter | the caret at its end |
| indent, outdent selected blocks | Tab, Shift+Tab | all of them |
| copy embed | Ctrl+Shift+C (no text selected) | `{{embed ((<uuid>))}}`, the block given an `id::` |
| numbered list | typing `1. ` in an empty block | numbered (`logseq.order-list-type:: number`) |
| quick capture | Ctrl+Shift+Enter | the block filed to today's journal |
| bold, italic, strikethrough, highlight | Ctrl+B, Ctrl+I, Ctrl+Shift+S, Ctrl+Shift+H | |
| insert link, follow link | Ctrl+L, Ctrl+O (Ctrl+Shift+O: in the sidebar) | |
| document mode | `t d` (not editing) | Enter a line break, Shift+Enter a new block |

From Tine's binding table (`src/keybindings.ts`, OG's ids and keys) and its block editor
(`src/components/Block.tsx`), each measured in the guide but quick capture, the formatting and link
keys and document mode. Unlike OG, Alt+Left and Alt+Right go back and forward, not zoom: a block is
zoomed into by a click on its bullet only. Headings have no key (the block's context menu).

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
pages, saving nothing. So [`proxy.ts`](proxy.ts) drops the meta from the app's page, and names three
of the bundle's values on `globalThis`, which the bundle keeps to itself: the document store
(`__sxsDoc`, `[doc, setDoc]`), the backend's pages (`__sxsPages`) and Tine's reading of a block's
header from its text (`__sxsFacets`, `deriveFacets(raw, format)`). Both patches are applied on
the way out, so the cache keeps what the site sent. A new bundle the patterns don't match leaves the
names out, and `open` stops the run saying so. The only traffic is GETs: the app, and the plugin
registry on raw.githubusercontent.com.

## Setting up and reading a test

- **A page per test**, `sxs-<run>-<n>`: pushed into the backend's pages as a page of blocks (each
  `{ id, raw, children }`, the id `<page>-<i>`), then opened as a user would, with the search (Ctrl+K,
  its name, Enter): the app has no route to a page. The name has the run in it: a tab can outlive a
  run (one that died), and the next run of Tine takes it over with the last run's pages still there, so a name of its own
  per run is what keeps the search from opening an old page of the same name.
- **A block's header facets**: a page's blocks come from the backend with their task marker,
  priority, heading level, dates, tags and properties, the Rust parser's, and Tine takes those as
  they are (`seedFacets`, `src/render/facets.ts`) until a block's text changes. So the driver's
  blocks carry Tine's own reading of their text (`deriveFacets`, named by `proxy.ts`, as Tine
  derives them for an edited block). Until 2026-10-18 they carried none: a numbered block was no
  list to Tine (no `1.` drawn, Enter and paste not numbering what they made, Backspace joining it
  where Tine, as OG, takes its number off), and a `TODO` block no task, until edited.
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
- **Enter always splits** (after its own cases: in a fence, in `$$` math, in page properties, on an
  empty numbered item, on a list line inside the block): an empty last child makes another, where
  OG outdents it (`Block.tsx`'s Enter, then `splitBlock`). The split keeps the spaces at both halves'
  edges (nothing trimmed), and over a selection splits at its start, the selected text kept.
- **Pasted HTML's emphasis is spelled `_i_` and `~s~`**: the same text as `*i*` and `~~s~~` to the
  comparison, which goes by the rendering (`sameText` in lib/block.ts, since 2026-10-25).
- **Backspace at a numbered block's start takes its number first**, as Logseq does, the block a
  bulleted one (`backspace.md › Backspace29`): declared, `backspaceAtItemStart: logseq` (since
  2026-10-25).
- **A backtick in text is typed as a pair**, as Logseq does (`backtick.md › Backtick18`, `19`, `21`,
  `32`): declared, `closeBackticks: all` (since 2026-10-25).
- **A join never refuses but at the top**: Backspace at a block's start joins it into the block
  above, Delete at the very end of its text the block below into it (`absorbInto`), their children
  appended to the survivor's; Backspace on a page's first block does nothing. Delete joins only with
  the caret at the text's very end: a space after the caret is deleted first. So of ourus's
  `emptyItemWithChildren` camps Tine is SiYuan's and BlockNote's (refusing Backspace with nothing
  above, lifting on Delete), and the driver declares no value: it said `refuse` until 2026-10-18,
  skipping six examples Tine plays otherwise.

- **Against Logseq OG**, which Tine copies: of 334 examples both ran from the same start, 275 came
  out the same before the facets were seeded (the driver's loads gave Tine none: a numbered block was
  no list to it), 282 after; of the 50 apart, Tine's own rules above (Enter always splits, joins
  never refuse) and Logseq's (a join refused where both blocks have children, the hidden property of
  a numbered block). Where a near-clone differs from its original, the driver is the first place to
  look.

## Drag and drop

Drag and drop ([`move-subtree.md`](../../spec/move-subtree.md), played with the real mouse, aimed where its own
geometry puts each place: `Block.tsx`'s bullet drag, read in the guide's bundle, measured in the guide):

- **A bullet is dragged with mouse events**, not HTML5 drag: a press on `.bullet-container`, a move of
  4 pixels starts it, the block under the pointer is the target and the place is on it: more than 50
  pixels right of the block's left (a level is 30), its last child; else before it in the top half of
  its row, after it in the bottom half. A first child is dropped before the parent's first other
  child, or as the child of a parent with none (`MoveSubtree3`, `MoveSubtree9`); a place inside the dragged
  blocks is refused, nothing moved. The places agree (`MoveSubtree1`, `MoveSubtree2`, `MoveSubtree3`, `MoveSubtree9`, `MoveSubtree12`,
  `Scenario8`).
- **The drag ends the editing**: after a drop no block is edited, the caret gone, so the outline
  alone is judged (`MoveSubtree1`, `MoveSubtree2`, `MoveSubtree9`, `MoveSubtree12`), and a case typing after it is skipped
  (`Scenario8b`, `Scenario8c`: "no text focus").
- **A heading keeps its level**: the text moves as it is, its section's headings with it (`MoveSubtree14`:
  `### D` and `#### E` under `## B`, ourus's `## D`, `### E`; `MoveSubtree15`: `##### D`, ourus's `## D`).
- **No cover rule**: with blocks selected, a drag from any bullet carries the selection, the pressed
  block in it or not; with none, the pressed block with its children. A press on a selected block
  agrees (MoveSubtree4, MoveSubtree19, the selection kept); one on `c` with `a`, `b` selected moves them to where
  they are, nothing changing (MoveSubtree5, MoveSubtree6 disagree; ourus moves `c` alone).

## Folds, measured

[`fold.md`](../../spec/fold.md), measured 2026-10-28 (no zoom: [`zoom.md`](../../spec/zoom.md)'s
cases skip). A block's fold is its `collapsed`, seeded with the page as the rest is, and read from
the store; what Ctrl+Up writes into the text, `collapsed:: true`, is left out of the block's text,
its fold being what the step reports. What is compared is what the reader sees, the folds in effect.

- **Around a collapsed block it agrees**, as Logseq OG does: Enter at its end and on an empty one
  with children (`Fold1`, `Fold5`), Backspace after it (`Fold3`), a move (`Fold4`), an indent under it
  (`Fold6`), unfold (`Fold12`).
- **Enter mid-text in a collapsed block** (split as `enterMidItem: child`) puts the rest after its
  children, the block still collapsed (`Fold2`, `Fold2b`), as ourus under `child`.
- **Delete at a collapsed block's end does nothing** (`Fold7`), as ourus, which refuses it (`folded`).
- **Backspace right after a collapsed block joins into its text**, not its hidden last child's, still
  collapsed (`Fold15`), as ourus.
- **The block joined into a collapsed block keeps its children hidden**: they go after its own, still
  collapsed (`Fold15b`); ourus puts them there and opens it, so none it moved is hidden.

## Tine bugs met on the way

Seen in the guide's export of 2026-09-28; source references to Tine's repository as of 2026-10-17.

1. **A join puts the joined block's children last** (`delete.md › Delete5`, `5b`, `5e`,
   `backspace.md › Backspace17c`). `absorbInto` appends the absorbed block's children to the
   survivor's (`children.push(...node.children)`), so where the survivor has other children after
   the absorbed one, the outline's order changes: Delete at the end of an empty block whose first
   child `a` has a child `b` and a sibling `c` reads `a`, `c`, `b` after.
2. **Backspace on an empty block after a collapsed one throws** (`fold.md › Fold3`, 2026-10-28):
   `TypeError: Cannot read properties of undefined (reading 'page')` in the page, the block gone and
   the caret at the collapsed block's end all the same, as ourus.

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
