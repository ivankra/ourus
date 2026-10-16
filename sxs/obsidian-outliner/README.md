# Obsidian with Outliner

[`driver.ts`](driver.ts) drives Obsidian (1.14.4) with [Outliner](https://github.com/vslinko/obsidian-outliner)
(`obsidian-outliner` 4.10.2, the community plugin), at its default settings, in Live Preview,
Obsidian's default editing mode ([`../obsidian-lp/`](../obsidian-lp/) is the same without the plugin).
The rest (how it runs, indentation, keys) is as for [bare Obsidian](../obsidian/README.md); what
differs is here. Last results: [`sxs.md`](sxs.md).

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
| `indent`, `outdent` | Tab, Shift+Tab | "better Tab" (`betterTab`, on): the item with its children; the indentation is copied from a sibling or a child where there is one, else Obsidian's (a tab) |
| `moveSubtreeUp`, `moveSubtreeDown` | Ctrl+Shift+Up, Ctrl+Shift+Down | "Move list item up" and "down" (`move-list-item-up`, `-down`): the item with its children, into the neighboring item at a list's edge; an ordered list is renumbered |
| `deleteContentBackward`, `deleteContentForward` | Backspace, Delete | "stick the cursor to the content" (`stickCursor: bullet-and-checkbox`): at an item's start, it joins the previous item only where children allow, and otherwise does nothing |
| caret motions | arrows, Home, End | the same setting keeps the caret off bullets and checkboxes, after any move |

The caret is kept off markers from the start: one placed before an item's text, at the line's
start, in the marker or before a checkbox's end, goes to the text's start. Examples that start
there are skipped (`keepsCaretOnText`, the setup's `holds`).

Shift+Enter, Up and Down are Obsidian's. Ctrl+A selects the item first (`selectAll`), but no example
uses it. The settings are its defaults (`.obsidian/plugins/obsidian-outliner/data.json` is not
written).

## What it does, measured

Against bare Obsidian in Live Preview ([`../obsidian-lp/sxs.md`](../obsidian-lp/sxs.md)):

- **Indenting carries the children** (`indent.md › Indent2` agrees), and so do moves.
- **Backspace and Delete join items** where their children allow (`backspace.md`, `del.md` agree
  more); where they don't, Backspace does nothing.
- **A selection of several items doesn't move** (`move-subtree-down.md › MoveDown11`): the command wants
  one caret, where bare Obsidian's "Move line down" moves every selected line.
- **Quotes do worse**: moving past and between quoted items (`quotes.md › Swapping two quoted
  items`).
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
