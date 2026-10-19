# Obsidian with Outliner

[`driver.ts`](driver.ts) drives Obsidian (1.14.4) with [Outliner](https://github.com/vslinko/obsidian-outliner)
(`obsidian-outliner` 4.10.2, the community plugin), at its default settings, in Live Preview,
Obsidian's default editing mode ([`../obsidian-lp/`](../obsidian-lp/) is the same without the plugin).
The rest (how it runs, indentation, keys) is as for [bare Obsidian](../obsidian/README.md); what
differs is here.

## Stack

A TypeScript plugin (built with Rollup, tested with Jest), its keys CodeMirror 6 keymaps registered
through Obsidian's editor extensions, its operations on a parse of the list around the caret.

Repo: https://github.com/vslinko/obsidian-outliner

## What Outliner changes

Its keys work on a list item at the caret, with one caret, and only inside a list; elsewhere, and
while an IME is composing, the key is Obsidian's.

| action | keys | Outliner's |
| --- | --- | --- |
| `enter` | Enter | "better Enter" (`betterEnter`, on): an empty child item outdents, else a new item |
| `indent` | Tab | "better Tab" (`betterTab`, on): the item with its children; the indentation is copied from a sibling or a child where there is one, else Obsidian's (a tab) |
| `outdent` | Shift+Tab | "better Tab", as `indent` |
| `moveSubtreeUp` | Ctrl+Shift+Up | "Move list item up" (`move-list-item-up`): the item with its children, into the neighboring item at a list's edge; an ordered list is renumbered |
| `moveSubtreeDown` | Ctrl+Shift+Down | "Move list item down" (`move-list-item-down`), as `moveSubtreeUp` |
| `deleteContentBackward` | Backspace | "stick the cursor to the content" (`stickCursor: bullet-and-checkbox`): at an item's start, it joins the previous item only where children allow, and otherwise does nothing |
| `deleteContentForward` | Delete | the same setting, as `deleteContentBackward` |

The same setting keeps the caret off bullets and checkboxes after any caret move (arrows, Home, End),
and from the start: one placed before an item's text, at the line's start, in the marker or before a
checkbox's end, goes to the text's start. Examples that start there are skipped (`keepsCaretOnText`,
the setup's `holds`).

Shift+Enter, Up and Down are Obsidian's. The settings are its defaults
(`.obsidian/plugins/obsidian-outliner/data.json` is not written).

Other shortcuts (measured in 1.14.4 with Outliner 4.10.2 on `- a`, its children `- b` (with `- c`
under it) and `- e`, then `- d`, indented with tabs; bare Obsidian's are in
[`../obsidian/README.md`](../obsidian/README.md)):

| shortcut | keys | what it does |
| --- | --- | --- |
| Fold the list, Unfold the list (`fold`, `unfold`) | Ctrl+Up, Ctrl+Down | the item's children hidden (`- a…`) or shown |
| Select all (`selectAll`) | Ctrl+A | `b`'s text, then `b` with its children (from its text: `b` / `c`), then the document |
| Left, Ctrl+Left at an item's text start | ArrowLeft, Ctrl+ArrowLeft | to the end of the line above (`- a┃`), never onto the bullet |
| Home; Shift+Home | Home, Shift+Home | to the text's start (after `- `), and select to it |
| Delete word backward, at the text's start (CodeMirror's) | Ctrl+Backspace | the marker: `\t- ┃b` becomes `\t┃b`, no longer an item (Outliner's "delete to content start" is Cmd+Backspace, Mac only) |
| Delete word forward, at an item's end (CodeMirror's) | Ctrl+Delete | the line break only: `\t- b\t\t- c`, the next item's tabs and marker kept as text |
| Extend the selection (Obsidian's) | Shift+Up, Shift+Down | by line, not by item |
| Toggle checkbox, Delete paragraph, Indent more and less (Obsidian's) | Ctrl+L, Ctrl+D, Ctrl+], Ctrl+[ | the line, not the item with its children: Ctrl+D on `b` leaves `c` under `a`; Ctrl+] makes `\t\t- b` |
| Add cursor above, below (Obsidian's) | Ctrl+Alt+Up, Ctrl+Alt+Down | a second caret; Outliner's keys then pass the key to Obsidian (they want one caret) |
| Move line up, down (the vault's binding of Obsidian's) | Alt+Up, Alt+Down | the line alone: `\t- b` above `- a` |
| Indent the list and sublists, Outdent the list and sublists (`indent-list`, `outdent-list`) | none | Tab's and Shift+Tab's, as commands |
| Drag and drop (`dnd`, on) | a bullet dragged with the mouse | the item with its children, to where it is dropped (from the source) |
| Show system info (`system-info`) | Ctrl+Shift+Alt+I | a dialog of the plugins' versions and settings (from the source) |

## What it does, measured

Against bare Obsidian in Live Preview, each read in
Outliner's source (cloned at 4.10.2: `src/operations/`, `src/services/Parser.ts`) and played by hand:

- **Indenting carries the children** (`indent.md › Indent2` agrees), and so do moves.
- **Backspace and Delete join items** where neither has children (`DeleteTillPreviousLineContentEnd`:
  `prev.isEmpty()` is "no children"); where one has, Backspace at the text's start does nothing ("Children
  move to the joined node", "Delete forward absorbs child…"). With no item above (the first of a list, a
  heading above it), Backspace is Obsidian's: `# Title` / `- ┃more` becomes `-┃more` (Backspace4).
- **A list is its lines, up to an empty one** (`Parser`: item lines and indented lines; a line of no
  characters ends it). Moves don't cross a blank line (MoveDown1, Gap4, Gap5: nothing happens), and a
  blank line with no indentation inside an item's code block cuts the list there: moving the item up
  splits the block (MoveUp13: `- b` / `` ``` `` / `x` / `- a` / blank / `y` / `` ``` ``), an Outliner bug.
  The spec draws blank lines empty; Obsidian's Enter in an item's code block indents them, which
  Outliner would keep in the list.
- **Moves are of list items only**: Ctrl+Shift+Up and Down on a paragraph, a heading or a quote do
  nothing (the Gap, MoveUp3, MoveDown4 and Quote cases), where bare Obsidian's Alt+Up moves the line.
  **A selection of several items doesn't move** (`MoveDown11`): the command wants one caret.
- **Every ordered list is renumbered from 1** after any of its operations (`recalculateNumericBullets`:
  `9. a`, `10. b` become `1.`, `2.`), so a list's start is lost ("List starting at 3 keeps its start",
  MoveDown23, MoveDown30, Indent15's `5. b`, `9. c`).
- **An Outliner bug, the caret after renumbering**: where the renumbering shortens a line before the
  caret (`10.` to `1.`), the caret lands that many characters too far, into the next line: `10. a┃` /
  `11. b` and Enter make `1. a` / `2. ` / `3. ┃b`; `9. a` / `10. b┃` moved up makes `1. b` / `2. ┃a`
  (Enter3c, Enter25, MoveUp15).
- **An item's other lines are its notes**: Backspace at a note line's start joins it to the line above,
  Delete at its end the line below (`mergeNotes`: Fence17, Fence19, Fence23, Fence24, also inside a code
  block), and Enter in a note, or at a code block's closing fence, makes a new item (Fence7d, Fence12,
  Fence42, Enter37).
- **The caret is kept on the text**: after any move of the caret (Ctrl+Home from below lands at
  `- ┃one`, "Carried place removed on leaving"; after Shift+Home and Backspace a line that became an item
  has its caret moved past the marker, SoftBackspace3), Outliner puts it back after the marker, a
  checkbox, or a note's indentation (Shift+Enter over a selection: `- a` / ` ┃beta`, S13).
- **Quotes do worse**: moving past and between quoted items (`quotes.md › Swapping two quoted
  items`); a list in a quote isn't one to Outliner (Quote1, 5: Tab on `> - b` does nothing), and a
  list right after a quoted one starts there (Quote17, 19: Tab on its first item does nothing).
- **Starts it won't hold**: a caret before an item's text goes to the text's start (above).

## Internals

Loaded, the plugin is `app.plugins.plugins['obsidian-outliner']`. Its settings are
`.obsidian/plugins/obsidian-outliner/data.json`, one flat object merged over its defaults:
`styleLists: true`, `debug: false`, `stickCursor: "bullet-and-checkbox"` (`"never"` turns its caret
handling off), `betterEnter`, `betterVimO`, `betterTab` and `selectAll` (all `true`),
`listLines: false`, `listLineAction: "toggle-folding"`, `dnd: true`. Its commands are
`obsidian-outliner:move-list-item-up` and `-down` (Mod+Shift+Up and Down), `indent-list` and
`outdent-list` (no hotkey), `fold` and `unfold` (Mod+Up and Down, which need Obsidian's `foldIndent`).
Its keys are CodeMirror keymaps (Enter, Tab and Shift+Tab at the highest precedence; Backspace,
Delete, Left and Ctrl+Left at the normal one); each does nothing while an IME composes or outside a
list, and a command that does nothing passes the key on to Obsidian. It indents with Obsidian's unit
(a tab with `useTab`, else `tabSize` spaces), after copying the indentation of a sibling or a child
where there is one.
