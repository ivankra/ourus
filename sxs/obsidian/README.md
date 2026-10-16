# Obsidian

[`driver.ts`](driver.ts) drives Obsidian as it comes, with no plugins, in Source mode, where the
editor shows the text as it is: the desktop app (1.14.4, installer 1.14.4, on 2026-10-13).
[`../obsidian-lp/`](../obsidian-lp/) is the same in Live Preview, Obsidian's default editing mode, which
draws the markup. Obsidian is a Markdown editor (CodeMirror 6) on plain `.md` files, so its
documents are text: the spec's buffers are loaded and compared as text, caret included (the `text` model, [`../lib/text.ts`](../lib/text.ts)), with their indentation as tabs (below). Last results: [`sxs.md`](sxs.md).

With an outliner plugin, in Live Preview: [`../obsidian-outliner/`](../obsidian-outliner/) and
[`../obsidian-true-outliner/`](../obsidian-true-outliner/).

## Keys (Linux)

Obsidian's defaults, and CodeMirror's beneath them, but for two the vault binds (`hotkeys.json`):

| action | keys |
| --- | --- |
| `enter`, `shiftEnter` | Enter (Obsidian's list continuation), Shift+Enter |
| `indent`, `outdent` | Tab, Shift+Tab |
| `moveSubtreeUp`, `moveSubtreeDown` | Alt+Up, Alt+Down: "Move line up" and "Move line down" (`editor:swap-line-up`, `-down`), which have no hotkey out of the box; they move the line, not the item with its children |
| `deleteContentBackward`, `deleteContentForward` | Backspace, Delete |
| `deleteSoftLineBackward` | Shift+Home, Backspace ("delete line boundary backward" is bound on a Mac only) |
| `pasteStructured`, `pastePlain` | Ctrl+V, Ctrl+Shift+V |
| `undo`, `redo` | Ctrl+Z, Ctrl+Shift+Z |
| caret motions | arrows, Home, End, Ctrl+Home, Ctrl+End; `select…` with Shift |

`deleteSubtree` and `duplicateSubtree` have no command in Obsidian; their tests are skipped.

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
`launch`), and the runner drives its window over the DevTools protocol. A run starts it and stops
it; nothing is shared between runs but the downloads.

- **The app.** [obsidian-launcher](https://www.npmjs.com/package/obsidian-launcher) (a dev
  dependency) downloads Obsidian into `.sxs/obsidian/files/` (shared by the setups, which take turns by
  `files.lock` beside it), once per version: the app (its
  JavaScript, an `.asar`) and the installer (Electron, an AppImage, unpacked: no FUSE needed).
  `OBSIDIAN_VERSION` picks the app's version (`latest` by default); the installer is the latest one
  that runs it. It is started with a configuration directory of its own (under the system's temporary
  directory, removed at the end), auto-update off, and `--remote-debugging-port` on a free port, so it
  never touches an Obsidian installed on the machine. Starting takes about 2 s once downloaded.
- **The vault**, `.sxs/<name>/vault/`, is written anew at each start: its
  `.obsidian/app.json` (`useTab`, `livePreview` for the setup's editing mode), `hotkeys.json`, and each
  plugin's `data.json` (a setup's `pluginData`). Each test makes a note there (`ourus-<n>.md`,
  `app.vault.create`) and opens it in the editor, so that it starts with no history to undo (a file
  switch gives the editor a new state); the last test's note is deleted once the new one is open. The
  caret is placed with a CodeMirror transaction, and reading is the editor's state.
