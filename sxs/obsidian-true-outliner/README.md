# Obsidian with true-outliner

[`driver.ts`](driver.ts) drives Obsidian (1.14.4) with
[true-outliner](https://github.com/laughedelic/obsidian-true-outliner) (`true-outliner` 0.14.4, the
latest release on GitHub; the cases measured from it are in
[`spec/obsidian-true-outliner.md`](../../spec/obsidian-true-outliner.md)), in Live Preview,
Obsidian's default editing mode ([`../obsidian-lp/`](../obsidian-lp/) is the same without the plugin).
The rest (how it runs, indentation, keys) is as for [bare Obsidian](../obsidian/README.md); what
differs is here.

It isn't in the community list, so it is installed from its GitHub release. Later prereleases fix
paste under Obsidian 1.14.4 (`0.14.5-pr373…`), so 0.14.4's pastes there may differ for that reason.

## Stack

A TypeScript plugin (built with esbuild, unit-tested with Vitest, end to end in a real Obsidian
through wdio-obsidian-service and obsidian-launcher), its outline mode a CodeMirror 6 state field, its
keys a keymap at the highest precedence, its edits transactions classified and filtered as they pass.

Repo: https://github.com/laughedelic/obsidian-true-outliner

## Outline mode

Outline mode is a tab's, taken from the setting `outlineByDefault` (on by default) when a tab opens
a note: each test's note, opened in the tab, is outlined. The vault's
`.obsidian/plugins/true-outliner/data.json` sets it anyway, so that the default can't move under the
results. Live Preview and Source mode are both outlined.

## What true-outliner changes

