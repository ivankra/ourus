# Obsidian with true-outliner

[`driver.ts`](driver.ts) drives Obsidian (1.14.4) with
[true-outliner](https://github.com/laughedelic/obsidian-true-outliner) (`true-outliner` 0.14.4, the
latest release on GitHub; the cases measured from it are in
[`spec/obsidian-true-outliner.md`](../../spec/obsidian-true-outliner.md)), in Live Preview,
Obsidian's default editing mode ([`../obsidian-lp/`](../obsidian-lp/) is the same without the plugin).
The rest (how it runs, indentation, keys) is as for [bare Obsidian](../obsidian/README.md); what
differs is here. Last results: [`sxs.md`](sxs.md).

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
| `enter`, `shiftEnter` | Enter, Shift+Enter | split the node, continue it |
| `indent`, `outdent` | Tab, Shift+Tab | the node with its children; the indent unit is the document's (a tab, else its first step), else Obsidian's (a tab) |
| `moveBlockUp`, `moveBlockDown` | Ctrl+Shift+Up, Ctrl+Shift+Down | "Move node up" and "down" (`move-node-up`, `-down`), the node with its children; Alt+Up and Down do nothing in outline mode |
| `deleteContentBackward`, `deleteContentForward` | Backspace, Delete | take back a place a structural key just made, refuse to join a block id's line; else Obsidian's |
| caret motions | arrows, Home, End | outline-aware; Shift+Up and Down extend the selection by node |
| `pasteStructured` | Ctrl+V | a paste of several blocks is made a structural one (a transaction filter) |
| `undo`, `redo` | Ctrl+Z, Ctrl+Shift+Z | CodeMirror's history, the caret restored with it |

Nothing deletes a node with its children by a key (`deleteSubtree`): those examples are skipped.

Its caret is outline-aware from the start: one placed before an item's text, at the line's start or
in the marker, goes to the text's start, which is after every space that follows the marker (in an
empty item with a trailing space, its end). Examples that start there are skipped
(`keepsCaretOnText`, the setup's `holds`). A caret before a task's checkbox stays where it is, which
bare Obsidian's Live Preview doesn't allow.

## What it does, measured

Against bare Obsidian in Live Preview ([`../obsidian-lp/sxs.md`](../obsidian-lp/sxs.md)):

- **Its own cases agree most** (`obsidian-true-outliner.md`), and so do more of Enter, Shift+Enter,
  Backspace, Delete and indenting than in the other setups. The spec's cases were measured from
  true-outliner and then drawn as wanted, so where it still differs is mostly where the spec chose
  otherwise (the spec's prose says which).
- **A move puts the caret at the moved item's text start**, not where it was (`block-up.md ›
  BlockUp1`: `- b┃` comes out `- ┃b`): moves agree on the text and give `caret`. Home stays at the
  text's start (`cursor.md › CursorHome2`).
- **Sections of headings and paragraphs** disagree more than in bare Obsidian (`obsidian-true-outliner.md
  › Enter › E29`: Enter at a paragraph's start).
- **Paste** may suffer from what the later prereleases fix under Obsidian 1.14.4 (above).

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
