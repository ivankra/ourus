---
type: Plugin
url: https://github.com/kazdonkai/unified-outliner
repo: https://github.com/kazdonkai/unified-outliner
host: obsidian
overview: 'Obsidian plugin: one tree of heading sections, list subtrees and body blocks'
tech: TS, CodeMirror 6 (Obsidian API)
license: MIT
why: 'Closest found to True Outliner: move/re-level/reparent whole nodes across headings and lists, focused subtree editing; no block IDs unless you use mirrors'
stars: 6
last_release: 1.0.6
last_release_date: 2026-10-01
last_commit: 2026-10-01
checked: 2026-10-14
sources: [https://github.com/kazdonkai/unified-outliner]
---

# Unified Outliner (Obsidian plugin)

## How it behaves

Measured with 1.0.6 in Obsidian 1.14.4 (Live Preview), replaying ourus's behavior spec. It binds no
keys and takes none of Obsidian's, so its commands were bound in the vault where Obsidian leaves keys
free (move block up and down, indent and outdent block, delete block, duplicate below).

- **Moves by subtree**, the item with its children: the best of the Obsidian setups at moving.
- **Its indent writes four columns**: an item takes its previous sibling's first child's
  indentation, or four past the sibling, in spaces unless its own line has a tab (`TAB_WIDTH = 4`).
- **Delete block and Duplicate below** take the item with its children and leave the caret at the
  line's start; Enter, Tab, Backspace and the caret stay Obsidian's.
- Of the examples run, 108 agree with ourus, one more than bare Obsidian in Live Preview.

