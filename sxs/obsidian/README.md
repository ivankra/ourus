# Obsidian

[`driver.ts`](driver.ts) drives Obsidian as it comes, with no plugins, in Source mode, where the
editor shows the text as it is: the desktop app (1.14.4, installer 1.14.4, on 2026-10-13).
[`../obsidian-lp/`](../obsidian-lp/) is the same in Live Preview, Obsidian's default editing mode, which
draws the markup. Obsidian is a Markdown editor (CodeMirror 6) on plain `.md` files, so its
documents are text: the spec's buffers are loaded and compared as text, caret included (the `text` model, [`../lib/text.ts`](../lib/text.ts)), with their indentation as tabs (below).

With an outliner plugin, in Live Preview: [`../obsidian-outliner/`](../obsidian-outliner/) and
[`../obsidian-true-outliner/`](../obsidian-true-outliner/).

## Keys (Linux)

Obsidian's defaults, and CodeMirror's beneath them, but for two the vault binds (`hotkeys.json`):

| action | keys |
| --- | --- |
| `enter` | Enter (Obsidian's list continuation) |
| `shiftEnter` | Shift+Enter |
| `indent` | Tab |
| `outdent` | Shift+Tab |
| `moveSubtreeUp` | Alt+Up: "Move line up" (`editor:swap-line-up`), which has no hotkey out of the box; it moves the line, not the item with its children |
| `moveSubtreeDown` | Alt+Down: "Move line down" (`editor:swap-line-down`), as `moveSubtreeUp` |
| `deleteContentBackward` | Backspace |
| `deleteContentForward` | Delete |
| `deleteSoftLineBackward` | Shift+Home, Backspace ("delete line boundary backward" is bound on a Mac only) |
| `deleteSubtree` | *missing* (no command): its tests are skipped |
| `duplicateSubtree` | *missing* (no command): its tests are skipped |
| `pasteStructured` | Ctrl+V |
| `pastePlain` | Ctrl+Shift+V |
| `undo` | Ctrl+Z |
| `redo` | Ctrl+Shift+Z |

Other shortcuts (measured in 1.14.4 on `- a`, its children `- b` (with `- c` under it) and `- e`, then
`- d`):

| shortcut | keys | what it does |
| --- | --- | --- |
| Toggle checkbox status (`editor:toggle-checklist-status`) | Ctrl+L | an item a task, then done, then not: `- b`, `- [ ] b`, `- [x] b`, `- [ ] b` |
| Delete paragraph (`editor:delete-paragraph`) | Ctrl+D (and CodeMirror's Ctrl+Shift+K) | the caret's line only: `b`'s child `c` stays, now under `a` |
| Indent more, indent less (CodeMirror's) | Ctrl+], Ctrl+[ (and Ctrl+Shift+], Ctrl+Shift+[) | the line by one level, its children left where they are (Tab and Shift+Tab take them along) |
| Add cursor above, below (`editor:add-cursor-above`, `-below`) | Ctrl+Alt+Up, Ctrl+Alt+Down | a second caret on the line above or below |
| Select all | Ctrl+A | the document |
| Bold, italics, comment, insert link | Ctrl+B, Ctrl+I, Ctrl+/, Ctrl+K | |
| Follow link, open link in a new tab | Alt+Enter, Ctrl+Enter | nothing off a link |

"Toggle fold", "Fold all", "Unfold all", "Fold more" and "Fold less" (`editor:toggle-fold`, ...; an
item's children, or a heading's section, hidden or shown) have no key; nor have "Toggle bullet list"
(`- b` to `b`), "Toggle numbered list" (`- b` to `1. b`), "Set heading" 1 to 6 (in an item, the `## `
goes before its marker: `## - b`), or "Move line up" and "down" (bound by the vault, above).
CodeMirror's Alt+L (select line), Shift+Alt+Up and Down (copy line) and Ctrl+Alt+[ and ] (fold all,
unfold all) aren't bound in Obsidian.

## Stack

A closed-source Electron app (installer 1.14.4: Electron 43.7.7). The editor is CodeMirror 6 in both
editing modes, but its Markdown is **HyperMD's `hypermd` mode**, a CodeMirror 5 syntax-highlighting
mode Obsidian forked, which reads a line at a time and builds no tree; reading view and the metadata
cache parse with **remark-parse 8** (2020, before micromark), into a tree; the editing commands read
the caret's line with a regular expression. None of the three is CommonMark, and they disagree on
lists. The libraries and their versions, the parsers with the evidence and where they differ, and
the app's objects the driver uses: [`stack.md`](stack.md).

## Running it

Obsidian has no web app, so it doesn't run in the shared browser: the driver starts it (its
`launch`), and the runner drives its window over the DevTools protocol. Obsidians of the driver's own
are shared instead, as the pool's browsers are: one Obsidian opens any number of vaults, each in a
window of its own (its own `app`, settings and plugins), so every setup's runs share a pool of them.

- **The app.** [obsidian-launcher](https://www.npmjs.com/package/obsidian-launcher) (a dev
  dependency) downloads Obsidian into `.sxs/obsidian/files/` (shared by the setups, which take turns by
  `files.lock` beside it), once per version: the app (its
  JavaScript, an `.asar`) and the installer (Electron, an AppImage, unpacked: no FUSE needed).
  `OBSIDIAN_VERSION` picks the app's version (`latest` by default); the installer is the latest one
  that runs it.
- **The pool.** Instance n is `.sxs/obsidian/<n>/`: its configuration directory (`config/`, Electron's
  `--user-data-dir`: auto-update off, no vault, the app's `.asar` linked in), its log
  (`obsidian.log`), debugging port (`port`, a free one), versions (`version`) and pid (`server.pid`), so
  it never touches an Obsidian installed on the machine. Started with no vault, it opens its starter
  window (the vault chooser), which keeps it running with no vault open between one setup's window and
  the next; it is started detached, and stopped as the last window a run has in it closes (at a
  worker's release, `pool.lock` held: a worker taking it then starts another), or by `run.ts --stop`.
  A worker takes an instance of the versions to run with no window of its setup in use (`<setup>.lock`,
  held for the run), else starts one at the first number none runs at while fewer than the pool's
  size run, else waits for room (`pool.lock` around each look). Starting takes
  about 2.5 s once downloaded; a vault's window opens in about 0.35 s. An instance is some 95 tasks, and
  a window some 25 more (the old way, an Obsidian per worker: some 105 each).
- **The vault**, `.sxs/obsidian/<n>/<setup>/`, is written anew for each run: its `.obsidian/app.json`
  (`useTab`, `livePreview` for the setup's editing mode), `hotkeys.json`, and each plugin's
  `data.json` (a setup's `pluginData`). It is opened from the starter window (Obsidian's `vault-open`
  message, as the chooser does), and its window is closed when the run releases it (a window a run left
  some other way is closed before the vault is written anew). Each test makes a note there
  (`ourus-<n>.md`, `app.vault.create`) and opens it in the editor, so that it starts with no history to
  undo (a file switch gives the editor a new state); the last test's note is deleted once the new one is
  open. The caret is placed with a CodeMirror transaction, and reading is the editor's state.
- **Plugins** are a setup's `plugins`, as obsidian-launcher takes them: a community plugin by `id`
  (and `version`), a GitHub release by `repo` (the repository's URL, and `version`), or a local
  `path` (a built plugin:
  `manifest.json`, `main.js`). The launcher fetches them (into `.sxs/obsidian/files/obsidian-plugins/`, outside Obsidian), copies
  them into the vault's `.obsidian/plugins/<id>/` beside the `data.json` already there, and lists them
  in `community-plugins.json`. Restricted mode is lifted for each vault as a user does it once: the
  `enable-plugin-<vault id>` flag in local storage, keyed by the id the instance gives the vault as it
  opens it, so set by a script that runs in each window before Obsidian's own (`trustVault`, which
  asks the main process for the window's vault). `open` stops the run unless every plugin the vault
  enables has loaded, and the version line names each with its version.
- **Shared within an instance**: its clipboard, which a worker holds for an example that uses it
  (`clipboard.lock`), and its local storage (Obsidian keys its own by the vault's id; neither plugin
  uses it). The focus is each window's (Playwright emulates it per page), so windows take keys at once.
- **A display.** On Linux without `DISPLAY` (or without `--headed`) an instance gets an Xvfb of its
  own, which picks a free display itself (`-displayfd`) and exits with its last client (`-terminate`),
  so with the instance. A `--headed` run with a display starts an Obsidian of its own there
  (`.sxs/obsidian/headed/`), stopped at the run's end.
- **Offline.** Its proxy is a port nothing listens on, so nothing it would fetch (an update, the
  plugin list) changes what is tested.
- **Stopping** (`run.ts --stop`) kills an instance's process group; its configuration directory is
  written anew at its next start.

**A load that never ends.** Twice in about 2,400 loads, loading a note failed 11 ms in with
"Resulting promise was garbage collected": one of Obsidian's calls (`vault.create`, or `openFile`) gave
a promise that never settled, and V8's inspector, which holds an evaluation's promise weakly,
collected it instead of waiting. The runner runs such an example once more, from a fresh document.

**A window that loses the system's focus.** Under a full run's load a window of the shared instance
now and then loses the system's focus for a moment (no other window opening, closing or raised does it
alone, measured), its editor keeping the page's. CodeMirror's `hasFocus` wants both, and the read took
its `false` for no caret: about one read in 2,500 came out caretless, a different example each run
(Scenario14, Typing3, Undo2, Scenario18, TaskDelete3). The read keeps the caret where the editor's
content has the page's focus; another element's focus (the note's title, after Up from the first line)
is still no caret. Each read that only this kept is recorded in the instance's `focus.log` ("window
unfocused, visible"): one in two full runs of the four setups, which then came out alike.

**Concurrent runs.** Each setup is one run's at a time: the runner takes `.sxs/<name>/<name>.lock`
(the run's pid, linked into place whole, so taken atomically), and a second run of the same setup
stops with "another run has …"; a lock whose run is gone is taken over. The pool has at most four
instances (full, some 800 tasks), or as many as `OURUS_SXS_OBSIDIANS` says: `run.ts` says 2 for a run
of several apps with Chromium's among them, the pool's six browsers some 1,100 tasks beside them under
the container's cap (2048); one past the size is stopped once no run has a window in it. So a run has
up to four workers, or two (`parallel`,
`--workers`), each a window in an instance of its own: a run's workers in different instances, runs of
different setups side by side in the same ones (a window of each setup in an instance at most); with
the pool full, a worker waits for room. What they share is an instance's process, clipboard (held by the example
that uses it) and local storage, and the downloads (read once fetched; two runs fetching the same
version at once is untested). Side by side they compete for the CPU, so a full run is best alone when
timing matters.

Packages it needs on Debian (13 and later; the names with `t64` are the 64-bit-time ones): `xvfb`,
and Electron's libraries, `libgtk-3-0t64 libnss3 libasound2t64 libgbm1 libxkbcommon0 libcups2t64
libatk-bridge2.0-0t64 libxcomposite1 libxdamage1 libxrandr2` (they bring the rest; before Debian 13,
the names without `t64`). The driver installs what is missing, as root or with passwordless `sudo`
([`lib/system.ts`](../lib/system.ts)). As root,
Electron needs `--no-sandbox`, which the driver passes.

## Indentation: tabs, as Obsidian writes them

Obsidian indents with a tab (`useTab`, its default), or with four spaces when told not to use tabs;
never with two, which the spec draws: `tabSize` only sets how wide a tab is shown (Obsidian's editor
extensions: `indentUnit.of(useTab ? "\t" : "    ")`). So it runs with tabs, and a test indented with
spaces is loaded as Obsidian itself would have written it (measured: Tab and Shift+Enter in each kind
of item), and read back the other way (`asTabs`, `asSpaces`, the caret carried along):

- **An item nested in an item**: the parent's indentation and a tab, whatever the parent's marker.
  Tab under `1. a`, `10. a` or `-  a` makes `\t1. b`, `\t- b`; read back, a tab into an item is its
  text's column (`1. a` / `   1. b`, `10. a` / `    - b`).
- **Any other line in an item** (a continuation, a code block, a blank line with spaces): the item's
  indentation and spaces to its text, as Shift+Enter writes them (`1. a` / `   text`, `\t- b` /
  `\t  text`; a fence typed in `- a` is `  ```).
- **Past that**, an item's extra indentation is two spaces a tab (an odd one a space), any other line's
  stays spaces (a code block's own); and outside any item, each two spaces a tab.
- **A caret after a marker's space** starts the text: in `- ┃ b` the space after the caret is the
  text's, not the marker's (ourus's place before ` b`), so a child is under the marker's two columns.
  This is a guess the text can't settle: right where ourus keeps the space too (`placeholders.md ›
  Placeholder8`, 9: agree, whitespace), wrong where the app keeps a space ourus trims and the item has
  children (Outliner's `- a┃ b` / `  - c` and Enter, `enter.md › Enter3`: `disagree`, where reading the
  child under three columns gave `whitespace`).

A test whose starting buffer is indented with tabs already is taken as written, and one whose caret is
inside what becomes a tab is skipped. A plugin may write its own mix (true-outliner's `  - a` /
`\t  - b` after a join, `10. a` / `\t - child` after a renumbering): read back as drawn (a tab to the
next multiple of four past its parent), it differs from ourus in spaces only, a `whitespace` verdict.

Until 2026-10-18 every two spaces were a tab and every tab two spaces, whatever the structure: an item
under `1. a` loaded as `\t - b`, which Obsidian never writes, and Obsidian's own `\t1. b` under `1. a`
read back as two spaces where ourus has three, a disagreement over indentation alone (Indent4, Indent5,
Enter25, E4, list-marker-content-column: now agree).

## What it does, measured

What the four setups share (every key the plugins leave to Obsidian):

- **Up from the first line goes to the note's title** (Obsidian's inline title, shown by default): the
  editor loses the focus, the read has no caret (`cursor.md › CursorUp1`: `caret`), and later keys go
  to the title (`scenarios.md › Scenario21`). true-outliner's Up stays in the editor.
- **It is a text editor**: Enter and Backspace keep spaces and blank lines a structural editor would
  drop (most `whitespace` verdicts); a paste is Markdown inserted where the caret is, the clipboard's
  HTML converted (`paste.md`).

## Settings

Obsidian's own defaults, but for `useTab` set explicitly (the translation relies on it) and the
view the setup asks for (`mode`: `livePreview` in `app.json`, so every note opens in it; `open`
checks the editor's editing mode). Its Markdown is ourus's `obsidian` flavor (`behaves`).

Live Preview doesn't keep a caret everywhere the spec puts one, so those examples are skipped in its
setups (`holds`). The frontmatter is shown as properties, and a caret placed in it ends up outside
it. A table is drawn as a table of Live Preview's own: a caret placed in it goes into a cell's editor,
the note's editor losing the focus, and the table is padded (`| a | b |` to `| a   | b   |`), so a
start with a caret in a table is skipped (`inTable`; they were errors, "holds the starting state
differently"). A task's checkbox is a widget, and in bare Obsidian a caret placed between the marker and the
checkbox's end goes to the line's start (`inCheckbox`, `obsidian-lp`'s `holds`); a plugin may keep
it there (true-outliner does). Source mode keeps a caret in both places.
