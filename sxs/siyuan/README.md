# SiYuan

[`driver.ts`](driver.ts) drives [SiYuan](https://b3log.org/siyuan/), a block editor over Markdown
(a document's paragraphs, headings, lists and their items, quotes and code are blocks), open source
(AGPL-3.0): release 3.8.6 (2026-09-29), run from its Linux arm64 release on this machine, its kernel
serving the web UI that the app's browser loads. It has no public demo. The spec's buffers are
projected onto blocks (the `block` model, [`../lib/block.ts`](../lib/block.ts)) in free form (`freeForm`):
a paragraph, a heading or code is a block outside every list (`¶` in the drawings), at the top level or
in an item, as SiYuan's own blocks are, a list item an item.

## Keys (Linux)

From the keymap in SiYuan's configuration (`window.siyuan.config.keymap`, where ⌘ is Ctrl on Linux),
checked in the app:

| action | keys |
| --- | --- |
| `enter` | Enter |
| `shiftEnter` | Shift+Enter (a line break in the block) |
| `indent` | Tab: the item with its children |
| `outdent` | Shift+Tab: the item with its children (outdenting is direct) |
| `moveSubtreeUp` | Ctrl+Shift+Up ("Move up", ⇧⌘↑) |
| `moveSubtreeDown` | Ctrl+Shift+Down ("Move down", ⇧⌘↓) |
| `deleteContentBackward` | Backspace |
| `deleteContentForward` | Delete |
| `deleteSoftLineBackward` | Shift+Home, then Backspace (no command for it) |
| `deleteSubtree` | *missing* (below): its examples are skipped |
| `duplicateSubtree` | Ctrl+D ("Duplicate", ⌘D): the block being edited, which in an item is its paragraph, copied inside the item (`DuplicateSubtree1`); the item with its children is duplicated from its block menu |
| `pasteStructured` | Ctrl+V |
| `pastePlain` | Ctrl+Shift+V |
| `undo` | Ctrl+Z |
| `redo` | Ctrl+Y |

No key deletes an item with its children, nor selects one whole: Shift+Up at a block's first line
selects its paragraph (not the item), and Backspace then empties the paragraph, the item and its
children staying; Ctrl+A selects the block's text, then every top-level block; a click on the bullet
zooms into the item (measured, 3.8.6). An item is deleted with its children from its block menu (the
gutter's, or ⌘/), by mouse.

Other shortcuts (the keymap's, `window.siyuan.config.keymap`, Linux; ⌘ is Ctrl):

| shortcut | keys | what it does |
| --- | --- | --- |
| Expand, Collapse | Ctrl+Down, Ctrl+Up | unfold, fold the block's children |
| Fold recursively | Alt+Ctrl+Up | the block and every block under it |
| Enter, Back (zoom) | Alt+Right, Alt+Left | the item as the page (as a click on its bullet), and back |
| Jump to parent, its previous, its next | Ctrl+Shift+J, Ctrl+Shift+M, Ctrl+Shift+N | the caret to the parent block, or to the parent's sibling |
| Insert before, after | Ctrl+Shift+B, Ctrl+Shift+A | an empty block before or after the block |
| Expand selection up, down | Alt+Shift+Up, Alt+Shift+Down | select the block, then more above or below (Shift+Up and Down at a block's edge too) |
| Select to page start, end | Ctrl+Shift+Home, Ctrl+Shift+End | |
| Toggle task | Ctrl+Shift+L | check or uncheck the item |
| Insert task list | Ctrl+L | a task list with one empty task after the block (in an item, inside it) |
| Paragraph, Heading 1 to 6 | Alt+Ctrl+0, Alt+Ctrl+1 to 6 | the block's type |
| Code block, Table | Ctrl+Shift+K, Ctrl+O | |
| Block menu | Ctrl+/ | the block's menu: delete, duplicate, turn into, move, ... |
| Mind map: add sibling, child | Ctrl+Enter, Ctrl+Shift+Enter | in a list's mind-map view only |

## Stack

A kernel in Go (1.26, on gin 1.12) keeps a workspace of notebooks, each document a `.sy` file (a JSON
tree of blocks), indexed in SQLite (a fork of go-sqlite3). Lute (`88250/lute`), SiYuan's Markdown
engine, runs in the kernel and, compiled to JavaScript, in the client (`stage/protyle/js/lute/`):
it reads Markdown into blocks and the editor's DOM back into Markdown. The client is TypeScript with
no UI framework, built with webpack 5; its editor, Protyle, is its own (each block's text a
`contenteditable` in `.protyle-wysiwyg`). The desktop app is Electron 44 around the same client and
kernel. Also its own: dejavu (the data repository and sync) and riff (flashcards). From `kernel/go.mod`
and `app/package.json` at v3.8.6, and the release's files.

Repo: https://github.com/siyuan-note/siyuan

## Running it

[`kernel.ts`](kernel.ts), from the driver's `open` (a worker's window, before it loads the UI):

- **The release**, `siyuan-<version>-linux-arm64.tar.gz` (or `-linux.tar.gz` on x64, 250 MB), is
  downloaded from GitHub once into `.sxs/siyuan/files/`, its SHA-256 checked against the release's
  `SHA256SUMS.txt`, its `resources/` (kernel, stage, appearance, guide) unpacked there, into
  `.sxs/siyuan/files/siyuan-<version>-linux-<arch>/`, and the archive deleted (kernels starting at
  once take turns, `files.lock`). `SIYUAN_VERSION` picks the release, 3.8.6 by default: pinned, so a
  report changes when the app does, not when SiYuan releases.
- **A kernel for each worker**, as the pool's browsers are numbered: kernel n is
  `resources/kernel/SiYuan-Kernel serve --workspace=.sxs/siyuan/<n>/workspace --port=<6816+n>
  --wd=<resources> --lang=en`, its log `.sxs/siyuan/<n>/kernel.log` and pid `.sxs/siyuan/<n>/server.pid`.
  A worker leases the first kernel no other worker holds (`.sxs/siyuan/<n>/kernel.lock`, held until
  the run ends), starting it if it isn't running; a window an earlier run left is on its kernel's port,
  and the worker reusing it holds that kernel (or, held already, opens a new window on another). Each
  is started detached and left running for the next run, as the browsers are, while its workspace has
  the driver's plugin (a workspace deleted under it, it is started anew); `run.ts --stop` stops them
  all. A workspace is its kernel's data directory: its settings, the test notebook, the driver's
  plugin; deleting it (with the kernel stopped) gives a fresh one. Kernel 0's port is
  `OURUS_SIYUAN_PORT`, 6816 by default, not SiYuan's 6806, so a SiYuan of the user's is never touched.
  A kernel boots in under a second (`system/bootProgress` at 100). Kernels share nothing but the
  release: their documents, undo and notebooks are their own, so workers never meet.
- **Closed in**: it listens on 127.0.0.1 only (the workspace's `system.networkServe` is off, checked
  at start: a workspace serving the network is refused), needs no auth code there
  (`SIYUAN_ACCESS_AUTH_CODE_BYPASS`, the variable its Docker image documents), and has no way out:
  its HTTP and HTTPS proxy is 127.0.0.1:9, where nothing listens, so no update, announcement or sync
  leaves. The browser reaches it on loopback, past the caching proxy (Chromium doesn't proxy
  loopback), and the UI asks the proxy for nothing.
- **A fresh workspace** has a starter notebook of its own beside the test one, `ourus sxs`; a run's
  first test on a kernel removes earlier runs' documents there.
- **A workspace locked elsewhere**: a kernel locks its workspace (`flock` on `workspace/.lock`) and
  exits 24 ("lock workspace failed") if it can't. On 2026-10-18 every workspace's lock was held by
  nothing in this container (no kernel running, nothing in `/proc/locks`; a new file beside it locked
  fine), most likely a kernel of another container on the same checkout: deleting `.sxs/siyuan/`
  (the release downloads again) gave fresh workspaces.

## The driver's plugin

The kernel's API makes and removes documents, but nothing opens one in the editor: the frontend's
`openFileById` isn't reachable from the page, and navigating to `/?id=<doc>` reloads the whole UI,
about 3 s a test. SiYuan's plugin API has it (`openTab({ app, doc: { id } })`), so the driver brings
a plugin of its own, [`plugin/`](plugin/) (`plugin.json` and `index.js`, a dozen lines), that gives
the page `window.__ourusSxs`: `open(id)`, resolved when the tab has opened, and `editor()`, the
plugin API's `getActiveEditor()`. `kernel.ts` copies it into the workspace
(`data/plugins/ourus-sxs/`), enables it (`data/storage/petal/petals.json`), and trusts plugins in
the workspace (`setting/setBazaar`, `trust: true`: the "trust" a user confirms in Settings ›
Marketplace; a fresh workspace on a desktop or in Docker loads no plugin without it,
`IsPetalsEnabled` in `kernel/model/plugin.go`). A document opens in about 0.3 s.

## Setting up and reading a test

- **A document per test**, in the notebook `ourus sxs`, made from Markdown through the API
  (`filetree/createDocWithMd`), in free form: a free block a block of its own, set off by blank lines,
  at the top level or in its item at the item's content column (its lines escaped where they would
  read as a list's item or a quote, `\- x`; an empty one a zero-width space, which SiYuan makes an
  empty paragraph of and its converter drops); what one owns in ourus's outline (a heading its section,
  a paragraph the list after it) beside it, as Markdown has them (`liftOwned`, `lib/block.ts`); an item
  `- ` at its depth, its continuation lines indented under it. A numbered block that doesn't go on from the one before it (`1. a`, `1. b`)
  starts a list of its own by the other delimiter (`1)`), which SiYuan keeps apart, drawing it `1.`
  (Markdown with `1.` for both would make one list, numbered on). Opened through the plugin; the last test's document is then removed
  (`filetree/removeDocByID`), which closes its tab, and before a run's first test every earlier
  document in the notebook is.
- **Undo is the kernel's**, per document (3.8 moved the undo stack into the kernel, its
  `GlobalUndoLog`, shared by every window: `app/src/protyle/undo/index.ts`), so a fresh document
  starts with an empty history and undo stays within the test (Protyle's `clearStack` does nothing
  now).
- **Reading is the editor's DOM**, SiYuan's own tree: the list items in order, a block's text its own
  blocks' Markdown by SiYuan's converter (`protyle.lute.BlockDOM2StdMd`, one block's DOM to
  Markdown), joined by line breaks, a task item's `[ ] ` or `[x] ` before it (`data-task`); any block
  but an item's text free, and nested as ourus's outline has them among each block's siblings
  (`ownBlocks`: a heading takes its section, a paragraph the list after it, inside items too); a free
  block's escape at its start off (`\- x` is the paragraph `- x`, SiYuan keeping the backslash), as
  the projection has a block's text; a table's caret by its cell (SiYuan pads a column to its widest
  cell, the caret's marker counted in it). An item's text is its first block; its other blocks are its children, in order with its nested lists, an
  empty paragraph too, where it is: SiYuan leaves one where an item's blocks went into the item above
  (Backspace at an empty item's start, Enter on an empty child), a block until it is deleted, and
  typing there fills it. (Read as a line of the item's text, as until 2026-10-18, it made 17 of
  these whitespace verdicts, and drew a paragraph after a nested list before it.) A block
  outside every list (a paragraph SiYuan made of an item, by Shift+Tab at the top level, say) is
  owned as the spec's buffers' blocks are (`../lib/block.ts`): a paragraph owns the list right after
  it, a heading its section. Not the whole document's Markdown projected as the buffers are: SiYuan's
  Markdown can say less than its tree (after a deletion at a text's start, `-  b` with a child indented
  two columns, which CommonMark doesn't make its child). Blocks selected are those with
  `.protyle-wysiwyg--select`.
- **The caret** is mapped into a block's Markdown, and back, through a marker character: put where the
  caret is in a copy of the block's DOM, the copy converted, the marker found. So markup the editor
  draws as no text (`**b**`, a heading's `## `, the zero-width characters around inline code) counts as
  it does in the Markdown. Placing a caret takes the DOM position whose marker lands at the offset.
- **Settling**: edits go to the kernel as transactions, and undo and redo come back from it, so the
  busy signal is a request the page owes (`fetch`, counted by the driver).
- An example takes about 1 s, the document's making and opening most of it; a full run some 7 minutes
  on one kernel, 106 s on four (4 workers, the default).

## Starts SiYuan won't hold

Measured (each was a start the load check found held otherwise, in the first full run), and skipped
with the reason (`holds`):

| reason | what SiYuan does | e.g. |
| --- | --- | --- |
| a block's text starting with whitespace | a tab or an indented line becomes structure, or is trimmed | `cursor.md › CursorDown2`, `delete.md › Delete11` |
| a line's trailing whitespace | trimmed, a hard break's two spaces too (an empty task's `[ ] ` is its checkbox, and held) | `indent.md › Indent19`, `delete.md › Delete5d` |
| a block's text ending in a line break | the empty last line trimmed | `shift-enter.md › ShiftEnter11`, `12` |
| a heading's closing #s | dropped: `# Title #` is `# Title` | `backspace.md › Backspace4` |
| a thematic break as an item | `- ---` is a thematic break, not an item holding one, and SiYuan makes it one, outside the list | `move-subtree-up.md › MoveUp19` |
| a caret in a task's checkbox | the checkbox is drawn, not text | `tasks.md › TaskBackspace1` |
| a caret on a code block's fence | the code block's editor has the code alone; its language is a label | `fences.md › Fence6`, `7`, `13` |
| a heading with more lines | a heading is one line: the next ones a paragraph after it | `backspace.md › SoftBackspace5`, `enter.md › Enter51` |
| a caret in a math block | the block is drawn (KaTeX), its TeX edited in a popup; a `$$` line alone is an empty math block | `fences.md › Fence42`, `move-subtree-up.md › MoveUp37` |
| a caret outside a table's cells | a table's cells are its text: a pipe, a cell's padding or the delimiter row has no place | `enter.md › Enter49` |
| a table SiYuan writes otherwise | a column with a cell of three characters or more is padded to it, its delimiter row longer (`\| a   \| b \|` above `\| one \| 2 \|`) | `enter.md › Enter50`, `paste.md › Paste56` |
| a caret in a heading's #s | its level, not text: the caret goes to the title's start | `outdent.md › Outdent17` |

The driver refuses no tag. `markup-fence` was refused until 2026-10-18 ("code lines that would make a
fence are only text there"); played, the cases `holds` lets through are SiYuan's to show (a join
into code is a join of blocks; a join of code lines into ```` ``` ```` is text, escaped, below): 12
run.

## What SiYuan does

A list item holds blocks (paragraphs, headings, code, lists), and keys at an item's edge move blocks
between items rather than join text: most of SiYuan's disagreements. Each below was played in a probe
(a headless Chromium of its own on a kernel of its own) and read in the tree, and the joins and
splits in the source (`removeBlock`, `removeLi` in `app/src/protyle/wysiwyg/remove.ts`).

- **Backspace at an item's start** with an item above: the item's blocks go into that item, after
  its last block ("列表项合并到前一个列表项的最后一个块末尾"): `- one` / `- ┃two` is `- one` with a
  second paragraph `two`, read as its child (`backspace.md › Backspace1`); a second Backspace joins
  the paragraphs. The only item of a nested list is outdented instead (`Backspace3`, `Scenario3`);
  the first of several, its blocks go into the parent item (`Next item becomes the new 1.`); the
  first item of a top-level list leaves the list, a paragraph above it (`Backspace17`), which owns the
  list after it as the projection has it.
- **Delete at an item's end**: the next item's blocks come into this one, the same way (`Delete2`,
  `Scenario11`); a child with children is outdented (`Delete1`, `Delete5c`). Delete at a code block's
  end does nothing (`Fence30`).
- **Enter on an empty item** makes it a paragraph: at the top level outside the list, between the two
  lists it splits (`Enter7`); nested, in the parent item, where it was (`Enter27`, `Enter28`). None of
  ourus's `enterOnEmptyItem`.
- **Shift+Enter** in an empty block does nothing (`Enter, then Shift-Enter and Backspace`); right
  before a line break it makes `\n\n`, which SiYuan's Markdown engine splits into two paragraphs
  (`Place inside a multi-line item`).
- **Split text is read again as Markdown**: after Enter, `2. def` is a nested ordered list starting
  at 2 (`Enter35`) and `# def` a heading (`Enter9`, `TaskEnter3`: the caret at its text's start); the
  space at the split stays (`Enter1`, `ShiftEnter1`: whitespace).
- **Paste**: into an item, what is pasted goes inside it, after its paragraph (`Paste38`); pasted
  items take the list's kind (into a task list, tasks: `Paste27d`); one pasted block joins the
  paragraph (`# h` at a paragraph's end is `h` in it: `Paste32`); a trailing line break is dropped
  (`Paste3`, `Paste5`). "Paste as plain text" (Ctrl+Shift+V) isn't verbatim: the text is read as
  Markdown into blocks (`Md2BlockDOM`) and flattened back into the block's text
  (`BlockDOM2EscapeMarkerContent`, `pasteAsPlainText` in `app/src/protyle/util/paste.ts`): `x` /
  `- y` is `xy` (`Paste4`, `Paste64`), `$$` math its TeX (`Paste45`); leading spaces stay (`Paste78`).
- **Up from the first line** goes to the document's title, out of the outline (`CursorUp1`); Up and
  Down keep the caret's x, not its column (`CursorUp2`, `CursorDown5`).
- **A list holds one kind of item**: tasks and plain items given as one list become sibling lists, a
  task list beside a plain one; the outline reads the same.
- **Ctrl+D in an item** duplicates its paragraph inside the item, and selects the copy
  (`duplicate-subtree.md › DuplicateSubtree1`).

SiYuan bugs met on the way:

- **A plain paste into `[a]: b c`** (`Paste69`) makes the item a checked task: the list becomes a task
  list, the item's marker `a` (`data-task="a"`), its text `: xb c`; exported, `- [X] : xb c`.
- **Shift+Enter before an escaped ```` ``` ````** in code (`Fence38`) leaves the escape at the end of the
  line before and the new line's backticks unescaped: in the editor still code, in SiYuan's Markdown
  export a fence that closes the block there.

**Free form, since 2026-10-18.** Every block had gone in as a list item: SiYuan's paragraphs and headings
outside lists (most of what its users write) were played as items, and what SiYuan makes of an item (a
paragraph, by Backspace at the first item's start, Enter on an empty one, Shift+Tab at the top level)
drew as an item still. In free form 87 more examples run (the 135 `free-form` cases), the read is
checked against the screen's kinds, and the 24 verdicts that went from agree to disagree were each
SiYuan's: **Tab in a paragraph outside a list types a tab** (`indent.md › Indent21`, `Indent22`), a
heading or a paragraph moves alone, its section or list staying (`move-subtree-down.md › MoveDown4`),
Shift+Tab on a top-level item makes it a paragraph (`outdent.md › Outdent2`), an item at its list's edge
stays in the list (`MoveDown18`), a list pasted at a heading's end goes before the list after it
(`paste.md › Paste59b`, against the declared `pasteStructuredOnParent: after`, measured on the item
form; with `--ignore-options` the camp agrees in part, and stays declared). Paragraphs join as text
(`backspace.md › Backspace12`: ourus, taking the blank line, makes one paragraph of two lines).

Open: the projection takes the escape off a block's first line (`\# def` is the block text `# def`),
and SiYuan's converter writes a paragraph's text unescaped, so a paragraph `# def` and a heading
`def` read the same: where SiYuan makes a heading of text ourus keeps as text (`Enter9`,
`TaskEnter3`), the verdict is `caret` where it is a disagreement. A projection option keeping the
escape, with a read that escapes a paragraph's markup-like start, would tell them apart.

## Invisible characters

SiYuan's editor keeps characters a reader never sees, and, unlike ourus's placeholder and RemNote's
U+FEFF, stores them: its documents (`.sy`, JSON) are the editor's block tree, not Markdown. Measured
in the DOM, the stored tree and the Markdown export (3.8.6):

| what | where | stored (`.sy`) | exported (Markdown) | for |
| --- | --- | --- | --- | --- |
| U+200D (zero-width joiner) before ```` ``` ```` | in code | yes | yes | an escape: the line closes no fence; taken out only when code is copied (its copy button; `removeZWJ`), put back on a plain paste into code |
| a second `\n` | a text ending in a line break (`a⏎⏎` for `a⏎`) | yes | no | the empty last line renders and takes the caret; typing there drops it (`a⏎x`) |
| U+200B (zero-width space) | each side of inline code (`a ​<code>c</code>​`) | yes | the one before inline code | a caret place outside an inline element |
| U+2060 (word joiner) | inside inline code, before its text | no | no | a caret place inside it, at its start |
| `<wbr>` | where the caret is, while SiYuan rewrites a block's HTML (through its Markdown engine, Lute) | no | no | the caret found again after (`focusByWbr`): the driver's own marker method, SiYuan's |

The driver reads through SiYuan's converter (`BlockDOM2StdMd`), which drops U+200B, U+2060 and the
second `\n`; it takes U+200D out where it escapes three backticks, and places a caret after it, not
between it and the character before, which it joins (one grapheme: a user's caret goes past both).
Without that, a code line with ```` ``` ```` in it read with the joiner, and SiYuan held such starts
"otherwise" (`Fence38`, `39`: errors, now run).

None of them is ourus's placeholder (`spec/placeholders.md`, `◌`): that is a position, the end of an
empty line read as if a character were typed there, so that an empty node exists in the outline
Markdown is; resolved by rule when the caret leaves, and never in the file. SiYuan needs none: its
store is a tree, where an empty paragraph or item is a node (`NodeParagraph` with no text); its
Markdown export just drops it. What it has are caret places (the second `\n`, U+200B, U+2060, as
RemNote's U+FEFF is one, all characters, put in and dropped by the editor as the text changes) and an
escape (U+200D), all stored.

## Internals

- `window.siyuan`: `isReady`, `config.system.kernelVersion`, `config.keymap` (each entry's `default`
  and `custom`), `layout`.
- `window.__ourusSxs` (the driver's plugin): `open(id)`, `editor()`, whose `protyle` has
  `block.rootID` (the document open), `wysiwyg.element` (the editor's DOM) and `lute`
  (`BlockDOM2StdMd`).
- The DOM: `[data-type="NodeList"] > [data-type="NodeListItem"]` (`data-task` on a task item, `" "` or
  `"X"`), whose own blocks (`NodeParagraph`, `NodeHeading`, `NodeCodeBlock`, ...) each have a
  `[contenteditable="true"]` (a code block's inside `.hljs`, its language a `contenteditable="false"`
  label), and nested `NodeList`s.
- The API (POST, JSON): `system/version`, `system/bootProgress`, `system/getConf`,
  `setting/setBazaar`, `notebook/lsNotebooks`, `notebook/createNotebook`, `filetree/createDocWithMd`,
  `filetree/listDocsByPath`, `filetree/removeDocByID`; every route is in `kernel/api/router.go`.
- In SiYuan's source: the editor's keys in `app/src/protyle/wysiwyg/keydown.ts`, the plugin API in
  `app/src/plugin/API.ts`, plugin loading in `app/src/plugin/loader.ts` and
  `kernel/model/plugin.go`.
