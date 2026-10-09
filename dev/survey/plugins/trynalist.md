---
type: Plugin
url: https://github.com/grub-basket/Trynalist
repo: https://github.com/grub-basket/Trynalist
host: obsidian
overview: 'Obsidian plugin: a Dynalist-style outliner whose every line is a Markdown note in the vault'
tech: TS, Obsidian API
license: MIT
why: 'A block outliner inside Obsidian, in a view of its own, stored one file per item (frontmatter: id, parent, fractional order, depth, item state; the body is the item and its note), documents as folders with a manifest; Dynalist''s keys and behaviors as its defaults. Young (0.x, community-listed, not reviewed)'
stars: 0
last_release: 0.82.0
last_release_date: 2026-10-01
last_commit: 2026-10-07
checked: 2026-10-14
sources: [https://github.com/grub-basket/Trynalist]
---

# Trynalist (Obsidian plugin)

## How it's built

Read from its source (`src/`, TypeScript; `main.ts`, `store.ts` and `outline-view.ts` are 12,600 of
its lines), 0.82.0.

- **A document is a folder** with a `<Doc>.trynalist` manifest (JSON: `format: "trynalist-doc"`, an
  `id`, the `title`, timestamps), opened in a view of the plugin's own (a `FileView`, `trynalist-doc`,
  registered for the extension), not in Obsidian's Markdown editor.
- **An item is a file**, `<slug>-<id>.md` (the id 10 random base-36 characters, the slug frozen at
  creation): its frontmatter is the structure and state (`parent`, a fractional `order`, `indent`,
  `depth`, `checkbox`, `checked`, `heading` 1–6, `collapsed`, `color`, `due`, timestamps), its body
  the item's line and then its note.
- **The view** keeps an index of the document's nodes in memory and writes each change back to the
  item's file. Each row's text is a `contenteditable`, its raw text while it has the caret and its
  inline formatting rendered otherwise; a checkbox is an input beside it; a note is rendered by
  Obsidian's Markdown renderer.
- **Keys** are chords in the view's own scope (a community plugin may not ship default hotkeys):
  Dynalist's, with Tab and Shift+Tab, Alt+Up and Down, Shift+Enter into the note, Alt+Enter for a line
  break, and a structural undo on Mod+Z that leaves typing to the row's own undo.

Not run side by side with ourus's spec: an outliner in a view of its own, stored a file per item, it
needs a block driver of its own over the Obsidian launcher (a test's outline written as item files,
read back from the view's index), where the other Obsidian setups edit one note. Deferred.