In outline mode, its keymap comes first (CodeMirror's highest precedence) and isn't in Obsidian's
hotkey settings; out of it, every key is Obsidian's.

| action | keys | true-outliner's |
| --- | --- | --- |
| `enter` | Enter | splits the node |
| `shiftEnter` | Shift+Enter | continues it |
| `indent` | Tab | the node with its children; the indent unit is the document's (a tab, else its first step), else Obsidian's (a tab) |
| `outdent` | Shift+Tab | as `indent` |
| `moveSubtreeUp` | Ctrl+Shift+Up | "Move node up" (`move-node-up`): the node with its children, the caret at its text's start; Alt+Up is Obsidian's (unbound out of the box; the vault binds it to "Move line", which moves the line here too) |
| `moveSubtreeDown` | Ctrl+Shift+Down | "Move node down" (`move-node-down`), as `moveSubtreeUp` (Alt+Down likewise) |
| `move ②` | the mouse | drag and drop: any node pressed by its mark (a press below 4 pixels zooms), dropped at its seam and depth (`trueOutlinerDrop` in [`../obsidian/obsidian.ts`](../obsidian/obsidian.ts), [`../lib/drag.ts`](../lib/drag.ts)) |
| `deleteContentBackward` | Backspace | takes back a place a structural key just made, refuses to join a block id's line; else Obsidian's |
| `deleteContentForward` | Delete | as `deleteContentBackward` |
| `deleteSubtree` | *missing* | nothing deletes a node with its children by a key: its examples are skipped |
| `pasteStructured` | Ctrl+V | a paste of several blocks is made a structural one (a transaction filter) |
| `undo` | Ctrl+Z | CodeMirror's history, the caret restored with it |
| `redo` | Ctrl+Shift+Z | as `undo` |

Its caret is outline-aware after any caret move (arrows, Home, End; Shift+Up and Down extend the
selection by node), and from the start: one placed before an item's text, at the line's start or
in the marker, goes to the text's start, which is after every space that follows the marker (in an
empty item with a trailing space, its end). Examples that start there are skipped
(`keepsCaretOnText`, the setup's `holds`). A caret before a task's checkbox stays where it is, which
bare Obsidian's Live Preview doesn't allow.

Other shortcuts (measured in 1.14.4 with true-outliner 0.14.4, in outline mode, on `- a`, its children
`- b` (with `- c` under it) and `- e`, then `- d`, indented with tabs; bare Obsidian's are in
[`../obsidian/README.md`](../obsidian/README.md)):

| shortcut | keys | what it does |
| --- | --- | --- |
| Fold node, Unfold node (`fold-node`, `unfold-node`) | Ctrl+Alt+Up, Ctrl+Alt+Down | the node's children hidden (`- a`, a count of 3 beside it) or shown; Obsidian's "add cursor above, below" taken over |
| Toggle fold (`toggle-fold`) | Ctrl+Alt+Period, as declared | nothing: the key doesn't fire (Obsidian takes it as `.`); the command folds |
| Select all | Ctrl+A | by structure: `b`'s text, `b` with its children, its siblings with theirs (`b` to `e`), the parent with all of it, the document |
| Extend the selection by node | Shift+Up, Shift+Down | whole nodes, with their children (from `b`: `b` with `c`, then with `e`); the note's editor then has no DOM focus (the page's body has it), and true-outliner takes the next key anyway |
| Left, Right at a node's text edges | ArrowLeft, ArrowRight | over the marker: from `b`'s start to `a`'s end, from `a`'s end to `b`'s start |
| Word left at a text's start | Ctrl+ArrowLeft | nothing (the caret stays at `b`'s start) |
| Home; End; Shift+Home | Home, End, Shift+Home | to the text's start (a second Home stays; a task's line has two stops, before and after its checkbox); to the line's end; select to the text's start |
| Delete word backward, at the text's start (CodeMirror's) | Ctrl+Backspace | the marker: `\t- ┃b` becomes `\t┃b`, no longer an item |
| Delete word forward, at a node's end (CodeMirror's) | Ctrl+Delete | the child's text joined: `- b┃` / `- c` becomes `- b┃c`, `c`'s marker and indentation gone (its transaction filter) |
| Toggle checkbox, Indent more and less (Obsidian's) | Ctrl+L, Ctrl+], Ctrl+[ | the line: `- [ ] b`; `\t\t- b`, its children left; `- b` |
| Delete paragraph (Obsidian's) | Ctrl+D (and CodeMirror's Ctrl+Shift+K) | not the caret's line alone: from `c`, `b` with it; from `e`, `c` with it; from `b`, all of `a`; from `a`, its line (likely its transaction filter taking the deletion for a structural one) |
| Outdent a top-level node | Shift+Tab | nothing |
| Zoom in (`zoom-in`) | a click on a node's bullet or marker | the node and its children alone in the editor (from the source: `zoom-click.ts`) |

"Indent node", "Outdent node", "Fold all nodes", "Unfold all nodes", "Fold one level more", "Fold one
level less", "Zoom in to node" (the node and its children alone in the editor), "Zoom out one level",
"Zoom out fully", "Toggle outline mode" and "Delete to content start" have no key.

## What it does, measured

Drag and drop ([`drag.md`](../../spec/drag.md), played with the real mouse, aimed at its own
geometry: `drag-geometry.ts`'s seams and columns):

- **The moved nodes are selected after the drop** (its design's D-series): drops agree on the text and
  give `caret`, and typing right after one replaces them (`scenarios.md › Scenario8b`).
- **Blank lines**: a node dropped into an item goes in without the blank line above it, which ourus
  keeps with the node above (`drag.md › Drag8`); a heading dropped among headings is set apart by blank
  lines (`Drag15`, `Drag16`).
- **A drop at the document's end after an earlier drop in the same view names no place**: its drop
  indicator isn't drawn, and the release cancels (`Drag13` run after `Drag1`; alone, it agrees on the
  text, `p⏎⏎x`, an item dropped after a paragraph a paragraph, as ourus). The pointer's coordinates and
  events are the same both times: state the view keeps from one note to the next, read 2026-10-28.

Against bare Obsidian in Live Preview:

- **Its own cases agree most** (`obsidian-true-outliner.md`), and so do more of Enter, Shift+Enter,
  Backspace, Delete and indenting than in the other setups. The spec's cases were measured from
  true-outliner and then drawn as wanted, so where it still differs is mostly where the spec chose
  otherwise (the spec's prose says which).
- **A move puts the caret at the moved item's text start**, not where it was (`move-subtree-up.md ›
  MoveUp1`: `- b┃` comes out `- ┃b`): moves agree on the text and give `caret`. Home stays at the
  text's start (`cursor.md › CursorHome2`).
- **Sections of headings and paragraphs** disagree more than in bare Obsidian (`obsidian-true-outliner.md
  › Enter › E29`: Enter at a paragraph's start).
- **Paste** may suffer from what the later prereleases fix under Obsidian 1.14.4 (above).
- **Backspace and Delete join nodes of one kind**, across the blank line between paragraphs too
  (`a` / blank / `┃b` becomes `a┃b`, Backspace12; Delete18), and otherwise do nothing: a paragraph and a
  heading don't join (`para` / blank / `# ┃Hello`, Backspace18; Delete13, 14), nor does the first node
  with nothing above it (`- ┃` / `- b`, Backspace17, 17e, 33). Where bare Obsidian deletes the marker's
  space (`-┃more`), true-outliner deletes nothing.
- **Up and Down skip blank lines** between nodes and keep a column in pixels (`makeVerticalHandler`):
  from `abc┃` over a blank line to `abc┃def`, then to the end at the document's edge (CursorDown1); into
  `## Title` at `## Tit┃le` (CursorUp2); into `- [ ] task` at `t┃ask` (CursorDown5).
- **Home, Ctrl+Home and Ctrl+End stop at a node's text** (`- ┃one`: CursorHome2, CursorDocStart1); a
  quote's or a callout's marker isn't skipped (`┃> quote`, CursorHome11, 16, 17).
- **It writes its own indentation** after a join or a renumbering: `- x` / `- ┃` / `\t- a` / `\t\t- b`
  and Backspace make `- x` / `  - a` / `\t  - b`; Enter after `9. a`'s sibling makes `10. a` /
  `\t - child`. Read back as drawn these differ from ourus in spaces only (`whitespace`: Backspace17d,
  Enter25).

## Internals

Loaded, the plugin is `app.plugins.plugins['true-outliner']`, and its `activeTabOutlineMode()` says
whether the active tab is outlined. Outline mode is a CodeMirror state field of the tab, taken from
`outlineByDefault` when the tab opens a note; the command `toggle-outline-mode` (no hotkey) switches
it. Its settings are `.obsidian/plugins/true-outliner/data.json`, a flat object (unknown keys are
dropped, invalid values fall back to the defaults): besides `outlineByDefault`, appearance (guides,
markers), folding (`rememberFolds`) and the backlinks footer (`backlinksFooter`, on). Its commands
are `true-outliner:<id>`: `move-node-up` and `-down` (Mod+Shift+Up and Down), `indent-node` and
`outdent-node` (no hotkey), `fold-node`, `unfold-node`, `toggle-fold`, and zooming; its keymap in
outline mode isn't among Obsidian's hotkeys. It warns when Outliner or Zoom is enabled beside it.
Its indent unit is the document's (a tab if the first indented list line has one, else the step from
a bullet to its child, else the first indented item's spaces, at most four), else CodeMirror's
`indentUnit`, which is Obsidian's (a tab here).