- **Plugins** are a setup's `plugins`, as obsidian-launcher takes them: a community plugin by `id`
  (and `version`), a GitHub release by `repo` (the repository's URL, and `version`), or a local
  `path` (a built plugin:
  `manifest.json`, `main.js`). The launcher fetches them (into `.sxs/obsidian/files/obsidian-plugins/`, outside Obsidian), copies
  them into the vault's `.obsidian/plugins/<id>/` beside the `data.json` already there, lists them in
  `community-plugins.json`, and lifts restricted mode (the `enable-plugin-<vault id>` flag in the
  configuration's local storage). `open` stops the run unless every plugin the vault enables has
  loaded, and the version line names each with its version.
- **A display.** On Linux without `DISPLAY` (or without `--headed`) it gets an Xvfb of its own,
  which picks a free display itself (`-displayfd`) and is stopped with it. Its log is
  `.sxs/<name>/obsidian.log`.
- **Offline.** Its proxy is a port nothing listens on, so nothing it would fetch (an update, the
  plugin list) changes what is tested.
- **Stopping** kills its process group, waits for it to exit, and removes its configuration
  directory, retrying: the app goes on writing there for a moment after the kill, and a removal that
  failed on a non-empty directory once lost a full run's report (the runner now reports a failed
  release and goes on). A run that exits another way stops it too (an `exit` handler).

**A load that never ends.** Twice in about 2,400 loads, loading a note failed 11 ms in with
"Resulting promise was garbage collected": one of Obsidian's calls (`vault.create`, or `openFile`) gave
a promise that never settled, and V8's inspector, which holds an evaluation's promise weakly,
collected it instead of waiting. The runner runs such an example once more, from a fresh document.

**Concurrent runs.** Each setup is one run's at a time: `launch` takes `.sxs/<name>/<name>.lock`
(the run's pid, linked into place whole, so taken atomically) before it writes the vault, and a
second run of the same setup stops with "another run has …" instead of rewriting the vault under
the first; a lock whose run is gone is taken over. Runs of different setups go side by side: each has
its own vault, log, configuration directory, debugging port and Xvfb display (so its own
clipboard, the display's). What they share are the downloads (read once fetched; two runs fetching
the same version at once is untested). Side by side they compete for the CPU, so a full run is best alone when timing matters.

Packages it needs on Debian (13 and later; the names with `t64` are the 64-bit-time ones): `xvfb`,
and Electron's libraries, `libgtk-3-0t64 libnss3 libasound2t64 libgbm1 libxkbcommon0 libcups2t64
libatk-bridge2.0-0t64 libxcomposite1 libxdamage1 libxrandr2` (they bring the rest; before Debian 13,
the names without `t64`). The driver installs what is missing, as root or with passwordless `sudo`
([`lib/system.ts`](../lib/system.ts)). As root,
Electron needs `--no-sandbox`, which the driver passes.

## Indentation: tabs

**To be revisited.** Obsidian indents with a tab (`useTab`, its default), or with four spaces when
told not to use tabs; never with two, which the spec draws: `tabSize` only sets how wide a tab is
shown (Obsidian's editor extensions: `indentUnit.of(useTab ? "\t" : "    ")`). So it runs with tabs,
and a test indented with spaces is translated: each two spaces of a line's indentation are loaded as a
tab (an odd one stays a space), and each tab of its indentation is read back as two spaces, the caret
carried along (`asTabs`, `asSpaces`). A test whose starting buffer is indented with tabs already is
taken as written, and a test whose caret is between two spaces of indentation is skipped.

What the translation can't carry is CommonMark's columns: a tab reaches the next multiple of four,
and two spaces reach two. Under an ordered item (`1. a`, its text at column 3) Obsidian's tab nests
the item, and the two spaces it is read back as don't (the spec draws three): those examples show as
disagreements over indentation.

## Settings

Obsidian's own defaults, but for `useTab` set explicitly (the translation relies on it) and the
view the setup asks for (`mode`: `livePreview` in `app.json`, so every note opens in it; `open`
checks the editor's editing mode). Its Markdown is ourus's `obsidian` flavor (`behaves`).

Live Preview doesn't keep a caret everywhere the spec puts one, so those examples are skipped in its
setups (`holds`). The frontmatter is shown as properties, and a caret placed in it ends up outside
it. A task's checkbox is a widget, and in bare Obsidian a caret placed between the marker and the
checkbox's end goes to the line's start (`inCheckbox`, `obsidian-lp`'s `holds`); a plugin may keep
it there (true-outliner does). Source mode keeps a caret in both places.
