# SiYuan

[`driver.ts`](driver.ts) drives [SiYuan](https://b3log.org/siyuan/), a block editor over Markdown
(a document's paragraphs, headings, lists and their items, quotes and code are blocks), open source
(AGPL-3.0): release 3.8.6 (2026-09-29), run from its Linux arm64 release on this machine, its kernel
serving the web UI that the app's browser loads. It has no public demo. The spec's buffers are
projected onto blocks, as for Logseq (the `block` model, [`../lib/outline.ts`](../lib/outline.ts)), every
block a list item at its depth. Last results: [`sxs.md`](sxs.md).

## Keys (Linux)

From the keymap in SiYuan's configuration (`window.siyuan.config.keymap`, where ⌘ is Ctrl on Linux),
checked in the app:

| action | keys |
| --- | --- |
| `enter`, `shiftEnter` | Enter, Shift+Enter (a line break in the block) |
| `indent`, `outdent` | Tab, Shift+Tab: the item with its children (outdenting is direct) |
| `moveSubtreeUp`, `moveSubtreeDown` | Ctrl+Shift+Up, Ctrl+Shift+Down ("Move up", "Move down", ⇧⌘↑ and ⇧⌘↓) |
| `deleteContentBackward`, `deleteContentForward` | Backspace, Delete |
| `deleteSoftLineBackward` | Shift+Home, then Backspace (no command for it) |
| `duplicateSubtree` | Ctrl+D ("Duplicate", ⌘D): the block being edited, which in an item is its paragraph, not the item |
| `pasteStructured`, `pastePlain` | Ctrl+V, Ctrl+Shift+V |
| `undo`, `redo` | Ctrl+Z, Ctrl+Y |
| caret motions | arrows, Home, End, Ctrl+Home, Ctrl+End; `select…` with Shift |

`deleteSubtree` has no key: Escape puts the item's paragraph in block selection (3.8's
`setBlockSelectionModeElement`), Space selects it, and Backspace empties it, the item and its
children staying (measured on `- b` with a child). An item is selected by clicking its bullet. Its
examples are skipped.

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

[`kernel.ts`](kernel.ts), through the driver's `serve` (run before the app's tab loads):

- **The release**, `siyuan-<version>-linux-arm64.tar.gz` (or `-linux.tar.gz` on x64, 250 MB), is
  downloaded from GitHub once into `.sxs/siyuan/files/`, its SHA-256 checked against the release's
  `SHA256SUMS.txt`, its `resources/` (kernel, stage, appearance, guide) unpacked there, into
  `.sxs/siyuan/files/siyuan-<version>-linux-<arch>/`, and the archive deleted. `SIYUAN_VERSION` picks the release, 3.8.6 by default: pinned, so a report
  changes when the app does, not when SiYuan releases.
- **The kernel**, `resources/kernel/SiYuan-Kernel serve --workspace=.sxs/siyuan/workspace
  --port=6816 --wd=<resources> --lang=en`, started detached, its log `.sxs/siyuan/kernel.log`, and
  left running for the next run, as the browser is, while its workspace has the driver's plugin
  (a workspace deleted under it, it is started anew); it is recorded in `.sxs/siyuan/server.pid`,
  and `run.ts --stop` stops it. The workspace is the kernel's data directory: its settings, the test
  notebook, the driver's plugin; deleting it (with the kernel stopped) gives a fresh one. The port is `OURUS_SIYUAN_PORT`, 6816 by default, not SiYuan's 6806,
  so a SiYuan of the user's is never touched. It boots in under a second (`system/bootProgress` at 100).
- **Closed in**: it listens on 127.0.0.1 only (the workspace's `system.networkServe` is off, checked
  at start: a workspace serving the network is refused), needs no auth code there
  (`SIYUAN_ACCESS_AUTH_CODE_BYPASS`, the variable its Docker image documents), and has no way out:
  its HTTP and HTTPS proxy is 127.0.0.1:9, where nothing listens, so no update, announcement or sync
  leaves. The browser reaches it on loopback, past the caching proxy (Chromium doesn't proxy
  loopback), and the UI asks the proxy for nothing.
- **A fresh workspace** has a starter notebook of its own beside the test one, `ourus sxs`.

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
  (`filetree/createDocWithMd`): every block a list item, `- ` at its depth, its continuation lines
  indented under it. Opened through the plugin; the last test's document is then removed
  (`filetree/removeDocByID`), which closes its tab, and before a run's first test every earlier
  document in the notebook is.
- **Undo is the kernel's**, per document (3.8 moved the undo stack into the kernel, its
  `GlobalUndoLog`, shared by every window: `app/src/protyle/undo/index.ts`), so a fresh document
  starts with an empty history and undo stays within the test (Protyle's `clearStack` does nothing
  now).
- **Reading is the editor's DOM**, SiYuan's own tree: the list items in order, a block's text its own
  blocks' Markdown by SiYuan's converter (`protyle.lute.BlockDOM2StdMd`, one block's DOM to
  Markdown), joined by line breaks, a task item's `[ ] ` or `[x] ` before it (`data-task`). A block
  outside every list (a paragraph SiYuan made of an item, by Shift+Tab at the top level, say) is
  owned as the spec's buffers' blocks are (`../lib/outline.ts`): a paragraph owns the list right after
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
- An example takes about 1 s, the document's making and opening most of it; a full run about 6 minutes.

## Starts SiYuan won't hold

Measured (each was a start the load check found held otherwise, in the first full run), and skipped
with the reason (`holds`):

| reason | what SiYuan does | e.g. |
| --- | --- | --- |
| a block's text starting with whitespace | a tab or an indented line becomes structure, or is trimmed | `cursor.md › CursorDown2`, `del.md › Delete11` |
| a line's trailing whitespace | trimmed, a hard break's two spaces too (an empty task's `[ ] ` is its checkbox, and held) | `indent.md › Indent19`, `del.md › Delete5d` |
| a block's text ending in a line break | the empty last line trimmed | `shift-enter.md › ShiftEnter11`, `12` |
| a heading's closing #s | dropped: `# Title #` is `# Title` | `backspace.md › Backspace4` |
| a thematic break as an item | `- ---` is a thematic break, not an item holding one, and SiYuan makes it one, outside the list | `move-subtree-up.md › MoveUp19` |
| a caret in a task's checkbox | the checkbox is drawn, not text | `tasks.md › TaskBackspace1` |
| a caret on a code block's fence | the code block's editor has the code alone; its language is a label | `fences.md › Fence6`, `7`, `13` |

## What SiYuan does that a driver has to know

- **A list holds one kind of item**: tasks and plain items given as one list become sibling lists, a
  task list beside a plain one; the outline reads the same.
- **Enter on an empty middle child** doesn't make a sibling or outdent it: the empty item becomes a
  second paragraph of its parent item (`enter.md › Enter28`), none of ourus's `enterOnEmptyItem`.
- **Ctrl+D in an item** duplicates its paragraph inside the item, and selects the copy
  (`duplicate-subtree.md › DuplicateSubtree1`).

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
