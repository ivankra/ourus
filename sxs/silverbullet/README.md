# SilverBullet

[`driver.ts`](driver.ts) drives SilverBullet's live demo, https://demo.silverbullet.md/personal/
(the "Personal" space of the demo server; 2.12.0-50-gb2726cd8 on 2026-10-13, from its
`system.getVersion` syscall). SilverBullet is a Markdown editor (CodeMirror 6) with outline
commands, so its documents are text: the spec's buffers are loaded as written and compared as text,
caret included (the `text` model, [`../lib/text.ts`](../lib/text.ts)), and almost the whole spec runs. Last
results: [`sxs.md`](sxs.md).

https://silverbullet.md/ is the project's website, and https://docs.silverbullet.md/ another
read-only space (the manual).

## Keys (Linux)

| action | keys |
| --- | --- |
| `enter`, `shiftEnter` | Enter (SilverBullet's own list continuation), Shift+Enter |
| `indent`, `outdent` | Ctrl+. then L, Ctrl+. then H: "Outline: Move Right" and "Move Left" |
| `moveSubtreeUp`, `moveSubtreeDown` | Alt+Up, Alt+Down: "Outline: Move Up" and "Move Down" |
| `deleteContentBackward`, `deleteContentForward` | Backspace (CodeMirror's `deleteMarkupBackward`), Delete |
| `deleteSoftLineBackward` | Shift+Home, Backspace ("Delete Line Boundary Backward" is bound on a Mac only) |
| `pasteStructured`, `pastePlain` | Ctrl+V, Ctrl+Shift+V |
| `undo`, `redo` | Ctrl+Z, Ctrl+Y |
| caret motions | arrows, Home, End, Ctrl+Home, Ctrl+End; `select…` with Shift |

`deleteSubtree` and `duplicateSubtree` have no command in SilverBullet; their tests are skipped.

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
profile (`.sxs/` new, or `.sxs/silverbullet/chromium/` gone) the first test page's write reached the
proxy, got its 503, and `space.writePage` threw `Offline` (the client's error for a 5xx), and the run
died in `open`. Every run before had a synced profile. `open` now waits until the worker controls
the page and the client has had its `space-sync-complete` (`client.fullSyncCompleted`, the syscall
`sync.hasInitialSyncCompleted`): about 10 s of fetching the demo's 150-odd files, cold.

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

## What SilverBullet does that a driver has to know

- The outline commands work on list items (bullet and ordered), headings (a whole section), table
  rows and top-level paragraphs, per SilverBullet's own docs (`docs/Outlines.md` in its source,
  https://github.com/silverbulletmd/silverbullet).
- They indent by SilverBullet's indent unit (two spaces), whatever the list uses (tabs, a wider
  column), and don't renumber ordered lists.
- They act on the item at the caret, not on every item a selection covers.

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
