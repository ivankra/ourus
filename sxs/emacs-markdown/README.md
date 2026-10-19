# Emacs with markdown-mode

[`driver.ts`](driver.ts) drives GNU Emacs 30.2 (Debian's `emacs-nox`) with
[markdown-mode](https://jblevins.org/projects/markdown-mode/) 2.8 (2026-03-08, Jason Blevins's
`jrblevin/markdown-mode`), and nothing else (`emacs -Q`). Emacs is no page: the driver starts it on a
terminal of its own and plays keys into it through its server (a `Session`, [`../lib/driver.ts`](../lib/driver.ts)),
the first app driven so. Its documents are text, compared as text, caret included (the `text` model,
[`../lib/text.ts`](../lib/text.ts)).

## Keys

Emacs's and markdown-mode's own, in Emacs's notation, from markdown-mode's keymap
(`where-is-internal` on its commands, `markdown-mode-map`):

| action | keys |
| --- | --- |
| `enter` | RET (`markdown-enter-key`: a line break, indented as `markdown-indent-on-enter` says; no list item continued: that is M-RET, `markdown-insert-list-item`) |
| `shiftEnter` | S-&lt;return&gt;: unbound, so Emacs takes it as RET (the shift dropped, `<return>` translated), as for a user |
| `indent` | C-c &lt;right&gt; ("Indent Subtree", `markdown-demote`); TAB isn't it (below) |
| `outdent` | C-c &lt;left&gt; ("Outdent Subtree", `markdown-promote`) |
| `moveSubtreeUp` | C-c &lt;up&gt; ("Move Subtree Up", `markdown-move-up`) |
| `moveSubtreeDown` | C-c &lt;down&gt; ("Move Subtree Down", `markdown-move-down`) |
| `deleteContentBackward` | DEL (`markdown-outdent-or-delete`) |
| `deleteContentForward` | the Delete key (`delete-forward-char`) |
| `deleteSoftLineBackward` | C-0 C-k (`kill-line` with 0: the text before point on its line) |
| `deleteSubtree` | C-c C-k ("Kill Element", `markdown-kill-thing-at-point`: a list item with its children) |
| `duplicateSubtree` | *missing* (Emacs 29's `duplicate-dwim` is unbound): its examples are skipped |
| `pasteStructured` | C-y (`yank`): Emacs has one paste, from the kill ring |
| `pastePlain` | C-y, the same |
| `undo` | C-/ (`undo`) |
| `redo` | C-M-_ (`undo-redo`) |

TAB isn't `indent`: in markdown-mode it is `markdown-cycle`, which on a list item cycles the line's
indentation through the positions it allows (two spaces, then a tab), the line alone; Shift+Tab
(`markdown-shifttab`) folds the outline.

## Stack

Emacs: a C core (the Lisp interpreter, the display, the buffer as a gap buffer of characters, with
text properties) and Emacs Lisp for nearly everything else, editing commands included. markdown-mode
is one Lisp file (10,677 lines): a major mode whose keymap holds its commands and whose syntax
highlighting (font-lock, with `syntax-propertize` putting properties such as `markdown-list-item` on
the text) is what its list commands read; it parses nothing into a tree. Repo:
https://github.com/jrblevin/markdown-mode

## Running it

[`emacs.ts`](emacs.ts):

- **Emacs**, the system's (`apt install emacs-nox`: Debian's 30.2 here; installed with tmux when
  either is missing, as every run's packages are: [`lib/system.ts`](../lib/system.ts)), started `emacs -Q -nw` on a
  terminal: a tmux server of the run's own (`-L ourus-sxs-<pid>`), one session 80 by 24, and Emacs's
  server started in it on a socket in `.sxs/emacs-markdown/server-<pid>/` (Emacs refuses a socket directory
  others can read: it is made 700; a Unix socket's path is at most about 108 bytes, so an
  `OURUS_SXS_DIR` with a long path fails to start it, with "Service name too long"). Calls are `emacsclient --eval`. Started in 0.1 s; stopped (Emacs
  killed, then the tmux server) when the run ends.
- **A terminal, not a daemon**: a daemon's window is on no display, and what goes by the display goes
  wrong there: Up and Down move by screen lines (`line-move-visual`), taking their column from the
  display (`posn-at-point`), and lost it from one key to the next.
- **markdown-mode** 2.8 is fetched once from its tag (`v2.8`, `markdown-mode.el`) into
  `.sxs/emacs-markdown/files/markdown-mode-2.8/`, its SHA-256 checked against the one in `driver.ts`. The tag's
  `markdown-mode-version` says `2.8-alpha`; the report gives the tag.
- **One setting departs from the defaults**: lists indent by two spaces, as the spec draws them
  (`markdown-list-indent-width` 2, `indent-tabs-mode` off), where markdown-mode indents by four, with
  tabs (it sets `tab-width` 4, and Emacs's `indent-tabs-mode` is on). Examples whose lists are indented
  with tabs then disagree where markdown-mode's defaults might not (`indent.md › Indent6`, `7`).
- **No tmux or Emacs is left running**: a run that exits without stopping them (an error) kills its
  tmux server as it exits.

## Setting up and reading a test

- **A buffer per test** (`*ourus sxs*`), made anew and shown in the frame's window, in markdown-mode,
  the text inserted, point (and the mark, for a selection) placed, its undo history empty.
- **A selection is made as Shift and a motion makes it**: a temporary region (`transient-mark-mode`
  `(only . t)`, as `handle-shift-selection` sets it), so a motion without Shift deactivates it, as it
  does for a user; a plain active region would stay.
- **A key** is `execute-kbd-macro` of it in Emacs's notation, through the command loop and the
  buffer's keymaps; a command's error ("Nothing to demote at point") is its beep, and the key does
  nothing. Before each key, the frame is redisplayed (`redisplay t`) and the buffer fontified
  (`syntax-propertize`, `font-lock-ensure`), as between a user's keys: markdown-mode's list commands
  read the properties fontification sets, and without it answer "Nothing to demote" on an item.
- **The command before carries over**, as from one of a user's keys to the next: a key's first command
  sees it as `last-command` (the buffer's `pre-command-hook` gives it, its `post-command-hook`
  records it; a macro of its own starts without one). So consecutive Downs keep their column, and
  consecutive undos go further back instead of undoing the undo.
- **Typed text goes in as one run**, as a user's typing does: Emacs's undo takes a run of typing as
  one change, and characters typed in calls of their own as one each.
- **The clipboard is the kill ring**: a test's clipboard is `kill-new`, and read back from
  `current-kill`.
- **Reading** is the buffer's text, point and mark (when the region is active), offsets turned from
  code points (Emacs's) to UTF-16.
- **CR line endings** are skipped: Emacs decodes a file's CRLF when it reads it, and a buffer holds no
  CR of a line ending.
- A test takes about 5 ms; the whole spec, 3 seconds.

## What markdown-mode does

- **RET continues no list**: a line break, indented or not (`enter.md › Enter1`, `Enter3`), and on an
  empty item, a line break after its marker (`Enter28`). M-RET is the list command. Most of Enter's
  disagreements are this (125 of 143, where bare Obsidian's Enter disagrees in 76 of 117); `enter`
  stays RET, the Enter key. Tried as M-RET (2026-10-18, one run): 504 disagreements, not 511, lists
  continued (Enter2, 7, 27 agree) but list items made inside code blocks (`* ┃de` in a fence: Fence1
  to 6 from agree to disagree).
- **The harness, against real keys**: every example replayed as keystrokes on Emacs's terminal (`tmux
  send-keys`) rather than `execute-kbd-macro` came out the same in 659 of 665 (2026-10-18).
- **DEL after a marker deletes the space before the text** (`- ┃two` is `-┃two`), and at a line's start
  joins it to the line before, marker and all (`backspace.md › Backspace1`, `3`); it outdents only
  in the indentation.
- **Its subtree commands indent by its own width** (two here), not to a sibling's marker or a parent's
  text, keep an item's marker, and don't renumber (`indent.md › Indent3`, `4`, `5`); they act on the
  item at point, not on a region's items (`Indent9`); a heading's level changes with its subtree, blank
  lines put around it (`Indent12`); a paragraph is no item to indent (`Indent21`, `22`).
- **Moving keeps to the item's list**: a first item doesn't move up out of it (`move-subtree-up.md ›
  MoveUp7`).
- **"Kill Element"** kills an item with its children and leaves a blank line (`delete-subtree.md ›
  DeleteSubtree1`).
- **Yank is plain**: the text goes in as it is (`paste.md › Paste3`, `Paste7`).
- **Home is the line's start**, before the marker (`markdown-special-ctrl-a/e` is off by default);
  Up on the first line beeps and stays (`cursor.md › CursorUp1`).
- **Redo puts point at the line's start** (`undo.md › Undo1`, a caret verdict).

## Internals

The Lisp the driver uses: `execute-kbd-macro`, `kbd`, `switch-to-buffer`, `insert`, `goto-char`,
`push-mark` and `transient-mark-mode` for a selection, `buffer-undo-list`, `pre-command-hook` and
`post-command-hook` (buffer-local), `last-command`, `syntax-propertize`, `font-lock-ensure`,
`redisplay`, `kill-new`, `current-kill`, `buffer-substring-no-properties`, `region-active-p`, `mark`,
`json-serialize`; `markdown-mode-map` and `where-is-internal` for the keys; `server-start` with
`server-socket-dir` and `server-name`.
