# SilverBullet

[`driver.ts`](driver.ts) drives [SilverBullet](https://silverbullet.md/)'s [live demo](https://demo.silverbullet.md/personal/).
SilverBullet is a Markdown editor (CodeMirror 6) with outline commands,
so its documents are text: the spec's buffers are loaded as written and compared as text,
caret included (the `text` model, [`../lib/text.ts`](../lib/text.ts)), and almost the whole spec runs.

## Keys (Linux)

| action | keys |
| --- | --- |
| `enter` | Enter (SilverBullet's own list continuation) |
| `shiftEnter` | Shift+Enter |
| `indent` | Ctrl+. then L ("Outline: Move Right") |
| `outdent` | Ctrl+. then H ("Outline: Move Left") |
| `moveSubtreeUp` | Alt+Up ("Outline: Move Up"; also Ctrl+. then K) |
| `moveSubtreeDown` | Alt+Down ("Outline: Move Down"; also Ctrl+. then J) |
| `deleteContentBackward` | Backspace (CodeMirror's `deleteMarkupBackward`) |
| `deleteContentForward` | Delete |
| `deleteSoftLineBackward` | Shift+Home, Backspace ("Delete Line Boundary Backward" is bound on a Mac only) |
| `deleteSubtree` | *missing* (no command): its tests are skipped |
| `duplicateSubtree` | *missing* (no command): its tests are skipped |
| `paste` | Ctrl+V |
| `pastePlain` | Ctrl+Shift+V |
| `undo` | Ctrl+Z |
| `redo` | Ctrl+Y |
| `fold` | *missing*: "Outline: Fold" has no key (the driver loads folds by it) |
| `unfold` | *missing*: "Outline: Unfold" has no key |
| `toggleFold` | Ctrl+. then Ctrl+. ("Outline: Toggle Fold"): the item's children folded or unfolded, CodeMirror's fold |
| `zoomIn` | *missing*: SilverBullet has no zoom; the zoom's cases skip |
| `zoomOut` | *missing*, as `zoomIn` |
| `clearZoom` | *missing*, as `zoomIn` |

The outline commands (the `editor` plug's, `plugs/editor/outline.ts`; documented on its
[Outlines](https://docs.silverbullet.md/Outlines) page) act on what the caret is in: a list item with its
children; a heading with its section (to the next heading of its level or above), Move Right and Left
changing its level (`##` to `###`); a table's data row (the header row stays); a top-level paragraph,
moved past the blocks beside it.

Other shortcuts (from the source, `plugs/*/*.plug.yaml` and `client/editor_commands.ts` at the demo's
build, `b2726cd8`, the same keys the client's command hook reports; Linux; each pressed in the demo
but Fold, which changes no text):

| shortcut | keys | what it does |
| --- | --- | --- |
| Outline: Move Up, Move Down | Ctrl+. then K, Ctrl+. then J | as Alt+Up and Alt+Down |
| Task: Cycle State | Ctrl+. then T | `[ ]` to `[x]` and on, through the task states, with the caret at or in the `[ ]` (at the line's end, nothing) |
| Text: Listify Selection | Ctrl+Shift+8 | the selected lines as list items |
| Text: Quote Selection | Ctrl+Shift+. | the selected lines as a quote (the key `>` on the `.` key; a `.` with Shift and Ctrl held, as a test may send it, is the `Ctrl+.` chord's start instead, and takes the next key) |
| Delete Line | Ctrl+D | the caret's line, the item's children left where they are |
| Editor: Indent, Outdent | Tab, Shift+Tab | the selected lines by the indent unit (CodeMirror's `indentMore`, `indentLess`), not items |
| Editor: Delete Group Backward, Forward | Ctrl+Backspace, Ctrl+Delete | a word |
| Editor: Transpose Chars | Ctrl+T | |
| Text: Bold, Italic, Strikethrough, Marker | Ctrl+B, Ctrl+I, Ctrl+Shift+S, Ctrl+Alt+M | |
| Comment: Add | Ctrl+Alt+C | |
| Navigate: To This Page | Ctrl+Enter | follow the link at the caret |
| Page: Create Under Cursor | Ctrl+Shift+Enter | |
| Navigate: Page Picker, Meta Picker | Ctrl+K, Ctrl+Shift+K | |
| Open Command Palette | Ctrl+/ | every command, by name |
| Editor: Start Completion | Ctrl+Space | |

**Tab is not the outline indent.** Tab is "Editor: Indent", CodeMirror's `indentMore`: it indents the
selected lines by the indent unit, so a list item's children stay where they were. The outline
commands (Move Right, Move Left) move an item with its children, and a heading's level with its
section, which is what the spec's `indent` and `outdent` mean.

## Stack

A server in Rust (axum, tokio) that
keeps the space, a folder of Markdown files, and a client in TypeScript (Preact for the UI,
CodeMirror 6 for the editor, built with esbuild), a PWA that keeps a copy of the space in IndexedDB
and syncs it (local-first). Its features come as plugs, run in web workers; the outline commands are
the `editor` plug's.

Repo: https://github.com/silverbulletmd/silverbullet

## A read-only demo, made editable

The demo is read-only twice over: the boot config the server sends (`/.config`) says
`readOnly: true`, which the client reads at boot (no editing key bindings, the editor not editable),
and the server refuses writes. Nothing is compiled out: the client is the full one. So
[`proxy.ts`](proxy.ts) patches the boot config to `readOnly: false`, and answers every write to the
server (a PUT, DELETE or POST: the sync engine pushing a page) with 503, as if the server were briefly
unreachable. SilverBullet is local-first: edits live in the browser's copy of the space (IndexedDB),
and it tries the push again later. The demo is never written to; the pages the tests make exist only
in the browser.

**A test page's lookups, answered locally.** Each test's page has a name of its own, and SilverBullet
asks the server for it when opening it: in the first full run, 410 such lookups reached the demo
server, each a cache miss (the proxy's per-host tally showed them). The proxy now answers them "not
found" itself (a GET of `/.fs/ourus-sxs…` gets a 404), and a full run fetches nothing.

**A cold start waits for the first sync.** The browser's copy of the space is served locally only
after a first full sync: until then the service worker passes every request to the server, writes
too (its `fullSyncConfirmed`; "First full sync confirmed, will now start serving requests locally" in
its log), while a profile with a snapshot from before is served locally at once. So on a fresh
profile (`.sxs/` new, or the pool's browser profiles, `<state>/chromium/`, gone) the first test page's write reached the
proxy, got its 503, and `space.writePage` threw `Offline` (the client's error for a 5xx), and the run
died in `open`. Every run before had a synced profile. `open` now waits until the worker controls
the page and the client has had its `space-sync-complete` (`client.fullSyncCompleted`, the syscall
`sync.hasInitialSyncCompleted`): about 10 s of fetching the demo's 150-odd files, cold.

**A warm start can wait forever.** A run leaves its test pages in the browser's copy of the space,
and each sync pushes them to the server, which the proxy answers with 503. SilverBullet 2.12 (from
about October 2026) then never marks a full sync completed, so `open` waited its 120 s and the run
died there, on every browser start since (not on a page an earlier run left loaded, which `open`
doesn't reload). `open` now gives the full sync 20 s; past that, it clears the demo's data from the
browser (`Storage.clearDataForOrigin`: its service worker, its IndexedDB copy of the space) and
starts cold, as above: about 23 s in all.

## Setting up and reading a test

- **A page per test**, named `ourus-sxs-<time>-<n>`: written into the space in the browser
  (`syscall('space.writePage', name, text)`) and opened (`client.navigate({ path })`), so its editor
  starts from the text with an empty history (loading through an editor transaction would be the
  first thing undo undoes). The caret is placed with a CodeMirror transaction
  (`client.editorView.dispatch({ selection })`).
- **Reading** is the editor's state: `client.editorView.state.doc` and its main selection (none when
  the editor isn't focused).
- **Settling**: commands run in plug workers (the outline commands are the `editor` plug's), so the
  driver's busy signal is a plug sandbox owing an answer
  (`client.clientSystem.system.loadedPlugs` → `sandbox.outstandingInvocations`). Without it, a read
  could come between a command's change and its caret.
- CodeMirror keeps line breaks as LF, so examples with CR line endings are skipped.

## What SilverBullet does

- **No node is dragged**: its editor's drag moves selected text (CodeMirror's), and its outline
  commands are keys alone, so the drop cases (`move-subtree.md`) don't play here.

- The outline commands work on list items (bullet and ordered), headings (a whole section), table
  rows and top-level paragraphs, per SilverBullet's own docs (`docs/Outlines.md` in its source,
  https://github.com/silverbulletmd/silverbullet).
- They indent by SilverBullet's indent unit (two spaces), whatever the list uses (tabs, a wider
  column), and don't renumber ordered lists.
- They act on the item at the caret, not on every item a selection covers (`indent.md › Indent9`;
  Tab, line indentation, would indent every selected line, and leave an item's children behind:
  the outline command is the one played).
- **Move Up and Down stay among an item's siblings**: a last child doesn't move down, an item next
  to a paragraph doesn't pass it (`move-subtree-down.md › MoveDown9`, `MoveDown2`); blank lines stay
  where they were (`gaps.md › Gap4`); a list indented with tabs doesn't move (`MoveDown7`).
- **They don't read a quote's `> `**: an item in a quote is indented before its `>` (`  > - b`, not
  nested: `quotes.md › Quote1`), and an outline command on a paragraph or a setext heading does
  nothing (`indent.md › Indent21`, `Indent16`).
- **Editing is CodeMirror's Markdown**: Backspace at an item's text start takes its marker off and
  keeps the text, indented, as a continuation (`deleteMarkupBackward`: `backspace.md › Backspace1`);
  Backspace after a heading's `# ` deletes the space; blank lines stay where ourus joins blocks.
- **Home is "Cursor Line Start"** (`cursorLineStart`), the line's first column, before any marker,
  indentation or `> ` (`cursor.md › CursorHome1`, most caret verdicts); Shift+Home then Backspace
  deletes the markers too, as the Mac's Cmd-Backspace ("Delete Line Boundary Backward") does.
- **Paste goes in at the caret as text**, with no list's structure: the clipboard's text as it is, or
  its HTML through SilverBullet's HTML-to-Markdown converter (`*   a`, `1.  x`). Played both ways
  (`--plain-clipboard`), the 85 paste cases' verdicts were the same; 52 buffers differed.
- **Undo groups edits less than 500 ms apart** (CodeMirror's history): at a slower pace, an undo
  scenario's later buffers differ (`scenarios.md › Scenario23`), its verdict, decided earlier, not.

## Folds, measured

[`fold.md`](../../spec/fold.md), measured 2026-10-28 (no zoom: [`zoom.md`](../../spec/zoom.md)'s
cases skip). Folds are CodeMirror's: loaded by "Outline: Fold" at each folded row
(`client.runCommandByName`), read from the placeholders CodeMirror draws, each at its row's end. What
is compared is what the reader sees, the folds in effect.

- **Keys are a text editor's, through a fold**, as bare Obsidian's: Enter at a folded item's end
  puts the new item between it and its hidden children, the fold moving to the new row (`Fold1`);
  Backspace on an empty item after one deletes its marker, left as a blank line under the fold
  (`Fold3`); Enter on an empty folded item with children takes its marker off (`Fold5`); an item
  indented under a folded one stays shown, the fold kept (`Fold6`).
- **Delete at a folded item's end joins the next line as text**, its indentation and marker kept in
  the item's text (`Fold7`: `- a┃  - b`), the fold gone; ourus refuses it (`folded`), as the block
  apps.
- **Backspace right after a folded item takes its marker off**, the text a continuation line
  (`Fold15`: `  ┃c`); ourus joins it into the folded item's text, as the block apps.
- **Toggle at an item without children folds its parent**, as ourus's, but the caret stays where it
  was, now hidden (`Fold11`: `caret`); ourus moves it to the parent's text end.

## Internals

SilverBullet's client and syscalls, as the driver uses them (`window.client`, `window.syscall`): `client.editorView` (CodeMirror 6: `state.doc`,
`state.selection.main`, `dispatch`, `focus`, `hasFocus`), `client.navigate({ path: 'name.md' })`,
`client.currentName()`, `client.isReadOnlyMode()` (the boot config's `readOnly`, or the page's `perm`
being `ro`), `client.bootConfig`, `client.systemReady`, `client.fullSyncCompleted`
(`navigator.serviceWorker.controller` for the worker); `syscall('space.writePage', name, text)`,
`syscall('system.getVersion')`. Plugs: `client.clientSystem.system.loadedPlugs` (a `Map`), each with
`sandbox.outstandingInvocations`. Commands and their keys are in `client/editor_commands.ts` and
`plugs/editor/editor.plug.yaml` of SilverBullet's source; the outline operations in
`plugs/editor/outline_ops.ts`.
